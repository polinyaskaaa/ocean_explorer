export type Role = 'USER' | 'ADMIN';

export type Motion = 'GLIDE' | 'PULSE' | 'UNDULATE' | 'DART' | 'DRIFT';

export const MOTION_LABELS: Record<Motion, string> = {
  GLIDE: 'Ковзання',
  PULSE: 'Пульсація',
  UNDULATE: 'Хвиля тілом',
  DART: 'Ривки',
  DRIFT: 'Зависання',
};

export const MOTION_HINTS: Record<Motion, string> = {
  GLIDE: 'великі тварини',
  PULSE: 'медузи',
  UNDULATE: 'головоногі, вугри',
  DART: 'швидкі риби',
  DRIFT: 'малорухливі',
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  score: number;
}

export interface Creature {
  id: string;
  name: string;
  latinName: string | null;
  description: string;
  diet: string;
  size: string;
  weight: string;
  lifespan: string;
  habitat: string;
  imageUrl: string;
  depth: number;
  motion: Motion;
  questionCount: number;
}

export interface AdminQuestion {
  id: string;
  creatureId: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface AdminCreature extends Omit<Creature, 'questionCount'> {
  questions: AdminQuestion[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface QuizSession {
  creatureId: string;
  creatureName: string;
  totalQuestions: number;
  requiredCorrect: number;
  questions: QuizQuestion[];
}

export interface QuizAnswerResult {
  questionId: string;
  correct: boolean;
  correctIndex: number;
  selectedIndex: number;
}

export interface QuizResult {
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  awardedPoint: boolean;
  totalScore: number;
  results: QuizAnswerResult[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProgressResponse {
  user: User;
  completedCreatureIds: string[];
}

export interface CreaturePayload {
  name: string;
  latinName?: string;
  description: string;
  diet: string;
  size: string;
  weight: string;
  lifespan: string;
  habitat: string;
  imageUrl: string;
  depth: number;
  motion: Motion;
  questions: { text: string; options: string[]; correctIndex: number }[];
}
