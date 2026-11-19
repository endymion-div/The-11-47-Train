import { SUSPECT_PROFILES } from './caseData';
import type { GameState, SuspectId, SuspectProfile, SuspectStatement } from './types';

export function getAllSuspects(): SuspectProfile[] {
  return Object.values(SUSPECT_PROFILES);
}

export function getSuspectProfile(id: SuspectId): SuspectProfile {
  return SUSPECT_PROFILES[id];
}

export function getRecordedStatements(state: GameState): SuspectStatement[] {
  const statements: SuspectStatement[] = [];
  (Object.keys(SUSPECT_PROFILES) as SuspectId[]).forEach((suspectId) => {
    const profile = SUSPECT_PROFILES[suspectId];
    const runtime = state.suspectStates[suspectId];
    (['alibi', 'victim', 'blackout', 'secret'] as const).forEach((topic) => {
      const t = profile.topics[topic];
      const hasAsked = runtime.askedTopics.includes(topic);
      if (!hasAsked) return;
      const isBroken =
        t.requiredEvidenceToBreak &&
        runtime.presentedEvidenceIds.includes(t.requiredEvidenceToBreak);

      statements.push({
        id: t.statementId,
        suspectId,
        topic: t.label,
        quote: isBroken && t.brokenStatementQuote ? t.brokenStatementQuote : t.statementQuote,
        isLie: Boolean(t.isLie && !isBroken),
        contradictedBy: isBroken ? t.requiredEvidenceToBreak : undefined,
      });
    });
  });
  return statements;
}

export function getContradictedSuspectCount(state: GameState): number {
  return (Object.keys(state.suspectStates) as SuspectId[]).filter(
    (id) => state.suspectStates[id].alibiStatus === 'CONTRADICTION FOUND',
  ).length;
}
