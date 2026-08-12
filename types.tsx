
export interface FileContext {
  name: string;
  path: string;
  content: string;
  size: number;
}

export enum FileCategory {
  ESSENTIAL = 'Essential',
  RECOMMENDED = 'Recommended',
  OPTIONAL = 'Optional',
  IGNORE = 'Ignore'
}

export interface Recommendation {
  file: string;
  category: FileCategory;
  reason: string;
}

export interface ScoringWeight {
  task: string;
  weight: number;
  skills: string;
}

export interface ExamPart {
  name: string;
  duration: string;
  itemCount: number;
}

export interface ProjectStats {
  framework?: string;
  uiLibrary?: string;
  aiSdk?: string;
  hasAudio?: boolean;
  hasNavigation?: boolean;
  screens?: string[];
  legacyModelDetected?: boolean;
  manualJsonParsing?: boolean;
  pteModules?: string[];
  uiComponents?: string[];
  brandColors?: string[];
  examWeightsDetected?: boolean;
  practiceFlowDetected?: boolean;
  scoringFields?: string[];
  totalQuestions?: number;
  categoryDistribution?: Record<string, number>;
  gamification?: {
    leaderboardDetected: boolean;
    topScore: number;
    userScore: number;
    totalLeaders: number;
  };
  profile?: {
    targetScore: number;
    avgScore: number;
    exercisesDone: number;
    skills: { name: string; value: number }[];
  };
  scoringWeights?: ScoringWeight[];
  examStructure?: ExamPart[];
}
