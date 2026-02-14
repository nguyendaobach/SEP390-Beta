/**
 * Prompt Editor Store
 * ===================
 * Zustand store for managing prompt editor state
 */

import { create } from 'zustand';
import {
  IPromptEditorState,
  IPromptSettings,
  ICardOutline,
  TextContentMode,
  AmountOfText,
  AudienceType,
  ToneType,
  OutputLanguage,
  ThemeType,
  ImageSourceType,
  FormatType,
  ContentViewMode,
} from '@/types';

/**
 * Default settings
 */
const DEFAULT_SETTINGS: IPromptSettings = {
  textContentMode: TextContentMode.GENERATE,
  amountOfText: AmountOfText.CONCISE,
  writeFor: AudienceType.BUSINESS,
  tone: ToneType.PROFESSIONAL,
  outputLanguage: OutputLanguage.VIETNAMESE,
  theme: ThemeType.NOVA,
  imageSource: ImageSourceType.AUTOMATIC,
  format: FormatType.PRESENTATION,
};

/**
 * Prompt Editor Store Interface
 */
interface IPromptEditorStore extends IPromptEditorState {
  // Actions for main prompt
  setMainPrompt: (prompt: string) => void;
  setAdditionalInstructions: (instructions: string) => void;

  // Actions for settings
  updateSettings: (settings: Partial<IPromptSettings>) => void;
  setTextContentMode: (mode: TextContentMode) => void;
  setAmountOfText: (amount: AmountOfText) => void;
  setWriteFor: (audience: AudienceType) => void;
  setTone: (tone: ToneType) => void;
  setOutputLanguage: (lang: OutputLanguage) => void;
  setTheme: (theme: ThemeType) => void;
  setImageSource: (source: ImageSourceType) => void;
  setFormat: (format: FormatType) => void;

  // Actions for content
  setContentViewMode: (mode: ContentViewMode) => void;
  setGeneratedOutline: (outline: ICardOutline[]) => void;
  addCard: (card: ICardOutline) => void;
  updateCard: (id: string, card: Partial<ICardOutline>) => void;
  removeCard: (id: string) => void;
  reorderCards: (startIndex: number, endIndex: number) => void;

  // Actions for generation
  generateContent: () => Promise<void>;
  setIsGenerating: (isGenerating: boolean) => void;

  // Actions for credits
  useCredit: (amount: number) => void;

  // Reset
  reset: () => void;
}

/**
 * Initial state
 */
const initialState: IPromptEditorState = {
  mainPrompt: '',
  additionalInstructions: '',
  settings: DEFAULT_SETTINGS,
  contentViewMode: ContentViewMode.CARD_BY_CARD,
  generatedOutline: [],
  totalCards: 0,
  isGenerating: false,
  creditUsed: 0,
  totalCredit: 50000,
};

/**
 * Prompt Editor Store
 */
export const usePromptEditorStore = create<IPromptEditorStore>((set, get) => ({
  ...initialState,

  // Main prompt actions
  setMainPrompt: (prompt) => set({ mainPrompt: prompt }),

  setAdditionalInstructions: (instructions) =>
    set({ additionalInstructions: instructions }),

  // Settings actions
  updateSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),

  setTextContentMode: (mode) =>
    set((state) => ({
      settings: { ...state.settings, textContentMode: mode },
    })),

  setAmountOfText: (amount) =>
    set((state) => ({
      settings: { ...state.settings, amountOfText: amount },
    })),

  setWriteFor: (audience) =>
    set((state) => ({
      settings: { ...state.settings, writeFor: audience },
    })),

  setTone: (tone) =>
    set((state) => ({
      settings: { ...state.settings, tone: tone },
    })),

  setOutputLanguage: (lang) =>
    set((state) => ({
      settings: { ...state.settings, outputLanguage: lang },
    })),

  setTheme: (theme) =>
    set((state) => ({
      settings: { ...state.settings, theme: theme },
    })),

  setImageSource: (source) =>
    set((state) => ({
      settings: { ...state.settings, imageSource: source },
    })),

  setFormat: (format) =>
    set((state) => ({
      settings: { ...state.settings, format: format },
    })),

  // Content actions
  setContentViewMode: (mode) => set({ contentViewMode: mode }),

  setGeneratedOutline: (outline) =>
    set({ generatedOutline: outline, totalCards: outline.length }),

  addCard: (card) =>
    set((state) => ({
      generatedOutline: [...state.generatedOutline, card],
      totalCards: state.totalCards + 1,
    })),

  updateCard: (id, updates) =>
    set((state) => ({
      generatedOutline: state.generatedOutline.map((card) =>
        card.id === id ? { ...card, ...updates } : card
      ),
    })),

  removeCard: (id) =>
    set((state) => ({
      generatedOutline: state.generatedOutline.filter((card) => card.id !== id),
      totalCards: state.totalCards - 1,
    })),

  reorderCards: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.generatedOutline);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      // Update order
      const reordered = result.map((card, index) => ({
        ...card,
        order: index + 1,
      }));

      return { generatedOutline: reordered };
    }),

  // Generation actions
  generateContent: async () => {
    const state = get();
    set({ isGenerating: true });

    try {
      // TODO: Call AI API to generate content based on prompt and settings
      // For now, simulate with mock data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock generated outline
      const mockOutline: ICardOutline[] = [
        {
          id: '1',
          title: state.mainPrompt || 'Tiêu đề slide 1',
          bullets: ['Nội dung bullet 1', 'Nội dung bullet 2'],
          order: 1,
        },
        {
          id: '2',
          title: 'Slide 2',
          bullets: ['Nội dung bullet 1', 'Nội dung bullet 2', 'Nội dung bullet 3'],
          order: 2,
        },
      ];

      set({
        generatedOutline: mockOutline,
        totalCards: mockOutline.length,
        creditUsed: state.creditUsed + 1104,
      });
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      set({ isGenerating: false });
    }
  },

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  // Credit actions
  useCredit: (amount) =>
    set((state) => ({
      creditUsed: state.creditUsed + amount,
    })),

  // Reset
  reset: () => set(initialState),
}));
