import { useEffect, useRef } from 'react';
import { TRAIN_LOCATIONS } from '../game/caseData';
import {
  createGrainPool,
  createRainPool,
  findHotspotAtPoint,
  renderTrainScene,
} from '../game/animationEngine';
import { audioEngine } from '../game/audioEngine';
import type { GameState, Hotspot, LocationId } from '../game/types';

interface TrainCanvasViewProps {
  state: GameState;
  onMovePlayer: (x: number, facing: 1 | -1) => void;
  onTravelLocation: (locId: LocationId, spawnX: number) => void;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onAdvanceBlackout: (nextSec: number) => void;
  onFinishBlackout: () => void;
}

export function TrainCanvasView({
  state,
  onMovePlayer,
  onTravelLocation,
  onSelectHotspot,
  onAdvanceBlackout,
  onFinishBlackout,
}: TrainCanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(state);
  stateRef.current = state;

  const callbacksRef = useRef({
    onMovePlayer,
    onTravelLocation,
    onSelectHotspot,
    onAdvanceBlackout,
    onFinishBlackout,
  });
  callbacksRef.current = {
    onMovePlayer,
    onTravelLocation,
    onSelectHotspot,
    onAdvanceBlackout,
    onFinishBlackout,
  };

  // Mutable simulation state decoupled from React re-renders
  const simRef = useRef({
    playerX: state.playerX,
    playerFacing: state.playerFacing as 1 | -1,
    targetX: null as number | null,
    walkPhase: 0,
    footstepAccum: 0,
    landscapeScroll: 0,
    lightningAlpha: 0,
    lightningTimer: 4.5,
    tunnelAlpha: 0,
    tunnelTimer: 16,
    mouseNormX: 0.5,
    mouseNormY: 0.5,
    hoveredHotspotId: null as string | null,
    heldKeys: new Set<string>(),
    lastLocation: state.currentLocation,
    blackoutElapsedReal: 0,
    firedBlackoutCues: new Set<string>(),
  });

  // Sync playerX when location changes externally (e.g., via Map)
  useEffect(() => {
    if (simRef.current.lastLocation !== state.currentLocation) {
      simRef.current.lastLocation = state.currentLocation;
      simRef.current.playerX = state.playerX;
      simRef.current.playerFacing = state.playerFacing;
      simRef.current.targetX = null;
    }
  }, [state.currentLocation, state.playerX, state.playerFacing]);

  // Reset blackout cue tracker when entering blackout
  useEffect(() => {
    if (state.phase === 'blackout') {
      simRef.current.blackoutElapsedReal = 0;
      simRef.current.firedBlackoutCues.clear();
      audioEngine.setBlackoutMode(true);
      audioEngine.playRelayDrop();
    } else {
      audioEngine.setBlackoutMode(false);
    }
  }, [state.phase]);

  const isFrozen = state.phase === 'paused' || state.phase === 'gameover';
  const hasOverlayModal =
    state.activePanel !== null || state.activeSuspectId !== null || state.deductionOpen;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rainPool = createRainPool(55);
    const grainPool = createGrainPool(30);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(rect.width * dpr));
      canvas.height = Math.max(240, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        simRef.current.heldKeys.add('left');
        simRef.current.targetX = null;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        simRef.current.heldKeys.add('right');
        simRef.current.targetX = null;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        simRef.current.heldKeys.delete('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        simRef.current.heldKeys.delete('right');
      }
    };

    const clearInputs = () => {
      simRef.current.heldKeys.clear();
      simRef.current.targetX = null;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearInputs);
    document.addEventListener('visibilitychange', clearInputs);

    const paintOnce = (liveBlackoutSec: number, totalTime: number, dt: number) => {
      const curState = stateRef.current;
      const sim = simRef.current;
      const rect = canvas.getBoundingClientRect();
      renderTrainScene(
        ctx,
        rect.width,
        rect.height,
        {
          state: {
            ...curState,
            playerX: sim.playerX,
            playerFacing: sim.playerFacing,
            blackoutProgress: liveBlackoutSec,
          },
          mouseNormX: sim.mouseNormX,
          mouseNormY: sim.mouseNormY,
          hoveredHotspotId: sim.hoveredHotspotId,
          walkPhase: sim.walkPhase,
          landscapeScroll: sim.landscapeScroll,
          lightningAlpha: sim.lightningAlpha,
          tunnelAlpha: sim.tunnelAlpha,
          timeSec: totalTime,
        },
        rainPool,
        grainPool,
        dt,
      );
    };

    // If paused, gameover, or covered by a full-screen dossier/interrogation modal, paint once and stop RAF
    if (isFrozen || (hasOverlayModal && stateRef.current.phase !== 'blackout')) {
      paintOnce(stateRef.current.blackoutProgress, 0, 0.016);
      return () => {
        ro.disconnect();
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('blur', clearInputs);
        document.removeEventListener('visibilitychange', clearInputs);
      };
    }

    let rafId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let lastDrawTime = 0;
    let totalTime = 0;

    const tick = (now: number) => {
      if (disposed) return;
      rafId = window.requestAnimationFrame(tick);

      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
      totalTime += dt;

      const curState = stateRef.current;
      const sim = simRef.current;
      const loc = TRAIN_LOCATIONS[curState.currentLocation];

      // Continuous moving train landscape & weather
      sim.landscapeScroll += dt * 420;
      sim.lightningTimer -= dt;
      if (sim.lightningTimer <= 0) {
        sim.lightningAlpha = 1;
        sim.lightningTimer = 7 + Math.random() * 10;
        audioEngine.triggerDistantThunder();
      }
      sim.lightningAlpha = Math.max(0, sim.lightningAlpha - dt * 2.2);

      sim.tunnelTimer -= dt;
      if (sim.tunnelTimer <= 0) {
        sim.tunnelAlpha = 1;
        sim.tunnelTimer = 20 + Math.random() * 12;
      }
      if (sim.tunnelAlpha > 0) {
        sim.tunnelAlpha = Math.max(0, sim.tunnelAlpha - dt * 0.45);
      }

      // 90-Second Blackout Progression (compressed to ~9s real time, discrete React updates)
      let liveBlackoutSec = curState.blackoutProgress;
      if (curState.phase === 'blackout') {
        sim.blackoutElapsedReal += dt;
        liveBlackoutSec = Math.min(90, Math.floor((sim.blackoutElapsedReal / 9) * 90));
        const quantized = Math.floor(liveBlackoutSec / 5) * 5;
        if (quantized !== curState.blackoutProgress && quantized < 90) {
          callbacksRef.current.onAdvanceBlackout(quantized);
        }
        if (liveBlackoutSec >= 15 && !sim.firedBlackoutCues.has('steps')) {
          sim.firedBlackoutCues.add('steps');
          audioEngine.playFootstep();
          window.setTimeout(() => audioEngine.playFootstep(), 170);
          window.setTimeout(() => audioEngine.playFootstep(), 340);
        }
        if (liveBlackoutSec >= 30 && !sim.firedBlackoutCues.has('clatter')) {
          sim.firedBlackoutCues.add('clatter');
          audioEngine.playBlackoutClatter();
        }
        if (liveBlackoutSec >= 52 && !sim.firedBlackoutCues.has('wire')) {
          sim.firedBlackoutCues.add('wire');
          audioEngine.playBlackoutWireClick();
        }
        if (liveBlackoutSec >= 90 && !sim.firedBlackoutCues.has('done')) {
          sim.firedBlackoutCues.add('done');
          audioEngine.playDoorTransition();
          callbacksRef.current.onFinishBlackout();
        }
      } else {
        let vx = 0;
        if (sim.heldKeys.has('left')) vx -= 0.34;
        if (sim.heldKeys.has('right')) vx += 0.34;

        if (vx === 0 && sim.targetX !== null) {
          const diff = sim.targetX - sim.playerX;
          if (Math.abs(diff) > 0.012) {
            vx = Math.sign(diff) * 0.34;
          } else {
            sim.targetX = null;
          }
        }

        if (vx !== 0) {
          sim.playerFacing = vx > 0 ? 1 : -1;
          sim.playerX = Math.max(0.05, Math.min(0.95, sim.playerX + vx * dt));
          sim.walkPhase += Math.abs(vx) * dt * 28;
          sim.footstepAccum += Math.abs(vx) * dt;
          if (sim.footstepAccum >= 0.12) {
            sim.footstepAccum = 0;
            audioEngine.playFootstep();
          }

          if (sim.playerX <= 0.065 && loc.leftExit) {
            sim.heldKeys.delete('left');
            sim.targetX = null;
            audioEngine.playDoorTransition();
            callbacksRef.current.onTravelLocation(loc.leftExit, 0.86);
          } else if (sim.playerX >= 0.935 && loc.rightExit) {
            sim.heldKeys.delete('right');
            sim.targetX = null;
            audioEngine.playDoorTransition();
            callbacksRef.current.onTravelLocation(loc.rightExit, 0.14);
          }
        }
      }

      if (now - lastDrawTime < 45) return;
      lastDrawTime = now;
      paintOnce(liveBlackoutSec, totalTime, dt);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearInputs);
      document.removeEventListener('visibilitychange', clearInputs);
    };
  }, [isFrozen, hasOverlayModal]);

  const updatePointerNorm = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { nx: 0.5, ny: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
    const ny = Math.max(0, Math.min(1, (clientY - rect.top) / Math.max(1, rect.height)));
    simRef.current.mouseNormX = nx;
    simRef.current.mouseNormY = ny;
    const hit = findHotspotAtPoint(stateRef.current.currentLocation, nx, ny);
    simRef.current.hoveredHotspotId = hit ? hit.id : null;
    return { nx, ny, hit };
  };

  const handleCanvasClick = (clientX: number, clientY: number) => {
    audioEngine.ensureContext();
    const curState = stateRef.current;
    if (curState.phase !== 'playing') return;

    const { nx, hit } = updatePointerNorm(clientX, clientY);
    const loc = TRAIN_LOCATIONS[curState.currentLocation];

    // Check left/right vestibule door click directly
    if (nx <= 0.08 && loc.leftExit) {
      audioEngine.playDoorTransition();
      onTravelLocation(loc.leftExit, 0.86);
      return;
    }
    if (nx >= 0.92 && loc.rightExit) {
      audioEngine.playDoorTransition();
      onTravelLocation(loc.rightExit, 0.14);
      return;
    }

    if (hit) {
      // Walk subtly toward hotspot and inspect
      simRef.current.targetX = Math.max(0.12, Math.min(0.88, hit.x));
      onSelectHotspot(hit);
      return;
    }

    // Walk toward clicked horizontal position
    simRef.current.targetX = Math.max(0.08, Math.min(0.92, nx));
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07080a]">
      <canvas
        ref={canvasRef}
        data-testid="train-scene-canvas"
        onMouseMove={(e) => updatePointerNorm(e.clientX, e.clientY)}
        onClick={(e) => handleCanvasClick(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (touch) handleCanvasClick(touch.clientX, touch.clientY);
        }}
        className="block h-full w-full cursor-crosshair touch-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: state.observationMode
            ? 'radial-gradient(circle at 50% 48%, rgba(0,0,0,0) 35%, rgba(4,6,10,0.72) 100%)'
            : 'radial-gradient(circle at 50% 48%, rgba(0,0,0,0) 40%, rgba(6,5,4,0.56) 100%)',
        }}
      />
    </div>
  );
}
