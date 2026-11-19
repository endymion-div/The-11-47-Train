import type { EndingOutcome } from '../game/types';

interface EndingModalProps {
  ending: EndingOutcome;
  onPlayAgain: () => void;
  onReturnTitle: () => void;
}

export function EndingModal({ ending, onPlayAgain, onReturnTitle }: EndingModalProps) {
  const isVictory =
    ending.tier === 'MASTER_DETECTIVE' || ending.tier === 'PERFECT_SOLUTION';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ending.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060608]/95 p-4"
    >
      <div className="dossier-surface w-full max-w-2xl border border-[#9e7738] p-6 sm:p-8 shadow-2xl">
        <div className="text-xs font-mono-num tracking-[0.2em] text-[#c89b48] uppercase">
          {isVictory ? 'Case Closed · Silver Meridian Terminus' : 'Case Concluded · Inquiry Report'}
        </div>

        <h2 className="mt-2 font-display text-3xl font-bold text-[#f6efe0]">
          {ending.title}
        </h2>
        <p className="mt-1 text-sm font-medium text-[#d8b878]">{ending.subtitle}</p>

        <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#e5dac4]">
          {ending.epilogue}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 border-y border-[#3a2f22] py-4 text-center">
          <div>
            <div className="text-[11px] font-mono-num text-[#b8aa93] uppercase">Evidence</div>
            <div className="mt-1 font-mono-num text-xl font-semibold text-[#f5ebd6]">
              {ending.cluesFound}/{ending.totalClues}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono-num text-[#b8aa93] uppercase">Contradictions</div>
            <div className="mt-1 font-mono-num text-xl font-semibold text-[#f5ebd6]">
              {ending.contradictionsFound}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono-num text-[#b8aa93] uppercase">Case Score</div>
            <div className="mt-1 font-mono-num text-xl font-semibold text-[#c89b48]">
              {ending.score}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onReturnTitle}
            className="min-h-[44px] px-5 py-2 border border-[#4d3d2a] text-sm text-[#dfd3bd] hover:border-[#c89b48] cursor-pointer"
          >
            Title Screen
          </button>
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="min-h-[44px] px-6 py-2 bg-[#c89b48] text-[#140f0a] text-sm font-semibold hover:bg-[#dbb05d] cursor-pointer"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
