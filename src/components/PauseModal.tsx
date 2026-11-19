import type { Difficulty } from '../game/types';

interface PauseModalProps {
  difficulty: Difficulty;
  muted: boolean;
  lastSavedAt: string | null;
  onResume: () => void;
  onSave: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export function PauseModal({
  difficulty,
  muted,
  lastSavedAt,
  onResume,
  onSave,
  onToggleMute,
  onRestart,
  onReturnTitle,
}: PauseModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Investigation Paused"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="dossier-surface w-full max-w-md border border-[#8e6d36] p-6 shadow-2xl">
        <div className="text-xs font-mono-num tracking-widest text-[#c89b48] uppercase">
          The Silver Meridian · Paused
        </div>
        <h2 className="mt-1 font-display text-2xl font-semibold text-[#f5ebd6]">
          Case Suspended
        </h2>

        <div className="mt-4 flex items-center justify-between border-y border-[#3a2f22] py-3 text-xs text-[#cbbda4]">
          <span>Difficulty: <strong className="text-[#f0e4cd] capitalize">{difficulty}</strong></span>
          <span className="font-mono-num">
            {lastSavedAt ? `Saved at ${lastSavedAt}` : 'Not saved this session'}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="min-h-[44px] w-full bg-[#c89b48] text-[#140f0a] font-semibold text-sm hover:bg-[#dbb05d] cursor-pointer"
          >
            Resume Investigation
          </button>

          <button
            type="button"
            onClick={onSave}
            className="min-h-[44px] w-full border border-[#6e542a] bg-[#1e1812] text-[#f2e8d4] text-sm hover:border-[#c89b48] cursor-pointer"
          >
            Save Case to Browser
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="min-h-[44px] w-full border border-[#4a3a27] bg-[#16120e] text-[#dfd3bd] text-sm hover:border-[#c89b48] cursor-pointer"
          >
            Audio: {muted ? 'Muted (Click to Unmute)' : 'Active (Click to Mute)'}
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="min-h-[44px] w-full border border-[#4a3a27] bg-[#16120e] text-[#dfd3bd] text-sm hover:border-[#c89b48] cursor-pointer"
          >
            Restart Case From 11:47 PM
          </button>

          <button
            type="button"
            onClick={onReturnTitle}
            className="min-h-[44px] w-full border border-[#3a2e22] bg-transparent text-[#b8aa93] text-sm hover:text-[#f5ebd6] cursor-pointer"
          >
            Return to Title Screen
          </button>
        </div>
      </div>
    </div>
  );
}
