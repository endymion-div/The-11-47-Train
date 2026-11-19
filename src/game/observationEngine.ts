import type { Difficulty, GameState, Hotspot } from './types';

export interface ObservationHintSpec {
  highlightRadius: number;
  highlightOpacity: number;
  showTextHint: boolean;
}

export function getObservationHintSpec(difficulty: Difficulty): ObservationHintSpec {
  switch (difficulty) {
    case 'casual':
      return { highlightRadius: 32, highlightOpacity: 0.9, showTextHint: true };
    case 'investigator':
      return { highlightRadius: 20, highlightOpacity: 0.65, showTextHint: true };
    case 'master':
      return { highlightRadius: 0, highlightOpacity: 0.18, showTextHint: false };
  }
}

export function canInspectHotspot(hotspot: Hotspot, state: GameState): boolean {
  if (!hotspot.requiresObservation) return true;
  if (state.observationMode) return true;
  // In Casual mode, hovering close still works once discovered, otherwise requires Observation Mode
  if (hotspot.evidenceId && state.discoveredEvidenceIds.includes(hotspot.evidenceId)) {
    return true;
  }
  return false;
}

export function getObservationPrompt(hotspot: Hotspot, state: GameState): string {
  if (hotspot.requiresObservation && !state.observationMode) {
    return state.difficulty === 'master'
      ? 'Something faint lies here — examine more closely.'
      : 'Micro-detail obscured. Activate Observation Mode (O) to inspect.';
  }
  return hotspot.observationDetail || hotspot.inspectText;
}
