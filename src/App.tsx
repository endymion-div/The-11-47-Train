import { useCallback, useEffect, useState } from 'react';
import { EndingModal } from './components/EndingModal';
import { FinalDeductionModal } from './components/FinalDeductionModal';
import { GameHud } from './components/GameHud';
import { InterrogationModal } from './components/InterrogationModal';
import { NotebookDrawer } from './components/NotebookDrawer';
import { PauseModal } from './components/PauseModal';
import { TitleScreen } from './components/TitleScreen';
import { TrainCanvasView } from './components/TrainCanvasView';
import { audioEngine } from './game/audioEngine';
import { SUSPECT_PROFILES, TRAIN_LOCATIONS } from './game/caseData';
import { evaluateFinalDeduction } from './game/endingSystem';
import { collectEvidence } from './game/evidenceEngine';
import { createInitialGameState } from './game/gameState';
import {
  createCustomHypothesis,
  createHypothesisFromTemplate,
} from './game/hypothesisEngine';
import {
  interrogateAsk,
  interrogateChallenge,
  interrogateCompareStatement,
  interrogateObserve,
  interrogatePresentEvidence,
  interrogatePress,
} from './game/interrogationEngine';
import { getObservationPrompt } from './game/observationEngine';
import { hasSavedGame, loadGameState, saveGameState } from './game/saveSystem';
import { placeTimelineEvent, validateTimeline } from './game/timelineEngine';
import type {
  DeductionSubmission,
  Difficulty,
  GameState,
  Hotspot,
  InterrogationTopic,
  LocationId,
  NotebookTab,
  SuspectId,
} from './game/types';

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    const params =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const autostart = params?.get('autostart') === '1';
    return createInitialGameState('investigator', autostart);
  });

  const [saveAvailable, setSaveAvailable] = useState<boolean>(() => hasSavedGame());
  const [interrogationLine, setInterrogationLine] = useState<string>('');
  const [interrogationNote, setInterrogationNote] = useState<string>('');

  // Mirror game state to document.body.dataset.state for accessibility & automation
  useEffect(() => {
    const bodyState =
      state.phase === 'blackout'
        ? 'playing'
        : state.phase === 'gameover'
          ? 'gameover'
          : state.phase;
    document.body.dataset.state = bodyState;
  }, [state.phase]);

  const handleStartNew = useCallback((chosenDifficulty?: Difficulty) => {
    audioEngine.ensureContext();
    audioEngine.playDoorTransition();
    const diff = chosenDifficulty ?? state.difficulty;
    const fresh = createInitialGameState(diff, false);
    setState({
      ...fresh,
      phase: 'blackout',
      currentLocation: 'carriage_7',
      blackoutProgress: 0,
      muted: state.muted,
      toastMessage: null,
    });
  }, [state.difficulty, state.muted]);

  const handleContinueSave = useCallback(() => {
    const loaded = loadGameState();
    if (!loaded) return;
    audioEngine.ensureContext();
    audioEngine.playNotebookToggle();
    audioEngine.setMuted(loaded.muted);
    setState(loaded);
  }, []);

  const handleToggleMute = useCallback(() => {
    audioEngine.ensureContext();
    setState((prev) => {
      const nextMuted = !prev.muted;
      audioEngine.setMuted(nextMuted);
      return { ...prev, muted: nextMuted };
    });
  }, []);

  const handleToggleObservation = useCallback(() => {
    audioEngine.ensureContext();
    setState((prev) => {
      if (prev.phase !== 'playing') return prev;
      const nextObs = !prev.observationMode;
      audioEngine.setObservationMode(nextObs);
      audioEngine.playNotebookToggle();
      return {
        ...prev,
        observationMode: nextObs,
        toastMessage: nextObs
          ? 'Observation Mode Active — inspect subtle details with your brass loupe.'
          : null,
      };
    });
  }, []);

  const handleOpenInterrogation = useCallback((suspectId: SuspectId) => {
    audioEngine.ensureContext();
    audioEngine.playNotebookToggle();
    const profile = SUSPECT_PROFILES[suspectId];
    setInterrogationLine(
      `${profile.name} turns toward you. “What is it, Mr. Vane? An awful night for a journey.”`,
    );
    setInterrogationNote('Select a subject and choose how to question them.');
    setState((prev) => ({
      ...prev,
      activePanel: null,
      activeSuspectId: suspectId,
    }));
  }, []);

  // Global keyboard shortcuts (Title Enter/Space, Observation O, Mute M, Notebook N, Pause Esc/P)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (state.phase === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartNew();
        }
        return;
      }

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (state.deductionOpen) {
          setState((prev) => ({ ...prev, deductionOpen: false }));
          return;
        }
        if (state.activeSuspectId) {
          setState((prev) => ({ ...prev, activeSuspectId: null }));
          return;
        }
        if (state.activePanel) {
          setState((prev) => ({ ...prev, activePanel: null }));
          return;
        }
        if (state.phase === 'playing') {
          setState((prev) => ({ ...prev, phase: 'paused' }));
        } else if (state.phase === 'paused') {
          setState((prev) => ({ ...prev, phase: 'playing' }));
        }
        return;
      }

      if (state.phase === 'playing' && !state.activeSuspectId && !state.deductionOpen) {
        if (e.key === 'o' || e.key === 'O') {
          handleToggleObservation();
        } else if (e.key === 'm' || e.key === 'M') {
          handleToggleMute();
        } else if (e.key === 'n' || e.key === 'N') {
          audioEngine.playNotebookToggle();
          setState((prev) => ({
            ...prev,
            activePanel: prev.activePanel ? null : 'NOTEBOOK',
          }));
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    state.phase,
    state.deductionOpen,
    state.activeSuspectId,
    state.activePanel,
    handleStartNew,
    handleToggleObservation,
    handleToggleMute,
  ]);

  const handleMovePlayer = useCallback((x: number, facing: 1 | -1) => {
    setState((prev) => ({ ...prev, playerX: x, playerFacing: facing }));
  }, []);

  const handleTravelLocation = useCallback((locId: LocationId, spawnX = 0.25) => {
    audioEngine.playDoorTransition();
    setState((prev) => ({
      ...prev,
      currentLocation: locId,
      playerX: spawnX,
      activePanel: null,
      toastMessage: `Entered ${TRAIN_LOCATIONS[locId].name}`,
    }));
  }, []);

  const handleSelectHotspot = useCallback(
    (hotspot: Hotspot) => {
      if (hotspot.kind === 'door' && hotspot.targetLocation) {
        handleTravelLocation(hotspot.targetLocation, 0.22);
        return;
      }

      if (hotspot.kind === 'suspect' && hotspot.suspectId) {
        handleOpenInterrogation(hotspot.suspectId);
        return;
      }

      setState((prev) => {
        if (hotspot.requiresObservation && !prev.observationMode) {
          return {
            ...prev,
            toastMessage: getObservationPrompt(hotspot, prev),
          };
        }

        if (hotspot.evidenceId) {
          const res = collectEvidence(prev, hotspot.evidenceId);
          if (res.collectedNow) {
            audioEngine.playClueDiscovered();
            return res.nextState;
          }
          return {
            ...prev,
            toastMessage: `${hotspot.inspectText} (Already logged in Evidence)`,
          };
        }

        return {
          ...prev,
          toastMessage: hotspot.inspectText,
        };
      });
    },
    [handleTravelLocation, handleOpenInterrogation],
  );

  const handleInterrogationAction = (
    action:
      | 'ASK'
      | 'PRESS'
      | 'OBSERVE'
      | 'CHALLENGE'
      | 'PRESENT_EVIDENCE'
      | 'COMPARE_STATEMENT',
    topic: InterrogationTopic,
    evidenceId?: string,
  ) => {
    if (!state.activeSuspectId) return;
    const suspectId = state.activeSuspectId;
    let res;

    if (action === 'ASK') {
      res = interrogateAsk(state, suspectId, topic);
    } else if (action === 'PRESS') {
      res = interrogatePress(state, suspectId, topic);
    } else if (action === 'OBSERVE') {
      res = interrogateObserve(state, suspectId);
    } else if (action === 'CHALLENGE') {
      res = interrogateChallenge(state, suspectId, topic);
    } else if (action === 'PRESENT_EVIDENCE' && evidenceId) {
      res = interrogatePresentEvidence(state, suspectId, evidenceId);
      if (res.nextState.suspectStates[suspectId].brokenAlibi && !state.suspectStates[suspectId].brokenAlibi) {
        audioEngine.playContradiction();
      } else {
        audioEngine.playNotebookToggle();
      }
    } else {
      res = interrogateCompareStatement(state, suspectId);
      if (res.nextState.suspectStates.arthur.alibiStatus === 'CONTRADICTION FOUND') {
        audioEngine.playContradiction();
      }
    }

    setState(res.nextState);
    setInterrogationLine(res.speakerLine);
    setInterrogationNote(res.systemNote);
  };

  const handleOpenTab = (tab: NotebookTab) => {
    audioEngine.ensureContext();
    audioEngine.playNotebookToggle();
    setState((prev) => ({
      ...prev,
      activePanel: prev.activePanel === tab ? null : tab,
    }));
  };

  const handleSave = () => {
    const res = saveGameState(state);
    setSaveAvailable(res.ok);
    setState((prev) => ({
      ...prev,
      lastSavedAt: res.savedAt,
      toastMessage: res.ok ? `Case saved (${res.savedAt})` : 'Unable to write local save.',
    }));
  };

  const handleSubmitDeduction = (submission: DeductionSubmission) => {
    const outcome = evaluateFinalDeduction(state, submission);
    audioEngine.playEndingSting(outcome.tier);
    setState((prev) => ({
      ...prev,
      deductionOpen: false,
      activePanel: null,
      activeSuspectId: null,
      phase: 'gameover',
      ending: outcome,
    }));
  };

  if (state.phase === 'title') {
    return (
      <TitleScreen
        difficulty={state.difficulty}
        hasSave={saveAvailable}
        onSelectDifficulty={(d) => setState((prev) => ({ ...prev, difficulty: d }))}
        onStartNew={() => handleStartNew()}
        onContinue={handleContinueSave}
      />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#080706]">
      {/* Isolated 2D/2.5D Train Exploration & Blackout Canvas */}
      <TrainCanvasView
        state={state}
        onMovePlayer={handleMovePlayer}
        onTravelLocation={handleTravelLocation}
        onSelectHotspot={handleSelectHotspot}
        onAdvanceBlackout={(sec) =>
          setState((prev) => ({ ...prev, blackoutProgress: sec }))
        }
        onFinishBlackout={() =>
          setState((prev) => ({
            ...prev,
            phase: 'playing',
            blackoutProgress: 90,
            currentLocation: 'carriage_7',
            playerX: 0.45,
            toastMessage:
              '11:48:33 PM — Lights return! Thomas Avery is found dead inside locked Compartment 4. Investigate Carriage 7.',
          }))
        }
      />

      {/* World-Matched HUD Overlay */}
      <GameHud
        state={state}
        onToggleObservation={handleToggleObservation}
        onToggleMute={handleToggleMute}
        onOpenPause={() => setState((prev) => ({ ...prev, phase: 'paused' }))}
        onOpenTab={handleOpenTab}
        onOpenDeduction={() =>
          setState((prev) => ({ ...prev, activePanel: null, deductionOpen: true }))
        }
        onTravelLocation={handleTravelLocation}
        onSkipBlackout={() =>
          setState((prev) => ({
            ...prev,
            phase: 'playing',
            blackoutProgress: 90,
            currentLocation: 'carriage_7',
            playerX: 0.45,
            toastMessage:
              '11:48:33 PM — Lights return! Thomas Avery is found dead inside locked Compartment 4.',
          }))
        }
        onDismissToast={() => setState((prev) => ({ ...prev, toastMessage: null }))}
      />

      {/* Detective Dossier / Notebook Drawer */}
      {state.activePanel && state.phase === 'playing' && (
        <NotebookDrawer
          state={state}
          activeTab={state.activePanel}
          onSelectTab={(tab) => setState((prev) => ({ ...prev, activePanel: tab }))}
          onClose={() => setState((prev) => ({ ...prev, activePanel: null }))}
          onInterrogate={handleOpenInterrogation}
          onTravel={(locId) => handleTravelLocation(locId, 0.25)}
          onPlaceTimeline={(slotId, eventId) =>
            setState((prev) => placeTimelineEvent(prev, slotId, eventId))
          }
          onVerifyTimeline={() => {
            const res = validateTimeline(state);
            if (res.isValid) audioEngine.playClueDiscovered();
            setState(res.nextState);
          }}
          onTestTemplateHypothesis={(tplId) => {
            const hyp = createHypothesisFromTemplate(tplId, state);
            if (!hyp) return;
            audioEngine.playNotebookToggle();
            setState((prev) => ({
              ...prev,
              hypotheses: [hyp, ...prev.hypotheses],
            }));
          }}
          onCreateCustomHypothesis={(params) => {
            const hyp = createCustomHypothesis(params, state);
            audioEngine.playNotebookToggle();
            setState((prev) => ({
              ...prev,
              hypotheses: [hyp, ...prev.hypotheses],
            }));
          }}
          onReplayBlackout={() =>
            setState((prev) => ({
              ...prev,
              activePanel: null,
              phase: 'blackout',
              currentLocation: 'carriage_7',
              blackoutProgress: 0,
            }))
          }
          onOpenDeduction={() =>
            setState((prev) => ({ ...prev, activePanel: null, deductionOpen: true }))
          }
        />
      )}

      {/* Suspect Interrogation Modal */}
      {state.activeSuspectId && state.phase === 'playing' && (
        <InterrogationModal
          state={state}
          suspectId={state.activeSuspectId}
          lastLine={interrogationLine}
          systemNote={interrogationNote}
          onAction={handleInterrogationAction}
          onClose={() => setState((prev) => ({ ...prev, activeSuspectId: null }))}
        />
      )}

      {/* Final Deduction Modal */}
      {state.deductionOpen && state.phase === 'playing' && (
        <FinalDeductionModal
          state={state}
          onSubmit={handleSubmitDeduction}
          onClose={() => setState((prev) => ({ ...prev, deductionOpen: false }))}
        />
      )}

      {/* Pause Modal */}
      {state.phase === 'paused' && (
        <PauseModal
          difficulty={state.difficulty}
          muted={state.muted}
          lastSavedAt={state.lastSavedAt}
          onResume={() => setState((prev) => ({ ...prev, phase: 'playing' }))}
          onSave={handleSave}
          onToggleMute={handleToggleMute}
          onRestart={() => handleStartNew(state.difficulty)}
          onReturnTitle={() => {
            audioEngine.setBlackoutMode(false);
            audioEngine.setObservationMode(false);
            setState((prev) => createInitialGameState(prev.difficulty, false));
          }}
        />
      )}

      {/* Ending Modal */}
      {state.phase === 'gameover' && state.ending && (
        <EndingModal
          ending={state.ending}
          onPlayAgain={() => handleStartNew(state.difficulty)}
          onReturnTitle={() =>
            setState((prev) => createInitialGameState(prev.difficulty, false))
          }
        />
      )}
    </div>
  );
}
