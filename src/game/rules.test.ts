import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState, formatTrainClock } from './gameState';
import { collectEvidence } from './evidenceEngine';
import { interrogateAsk, interrogatePresentEvidence, interrogateCompareStatement } from './interrogationEngine';
import { placeTimelineEvent, validateTimeline } from './timelineEngine';
import { createHypothesisFromTemplate } from './hypothesisEngine';
import { evaluateFinalDeduction } from './endingSystem';
import { EVIDENCE_ITEMS, TIMELINE_SLOTS } from './caseData';

test('initial game state starts with anonymous 11:20 PM warning note and 6 suspects', () => {
  const state = createInitialGameState('investigator');
  assert.equal(state.phase, 'title');
  assert.equal(state.discoveredEvidenceIds.includes('ev_anonymous_note'), true);
  assert.equal(Object.keys(state.suspectStates).length, 6);
  assert.equal(formatTrainClock(state.clockMinutes), '11:48 PM');
});

test('evidence collection increments evidence locker and avoids duplicates', () => {
  let state = createInitialGameState('investigator', true);
  const first = collectEvidence(state, 'ev_stopped_watch');
  assert.equal(first.collectedNow, true);
  state = first.nextState;
  assert.equal(state.discoveredEvidenceIds.includes('ev_stopped_watch'), true);

  const duplicate = collectEvidence(state, 'ev_stopped_watch');
  assert.equal(duplicate.collectedNow, false);
});

test('presenting Clara berth punch log breaks her alibi and exposes contradiction', () => {
  let state = createInitialGameState('investigator', true);
  state = interrogateAsk(state, 'clara', 'alibi').nextState;
  const res = interrogatePresentEvidence(state, 'clara', 'ev_ticket_scanner_log');
  assert.equal(res.nextState.suspectStates.clara.alibiStatus, 'CONTRADICTION FOUND');
  assert.equal(res.nextState.suspectStates.clara.brokenAlibi, true);
});

test('comparing Arthur Bell statement after breaking Eleanor alibi exposes Arthur window', () => {
  let state = createInitialGameState('investigator', true);
  state = interrogatePresentEvidence(state, 'eleanor', 'ev_rear_deck_latch').nextState;
  assert.equal(state.suspectStates.eleanor.brokenAlibi, true);

  const compared = interrogateCompareStatement(state, 'arthur');
  assert.equal(compared.nextState.suspectStates.arthur.alibiStatus, 'CONTRADICTION FOUND');
});

test('timeline validation catches inconsistencies without spoiling answers and confirms full match', () => {
  let state = createInitialGameState('investigator', true);
  // Place wrong sequence (swap slot_1 and slot_2)
  state = placeTimelineEvent(state, 'slot_1', TIMELINE_SLOTS[1].expectedEventId);
  state = placeTimelineEvent(state, 'slot_2', TIMELINE_SLOTS[0].expectedEventId);
  state = placeTimelineEvent(state, 'slot_3', TIMELINE_SLOTS[2].expectedEventId);
  state = placeTimelineEvent(state, 'slot_4', TIMELINE_SLOTS[3].expectedEventId);
  state = placeTimelineEvent(state, 'slot_5', TIMELINE_SLOTS[4].expectedEventId);
  state = placeTimelineEvent(state, 'slot_6', TIMELINE_SLOTS[5].expectedEventId);

  const invalidCheck = validateTimeline(state);
  assert.equal(invalidCheck.isValid, false);
  assert.equal(invalidCheck.message, 'This sequence contains an inconsistency.');

  // Now place exact correct sequence
  for (const slot of TIMELINE_SLOTS) {
    state = placeTimelineEvent(state, slot.id, slot.expectedEventId);
  }
  const validCheck = validateTimeline(state);
  assert.equal(validCheck.isValid, true);
  assert.equal(validCheck.nextState.timelineValidated, true);
});

test('hypothesis testing proves Arthur Bell when core evidence is collected and contradicts Victor Hale', () => {
  let state = createInitialGameState('investigator', true);
  for (const item of EVIDENCE_ITEMS) {
    state = collectEvidence(state, item.id).nextState;
  }
  const victorHyp = createHypothesisFromTemplate('hyp_victor', state);
  assert.equal(victorHyp?.status, 'CONTRADICTED');

  const arthurHyp = createHypothesisFromTemplate('hyp_arthur', state);
  assert.equal(arthurHyp?.status, 'PROVEN');
});

test('ending system distinguishes Master Detective, False Accusation, Correct Suspect, and Unsolved', () => {
  const bareState = createInitialGameState('investigator', true);
  const unsolved = evaluateFinalDeduction(bareState, {
    who: 'arthur',
    how: 'how_wire_shunt',
    why: 'why_martin_bell',
    when: 'when_1147_30',
    where: 'where_comp_4',
    evidenceIds: [],
  });
  assert.equal(unsolved.tier, 'UNSOLVED');

  let fullState = createInitialGameState('investigator', true);
  for (const item of EVIDENCE_ITEMS) {
    fullState = collectEvidence(fullState, item.id).nextState;
  }
  for (const slot of TIMELINE_SLOTS) {
    fullState = placeTimelineEvent(fullState, slot.id, slot.expectedEventId);
  }
  fullState = validateTimeline(fullState).nextState;

  const wrongAccusation = evaluateFinalDeduction(fullState, {
    who: 'victor',
    how: 'how_wire_shunt',
    why: 'why_steel_contract',
    when: 'when_1147_30',
    where: 'where_comp_4',
    evidenceIds: ['ev_hale_cigarette_case'],
  });
  assert.equal(wrongAccusation.tier, 'FALSE_ACCUSATION');

  const partialArthur = evaluateFinalDeduction(fullState, {
    who: 'arthur',
    how: 'how_window_roof',
    why: 'why_steel_contract',
    when: 'when_1143_00',
    where: 'where_lounge',
    evidenceIds: ['ev_anonymous_note'],
  });
  assert.equal(partialArthur.tier, 'CORRECT_SUSPECT');

  const master = evaluateFinalDeduction(fullState, {
    who: 'arthur',
    how: 'how_wire_shunt',
    why: 'why_martin_bell',
    when: 'when_1147_30',
    where: 'where_comp_4',
    evidenceIds: [
      'ev_moved_suitcase',
      'ev_door_scratch',
      'ev_thermal_shunt',
      'ev_rear_deck_latch',
      'ev_missing_wrench',
      'ev_stopped_watch',
    ],
  });
  assert.equal(master.tier, 'MASTER_DETECTIVE');
});
