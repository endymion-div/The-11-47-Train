import { EVIDENCE_ITEMS, SUSPECT_PROFILES } from './caseData';
import { getContradictedSuspectCount } from './characterSystem';
import type { DeductionSubmission, EndingOutcome, GameState } from './types';

export const HOW_OPTIONS = [
  {
    id: 'how_wire_shunt',
    label:
      'Triggered a 90s thermal shunt, sedated Avery, struck him with the brass coupling wrench, and pulled the interior bolt shut via transom piano wire.',
  },
  {
    id: 'how_window_roof',
    label: 'Climbed along the exterior train roof during the storm and broke through the Compartment 4 window.',
  },
  {
    id: 'how_duplicate_key',
    label: 'Used a duplicate conductor passkey to lock the interior night-bolt from the corridor.',
  },
  {
    id: 'how_poison_only',
    label: 'Poisoned Avery’s brandy earlier and let him bolt his own door before collapsing at 11:47:30.',
  },
];

export const WHY_OPTIONS = [
  {
    id: 'why_martin_bell',
    label:
      'Revenge for his brother, Chief Engineer Martin Bell, framed and ruined by Thomas Avery’s forged 1920 bridge audit.',
  },
  {
    id: 'why_steel_contract',
    label: 'To stop Avery from exposing defective Bessemer steel shipments to the Northern Railway Board.',
  },
  {
    id: 'why_promissory_debt',
    label: 'To destroy a £42,000 forged promissory note before Avery reached London.',
  },
  {
    id: 'why_vienna_malpractice',
    label: 'To silence Avery’s blackmail over sealed 1919 Vienna surgical malpractice records.',
  },
];

export const WHEN_OPTIONS = [
  { id: 'when_1147_30', label: '11:47:30 PM — Thirty seconds into the 90-second blackout' },
  { id: 'when_1143_00', label: '11:43:00 PM — Before the blackout began' },
  { id: 'when_1148_33', label: '11:48:33 PM — Just after the lights returned' },
];

export const WHERE_OPTIONS = [
  { id: 'where_comp_4', label: 'Carriage 7, Compartment 4 (approached from Observation Carriage)' },
  { id: 'where_lounge', label: 'The Lounge bar, before the body was moved' },
  { id: 'where_engine', label: 'Engine Access area, then carried down the corridor' },
];

export function evaluateFinalDeduction(
  state: GameState,
  submission: DeductionSubmission,
): EndingOutcome {
  const totalClues = EVIDENCE_ITEMS.length;
  const cluesFound = state.discoveredEvidenceIds.length;
  const keyCluesFound = EVIDENCE_ITEMS.filter(
    (e) => e.isKeyClue && state.discoveredEvidenceIds.includes(e.id),
  ).length;
  const totalKeyClues = EVIDENCE_ITEMS.filter((e) => e.isKeyClue).length;
  const contradictionsFound = getContradictedSuspectCount(state);

  const selectedEvidence = new Set(submission.evidenceIds);
  const decisiveProofIds = [
    'ev_moved_suitcase',
    'ev_door_scratch',
    'ev_thermal_shunt',
    'ev_rear_deck_latch',
    'ev_missing_wrench',
    'ev_stopped_watch',
    'ev_brandy_residue',
    'ev_wet_footprint',
  ];
  const matchedDecisive = decisiveProofIds.filter((id) => selectedEvidence.has(id)).length;

  const rightWho = submission.who === 'arthur';
  const rightHow = submission.how === 'how_wire_shunt';
  const rightWhy = submission.why === 'why_martin_bell';
  const rightWhen = submission.when === 'when_1147_30';
  const rightWhere = submission.where === 'where_comp_4';

  const methodCount = [rightHow, rightWhy, rightWhen, rightWhere].filter(Boolean).length;

  // Prevent random lucky guesses: require actual discovered evidence + proof attachment
  const hasRealInvestigation = cluesFound >= 8 && matchedDecisive >= 3;

  if (!submission.who || cluesFound < 4) {
    return {
      tier: 'UNSOLVED',
      title: 'Case Unsolved',
      subtitle: 'The Silver Meridian Pulls Into Dawn With Questions Unanswered',
      epilogue:
        'Without sufficient forensic evidence from the carriages, Scotland Yard detains the entire compartment at London Terminus. The secret of the 90-second blackout slips away into the morning fog.',
      score: cluesFound * 25,
      cluesFound,
      totalClues,
      contradictionsFound,
      timelineSolved: state.timelineValidated,
    };
  }

  if (!rightWho) {
    const accused = SUSPECT_PROFILES[submission.who];
    return {
      tier: 'FALSE_ACCUSATION',
      title: 'False Accusation',
      subtitle: `${accused.name} Was Wrongly Charged`,
      epilogue: `You ordered Conductor Reed to detain ${accused.name}, but crucial physical evidence in Carriage 5 and Observation went overlooked. Two days later, the true killer quietly disappeared at Dover while the alibi collapsed in court.`,
      score: Math.max(100, cluesFound * 20 + contradictionsFound * 30),
      cluesFound,
      totalClues,
      contradictionsFound,
      timelineSolved: state.timelineValidated,
    };
  }

  // Right suspect! Now check if Master Detective, Perfect Solution, or Correct Suspect
  if (
    rightHow &&
    rightWhy &&
    rightWhen &&
    rightWhere &&
    state.timelineValidated &&
    keyCluesFound >= totalKeyClues - 1 &&
    matchedDecisive >= 5
  ) {
    return {
      tier: 'MASTER_DETECTIVE',
      title: 'Master Detective',
      subtitle: 'Every Second of the Blackout Reconstructed',
      epilogue:
        'In front of the assembled passengers, Elias Vane dismantles Arthur Vance-Bell’s masterpiece second by second: the stolen sedative, the 90-second thermal shunt, Eleanor’s storm break on the rear deck, the wet felt overshoes, the coupling wrench strike at 11:47:30, and the silk-wrapped piano wire drawn through the transom. Arthur Bell surrenders in silence as London lights break through the storm.',
      score: 1000 + cluesFound * 20 + contradictionsFound * 50,
      cluesFound,
      totalClues,
      contradictionsFound,
      timelineSolved: state.timelineValidated,
    };
  }

  if (hasRealInvestigation && methodCount >= 3 && matchedDecisive >= 3) {
    return {
      tier: 'PERFECT_SOLUTION',
      title: 'Perfect Solution',
      subtitle: 'Arthur Vance-Bell Arrested at London Terminus',
      epilogue:
        'Your reconstruction exposes how Arthur Bell exploited Eleanor Graves’s brief absence on the rear deck, engineered the 90-second blackout, and locked Compartment 4 from the corridor with piano wire. Confronted with his brother’s 1920 inquiry file and damp overshoes, Bell confesses before dawn.',
      score: 750 + cluesFound * 15 + contradictionsFound * 40,
      cluesFound,
      totalClues,
      contradictionsFound,
      timelineSolved: state.timelineValidated,
    };
  }

  return {
    tier: 'CORRECT_SUSPECT',
    title: 'Correct Suspect, Incomplete Proof',
    subtitle: 'Arthur Bell Detained — Method Partially Unproven',
    epilogue:
      'Your instinct correctly identified the mild-mannered clerk Arthur Bell, yet gaps in your forensic chain—such as the transom wire mechanism or the 90-second timing shunt—leave prosecutors scrambling to explain the locked door in court.',
    score: 420 + cluesFound * 15,
    cluesFound,
    totalClues,
    contradictionsFound,
    timelineSolved: state.timelineValidated,
  };
}
