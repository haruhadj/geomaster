import type {
  GameMode,
  InputMethod,
  Region,
  SessionLength,
} from '../store/useGameStore';

const STORAGE_KEY = 'geomaster-progress';

export interface GameSettingsSnapshot {
  gameMode: GameMode;
  inputMethod: InputMethod;
  isTimed: boolean;
  selectedRegion: Region;
  sessionLength: SessionLength;
}

export interface GameHistoryEntry {
  id: number;
  score: number;
  bestStreak: number;
  missedCount: number;
  questionsCompleted: number;
  totalQuestions: number | null;
  playedAt: string;
  settings: GameSettingsSnapshot;
}

export interface GameProgress {
  bestScore: number;
  bestStreak: number;
  totalGames: number;
  history: GameHistoryEntry[];
  settings: GameSettingsSnapshot;
}

const DEFAULT_SETTINGS: GameSettingsSnapshot = {
  gameMode: 'FLAGS',
  inputMethod: 'CHOICE',
  isTimed: true,
  selectedRegion: 'All',
  sessionLength: 25,
};

function sanitizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

function sanitizeSessionLength(value: unknown): SessionLength {
  if (value === 10 || value === 25 || value === 50 || value === 'All' || value === 'Endless') {
    return value;
  }
  return DEFAULT_SETTINGS.sessionLength;
}

function sanitizeSettings(value: unknown): GameSettingsSnapshot {
  const raw = value && typeof value === 'object' ? value as Partial<GameSettingsSnapshot> : {};

  return {
    gameMode: raw.gameMode === 'CAPITALS' || raw.gameMode === 'MIXED' ? raw.gameMode : 'FLAGS',
    inputMethod: raw.inputMethod === 'TYPING' ? 'TYPING' : 'CHOICE',
    isTimed: raw.isTimed !== false,
    selectedRegion:
      raw.selectedRegion === 'Africa'
      || raw.selectedRegion === 'Americas'
      || raw.selectedRegion === 'Asia'
      || raw.selectedRegion === 'Europe'
      || raw.selectedRegion === 'Oceania'
        ? raw.selectedRegion
        : 'All',
    sessionLength: sanitizeSessionLength(raw.sessionLength),
  };
}

function sanitizeHistoryEntry(value: unknown): GameHistoryEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const raw = value as Partial<GameHistoryEntry>;
  const id = sanitizeNumber(raw.id);
  if (id <= 0) {
    return null;
  }

  return {
    id,
    score: sanitizeNumber(raw.score),
    bestStreak: sanitizeNumber(raw.bestStreak),
    missedCount: sanitizeNumber(raw.missedCount),
    questionsCompleted: sanitizeNumber(raw.questionsCompleted),
    totalQuestions: raw.totalQuestions == null ? null : sanitizeNumber(raw.totalQuestions),
    playedAt: typeof raw.playedAt === 'string' ? raw.playedAt : new Date(id).toISOString(),
    settings: sanitizeSettings(raw.settings),
  };
}

function maxHistoryValue(history: GameHistoryEntry[], key: 'score' | 'bestStreak') {
  return history.reduce((currentMax, entry) => Math.max(currentMax, entry[key]), 0);
}

function isDefaultSettings(settings: GameSettingsSnapshot) {
  return (
    settings.gameMode === DEFAULT_SETTINGS.gameMode
    && settings.inputMethod === DEFAULT_SETTINGS.inputMethod
    && settings.isTimed === DEFAULT_SETTINGS.isTimed
    && settings.selectedRegion === DEFAULT_SETTINGS.selectedRegion
    && settings.sessionLength === DEFAULT_SETTINGS.sessionLength
  );
}

export function createEmptyProgress(): GameProgress {
  return {
    bestScore: 0,
    bestStreak: 0,
    totalGames: 0,
    history: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function normalizeProgress(value: unknown): GameProgress {
  const raw = value && typeof value === 'object' ? value as Partial<GameProgress> : {};
  const history = Array.isArray(raw.history)
    ? raw.history
      .map((entry) => sanitizeHistoryEntry(entry))
      .filter((entry): entry is GameHistoryEntry => entry !== null)
      .sort((left, right) => left.id - right.id)
    : [];

  return {
    bestScore: Math.max(sanitizeNumber(raw.bestScore), maxHistoryValue(history, 'score')),
    bestStreak: Math.max(sanitizeNumber(raw.bestStreak), maxHistoryValue(history, 'bestStreak')),
    totalGames: Math.max(sanitizeNumber(raw.totalGames), history.length),
    history,
    settings: sanitizeSettings(raw.settings),
  };
}

export function loadProgress(): GameProgress {
  if (typeof window === 'undefined') {
    return createEmptyProgress();
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createEmptyProgress();
    }
    return normalizeProgress(JSON.parse(stored));
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(progress: GameProgress) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function postToParent(event: string, data?: unknown) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'GAME_EVENT', event, data }, '*');
  }
}

export function withSettings(progress: GameProgress, settings: GameSettingsSnapshot) {
  const normalizedSettings = sanitizeSettings(settings);
  const currentSettings = progress.settings;

  if (
    currentSettings.gameMode === normalizedSettings.gameMode
    && currentSettings.inputMethod === normalizedSettings.inputMethod
    && currentSettings.isTimed === normalizedSettings.isTimed
    && currentSettings.selectedRegion === normalizedSettings.selectedRegion
    && currentSettings.sessionLength === normalizedSettings.sessionLength
  ) {
    return progress;
  }

  return {
    ...progress,
    settings: normalizedSettings,
  };
}

export function mergeProgress(local: GameProgress, remote: unknown): GameProgress {
  const normalizedLocal = normalizeProgress(local);
  const normalizedRemote = normalizeProgress(remote);
  const historyById = new Map<number, GameHistoryEntry>();

  [...normalizedLocal.history, ...normalizedRemote.history]
    .sort((left, right) => left.id - right.id)
    .forEach((entry) => {
      historyById.set(entry.id, entry);
    });

  const history = [...historyById.values()].sort((left, right) => left.id - right.id);
  const settings = isDefaultSettings(normalizedLocal.settings)
    ? normalizedRemote.settings
    : normalizedLocal.settings;

  return {
    bestScore: Math.max(
      normalizedLocal.bestScore,
      normalizedRemote.bestScore,
      maxHistoryValue(history, 'score'),
    ),
    bestStreak: Math.max(
      normalizedLocal.bestStreak,
      normalizedRemote.bestStreak,
      maxHistoryValue(history, 'bestStreak'),
    ),
    totalGames: Math.max(normalizedLocal.totalGames, normalizedRemote.totalGames, history.length),
    history,
    settings,
  };
}

export function createHistoryEntry(data: {
  score: number;
  bestStreak: number;
  missedCount: number;
  questionsCompleted: number;
  totalQuestions: number | null;
  settings: GameSettingsSnapshot;
}): GameHistoryEntry {
  const id = Date.now();

  return {
    id,
    score: sanitizeNumber(data.score),
    bestStreak: sanitizeNumber(data.bestStreak),
    missedCount: sanitizeNumber(data.missedCount),
    questionsCompleted: sanitizeNumber(data.questionsCompleted),
    totalQuestions: data.totalQuestions == null ? null : sanitizeNumber(data.totalQuestions),
    playedAt: new Date(id).toISOString(),
    settings: sanitizeSettings(data.settings),
  };
}

export function recordCompletedGame(progress: GameProgress, historyEntry: GameHistoryEntry): GameProgress {
  const history = [...progress.history, historyEntry].sort((left, right) => left.id - right.id);

  return {
    ...progress,
    bestScore: Math.max(progress.bestScore, historyEntry.score),
    bestStreak: Math.max(progress.bestStreak, historyEntry.bestStreak),
    totalGames: Math.max(progress.totalGames + 1, history.length),
    history,
  };
}