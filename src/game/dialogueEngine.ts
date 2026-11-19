import { SUSPECT_PROFILES } from './caseData';
import type { GameState, InterrogationTopic, SuspectId } from './types';

export function resolveDialogueResponse(
  state: GameState,
  suspectId: SuspectId,
  topic: InterrogationTopic,
  mode: 'ASK' | 'PRESS' | 'CHALLENGE',
): string {
  const profile = SUSPECT_PROFILES[suspectId];
  const runtime = state.suspectStates[suspectId];
  const topicData = profile.topics[topic];

  const isBroken =
    topicData.requiredEvidenceToBreak &&
    runtime.presentedEvidenceIds.includes(topicData.requiredEvidenceToBreak);

  if (isBroken && topicData.brokenAnswer) {
    return topicData.brokenAnswer;
  }

  if (mode === 'ASK') {
    return topicData.initialAnswer;
  }
  if (mode === 'PRESS') {
    return topicData.pressAnswer;
  }
  // CHALLENGE
  if (topicData.isLie && state.discoveredEvidenceIds.length >= 6) {
    return `${topicData.challengedAnswer} (Noticeable hesitation — present physical proof to break their story.)`;
  }
  return topicData.challengedAnswer;
}
