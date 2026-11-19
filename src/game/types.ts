export type ScreenPhase = 'title' | 'blackout' | 'playing' | 'paused' | 'gameover';

export type Difficulty = 'casual' | 'investigator' | 'master';

export type LocationId =
  | 'engine_access'
  | 'conductors_compartment'
  | 'dining_car'
  | 'lounge'
  | 'carriage_3'
  | 'carriage_5'
  | 'carriage_7'
  | 'victims_compartment'
  | 'observation_carriage';

export type SuspectId = 'clara' | 'victor' | 'mercer' | 'eleanor' | 'reed' | 'arthur';

export type EvidenceCategory =
  | 'Physical'
  | 'Documentary'
  | 'Testimonial'
  | 'Environmental'
  | 'Digital'
  | 'Timeline';

export type ReliabilityRating = 'Verified' | 'High' | 'Corroborated' | 'Circumstantial';

export interface EvidenceItem {
  id: string;
  name: string;
  category: EvidenceCategory;
  location: LocationId;
  locationLabel: string;
  timeDiscovered: string;
  description: string;
  observationNote: string;
  reliability: ReliabilityRating;
  possibleConnections: string[];
  isKeyClue: boolean;
  requiresObservation?: boolean;
}

export interface Hotspot {
  id: string;
  label: string;
  x: number; // 0..1 normalized across carriage width
  y: number; // 0..1 normalized across carriage height
  width: number;
  height: number;
  kind: 'evidence' | 'door' | 'detail' | 'suspect';
  evidenceId?: string;
  targetLocation?: LocationId;
  suspectId?: SuspectId;
  requiresObservation?: boolean;
  inspectText: string;
  observationDetail?: string;
}

export interface TrainLocation {
  id: LocationId;
  name: string;
  shortName: string;
  carNumber: string;
  description: string;
  ambientTheme: 'mahogany' | 'velvet' | 'corridor' | 'crime' | 'steel' | 'glass';
  leftExit?: LocationId;
  rightExit?: LocationId;
  interiorDoor?: LocationId;
  floorY: number;
  hotspots: Hotspot[];
  suspectsPresent: SuspectId[];
}

export interface AlibiEntry {
  time: string;
  claim: string;
}

export type AlibiStatus = 'UNVERIFIED' | 'CONTRADICTION FOUND' | 'VERIFIED';

export interface SuspectStatement {
  id: string;
  suspectId: SuspectId;
  topic: string;
  quote: string;
  isLie: boolean;
  contradictedBy?: string;
}

export type InterrogationAction =
  | 'ASK'
  | 'PRESS'
  | 'OBSERVE'
  | 'CHALLENGE'
  | 'PRESENT_EVIDENCE'
  | 'COMPARE_STATEMENT'
  | 'CHANGE_SUBJECT'
  | 'END_INTERVIEW';

export type InterrogationTopic = 'alibi' | 'victim' | 'blackout' | 'secret';

export interface SuspectProfile {
  id: SuspectId;
  name: string;
  role: string;
  age: number;
  portraitUrl: string;
  carriageHome: LocationId;
  possibleMotive: string;
  behaviorSummary: string;
  physicalTell: string;
  alibis: AlibiEntry[];
  contradictionEvidenceIds: string[];
  contradictionExplanation: string;
  truthSummary: string;
  topics: Record<
    InterrogationTopic,
    {
      label: string;
      initialAnswer: string;
      pressAnswer: string;
      challengedAnswer: string;
      statementId: string;
      statementQuote: string;
      isLie: boolean;
      requiredEvidenceToBreak?: string;
      brokenAnswer?: string;
      brokenStatementQuote?: string;
    }
  >;
  evidenceReactions: Record<
    string,
    {
      dialogue: string;
      suspicionDelta: number;
      breaksAlibi?: boolean;
      unlocksEvidenceId?: string;
      revealsQuestionId?: string;
    }
  >;
  defaultEvidenceReaction: string;
}

export interface TimelineSlot {
  id: string;
  time: string;
  label: string;
  expectedEventId: string;
}

export interface TimelineEventCard {
  id: string;
  title: string;
  detail: string;
  sourceHint: string;
  requiredEvidenceId?: string; // unlocked when discovered or available from start
}

export interface HypothesisTemplate {
  id: string;
  title: string;
  suspectId: SuspectId;
  claim: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  conclusionText: string;
}

export interface PlayerHypothesis {
  id: string;
  title: string;
  suspectId: SuspectId;
  claim: string;
  selectedEvidenceIds: string[];
  status: 'UNPROVEN' | 'CONTRADICTED' | 'PROVEN';
  evaluationNotes: string[];
}

export interface CaseQuestion {
  id: string;
  question: string;
  resolvedByEvidenceId: string;
  answer: string;
}

export type EndingTier =
  | 'MASTER_DETECTIVE'
  | 'PERFECT_SOLUTION'
  | 'CORRECT_SUSPECT'
  | 'FALSE_ACCUSATION'
  | 'UNSOLVED';

export interface DeductionSubmission {
  who: SuspectId | '';
  how: string;
  why: string;
  when: string;
  where: string;
  evidenceIds: string[];
}

export interface EndingOutcome {
  tier: EndingTier;
  title: string;
  subtitle: string;
  epilogue: string;
  score: number;
  cluesFound: number;
  totalClues: number;
  contradictionsFound: number;
  timelineSolved: boolean;
}

export type NotebookTab =
  | 'CASE'
  | 'PEOPLE'
  | 'EVIDENCE'
  | 'TIMELINE'
  | 'THEORIES'
  | 'MAP'
  | 'NOTEBOOK';

export interface SuspectRuntimeState {
  suspicion: number; // 0..100
  alibiStatus: AlibiStatus;
  brokenAlibi: boolean;
  askedTopics: InterrogationTopic[];
  pressedTopics: InterrogationTopic[];
  challengedTopics: InterrogationTopic[];
  presentedEvidenceIds: string[];
  recordedStatements: string[]; // statement IDs
  observedTell: boolean;
}

export interface GameState {
  phase: ScreenPhase;
  difficulty: Difficulty;
  currentLocation: LocationId;
  playerX: number; // 0.08..0.92 inside carriage
  playerFacing: 1 | -1;
  observationMode: boolean;
  clockMinutes: number; // minutes past 11:00 PM (e.g. 48 => 11:48 PM, 78 => 12:18 AM)
  discoveredEvidenceIds: string[];
  inspectedHotspotIds: string[];
  suspectStates: Record<SuspectId, SuspectRuntimeState>;
  timelinePlacements: Record<string, string | null>; // slotId -> eventCardId | null
  timelineValidated: boolean;
  timelineMessage: string;
  hypotheses: PlayerHypothesis[];
  activePanel: NotebookTab | null;
  activeSuspectId: SuspectId | null;
  blackoutProgress: number; // 0..90 seconds during blackout sequence
  blackoutObservedEvents: string[];
  muted: boolean;
  deductionOpen: boolean;
  ending: EndingOutcome | null;
  toastMessage: string | null;
  lastSavedAt: string | null;
}
