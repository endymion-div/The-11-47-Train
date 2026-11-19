import { useState } from 'react';
import { X } from 'lucide-react';
import { SUSPECT_PROFILES } from '../game/caseData';
import { getCollectedEvidence } from '../game/evidenceEngine';
import { HOW_OPTIONS, WHEN_OPTIONS, WHERE_OPTIONS, WHY_OPTIONS } from '../game/endingSystem';
import type { DeductionSubmission, GameState, SuspectId } from '../game/types';

interface FinalDeductionModalProps {
  state: GameState;
  onSubmit: (submission: DeductionSubmission) => void;
  onClose: () => void;
}

export function FinalDeductionModal({ state, onSubmit, onClose }: FinalDeductionModalProps) {
  const collected = getCollectedEvidence(state);
  const suspects = Object.values(SUSPECT_PROFILES);

  const [who, setWho] = useState<SuspectId | ''>('');
  const [how, setHow] = useState(HOW_OPTIONS[0].id);
  const [why, setWhy] = useState(WHY_OPTIONS[0].id);
  const [when, setWhen] = useState(WHEN_OPTIONS[0].id);
  const [where, setWhere] = useState(WHERE_OPTIONS[0].id);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleEvidence = (id: string) => {
    setEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!who) {
      setError('Select the suspect you are formally accusing before presenting your deduction.');
      return;
    }
    setError(null);
    onSubmit({ who, how, why, when, where, evidenceIds });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="The Final Deduction"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 p-3 sm:p-6"
    >
      <form
        onSubmit={handleSubmit}
        className="dossier-surface flex max-h-[92vh] w-full max-w-3xl flex-col border border-[#9e7738] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[#3a2f22] px-6 py-4">
          <div>
            <div className="text-xs font-mono-num tracking-widest text-[#c89b48] uppercase">
              Scotland Yard Dispatch · Silver Meridian
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#f5ebd6]">
              The Final Deduction
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close Final Deduction"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center border border-[#4a3a27] text-[#dfd3bd] hover:border-[#c89b48] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="noir-scroll flex-1 space-y-5 overflow-y-auto p-6">
          {/* 1. WHO */}
          <div>
            <label className="block text-xs font-mono-num tracking-wider text-[#c89b48] uppercase mb-2">
              1. Who Killed Thomas Avery?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {suspects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setWho(s.id)}
                  className={`min-h-[48px] flex items-center gap-2.5 px-3 py-2 text-left border cursor-pointer transition-colors ${
                    who === s.id
                      ? 'bg-[#74221d] border-[#d3675d] text-[#fdf2ef]'
                      : 'bg-[#15120e] border-[#3d3123] text-[#e5dac4] hover:border-[#c89b48]'
                  }`}
                >
                  <img
                    src={s.portraitUrl}
                    alt={s.name}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 object-cover shrink-0 border border-[#6e542a]"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{s.name}</div>
                    <div className="text-[11px] opacity-80 truncate">{s.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. HOW */}
          <div>
            <label htmlFor="deduction-how" className="block text-xs font-mono-num tracking-wider text-[#c89b48] uppercase mb-1.5">
              2. How Was the Locked-Room Murder Executed?
            </label>
            <select
              id="deduction-how"
              value={how}
              onChange={(e) => setHow(e.target.value)}
              className="w-full min-h-[44px] border border-[#4d3d2a] bg-[#120f0c] px-3 py-2 text-sm text-[#f3ead8]"
            >
              {HOW_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. WHY */}
          <div>
            <label htmlFor="deduction-why" className="block text-xs font-mono-num tracking-wider text-[#c89b48] uppercase mb-1.5">
              3. Why Was Thomas Avery Targeted?
            </label>
            <select
              id="deduction-why"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              className="w-full min-h-[44px] border border-[#4d3d2a] bg-[#120f0c] px-3 py-2 text-sm text-[#f3ead8]"
            >
              {WHY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4 & 5. WHEN & WHERE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="deduction-when" className="block text-xs font-mono-num tracking-wider text-[#c89b48] uppercase mb-1.5">
                4. When Did the Fatal Blow Occur?
              </label>
              <select
                id="deduction-when"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full min-h-[44px] border border-[#4d3d2a] bg-[#120f0c] px-3 py-2 text-sm text-[#f3ead8]"
              >
                {WHEN_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="deduction-where" className="block text-xs font-mono-num tracking-wider text-[#c89b48] uppercase mb-1.5">
                5. Where Was the Crime Executed?
              </label>
              <select
                id="deduction-where"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                className="w-full min-h-[44px] border border-[#4d3d2a] bg-[#120f0c] px-3 py-2 text-sm text-[#f3ead8]"
              >
                {WHERE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. SUPPORTING EVIDENCE */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-mono-num tracking-wider text-[#c89b48] uppercase">
                6. What Evidence Proves It? ({evidenceIds.length} selected)
              </span>
              <span className="text-[11px] text-[#b8aa93]">
                Attach decisive physical, timeline & documentary clues
              </span>
            </div>
            <div className="grid max-h-44 grid-cols-1 sm:grid-cols-2 gap-1.5 overflow-y-auto noir-scroll border border-[#342a1e] p-2 bg-[#0f0d0a]">
              {collected.map((item) => {
                const checked = evidenceIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleEvidence(item.id)}
                    className={`min-h-[40px] px-3 py-1.5 text-left text-xs border cursor-pointer ${
                      checked
                        ? 'bg-[#2a2115] border-[#c89b48] text-[#f5ebd6]'
                        : 'bg-[#16120e] border-[#30261b] text-[#c5b8a1] hover:border-[#785c2d]'
                    }`}
                  >
                    <span className="mr-1.5 font-mono-num">{checked ? '[✓]' : '[ ]'}</span>
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="border border-[#a8443a] bg-[#2a1412] px-4 py-2.5 text-xs text-[#f8d7d3]">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#3a2f22] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 border border-[#4a3a27] text-xs font-medium text-[#dfd3bd] hover:border-[#c89b48] cursor-pointer"
          >
            Continue Investigating
          </button>
          <button
            type="submit"
            className="min-h-[44px] px-6 py-2 bg-[#c89b48] text-[#140f0a] text-xs font-semibold hover:bg-[#dbb05d] cursor-pointer"
          >
            Present Final Accusation
          </button>
        </div>
      </form>
    </div>
  );
}
