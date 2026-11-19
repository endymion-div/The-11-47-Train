import { useState } from 'react';
import { X } from 'lucide-react';
import { SUSPECT_PROFILES } from '../game/caseData';
import { getCollectedEvidence } from '../game/evidenceEngine';
import type { GameState, InterrogationTopic, SuspectId } from '../game/types';

interface InterrogationModalProps {
  state: GameState;
  suspectId: SuspectId;
  lastLine: string;
  systemNote: string;
  onAction: (
    action:
      | 'ASK'
      | 'PRESS'
      | 'OBSERVE'
      | 'CHALLENGE'
      | 'PRESENT_EVIDENCE'
      | 'COMPARE_STATEMENT',
    topic: InterrogationTopic,
    evidenceId?: string,
  ) => void;
  onClose: () => void;
}

const TOPICS: { id: InterrogationTopic; label: string }[] = [
  { id: 'alibi', label: '11:47 Alibi' },
  { id: 'victim', label: 'Thomas Avery' },
  { id: 'blackout', label: '90s Blackout' },
  { id: 'secret', label: 'Hidden Detail' },
];

export function InterrogationModal({
  state,
  suspectId,
  lastLine,
  systemNote,
  onAction,
  onClose,
}: InterrogationModalProps) {
  const profile = SUSPECT_PROFILES[suspectId];
  const runtime = state.suspectStates[suspectId];
  const collected = getCollectedEvidence(state);
  const [topic, setTopic] = useState<InterrogationTopic>('alibi');
  const [presentingEvidence, setPresentingEvidence] = useState(false);
  const [changingSubject, setChangingSubject] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Interrogating ${profile.name}`}
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-3 sm:p-6"
    >
      <div className="dossier-surface flex max-h-[92vh] w-full max-w-4xl flex-col border border-[#8e6d36] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3a2f22] px-5 py-3.5">
          <div>
            <div className="text-[11px] font-mono-num tracking-widest text-[#c89b48] uppercase">
              Interrogation · {profile.role}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#f5ebd6]">
              {profile.name}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-xs font-mono-num">
              <div className="text-[#b8aa93]">
                SUSPICION: <strong className="text-[#f0c878]">{runtime.suspicion}%</strong>
              </div>
              <div
                className={
                  runtime.alibiStatus === 'CONTRADICTION FOUND'
                    ? 'text-[#e06d5a]'
                    : runtime.alibiStatus === 'VERIFIED'
                      ? 'text-[#8ec48a]'
                      : 'text-[#c2b59f]'
                }
              >
                ALIBI: {runtime.alibiStatus}
              </div>
            </div>

            <button
              type="button"
              aria-label="End Interview"
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center border border-[#4a3a27] text-[#dfd3bd] hover:border-[#c89b48] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Body: Portraits + Transcript */}
        <div className="noir-scroll grid flex-1 grid-cols-1 md:grid-cols-12 gap-4 overflow-y-auto p-5">
          {/* Suspect & Elias Portrait Column */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <div className="relative aspect-square w-full overflow-hidden border border-[#6e542a] bg-[#1a1511]">
              <img
                src={profile.portraitUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
                <div className="text-xs font-medium text-[#f5ebd6]">{profile.name}</div>
                <div className="text-[11px] text-[#cbbda4]">{profile.behaviorSummary}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 border border-[#3a2f22] bg-[#120f0c] p-2.5">
              <img
                src="/src/assets/images/portrait_elias_vane_1795070452510.jpg"
                alt="Detective Elias Vane"
                referrerPolicy="no-referrer"
                className="h-12 w-12 shrink-0 object-cover border border-[#6e542a]"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#f0d8a5]">Elias Vane</div>
                <div className="text-[11px] text-[#b8aa93] leading-snug">
                  {runtime.observedTell
                    ? profile.physicalTell
                    : 'Use Observe to watch for physical tells.'}
                </div>
              </div>
            </div>
          </div>

          {/* Dialogue & Controls Column */}
          <div className="md:col-span-8 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              {/* Subject Tabs (or Change Subject picker) */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-[#342a1e] pb-2.5">
                <span className="mr-1 text-xs font-mono-num text-[#a99c85]">SUBJECT:</span>
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTopic(t.id);
                      setChangingSubject(false);
                    }}
                    className={`min-h-[36px] px-3 py-1 text-xs font-medium border cursor-pointer transition-colors ${
                      topic === t.id
                        ? 'bg-[#c89b48] border-[#e7c47a] text-[#140f0a]'
                        : 'bg-[#1a1510] border-[#433524] text-[#dfd3bd] hover:border-[#c89b48]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Active Response Box */}
              <div className="border border-[#4a3a27] bg-[#110e0b] p-4 min-h-[140px] flex flex-col justify-between gap-3">
                <p className="text-sm sm:text-base leading-relaxed text-[#f3ead8]">
                  {lastLine}
                </p>
                {systemNote && (
                  <div className="border-t border-[#2d241a] pt-2 text-xs font-mono-num text-[#c89b48]">
                    {systemNote}
                  </div>
                )}
              </div>

              {/* Evidence Picker Drawer when Present Evidence is toggled */}
              {presentingEvidence && (
                <div className="border border-[#8e6d36] bg-[#17130f] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#f0d8a5]">
                      Select Evidence to Present to {profile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPresentingEvidence(false)}
                      className="text-xs text-[#b8aa93] hover:text-[#f5ebd6] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="noir-scroll grid max-h-40 grid-cols-1 sm:grid-cols-2 gap-1.5 overflow-y-auto">
                    {collected.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onAction('PRESENT_EVIDENCE', topic, item.id);
                          setPresentingEvidence(false);
                        }}
                        className="min-h-[40px] px-3 py-1.5 text-left text-xs border border-[#3c3022] bg-[#110e0b] text-[#ebe1cd] hover:border-[#c89b48] cursor-pointer"
                      >
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-[11px] text-[#a99c85]">{item.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {changingSubject && (
                <div className="border border-[#5c4727] bg-[#17130f] p-3 text-xs text-[#dfd3bd]">
                  Choose a subject tab above ({TOPICS.map((t) => t.label).join(' · ')}) to pivot the interrogation.
                </div>
              )}
            </div>

            {/* 8 Interrogation Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#342a1e]">
              <button
                type="button"
                onClick={() => onAction('ASK', topic)}
                className="min-h-[44px] bg-[#c89b48] text-[#140f0a] text-xs font-semibold hover:bg-[#dbb05d] cursor-pointer"
              >
                Ask
              </button>
              <button
                type="button"
                onClick={() => onAction('PRESS', topic)}
                className="min-h-[44px] border border-[#6e542a] bg-[#211a13] text-[#f2e8d4] text-xs font-medium hover:border-[#c89b48] cursor-pointer"
              >
                Press
              </button>
              <button
                type="button"
                onClick={() => onAction('OBSERVE', topic)}
                className="min-h-[44px] border border-[#6e542a] bg-[#211a13] text-[#f2e8d4] text-xs font-medium hover:border-[#c89b48] cursor-pointer"
              >
                Observe
              </button>
              <button
                type="button"
                onClick={() => onAction('CHALLENGE', topic)}
                className="min-h-[44px] border border-[#8e463a] bg-[#2b1714] text-[#f6ddd8] text-xs font-medium hover:bg-[#3a1f1b] cursor-pointer"
              >
                Challenge
              </button>
              <button
                type="button"
                onClick={() => setPresentingEvidence((v) => !v)}
                className="min-h-[44px] border border-[#9d7735] bg-[#282014] text-[#f3dfb3] text-xs font-semibold hover:bg-[#352a1b] cursor-pointer"
              >
                Present Evidence
              </button>
              <button
                type="button"
                onClick={() => onAction('COMPARE_STATEMENT', topic)}
                className="min-h-[44px] border border-[#5a4628] bg-[#1a1510] text-[#e5dac4] text-xs font-medium hover:border-[#c89b48] cursor-pointer"
              >
                Compare Statement
              </button>
              <button
                type="button"
                onClick={() => setChangingSubject((v) => !v)}
                className="min-h-[44px] border border-[#5a4628] bg-[#1a1510] text-[#e5dac4] text-xs font-medium hover:border-[#c89b48] cursor-pointer"
              >
                Change Subject
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] border border-[#3e3326] bg-[#120f0c] text-[#cbbda4] text-xs font-medium hover:text-[#f5ebd6] cursor-pointer"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
