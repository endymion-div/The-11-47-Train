import type { GameState } from './types';

const SAVE_STORAGE_KEY = 'the_1147_train_save_v1';

export function hasSavedGame(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return Boolean(window.localStorage.getItem(SAVE_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function saveGameState(state: GameState): { ok: boolean; savedAt: string } {
  const savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ok: false, savedAt };
    }
    const payload: GameState = {
      ...state,
      activePanel: null,
      activeSuspectId: null,
      deductionOpen: false,
      toastMessage: null,
      lastSavedAt: savedAt,
    };
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    return { ok: true, savedAt };
  } catch {
    return { ok: false, savedAt };
  }
}

export function loadGameState(): GameState | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || !parsed.discoveredEvidenceIds || !parsed.suspectStates) return null;
    return {
      ...parsed,
      phase: 'playing',
      activePanel: null,
      activeSuspectId: null,
      deductionOpen: false,
      toastMessage: 'Case file restored.',
    };
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
