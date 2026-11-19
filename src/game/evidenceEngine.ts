import { EVIDENCE_ITEMS } from './caseData';
import type { EvidenceCategory, EvidenceItem, GameState } from './types';

export function getEvidenceById(id: string): EvidenceItem | undefined {
  return EVIDENCE_ITEMS.find((item) => item.id === id);
}

export function getCollectedEvidence(state: GameState): EvidenceItem[] {
  return EVIDENCE_ITEMS.filter((item) => state.discoveredEvidenceIds.includes(item.id));
}

export function filterEvidenceByCategory(
  items: EvidenceItem[],
  category: EvidenceCategory | 'All',
): EvidenceItem[] {
  if (category === 'All') return items;
  return items.filter((item) => item.category === category);
}

export function collectEvidence(state: GameState, evidenceId: string): {
  nextState: GameState;
  collectedNow: boolean;
  item: EvidenceItem | undefined;
} {
  const item = getEvidenceById(evidenceId);
  if (!item) {
    return { nextState: state, collectedNow: false, item: undefined };
  }
  if (state.discoveredEvidenceIds.includes(evidenceId)) {
    return { nextState: state, collectedNow: false, item };
  }

  return {
    collectedNow: true,
    item,
    nextState: {
      ...state,
      discoveredEvidenceIds: [...state.discoveredEvidenceIds, evidenceId],
      clockMinutes: Math.min(state.clockMinutes + 2, 145),
      toastMessage: `Evidence Logged: ${item.name}`,
    },
  };
}
