/**
 * Prompt Editor Types
 * ===================
 * Types for the Prompt Editor page (similar to Gamma)
 */

export enum TextContentMode {
  GENERATE = 'generate',
  CONDENSE = 'condense',
  PRESERVE = 'preserve',
}

export enum AmountOfText {
  MINIMAL = 'minimal',
  CONCISE = 'concise',
  DETAILED = 'detailed',
  EXTENSIVE = 'extensive',
}

export enum AudienceType {
  BUSINESS = 'business',
  HIGH_SCHOOLERS = 'high_schoolers',
  COLLEGE_STUDENTS = 'college_students',
  CREATIVES = 'creatives',
  TECH_ENTHUSIASTS = 'tech_enthusiasts',
}

export enum ToneType {
  PROFESSIONAL = 'professional',
  CONVERSATIONAL = 'conversational',
  TECHNICAL = 'technical',
  ACADEMIC = 'academic',
  INSPIRATIONAL = 'inspirational',
  HUMOROUS = 'humorous',
}

export enum OutputLanguage {
  ENGLISH = 'en',
  VIETNAMESE = 'vi',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  CHINESE = 'zh',
  JAPANESE = 'ja',
}

export enum ThemeType {
  NOVA = 'nova',
  FLUO = 'fluo',
  FINESSE = 'finesse',
  VERDIGRIS = 'verdigris',
  MARINE = 'marine',
  LUX = 'lux',
}

export enum ImageSourceType {
  AUTOMATIC = 'automatic',
  NONE = 'none',
  UPLOAD = 'upload',
}

export enum FormatType {
  PRESENTATION = 'presentation',
  DOCUMENT = 'document',
  WEBPAGE = 'webpage',
}

export enum ContentViewMode {
  FREEFORM = 'freeform',
  CARD_BY_CARD = 'card_by_card',
}

/**
 * Generated card outline from prompt
 */
export interface ICardOutline {
  id: string;
  title: string;
  bullets: string[];
  order: number;
}

/**
 * Prompt Editor Settings
 */
export interface IPromptSettings {
  // Text Content Settings
  textContentMode: TextContentMode;
  amountOfText: AmountOfText;
  writeFor: AudienceType;
  tone: ToneType;
  outputLanguage: OutputLanguage;

  // Visual Settings
  theme: ThemeType;
  imageSource: ImageSourceType;

  // Format Settings
  format: FormatType;
}

/**
 * Prompt Editor State
 */
export interface IPromptEditorState {
  // Main prompt
  mainPrompt: string;
  additionalInstructions: string;

  // Settings
  settings: IPromptSettings;

  // Generated content
  contentViewMode: ContentViewMode;
  generatedOutline: ICardOutline[];
  totalCards: number;

  // UI state
  isGenerating: boolean;
  creditUsed: number;
  totalCredit: number;
}
