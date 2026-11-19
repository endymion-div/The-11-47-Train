import { SUSPECT_PROFILES } from './caseData';
import type { Difficulty, GameState, SuspectId, SuspectRuntimeState } from './types';

function createInitialSuspectState(): SuspectRuntimeState {
  return {
    suspicion: 20,
    alibiStatus: 'UNVERIFIED',
    brokenAlibi: false,
    askedTopics: [],
    pressedTopics: [],
    challengedTopics: [],
    presentedEvidenceIds: [],
    recordedStatements: [],
    observedTell: false,
  };
}

export function createInitialGameState(difficulty: Difficulty = 'investigator', skipToPlaying = false): GameState {
  const suspectStates = {} as Record<SuspectId, SuspectRuntimeState>;
  (Object.keys(SUSPECT_PROFILES) as SuspectId[]).forEach((id) => {
    suspectStates[id] = createInitialSuspectState();
  });

  return {
    phase: skipToPlaying ? 'playing' : 'title',
    difficulty,
    currentLocation: 'carriage_7',
    playerX: 0.45,
    playerFacing: 1,
    observationMode: false,
    clockMinutes: 48, // 11:48 PM right after blackout ends
    discoveredEvidenceIds: ['ev_anonymous_note'],
    inspectedHotspotIds: [],
    suspectStates,
    timelinePlacements: {
      slot_1: null,
      slot_2: null,
      slot_3: null,
      slot_4: null,
      slot_5: null,
      slot_6: null,
    },
    timelineValidated: false,
    timelineMessage: 'Assign the events of the 90-second blackout from 11:46:30 to 11:48:30.',
    hypotheses: [],
    activePanel: null,
    activeSuspectId: null,
    blackoutProgress: skipToPlaying ? 90 : 0,
    blackoutObservedEvents: [],
    muted: false,
    deductionOpen: false,
    ending: null,
    toastMessage: null,
    lastSavedAt: null,
  };
}

export function formatTrainClock(minutesPastEleven: number): string {
  const totalMinutes = 23 * 60 + minutesPastEleven;
  const hour24 = Math.floor(totalMinutes / 60) % 24;
  const min = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minStr = String(min).padStart(2, '0');
  return `${hour12}:${minStr} ${period}`;
}

export function computeGlobalSuspicionLevel(state: GameState): 'LOW' | 'ELEVATED' | 'CRITICAL' {
  const values = Object.values(state.suspectStates).map((s) => s.suspicion);
  const max = Math.max(...values, 0);
  if (max >= 70) return 'CRITICAL';
  if (max >= 45) return 'ELEVATED';
  return 'LOW';
}

export function advanceCaseClock(state: GameState, deltaMinutes: number): GameState {
  return {
    ...state,
    clockMinutes: Math.min(state.clockMinutes + deltaMinutes, 145),
  };
}
