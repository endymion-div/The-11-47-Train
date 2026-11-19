import { useState } from 'react';
import { X } from 'lucide-react';
import {
  ANONYMOUS_NOTE_TEXT,
  CASE_QUESTIONS,
  EVIDENCE_ITEMS,
  HYPOTHESIS_TEMPLATES,
  LOCATION_ORDER,
  SUSPECT_PROFILES,
  TIMELINE_EVENT_CARDS,
  TIMELINE_SLOTS,
  TRAIN_LOCATIONS,
  VICTIM_INFO,
} from '../game/caseData';
import { getRecordedStatements } from '../game/characterSystem';
import { filterEvidenceByCategory, getCollectedEvidence } from '../game/evidenceEngine';
import { getUnplacedTimelineCards } from '../game/timelineEngine';
import type {
  EvidenceCategory,
  GameState,
  LocationId,
  NotebookTab,
  SuspectId,
} from '../game/types';

interface NotebookDrawerProps {
  state: GameState;
  activeTab: NotebookTab;
  onSelectTab: (tab: NotebookTab) => void;
  onClose: () => void;
  onInterrogate: (suspectId: SuspectId) => void;
  onTravel: (locationId: LocationId) => void;
  onPlaceTimeline: (slotId: string, eventId: string | null) => void;
  onVerifyTimeline: () => void;
  onTestTemplateHypothesis: (templateId: string) => void;
  onCreateCustomHypothesis: (params: {
    title: string;
    suspectId: SuspectId;
    claim: string;
    selectedEvidenceIds: string[];
  }) => void;
  onReplayBlackout: () => void;
  onOpenDeduction: () => void;
}

const CATEGORIES: (EvidenceCategory | 'All')[] = [
  'All',
  'Physical',
  'Documentary',
  'Testimonial',
  'Environmental',
  'Digital',
  'Timeline',
];

const TABS: { id: NotebookTab; label: string }[] = [
  { id: 'CASE', label: 'Case' },
  { id: 'PEOPLE', label: 'People & Alibis' },
  { id: 'EVIDENCE', label: 'Evidence' },
  { id: 'TIMELINE', label: 'Timeline' },
  { id: 'THEORIES', label: 'Theories' },
  { id: 'MAP', label: 'Train Map' },
  { id: 'NOTEBOOK', label: 'Notebook' },
];

export function NotebookDrawer({
  state,
  activeTab,
  onSelectTab,
  onClose,
  onInterrogate,
  onTravel,
  onPlaceTimeline,
  onVerifyTimeline,
  onTestTemplateHypothesis,
  onCreateCustomHypothesis,
  onReplayBlackout,
  onOpenDeduction,
}: NotebookDrawerProps) {
  const [evCategory, setEvCategory] = useState<EvidenceCategory | 'All'>('All');
  const [selectedTimelineCardId, setSelectedTimelineCardId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Custom Hypothesis form state
  const [hypSuspect, setHypSuspect] = useState<SuspectId>('arthur');
  const [hypTitle, setHypTitle] = useState('');
  const [hypClaim, setHypClaim] = useState('');
  const [hypEvidence, setHypEvidence] = useState<string[]>([]);

  const collected = getCollectedEvidence(state);
  const filteredEvidence = filterEvidenceByCategory(collected, evCategory);
  const statements = getRecordedStatements(state);
  const unplacedCards = getUnplacedTimelineCards(state);

  const toggleHypEvidence = (id: string) => {
    setHypEvidence((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detective Case Dossier"
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-3 sm:p-6"
    >
      <div className="dossier-surface flex h-[88vh] w-full max-w-5xl flex-col border border-[#8e6d36] shadow-2xl overflow-hidden">
        {/* Top Tab Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3a2f22] px-4 py-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTab(t.id)}
                className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === t.id
                    ? 'bg-[#c89b48] text-[#140f0a]'
                    : 'text-[#dfd3bd] hover:bg-[#261e15]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Close Dossier"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center border border-[#4a3a27] text-[#dfd3bd] hover:border-[#c89b48] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Body */}
        <div className="noir-scroll flex-1 overflow-y-auto p-5 sm:p-6">
          {/* 1. CASE */}
          {activeTab === 'CASE' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 space-y-5">
                <div>
                  <div className="text-xs font-mono-num text-[#c89b48] uppercase tracking-wider">
                    Case Overview · Elias Vane
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-[#f5ebd6]">
                    Murder Aboard The Silver Meridian
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#dfd3bd]">
                    At 11:20 PM, an anonymous typed note reached your berth. At 11:47:00 PM sharp,
                    every lamp across the train went dead for ninety seconds. When power returned at
                    11:48:30 PM, {VICTIM_INFO.name} lay dead inside {VICTIM_INFO.compartment}—behind
                    an interior bolted door and storm-sealed windows.
                  </p>
                </div>

                <div className="parchment-sheet border border-[#9d8356] p-4 shadow-inner">
                  <div className="text-[11px] font-mono-num uppercase tracking-wider text-[#5a4526]">
                    Intercepted Slip · 11:20 PM
                  </div>
                  <p className="mt-1 font-display text-lg italic text-[#1e1710]">
                    “{ANONYMOUS_NOTE_TEXT}”
                  </p>
                </div>

                <div className="border border-[#3a2f22] bg-[#120f0c] p-4 space-y-2">
                  <div className="text-xs font-mono-num text-[#c89b48] uppercase">
                    Victim Dossier · {VICTIM_INFO.name}
                  </div>
                  <div className="text-xs text-[#b8aa93]">
                    {VICTIM_INFO.title} · Age {VICTIM_INFO.age} · {VICTIM_INFO.compartment}
                  </div>
                  <p className="text-sm text-[#e5dac4] leading-relaxed">{VICTIM_INFO.summary}</p>
                  <div className="text-xs text-[#cbbda4]">
                    Preliminary Pathology: {VICTIM_INFO.causeOfDeath}
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-4">
                <div className="border border-[#4a3a27] bg-[#14110d] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/src/assets/images/portrait_elias_vane_1795070452510.jpg"
                      alt="Detective Elias Vane"
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 object-cover border border-[#8e6d36]"
                    />
                    <div>
                      <div className="text-sm font-semibold text-[#f5ebd6]">Elias Vane</div>
                      <div className="text-xs text-[#b8aa93]">Private Consulting Detective</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-[#30261b] pt-3 text-xs font-mono-num">
                    <div>
                      <div className="text-[#9e917c]">EVIDENCE LOGGED</div>
                      <div className="text-lg font-semibold text-[#c89b48]">
                        {collected.length} / {EVIDENCE_ITEMS.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#9e917c]">TIMELINE STATUS</div>
                      <div className="text-sm font-semibold text-[#f5ebd6]">
                        {state.timelineValidated ? 'Verified' : 'Unresolved'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={onReplayBlackout}
                    className="min-h-[44px] w-full border border-[#6e542a] bg-[#1c1711] px-4 py-2 text-xs font-medium text-[#f2e8d4] hover:border-[#c89b48] cursor-pointer"
                  >
                    Re-Experience 90-Second Blackout Audio/Scene
                  </button>
                  <button
                    type="button"
                    onClick={onOpenDeduction}
                    className="min-h-[44px] w-full bg-[#74221d] border border-[#b54840] px-4 py-2 text-xs font-semibold text-[#fdf2ef] hover:bg-[#8c2b25] cursor-pointer"
                  >
                    Enter Final Deduction & Accusation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. PEOPLE & ALIBI BOARD */}
          {activeTab === 'PEOPLE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(SUSPECT_PROFILES).map((suspect) => {
                const runtime = state.suspectStates[suspect.id];
                return (
                  <article
                    key={suspect.id}
                    className="flex flex-col justify-between border border-[#3e3123] bg-[#120f0c] p-4 gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={suspect.portraitUrl}
                        alt={suspect.name}
                        referrerPolicy="no-referrer"
                        className="h-20 w-20 shrink-0 object-cover border border-[#785c2d]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-lg font-semibold text-[#f5ebd6] truncate">
                            {suspect.name}
                          </h3>
                          <span className="font-mono-num text-[11px] text-[#c89b48]">
                            {runtime.suspicion}%
                          </span>
                        </div>
                        <div className="text-xs text-[#b8aa93]">
                          {suspect.role} · {TRAIN_LOCATIONS[suspect.carriageHome].shortName}
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#dfd3bd]">
                          <strong>Possible Motive:</strong> {suspect.possibleMotive}
                        </p>
                      </div>
                    </div>

                    {/* Alibi Board Block */}
                    <div className="border-t border-[#2b2219] pt-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono-num text-[11px]">
                        <span className="text-[#a99c85]">CLAIMED ALIBI</span>
                        <span
                          className={
                            runtime.alibiStatus === 'CONTRADICTION FOUND'
                              ? 'text-[#e06d5a] font-semibold'
                              : runtime.alibiStatus === 'VERIFIED'
                                ? 'text-[#8ec48a] font-semibold'
                                : 'text-[#d4b068]'
                          }
                        >
                          {runtime.alibiStatus}
                        </span>
                      </div>
                      {suspect.alibis.map((al) => (
                        <div key={al.time} className="flex gap-2 text-[#d2c6b0]">
                          <span className="font-mono-num text-[#c89b48] shrink-0">{al.time}</span>
                          <span>{al.claim}</span>
                        </div>
                      ))}
                      {runtime.brokenAlibi && (
                        <div className="mt-1.5 text-[11px] text-[#e8988a]">
                          ✗ {suspect.contradictionExplanation}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onInterrogate(suspect.id)}
                      className="min-h-[42px] w-full bg-[#261e15] border border-[#8e6d36] text-xs font-semibold text-[#f5ebd6] hover:bg-[#c89b48] hover:text-[#140f0a] transition-colors cursor-pointer"
                    >
                      Question {suspect.name}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {/* 3. EVIDENCE */}
          {activeTab === 'EVIDENCE' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEvCategory(cat)}
                    className={`min-h-[36px] px-3 py-1 text-xs border cursor-pointer ${
                      evCategory === cat
                        ? 'bg-[#c89b48] border-[#e7c47a] text-[#140f0a] font-semibold'
                        : 'bg-[#17130f] border-[#3d3123] text-[#dfd3bd] hover:border-[#c89b48]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filteredEvidence.length === 0 ? (
                <div className="border border-[#33291e] p-8 text-center text-sm text-[#b8aa93]">
                  No clues logged under {evCategory} yet. Explore the carriages and activate
                  Observation Mode (O) to uncover hidden traces.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredEvidence.map((item) => (
                    <article
                      key={item.id}
                      className="border border-[#3e3123] bg-[#120f0c] p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-base font-semibold text-[#f5ebd6]">
                          {item.name}
                        </h3>
                        <span className="font-mono-num text-[11px] text-[#c89b48] shrink-0">
                          {item.reliability}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono-num text-[#a99c85]">
                        {item.category} · {item.locationLabel} · {item.timeDiscovered}
                      </div>
                      <p className="text-xs leading-relaxed text-[#dfd3bd]">{item.description}</p>
                      <div className="border-t border-[#2a2118] pt-2 text-xs italic text-[#cbb382]">
                        Elias’s Note: {item.observationNote}
                      </div>
                      <div className="text-[11px] text-[#9e917c]">
                        Links: {item.possibleConnections.join(' · ')}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. TIMELINE (90-SECOND BLACKOUT RECONSTRUCTION) */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-[#f5ebd6]">
                    90-Second Blackout Reconstruction
                  </h2>
                  <p className="text-xs text-[#cbbda4]">
                    Drag an event card (or click a card, then click a time slot) to reconstruct what
                    actually occurred between 11:46:30 and 11:48:30.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onVerifyTimeline}
                  className="min-h-[42px] px-5 py-2 bg-[#c89b48] text-[#140f0a] text-xs font-semibold hover:bg-[#dbb05d] cursor-pointer shrink-0"
                >
                  Verify Timeline Sequence
                </button>
              </div>

              <div
                className={`border px-4 py-2.5 text-xs font-medium ${
                  state.timelineValidated
                    ? 'border-[#5a8b56] bg-[#142014] text-[#b9e6b4]'
                    : state.timelineMessage === 'This sequence contains an inconsistency.'
                      ? 'border-[#a8443a] bg-[#2a1412] text-[#f5c7c2]'
                      : 'border-[#5a4628] bg-[#15110d] text-[#e4d6bb]'
                }`}
              >
                {state.timelineMessage}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 6 Time Slots */}
                <div className="lg:col-span-7 space-y-2.5">
                  {TIMELINE_SLOTS.map((slot) => {
                    const placedId = state.timelinePlacements[slot.id];
                    const placedCard = placedId
                      ? TIMELINE_EVENT_CARDS.find((c) => c.id === placedId)
                      : null;

                    return (
                      <div
                        key={slot.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedCardId) {
                            onPlaceTimeline(slot.id, draggedCardId);
                            setDraggedCardId(null);
                          }
                        }}
                        className={`min-h-[68px] flex items-stretch border transition-colors ${
                          selectedTimelineCardId
                            ? 'border-[#c89b48] bg-[#1f1912]'
                            : 'border-[#433524] bg-[#120f0c]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedTimelineCardId) {
                              onPlaceTimeline(slot.id, selectedTimelineCardId);
                              setSelectedTimelineCardId(null);
                            } else if (placedId) {
                              onPlaceTimeline(slot.id, null);
                            }
                          }}
                          className="flex flex-1 items-center gap-3 p-3 text-left cursor-pointer"
                        >
                          <div className="shrink-0 w-24">
                            <div className="font-mono-num text-sm font-semibold text-[#c89b48]">
                              {slot.time}
                            </div>
                            <div className="text-[11px] text-[#9e917c]">{slot.label}</div>
                          </div>

                          <div className="flex-1 min-w-0">
                            {placedCard ? (
                              <div>
                                <div className="text-xs font-semibold text-[#f5ebd6]">
                                  {placedCard.title}
                                </div>
                                <div className="text-[11px] text-[#cbbda4] line-clamp-2">
                                  {placedCard.detail}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs italic text-[#7c705d]">
                                Drop event card here or select a card on the right
                              </div>
                            )}
                          </div>
                        </button>

                        {placedCard && (
                          <button
                            type="button"
                            onClick={() => onPlaceTimeline(slot.id, null)}
                            className="shrink-0 border-l border-[#2f251b] px-3 text-xs text-[#cbbda4] hover:text-[#f5ebd6] hover:bg-[#1e1812] cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Unplaced Event Pool */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="text-xs font-mono-num text-[#c89b48] uppercase">
                    Observed & Deduced Events ({unplacedCards.length} available)
                  </div>
                  {unplacedCards.map((card) => {
                    const selected = selectedTimelineCardId === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        draggable
                        onDragStart={() => setDraggedCardId(card.id)}
                        onClick={() =>
                          setSelectedTimelineCardId((prev) => (prev === card.id ? null : card.id))
                        }
                        className={`w-full text-left border p-3 cursor-grab active:cursor-grabbing transition-colors ${
                          selected
                            ? 'border-[#e7c47a] bg-[#2a2115]'
                            : 'border-[#3d3123] bg-[#15120e] hover:border-[#8e6d36]'
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#f5ebd6]">{card.title}</div>
                        <div className="mt-1 text-[11px] text-[#cbbda4] leading-snug">
                          {card.detail}
                        </div>
                        <div className="mt-1 text-[10px] font-mono-num text-[#9e865c]">
                          {card.sourceHint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 5. THEORIES / HYPOTHESIS SYSTEM */}
          {activeTab === 'THEORIES' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Custom Hypothesis Builder */}
              <div className="lg:col-span-5 space-y-4 border border-[#3e3123] bg-[#120f0c] p-4">
                <h3 className="font-display text-lg font-semibold text-[#f5ebd6]">
                  Form & Test New Theory
                </h3>

                <div>
                  <label htmlFor="hyp-suspect" className="block text-xs text-[#b8aa93] mb-1">
                    Primary Suspect
                  </label>
                  <select
                    id="hyp-suspect"
                    value={hypSuspect}
                    onChange={(e) => setHypSuspect(e.target.value as SuspectId)}
                    className="w-full min-h-[40px] border border-[#4a3a27] bg-[#181410] px-3 text-xs text-[#f5ebd6]"
                  >
                    {Object.values(SUSPECT_PROFILES).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="hyp-title" className="block text-xs text-[#b8aa93] mb-1">
                    Theory Headline
                  </label>
                  <input
                    id="hyp-title"
                    type="text"
                    value={hypTitle}
                    onChange={(e) => setHypTitle(e.target.value)}
                    placeholder="e.g., Arthur slipped into Compartment 4 via transom wire"
                    className="w-full min-h-[40px] border border-[#4a3a27] bg-[#181410] px-3 text-xs text-[#f5ebd6]"
                  />
                </div>

                <div>
                  <label htmlFor="hyp-claim" className="block text-xs text-[#b8aa93] mb-1">
                    Working Hypothesis
                  </label>
                  <textarea
                    id="hyp-claim"
                    rows={2}
                    value={hypClaim}
                    onChange={(e) => setHypClaim(e.target.value)}
                    placeholder="State how they entered, struck, and sealed the door..."
                    className="w-full border border-[#4a3a27] bg-[#181410] p-2.5 text-xs text-[#f5ebd6]"
                  />
                </div>

                <div>
                  <div className="text-xs text-[#b8aa93] mb-1.5">
                    Attach Supporting Evidence ({hypEvidence.length})
                  </div>
                  <div className="noir-scroll max-h-36 overflow-y-auto space-y-1 border border-[#2f251b] p-2">
                    {collected.map((item) => {
                      const active = hypEvidence.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleHypEvidence(item.id)}
                          className={`w-full text-left px-2.5 py-1.5 text-xs border cursor-pointer ${
                            active
                              ? 'bg-[#2a2115] border-[#c89b48] text-[#f5ebd6]'
                              : 'bg-[#16120e] border-transparent text-[#cbbda4]'
                          }`}
                        >
                          {active ? '✓ ' : '+ '}
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onCreateCustomHypothesis({
                      title: hypTitle,
                      suspectId: hypSuspect,
                      claim: hypClaim,
                      selectedEvidenceIds: hypEvidence,
                    });
                    setHypTitle('');
                    setHypClaim('');
                    setHypEvidence([]);
                  }}
                  className="min-h-[44px] w-full bg-[#c89b48] text-[#140f0a] text-xs font-semibold hover:bg-[#dbb05d] cursor-pointer"
                >
                  Test Hypothesis Against Evidence
                </button>
              </div>

              {/* Tested Hypotheses & Quick Suspect Leads */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <div className="text-xs font-mono-num text-[#c89b48] uppercase mb-2">
                    Quick Case Hypotheses
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {HYPOTHESIS_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => onTestTemplateHypothesis(tpl.id)}
                        className="min-h-[38px] px-3 py-1.5 border border-[#5c4727] bg-[#1a1510] text-xs text-[#ebe1cd] hover:border-[#c89b48] cursor-pointer"
                      >
                        Test: {SUSPECT_PROFILES[tpl.suspectId].name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {state.hypotheses.length === 0 ? (
                    <div className="border border-[#33291e] p-6 text-sm text-[#b8aa93]">
                      No theories tested yet. Form a custom theory or test a suspect lead above.
                    </div>
                  ) : (
                    state.hypotheses.map((h) => (
                      <article
                        key={h.id}
                        className="border border-[#433524] bg-[#120f0c] p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-display text-base font-semibold text-[#f5ebd6]">
                            {h.title}
                          </h4>
                          <span
                            className={`font-mono-num text-xs font-semibold ${
                              h.status === 'PROVEN'
                                ? 'text-[#8ec48a]'
                                : h.status === 'CONTRADICTED'
                                  ? 'text-[#e06d5a]'
                                  : 'text-[#d4b068]'
                            }`}
                          >
                            {h.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#d6cab4]">{h.claim}</p>
                        <ul className="space-y-1 text-xs text-[#cbbda4]">
                          {h.evaluationNotes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 6. MAP */}
          {activeTab === 'MAP' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#f5ebd6]">
                  The Silver Meridian — Train Layout
                </h2>
                <p className="text-xs text-[#cbbda4]">
                  Select any carriage to move Elias Vane there immediately, or enter Compartment 4
                  from Carriage 7.
                </p>
              </div>

              {/* Linear Train Schematic */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LOCATION_ORDER.map((locId) => {
                  const loc = TRAIN_LOCATIONS[locId];
                  const isHere = state.currentLocation === locId;
                  return (
                    <button
                      key={locId}
                      type="button"
                      onClick={() => onTravel(locId)}
                      className={`min-h-[104px] flex flex-col justify-between border p-3.5 text-left transition-colors cursor-pointer ${
                        isHere
                          ? 'border-[#c89b48] bg-[#2a2115]'
                          : 'border-[#3d3123] bg-[#120f0c] hover:border-[#8e6d36]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-num text-[11px] text-[#c89b48]">
                          {loc.carNumber}
                        </span>
                        {isHere && (
                          <span className="font-mono-num text-[10px] text-[#f5ebd6]">YOU</span>
                        )}
                      </div>
                      <div className="font-display text-sm font-semibold text-[#f5ebd6]">
                        {loc.name}
                      </div>
                      <div className="text-[11px] text-[#b8aa93]">
                        {loc.suspectsPresent.length > 0
                          ? loc.suspectsPresent.map((s) => SUSPECT_PROFILES[s].name).join(', ')
                          : 'No suspects present'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Compartment 4 Crime Scene Inset */}
              <div className="border-t border-[#3a2f22] pt-4">
                <button
                  type="button"
                  onClick={() => onTravel('victims_compartment')}
                  className={`min-h-[68px] w-full sm:w-auto px-6 py-3 border text-left cursor-pointer ${
                    state.currentLocation === 'victims_compartment'
                      ? 'border-[#d3675d] bg-[#361816]'
                      : 'border-[#8e463a] bg-[#1d1110] hover:border-[#d3675d]'
                  }`}
                >
                  <div className="font-mono-num text-[11px] text-[#e08b82]">
                    CRIME SCENE · CARRIAGE 7 INTERIOR
                  </div>
                  <div className="font-display text-base font-semibold text-[#f9ece9]">
                    Victim&apos;s Compartment (#4) — Thomas Avery
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* 7. NOTEBOOK */}
          {activeTab === 'NOTEBOOK' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold text-[#f5ebd6]">
                  Key Unanswered Questions
                </h3>
                {CASE_QUESTIONS.map((q) => {
                  const solved = state.discoveredEvidenceIds.includes(q.resolvedByEvidenceId);
                  return (
                    <div
                      key={q.id}
                      className="border border-[#3d3123] bg-[#120f0c] p-3.5 space-y-1.5"
                    >
                      <div className="text-xs font-semibold text-[#f0d8a5]">{q.question}</div>
                      {solved ? (
                        <div className="text-xs text-[#9ed09a]">✓ Resolved: {q.answer}</div>
                      ) : (
                        <div className="text-xs italic text-[#9e917c]">
                          Unanswered — continue searching carriages and activating Observation Mode.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold text-[#f5ebd6]">
                  Recorded Suspect Statements ({statements.length})
                </h3>
                {statements.length === 0 ? (
                  <div className="border border-[#33291e] p-5 text-xs text-[#b8aa93]">
                    No statements recorded yet. Click any suspect inside the carriages or via People
                    to begin questioning.
                  </div>
                ) : (
                  statements.map((st) => (
                    <div
                      key={st.id}
                      className="border border-[#3d3123] bg-[#120f0c] p-3.5 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono-num">
                        <span className="text-[#c89b48]">
                          {SUSPECT_PROFILES[st.suspectId].name} · {st.topic}
                        </span>
                        {st.contradictedBy && (
                          <span className="text-[#e06d5a]">STORY BROKEN</span>
                        )}
                      </div>
                      <p className="text-xs text-[#dfd3bd] leading-relaxed">{st.quote}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
