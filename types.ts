
export enum Mode {
  WORK = 'WORK',
  SCHOOL = 'SCHOOL',
  SOCIAL = 'SOCIAL'
}

export enum DetailLevel {
  DETAILED = 'DETAILED',
  STANDARD = 'STANDARD',
  CONCISE = 'CONCISE'
}

export enum UserTier {
  FREE = 'FREE',
  PLUS = 'PLUS',
  PRO = 'PRO'
}

export interface ClarityScore {
  score: number;
  explanation: string;
}

export interface ResponseOption {
  type: string;
  wording: string;
  toneDescription: string;
  socialImpact: string;
  riskLevel: number;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  mode: Mode;
  originalMessage: string;
  whatWasSaid: string;
  whatIsExpected: string[];
  whatIsOptional: string[];
  whatCarriesRisk: string[];
  whatIsNotAskingFor: string[];
  hiddenRules: string[];
  clarityScore: ClarityScore;
  responses: ResponseOption[];
  confidenceLevel: 'High' | 'Medium' | 'Low';
}

export interface QueuedAnalysis {
  id: string;
  message: string;
  mode: Mode;
  detailLevel: DetailLevel;
  image?: { data: string; mimeType: string };
  audio?: { data: string; mimeType: string };
}

export type Screen = 'WELCOME' | 'ONBOARDING' | 'HOME' | 'INPUT' | 'LOADING' | 'RESULTS' | 'HISTORY' | 'SETTINGS' | 'PAYWALL' | 'LIBRARY' | 'COACH' | 'LEGAL';

export interface UserSettings {
  textSize: 'Small' | 'Medium' | 'Large' | 'ExtraLarge';
  fontFamily: 'Lexend' | 'OpenDyslexic' | 'Comic' | 'Sans';
  voiceName: string; // System voice name from Web Speech API
  analysisDetail: DetailLevel;
  audioOutput: boolean;
  audioSpeed: number;
  defaultMode: Mode;
  darkMode: boolean;
  tier: UserTier;
  analysesCount: number;
  subscriptionExpiry?: number;
}

export interface CustomLibraryItem {
  id: string;
  title: string;
  description: string;
  type: 'url' | 'file';
  url?: string;
  fileData?: string; // base64 for uploaded files
  fileName?: string;
  mimeType?: string;
  icon: 'Brain' | 'Briefcase' | 'Book' | 'MessageCircle';
  createdAt: number;
}
