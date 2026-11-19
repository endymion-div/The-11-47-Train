import {
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FolderSearch,
  Gavel,
  Lightbulb,
  Map as MapIcon,
  Pause,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TRAIN_LOCATIONS } from '../game/caseData';
import { computeGlobalSuspicionLevel, formatTrainClock } from '../game/gameState';
import type { GameState, LocationId, NotebookTab } from '../game/types';

interface GameHudProps {
  state: GameState;
  onToggleObservation: () => void;
  onToggleMute: () => void;
  onOpenPause: () => void;
  onOpenTab: (tab: NotebookTab) => void;
  onOpenDeduction: () => void;
  onTravelLocation: (locId: LocationId, spawnX: number) => void;
  onSkipBlackout: () => void;
  onDismissToast: () => void;
}

const NAV_TABS: { id: NotebookTab; label: string; Icon: typeof FolderSearch }[] = [
  { id: 'CASE', label: 'Case', Icon: Briefcase },
  { id: 'PEOPLE', label: 'People', Icon: Users },
  { id: 'EVIDENCE', label: 'Evidence', Icon: FolderSearch },
  { id: 'TIMELINE', label: 'Timeline', Icon: Clock },
  { id: 'THEORIES', label: 'Theories', Icon: Lightbulb },
  { id: 'MAP', label: 'Map', Icon: MapIcon },
  { id: 'NOTEBOOK', label: 'Notebook', Icon: BookOpen },
];

export function GameHud({
  state,
  onToggleObservation,
  onToggleMute,
  onOpenPause,
  onOpenTab,
  onOpenDeduction,
  onTravelLocation,
  onSkipBlackout,
  onDismissToast,
}: GameHudProps) {
  const loc = TRAIN_LOCATIONS[state.currentLocation];
  const suspicion = computeGlobalSuspicionLevel(state);

  if (state.phase === 'blackout') {
    const sec = state.blackoutProgress;
    const min = sec >= 60 ? 48 : 47;
    const remSec = sec >= 60 ? sec - 60 : sec;
    const clockStr = `11:${String(min).padStart(2, '0')}:${String(remSec).padStart(2, '0')} PM`;

    return (
      <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-5 sm:p-8">
        <div className="pointer-events-auto flex items-center justify-between gap-4 bg-[#0d0c0a]/90 border border-[#73582c]/60 px-4 py-2.5">
          <div>
            <div className="text-xs tracking-[0.2em] text-[#c89b48] uppercase font-mono-num">
              Power Failure · 90-Second Blackout
            </div>
            <div className="font-mono-num text-xl sm:text-2xl font-semibold text-[#f5ebd6]">
              {clockStr}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              tabIndex={-1}
              aria-label={state.muted ? 'Unmute Audio' : 'Mute Audio'}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleMute();
              }}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center border border-[#5e4724] bg-[#1a1510] text-[#e5d8bf] hover:border-[#c89b48] cursor-pointer"
            >
              {state.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onSkipBlackout}
              className="min-h-[40px] px-4 py-2 bg-[#c89b48] text-[#140f0a] text-xs font-semibold hover:bg-[#dcb261] cursor-pointer whitespace-nowrap"
            >
              Skip to 11:48:33 Discovery
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-xl bg-[#0e0c0a]/90 border border-[#73582c]/60 px-5 py-3 text-center text-sm text-[#e8dcc4]">
          Move your pocket torch across the dark carriage and listen closely to the sequence of sounds.
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-4">
      {/* Top Status & Utility Cluster */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Case Telemetry Strip */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-1 bg-[#120f0c]/95 border border-[#785c2d]/70 px-3.5 py-2 text-xs text-[#e8decb]">
          <span className="font-display font-semibold tracking-wide text-[#f0d8a5] whitespace-nowrap">
            CASE: THE 11:47 TRAIN
          </span>
          <span aria-hidden="true" className="text-[#69522d]">|</span>
          <span className="font-mono-num whitespace-nowrap">
            TIME: <strong className="text-[#f5ebd6] font-semibold">{formatTrainClock(state.clockMinutes)}</strong>
          </span>
          <span aria-hidden="true" className="text-[#69522d]">|</span>
          <span className="font-mono-num whitespace-nowrap">
            EVIDENCE: <strong className="text-[#c89b48] font-semibold">{state.discoveredEvidenceIds.length}</strong>
          </span>
          <span aria-hidden="true" className="text-[#69522d]">|</span>
          <span className="font-mono-num whitespace-nowrap">
            SUSPICION:{' '}
            <strong
              className={
                suspicion === 'CRITICAL'
                  ? 'text-[#e06d5a]'
                  : suspicion === 'ELEVATED'
                    ? 'text-[#e4b358]'
                    : 'text-[#96bf8a]'
              }
            >
              {suspicion}
            </strong>
          </span>
        </div>

        {/* Top-Right Controls: Observation, Accuse, Mute, Pause */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleObservation();
            }}
            className={`min-h-[40px] flex items-center gap-2 px-3.5 py-2 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              state.observationMode
                ? 'bg-[#c89b48] border-[#e7c47a] text-[#140f0a]'
                : 'bg-[#120f0c]/95 border-[#785c2d]/70 text-[#efe5d2] hover:border-[#c89b48]'
            }`}
          >
            <Eye className="h-4 w-4 shrink-0" />
            <span>Observation [O]</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenDeduction();
            }}
            className="min-h-[40px] flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#74221d] border border-[#b54840] text-[#f9ece9] hover:bg-[#8c2b25] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Gavel className="h-4 w-4 shrink-0" />
            <span>Final Deduction</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label={state.muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center bg-[#120f0c]/95 border border-[#785c2d]/70 text-[#efe5d2] hover:border-[#c89b48] cursor-pointer"
          >
            {state.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Pause Menu [Esc]"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenPause();
            }}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center bg-[#120f0c]/95 border border-[#785c2d]/70 text-[#efe5d2] hover:border-[#c89b48] cursor-pointer"
          >
            <Pause className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transient Discovery / System Toast */}
      {state.toastMessage && (
        <div className="pointer-events-auto mx-auto my-auto max-w-lg bg-[#16120e]/95 border border-[#c89b48] px-5 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.75)] flex items-center justify-between gap-4">
          <p className="text-sm text-[#f4ead6]">{state.toastMessage}</p>
          <button
            type="button"
            onClick={onDismissToast}
            className="min-h-[36px] px-2.5 text-xs font-mono-num text-[#c89b48] hover:text-[#f0d290] cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bottom Compact Carriage & Main Navigation Dock */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Location & Adjacent Carriage Stepper */}
        <div className="pointer-events-auto flex items-center justify-between gap-2 bg-[#120f0c]/95 border border-[#785c2d]/70 px-3 py-1.5">
          <button
            type="button"
            disabled={!loc.leftExit}
            aria-label={loc.leftExit ? `Move left to ${TRAIN_LOCATIONS[loc.leftExit].name}` : 'Front of train'}
            onClick={() => loc.leftExit && onTravelLocation(loc.leftExit, 0.86)}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#c89b48] disabled:opacity-30 hover:bg-[#241c14] cursor-pointer disabled:cursor-default"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="px-1 text-center sm:text-left">
            <div className="text-[11px] font-mono-num text-[#c89b48] leading-none">
              {loc.carNumber}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#f4ead6] whitespace-nowrap">
              {loc.name}
            </div>
          </div>

          <button
            type="button"
            disabled={!loc.rightExit}
            aria-label={loc.rightExit ? `Move right to ${TRAIN_LOCATIONS[loc.rightExit].name}` : 'Rear of train'}
            onClick={() => loc.rightExit && onTravelLocation(loc.rightExit, 0.14)}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#c89b48] disabled:opacity-30 hover:bg-[#241c14] cursor-pointer disabled:cursor-default"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Main 7-Tab Detective Navigation Strip */}
        <nav
          aria-label="Investigation Tabs"
          className="pointer-events-auto flex items-center gap-1 overflow-x-auto bg-[#120f0c]/95 border border-[#785c2d]/70 p-1"
        >
          {NAV_TABS.map(({ id, label, Icon }) => {
            const active = state.activePanel === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onOpenTab(id)}
                className={`min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#c89b48] text-[#140f0a]'
                    : 'text-[#e5dac4] hover:bg-[#261e15] hover:text-[#f8eedb]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
