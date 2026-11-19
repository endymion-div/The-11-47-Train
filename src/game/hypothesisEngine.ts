import { EVIDENCE_ITEMS, HYPOTHESIS_TEMPLATES, SUSPECT_PROFILES } from './caseData';
import type { GameState, PlayerHypothesis, SuspectId } from './types';

export function createHypothesisFromTemplate(
  templateId: string,
  state: GameState,
): PlayerHypothesis | null {
  const tpl = HYPOTHESIS_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return null;

  const selectedEvidenceIds = [
    ...tpl.supportingEvidenceIds,
    ...tpl.contradictingEvidenceIds,
  ].filter((id) => state.discoveredEvidenceIds.includes(id));

  return evaluateHypothesis(
    {
      id: `player_${tpl.id}_${Date.now()}`,
      title: tpl.title,
      suspectId: tpl.suspectId,
      claim: tpl.claim,
      selectedEvidenceIds,
      status: 'UNPROVEN',
      evaluationNotes: [],
    },
    state,
  );
}

export function createCustomHypothesis(
  params: {
    title: string;
    suspectId: SuspectId;
    claim: string;
    selectedEvidenceIds: string[];
  },
  state: GameState,
): PlayerHypothesis {
  return evaluateHypothesis(
    {
      id: `custom_${Date.now()}`,
      title: params.title.trim() || `Theory on ${SUSPECT_PROFILES[params.suspectId].name}`,
      suspectId: params.suspectId,
      claim: params.claim.trim() || `${SUSPECT_PROFILES[params.suspectId].name} executed the 11:47 murder.`,
      selectedEvidenceIds: params.selectedEvidenceIds,
      status: 'UNPROVEN',
      evaluationNotes: [],
    },
    state,
  );
}

export function evaluateHypothesis(
  hypothesis: PlayerHypothesis,
  state: GameState,
): PlayerHypothesis {
  const notes: string[] = [];
  const selected = new Set(hypothesis.selectedEvidenceIds);

  if (hypothesis.suspectId === 'victor') {
    if (state.discoveredEvidenceIds.includes('ev_bartender_ledger')) {
      notes.push('✗ Contradicted by Lounge Cognac Chit (11:47 PM) — Victor Hale was in the Lounge when the lights failed.');
      return { ...hypothesis, status: 'CONTRADICTED', evaluationNotes: notes };
    }
    notes.push('? Motive and cigarette case exist, but no proof places Hale in Carriage 7 at 11:47.');
    return { ...hypothesis, status: 'UNPROVEN', evaluationNotes: notes };
  }

  if (hypothesis.suspectId === 'clara') {
    if (
      state.discoveredEvidenceIds.includes('ev_promissory_note') &&
      state.suspectStates.clara.brokenAlibi
    ) {
      notes.push('✗ Clara entered Carriage 5 to burn her £42,000 debt note in the Lounge hearth, not to enter Compartment 4.');
      return { ...hypothesis, status: 'CONTRADICTED', evaluationNotes: notes };
    }
    notes.push('? Her passkey was scanned in Carriage 5 at 11:46:10, yet no murder weapon ties to her.');
    return { ...hypothesis, status: 'UNPROVEN', evaluationNotes: notes };
  }

  if (hypothesis.suspectId === 'mercer') {
    if (state.suspectStates.mercer.brokenAlibi) {
      notes.push('✗ His chloral hydrate vial was stolen from an unlocked satchel at 11:15 PM; no physical trace puts him in Comp 4.');
      return { ...hypothesis, status: 'CONTRADICTED', evaluationNotes: notes };
    }
    notes.push('? Sedative residue matches medical stock, but how did he reach Comp 4 or lock the bolt?');
    return { ...hypothesis, status: 'UNPROVEN', evaluationNotes: notes };
  }

  if (hypothesis.suspectId === 'eleanor') {
    if (state.discoveredEvidenceIds.includes('ev_rear_deck_latch')) {
      notes.push('✗ Wet trench hem confirms she stepped outside onto the Observation rear deck during the blackout.');
      return { ...hypothesis, status: 'CONTRADICTED', evaluationNotes: notes };
    }
    notes.push('? Threat to her source establishes motive, but no physical proof connects her to the wrench or wire.');
    return { ...hypothesis, status: 'UNPROVEN', evaluationNotes: notes };
  }

  if (hypothesis.suspectId === 'reed') {
    if (state.suspectStates.reed.brokenAlibi) {
      notes.push('✗ Reed hid the Engine Access carelessness out of fear for his pension, and felt the true killer brush past him at 11:47:15.');
      return { ...hypothesis, status: 'CONTRADICTED', evaluationNotes: notes };
    }
    notes.push('? Reed knew train systems intimately, yet lacked any motive against Avery.');
    return { ...hypothesis, status: 'UNPROVEN', evaluationNotes: notes };
  }

  // Arthur Bell evaluation
  const coreProofIds = [
    'ev_rear_deck_latch',
    'ev_moved_suitcase',
    'ev_door_scratch',
    'ev_thermal_shunt',
    'ev_missing_wrench',
  ];
  const matchedCore = coreProofIds.filter((id) => selected.has(id));
  const discoveredCore = coreProofIds.filter((id) => state.discoveredEvidenceIds.includes(id));

  matchedCore.forEach((id) => {
    const item = EVIDENCE_ITEMS.find((e) => e.id === id);
    if (item) notes.push(`✓ ${item.name} supports this theory.`);
  });

  if (matchedCore.length >= 4 && state.difficulty !== 'master') {
    return {
      ...hypothesis,
      status: 'PROVEN',
      evaluationNotes: [
        ...notes,
        '✓ All mechanical, forensic, and timeline threads interlock cleanly around Arthur Bell.',
      ],
    };
  }

  if (matchedCore.length === 5) {
    return {
      ...hypothesis,
      status: 'PROVEN',
      evaluationNotes: [
        ...notes,
        '✓ Complete forensic chain verified.',
      ],
    };
  }

  if (discoveredCore.length < 4) {
    notes.push('? Missing decisive physical proof from Carriage 5, Compartment 4, or Observation.');
  } else {
    notes.push('? Attach at least 4 decisive physical clues from your evidence locker to test this theory.');
  }

  return {
    ...hypothesis,
    status: 'UNPROVEN',
    evaluationNotes: notes,
  };
}
