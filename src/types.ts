import { CategoryKey } from './utils/constants';

export interface Player {
  name: string;
  score: number;
  hasAnswered: boolean;
  avatar?: string;
  isSpectator?: boolean;
}

export interface CurrentQuestion {
  text: string;
  answer: string;
  timerEnd: number;
}

export interface RoomState {
  createdAt?: number;
  hostId: string;
  state: 'lobby' | 'playing' | 'results' | 'final-results';
  category?: CategoryKey;
  questionsData?: { text: string; answer: string }[];
  currentQuestion?: CurrentQuestion;
  players: Record<string, Player>;
  round?: number;
}
