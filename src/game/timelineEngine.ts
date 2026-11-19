import { TIMELINE_EVENT_CARDS, TIMELINE_SLOTS } from './caseData';
import type { GameState } from './types';

export function placeTimelineEvent(
  state: GameState,
  slotId: string,
  eventId: string | null,
): GameState {
  const nextPlacements = { ...state.timelinePlacements };

  // Remove eventId from any previous slot so cards remain unique on the board
  if (eventId) {
    for (const key of Object.keys(nextPlacements)) {
      if (nextPlacements[key] === eventId) {
        nextPlacements[key] = null;
      }
    }
  }

  nextPlacements[slotId] = eventId;

  return {
    ...state,
    timelinePlacements: nextPlacements,
    timelineValidated: false,
    timelineMessage: 'Timeline updated. Run consistency check when all six intervals are placed.',
  };
}

export function validateTimeline(state: GameState): {
  isValid: boolean;
  isComplete: boolean;
  message: string;
  nextState: GameState;
} {
  const filledCount = TIMELINE_SLOTS.filter((slot) => Boolean(state.timelinePlacements[slot.id])).length;
  if (filledCount < TIMELINE_SLOTS.length) {
    const message = `Place all 6 intervals (${filledCount}/${TIMELINE_SLOTS.length} placed) before verifying.`;
    return {
      isValid: false,
      isComplete: false,
      message,
      nextState: {
        ...state,
        timelineValidated: false,
        timelineMessage: message,
      },
    };
  }

  const allCorrect = TIMELINE_SLOTS.every(
    (slot) => state.timelinePlacements[slot.id] === slot.expectedEventId,
  );

  if (!allCorrect) {
    // Do NOT reveal which slot is wrong — matches prompt requirement!
    const message = 'This sequence contains an inconsistency.';
    return {
      isValid: false,
      isComplete: true,
      message,
      nextState: {
        ...state,
        timelineValidated: false,
        timelineMessage: message,
      },
    };
  }

  const message =
    'Sequence Verified: Every sound, movement, and physical trace aligns across the 90-second blackout.';
  return {
    isValid: true,
    isComplete: true,
    message,
    nextState: {
      ...state,
      timelineValidated: true,
      timelineMessage: message,
      toastMessage: '90-Second Blackout Timeline Verified',
    },
  };
}

export function getUnplacedTimelineCards(state: GameState) {
  const placedIds = new Set(Object.values(state.timelinePlacements).filter(Boolean));
  return TIMELINE_EVENT_CARDS.filter((card) => !placedIds.has(card.id));
}
