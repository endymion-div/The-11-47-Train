import { SUSPECT_PROFILES } from './caseData';
import { resolveDialogueResponse } from './dialogueEngine';
import type { GameState, InterrogationTopic, SuspectId } from './types';

export interface InterrogationResult {
  nextState: GameState;
  speakerLine: string;
  systemNote: string;
}

export function interrogateAsk(
  state: GameState,
  suspectId: SuspectId,
  topic: InterrogationTopic,
): InterrogationResult {
  const runtime = state.suspectStates[suspectId];
  const asked = runtime.askedTopics.includes(topic)
    ? runtime.askedTopics
    : [...runtime.askedTopics, topic];

  const nextState: GameState = {
    ...state,
    clockMinutes: Math.min(state.clockMinutes + 1, 145),
    suspectStates: {
      ...state.suspectStates,
      [suspectId]: {
        ...runtime,
        askedTopics: asked,
        recordedStatements: runtime.recordedStatements.includes(
          SUSPECT_PROFILES[suspectId].topics[topic].statementId,
        )
          ? runtime.recordedStatements
          : [...runtime.recordedStatements, SUSPECT_PROFILES[suspectId].topics[topic].statementId],
      },
    },
  };

  return {
    nextState,
    speakerLine: resolveDialogueResponse(nextState, suspectId, topic, 'ASK'),
    systemNote: `Statement recorded under ${SUSPECT_PROFILES[suspectId].topics[topic].label}.`,
  };
}

export function interrogatePress(
  state: GameState,
  suspectId: SuspectId,
  topic: InterrogationTopic,
): InterrogationResult {
  const runtime = state.suspectStates[suspectId];
  const pressed = runtime.pressedTopics.includes(topic)
    ? runtime.pressedTopics
    : [...runtime.pressedTopics, topic];
  const asked = runtime.askedTopics.includes(topic)
    ? runtime.askedTopics
    : [...runtime.askedTopics, topic];

  const nextState: GameState = {
    ...state,
    clockMinutes: Math.min(state.clockMinutes + 1, 145),
    suspectStates: {
      ...state.suspectStates,
      [suspectId]: {
        ...runtime,
        askedTopics: asked,
        pressedTopics: pressed,
        suspicion: Math.min(100, runtime.suspicion + 5),
      },
    },
  };

  return {
    nextState,
    speakerLine: resolveDialogueResponse(nextState, suspectId, topic, 'PRESS'),
    systemNote: 'You press for exact timings and details.',
  };
}

export function interrogateObserve(
  state: GameState,
  suspectId: SuspectId,
): InterrogationResult {
  const profile = SUSPECT_PROFILES[suspectId];
  const runtime = state.suspectStates[suspectId];
  const nextState: GameState = {
    ...state,
    suspectStates: {
      ...state.suspectStates,
      [suspectId]: {
        ...runtime,
        observedTell: true,
      },
    },
  };

  return {
    nextState,
    speakerLine: `Elias Vane observes quietly: ${profile.physicalTell}`,
    systemNote: `Physical tell noted: ${profile.behaviorSummary}`,
  };
}

export function interrogateChallenge(
  state: GameState,
  suspectId: SuspectId,
  topic: InterrogationTopic,
): InterrogationResult {
  const runtime = state.suspectStates[suspectId];
  const challenged = runtime.challengedTopics.includes(topic)
    ? runtime.challengedTopics
    : [...runtime.challengedTopics, topic];

  const nextState: GameState = {
    ...state,
    suspectStates: {
      ...state.suspectStates,
      [suspectId]: {
        ...runtime,
        challengedTopics: challenged,
        suspicion: Math.min(100, runtime.suspicion + 8),
      },
    },
  };

  return {
    nextState,
    speakerLine: resolveDialogueResponse(nextState, suspectId, topic, 'CHALLENGE'),
    systemNote: 'You challenge their consistency directly.',
  };
}

export function interrogatePresentEvidence(
  state: GameState,
  suspectId: SuspectId,
  evidenceId: string,
): InterrogationResult {
  const profile = SUSPECT_PROFILES[suspectId];
  const runtime = state.suspectStates[suspectId];
  const reaction = profile.evidenceReactions[evidenceId];

  const presented = runtime.presentedEvidenceIds.includes(evidenceId)
    ? runtime.presentedEvidenceIds
    : [...runtime.presentedEvidenceIds, evidenceId];

  if (!reaction) {
    return {
      nextState: {
        ...state,
        suspectStates: {
          ...state.suspectStates,
          [suspectId]: {
            ...runtime,
            presentedEvidenceIds: presented,
          },
        },
      },
      speakerLine: profile.defaultEvidenceReaction,
      systemNote: 'No direct contradiction triggered by that item.',
    };
  }

  const nextSuspicion = Math.max(0, Math.min(100, runtime.suspicion + reaction.suspicionDelta));
  const breaksAlibi = Boolean(reaction.breaksAlibi);
  const nextAlibiStatus = breaksAlibi
    ? 'CONTRADICTION FOUND'
    : evidenceId === 'ev_bartender_ledger' && suspectId === 'victor'
      ? 'VERIFIED'
      : runtime.alibiStatus;

  const nextState: GameState = {
    ...state,
    clockMinutes: Math.min(state.clockMinutes + 2, 145),
    suspectStates: {
      ...state.suspectStates,
      [suspectId]: {
        ...runtime,
        presentedEvidenceIds: presented,
        suspicion: nextSuspicion,
        brokenAlibi: runtime.brokenAlibi || breaksAlibi,
        alibiStatus: nextAlibiStatus,
      },
    },
  };

  return {
    nextState,
    speakerLine: reaction.dialogue,
    systemNote: breaksAlibi
      ? `ALIBI CONTRADICTION FOUND: ${profile.name}'s story has cracked.`
      : nextAlibiStatus === 'VERIFIED'
        ? `ALIBI VERIFIED: Evidence corroborates ${profile.name}'s 11:47 location.`
        : `${profile.name} reacts strongly to the evidence.`,
  };
}

export function interrogateCompareStatement(
  state: GameState,
  suspectId: SuspectId,
): InterrogationResult {
  const profile = SUSPECT_PROFILES[suspectId];
  const runtime = state.suspectStates[suspectId];
  const hasAnyContradiction = profile.contradictionEvidenceIds.some((id) =>
    state.discoveredEvidenceIds.includes(id),
  );

  if (suspectId === 'arthur' && state.suspectStates.eleanor.brokenAlibi) {
    const nextState: GameState = {
      ...state,
      suspectStates: {
        ...state.suspectStates,
        arthur: {
          ...runtime,
          alibiStatus: 'CONTRADICTION FOUND',
          brokenAlibi: true,
          suspicion: Math.max(runtime.suspicion, 60),
        },
      },
    };
    return {
      nextState,
      speakerLine:
        'You compare Arthur Bell’s claim against Eleanor Graves’s revised statement: Eleanor admits she stepped onto the rear deck from 11:46:30 to 11:47:50. Arthur Bell had an open 80-second window alone!',
      systemNote: 'Cross-statement contradiction logged against Arthur Bell.',
    };
  }

  if (hasAnyContradiction) {
    return {
      nextState: state,
      speakerLine:
        'Comparing their timeline against your evidence locker reveals a clear gap. Present the physical proof directly to force a confession.',
      systemNote: 'Contradictory physical evidence is already in your possession.',
    };
  }

  return {
    nextState: state,
    speakerLine:
      'Their current statements align on the surface—you will need physical or documentary proof from the carriages to expose any hidden discrepancies.',
    systemNote: 'No contradiction proven yet against recorded statements.',
  };
}
