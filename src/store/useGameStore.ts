import { create } from 'zustand';
import { Country } from '../data/countries';

export type GameMode = 'FLAGS' | 'CAPITALS' | 'MIXED';
export type InputMethod = 'CHOICE' | 'TYPING';
export type Region = 'All' | 'Africa' | 'Americas' | 'Asia' | 'Europe' | 'Oceania';
export type SessionLength = 10 | 25 | 50 | 'All' | 'Endless';

interface GameState {
  // Game State
  score: number;
  streak: number;
  lives: number;
  bestStreak: number;
  isPlaying: boolean;
  isGameOver: boolean;
  missedCountries: Country[];
  
  // Settings
  gameMode: GameMode;
  inputMethod: InputMethod;
  isTimed: boolean;
  selectedRegion: Region;
  sessionLength: SessionLength;

  // Actions
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  updateScore: (basePoints: number, secondsTaken: number) => void;
  handleCorrect: (secondsTaken: number) => void;
  handleWrong: (country?: Country) => void;
  setSettings: (settings: Partial<Pick<GameState, 'gameMode' | 'inputMethod' | 'isTimed' | 'selectedRegion' | 'sessionLength'>>) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  streak: 0,
  lives: 3,
  bestStreak: 0,
  isPlaying: false,
  isGameOver: false,
  missedCountries: [],

  gameMode: 'FLAGS',
  inputMethod: 'CHOICE',
  isTimed: true,
  selectedRegion: 'All',
  sessionLength: 25,

  startGame: () => set({ isPlaying: true, isGameOver: false, score: 0, streak: 0, lives: 3, missedCountries: [] }),
  endGame: () => set({ isPlaying: false, isGameOver: true }),
  resetGame: () => set({ isPlaying: false, isGameOver: false, score: 0, streak: 0, lives: 3, missedCountries: [] }),

  updateScore: (basePoints, secondsTaken) => {
    const { streak, inputMethod } = get();
    
    // Multipliers
    const methodMultiplier = inputMethod === 'TYPING' ? 2.0 : 1.0;
    const speedBonus = Math.max(0, 10 - secondsTaken) * 10;
    const streakMultiplier = Math.min(2.0, 1 + (streak / 10));

    const points = Math.round((basePoints * methodMultiplier + speedBonus) * streakMultiplier);
    
    set((state) => ({
      score: state.score + points,
    }));
  },

  handleCorrect: (secondsTaken) => {
    const { gameMode, updateScore } = get();
    const basePoints = gameMode === 'CAPITALS' ? 150 : 100;
    
    updateScore(basePoints, secondsTaken);
    
    set((state) => {
      const newStreak = state.streak + 1;
      return {
        streak: newStreak,
        bestStreak: Math.max(state.bestStreak, newStreak),
      };
    });
  },

  handleWrong: (country) => {
    set((state) => {
      const newLives = state.lives - 1;
      const newMissed = country ? [...state.missedCountries, country] : state.missedCountries;
      
      // Filter duplicates in missed countries
      const uniqueMissed = Array.from(new Set(newMissed.map(c => c.id)))
        .map(id => newMissed.find(c => c.id === id)!);

      if (newLives <= 0) {
        return { lives: 0, streak: 0, isPlaying: false, isGameOver: true, missedCountries: uniqueMissed };
      }
      return { lives: newLives, streak: 0, missedCountries: uniqueMissed };
    });
  },

  setSettings: (settings) => set((state) => ({ ...state, ...settings })),
}));
