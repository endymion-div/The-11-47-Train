import { SUSPECT_PROFILES, TRAIN_LOCATIONS } from './caseData';
import { getObservationHintSpec } from './observationEngine';
import type { GameState, Hotspot, LocationId, SuspectId } from './types';

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
}

interface GrainDot {
  x: number;
  y: number;
  a: number;
}

export interface CanvasRenderContext {
  state: GameState;
  mouseNormX: number;
  mouseNormY: number;
  hoveredHotspotId: string | null;
  walkPhase: number;
  landscapeScroll: number;
  lightningAlpha: number;
  tunnelAlpha: number;
  timeSec: number;
}

export function createRainPool(count = 110): RainDrop[] {
  const pool: RainDrop[] = [];
  for (let i = 0; i < count; i++) {
    pool.push({
      x: Math.random(),
      y: Math.random(),
      len: 0.03 + Math.random() * 0.05,
      speed: 0.9 + Math.random() * 0.9,
    });
  }
  return pool;
}

export function createGrainPool(count = 90): GrainDot[] {
  const pool: GrainDot[] = [];
  for (let i = 0; i < count; i++) {
    pool.push({
      x: Math.random(),
      y: Math.random(),
      a: 0.03 + Math.random() * 0.05,
    });
  }
  return pool;
}

export function findHotspotAtPoint(
  locationId: LocationId,
  normX: number,
  normY: number,
): Hotspot | null {
  const loc = TRAIN_LOCATIONS[locationId];
  if (!loc) return null;
  for (let i = loc.hotspots.length - 1; i >= 0; i--) {
    const hs = loc.hotspots[i];
    const halfW = hs.width / 2 + 0.015;
    const halfH = hs.height / 2 + 0.02;
    if (
      normX >= hs.x - halfW &&
      normX <= hs.x + halfW &&
      normY >= hs.y - halfH &&
      normY <= hs.y + halfH
    ) {
      return hs;
    }
  }
  return null;
}

export function renderTrainScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rc: CanvasRenderContext,
  rainPool: RainDrop[],
  grainPool: GrainDot[],
  dt: number,
): void {
  const loc = TRAIN_LOCATIONS[rc.state.currentLocation];
  const isBlackout = rc.state.phase === 'blackout';

  // Update rain particles in-place (zero GC)
  for (let i = 0; i < rainPool.length; i++) {
    const r = rainPool[i];
    r.x -= dt * 0.55 * r.speed;
    r.y += dt * 1.15 * r.speed;
    if (r.y > 1.05 || r.x < -0.1) {
      r.x = Math.random() * 1.2;
      r.y = -0.05;
    }
  }

  // Subtle train suspension sway synchronized with wheels
  const swayX = Math.sin(rc.timeSec * 3.1) * 1.4;
  const swayY = Math.sin(rc.timeSec * 6.2) * 1.2 + Math.cos(rc.timeSec * 12.4) * 0.4;

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.translate(swayX, swayY);

  // 1. Exterior Stormy Countryside Sky & Moving Silhouettes
  drawExteriorBackdrop(ctx, width, height, rc, rainPool);

  // 2. Luxury 1920s Carriage Architecture (2.5D depth walls, ceiling, floor, windows)
  drawCarriageInterior(ctx, width, height, loc.ambientTheme, loc.id, rc, isBlackout);

  // 3. Interactive Scene Props & Hotspots
  for (const hs of loc.hotspots) {
    if (hs.kind === 'suspect') continue;
    drawHotspotProp(ctx, width, height, loc.floorY, hs, rc, isBlackout);
  }

  // 4. Suspects in this carriage
  for (const hs of loc.hotspots) {
    if (hs.kind === 'suspect' && hs.suspectId) {
      drawSuspectFigure(
        ctx,
        width,
        height,
        hs.suspectId,
        hs.x * width,
        loc.floorY * height,
        rc.hoveredHotspotId === hs.id,
        rc.timeSec,
        isBlackout,
      );
    }
  }

  // 5. Playable Detective Elias Vane
  drawEliasVane(
    ctx,
    rc.state.playerX * width,
    loc.floorY * height,
    height,
    rc.state.playerFacing,
    rc.walkPhase,
    rc.timeSec,
    isBlackout,
  );

  // 6. Warm Brass Sconce Cones & Atmospheric Lighting
  if (!isBlackout) {
    drawBrassLighting(ctx, width, height, loc.ambientTheme, loc.id, rc.timeSec);
  } else {
    drawBlackoutOverlay(ctx, width, height, rc);
  }

  // 7. Observation Mode Loupe & Analytical Overlays
  if (rc.state.observationMode && !isBlackout) {
    drawObservationOverlay(ctx, width, height, loc.hotspots, rc);
  }

  // 8. Hovered Hotspot Diegetic Label
  if (rc.hoveredHotspotId && !isBlackout) {
    const hovered = loc.hotspots.find((h) => h.id === rc.hoveredHotspotId);
    if (hovered) {
      drawHotspotTooltip(ctx, width, height, hovered, rc.state);
    }
  }

  // 9. Edge Vignette & Subtle Noir Film Grain
  drawVignetteAndGrain(ctx, width, height, grainPool, rc.state.observationMode);

  ctx.restore();
}

function drawExteriorBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rc: CanvasRenderContext,
  rainPool: RainDrop[],
): void {
  const flash = rc.lightningAlpha * 0.45;
  ctx.fillStyle = flash > 0.08 ? '#31425f' : '#09101b';
  ctx.fillRect(-10, -10, width + 20, height * 0.72 + 10);

  // Distant storm ridge parallax
  ctx.fillStyle = rc.lightningAlpha > 0.15 ? '#1c2a3f' : '#080e17';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.56);
  const offsetFar = (rc.landscapeScroll * 0.25) % 320;
  for (let x = -320; x <= width + 320; x += 80) {
    const ridgeH = Math.sin((x + offsetFar) * 0.015) * 26 + Math.cos((x + offsetFar) * 0.032) * 14;
    ctx.lineTo(x, height * 0.44 - ridgeH);
  }
  ctx.lineTo(width + 320, height * 0.72);
  ctx.lineTo(0, height * 0.72);
  ctx.closePath();
  ctx.fill();

  // Fast foreground pine trees & telegraph poles
  const offsetNear = rc.landscapeScroll % 240;
  ctx.fillStyle = '#05080f';
  for (let x = -240; x <= width + 240; x += 60) {
    const px = x - offsetNear;
    const treeH = 42 + ((Math.abs(Math.floor(x / 60)) * 17) % 35);
    ctx.beginPath();
    ctx.moveTo(px, height * 0.6);
    ctx.lineTo(px + 18, height * 0.6 - treeH);
    ctx.lineTo(px + 36, height * 0.6);
    ctx.closePath();
    ctx.fill();
  }

  // Passing station / signal pole amber streaks occasionally
  const poleX = width - ((rc.landscapeScroll * 1.45) % (width * 2.4));
  if (poleX > -40 && poleX < width + 40) {
    ctx.fillStyle = 'rgba(220, 175, 92, 0.45)';
    ctx.beginPath();
    ctx.arc(poleX, height * 0.36, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220, 175, 92, 0.14)';
    ctx.beginPath();
    ctx.arc(poleX, height * 0.36, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rain streaks outside windows
  ctx.strokeStyle = 'rgba(176, 204, 232, 0.36)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < rainPool.length; i++) {
    const r = rainPool[i];
    const rx = r.x * width;
    const ry = r.y * height * 0.7;
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - r.len * width * 0.32, ry + r.len * height * 0.85);
  }
  ctx.stroke();

  // Tunnel dark passage overlay
  if (rc.tunnelAlpha > 0.01) {
    ctx.fillStyle = `rgba(3, 4, 7, ${rc.tunnelAlpha * 0.88})`;
    ctx.fillRect(0, 0, width, height * 0.7);
  }
}

function drawCarriageInterior(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: 'mahogany' | 'velvet' | 'corridor' | 'crime' | 'steel' | 'glass',
  locationId: LocationId,
  rc: CanvasRenderContext,
  isBlackout: boolean,
): void {
  const ceilY = height * 0.14;
  const floorY = height * 0.78;
  const wallTopY = ceilY;

  // Ceiling arch
  ctx.fillStyle = theme === 'steel' ? '#1c2026' : '#24150e';
  ctx.fillRect(0, 0, width, ceilY);

  // Brass ceiling trim bar
  ctx.fillStyle = isBlackout ? '#2d2314' : '#8a6830';
  ctx.fillRect(0, ceilY - 4, width, 4);

  // Upper wall surround with cutout windows
  const wallColor =
    theme === 'steel'
      ? '#21252b'
      : theme === 'velvet'
        ? '#261414'
        : theme === 'glass'
          ? '#1a1410'
          : '#2b1910';

  const winTop = height * 0.21;
  const winBottom = height * 0.56;

  // Compute exact window spans [startFrac, endFrac] so Carriage 7 bulkhead & piers align cleanly
  const windowSpans: [number, number][] = [];
  if (locationId === 'carriage_7') {
    windowSpans.push([0.27, 0.42], [0.66, 0.89]);
  } else {
    const winCount = locationId === 'observation_carriage' ? 4 : 3;
    const winMargin = 0.08;
    const gap = 0.06;
    const winWidthFrac = (1 - winMargin * 2 - gap * (winCount - 1)) / winCount;
    for (let i = 0; i < winCount; i++) {
      const s = winMargin + i * (winWidthFrac + gap);
      windowSpans.push([s, s + winWidthFrac]);
    }
  }

  // Draw solid wall bands & piers around window cutouts
  ctx.fillStyle = wallColor;
  ctx.fillRect(0, wallTopY, width, winTop - wallTopY); // above windows
  ctx.fillRect(0, winBottom, width, floorY - winBottom); // wainscoting below windows
  let cursorX = 0;
  for (const [sFrac, eFrac] of windowSpans) {
    const sx = sFrac * width;
    const ex = eFrac * width;
    if (sx > cursorX) {
      ctx.fillRect(cursorX, winTop, sx - cursorX, winBottom - winTop);
    }
    cursorX = ex;
  }
  if (cursorX < width) {
    ctx.fillRect(cursorX, winTop, width - cursorX, winBottom - winTop);
  }

  // Mahogany window frames + velvet curtains + glass reflection
  for (const [sFrac, eFrac] of windowSpans) {
    const wx = sFrac * width;
    const ww = (eFrac - sFrac) * width;
    ctx.strokeStyle = isBlackout ? '#2c2214' : '#9c7738';
    ctx.lineWidth = 3;
    ctx.strokeRect(wx, winTop, ww, winBottom - winTop);

    ctx.fillStyle = 'rgba(205, 224, 245, 0.05)';
    ctx.fillRect(wx, winTop, ww, (winBottom - winTop) * 0.45);

    if (theme !== 'steel') {
      ctx.fillStyle = theme === 'velvet' ? '#3d1216' : '#321414';
      ctx.fillRect(wx + 2, winTop + 2, 16, winBottom - winTop - 4);
      ctx.fillRect(wx + ww - 18, winTop + 2, 16, winBottom - winTop - 4);
    }
  }

  // Wainscoting paneling detail
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 2;
  for (let x = 30; x < width - 30; x += 120) {
    ctx.strokeRect(x, winBottom + 14, 86, floorY - winBottom - 26);
  }

  // Brass handrail along corridor wall
  ctx.fillStyle = isBlackout ? '#3a2d18' : '#b88c42';
  ctx.fillRect(0, height * 0.61, width, 4);

  // Floor & 2.5D Perspective Carpet Runner
  ctx.fillStyle = theme === 'steel' ? '#121518' : '#160d08';
  ctx.fillRect(0, floorY, width, height - floorY);

  if (theme !== 'steel') {
    ctx.fillStyle = '#381116';
    ctx.fillRect(width * 0.03, floorY + 10, width * 0.94, height - floorY - 20);
    ctx.strokeStyle = isBlackout ? '#332613' : '#9b7435';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(width * 0.03, floorY + 10, width * 0.94, height - floorY - 20);
  }

  // Location-specific furniture / architectural landmarks
  if (locationId === 'dining_car') {
    for (const bx of [0.22, 0.52, 0.8]) {
      const x = bx * width;
      ctx.fillStyle = '#e7decb';
      ctx.fillRect(x - 42, height * 0.62, 84, 12); // linen table
      ctx.fillStyle = '#331d13';
      ctx.fillRect(x - 6, height * 0.63, 12, floorY - height * 0.63);
      // Warm table lamp
      ctx.fillStyle = '#cfa04e';
      ctx.fillRect(x - 4, height * 0.56, 8, 8);
      ctx.fillStyle = '#f8d27d';
      ctx.beginPath();
      ctx.moveTo(x - 14, height * 0.56);
      ctx.lineTo(x + 14, height * 0.56);
      ctx.lineTo(x + 9, height * 0.52);
      ctx.lineTo(x - 9, height * 0.52);
      ctx.closePath();
      ctx.fill();
    }
  } else if (locationId === 'lounge') {
    // Marble fireplace hearth
    ctx.fillStyle = '#2b2724';
    ctx.fillRect(width * 0.24, height * 0.5, width * 0.12, floorY - height * 0.5);
    ctx.fillStyle = isBlackout ? '#1a0a06' : `rgba(240, 120, 42, ${0.55 + Math.sin(rc.timeSec * 8) * 0.15})`;
    ctx.fillRect(width * 0.27, height * 0.62, width * 0.06, height * 0.14);
    // Mahogany bar counter
    ctx.fillStyle = '#3c2114';
    ctx.fillRect(width * 0.44, height * 0.56, width * 0.16, floorY - height * 0.56);
    ctx.fillStyle = '#b4873e';
    ctx.fillRect(width * 0.44, height * 0.56, width * 0.16, 4);
  } else if (locationId === 'victims_compartment') {
    // Compartment 4 door on the left with overhead transom
    ctx.fillStyle = '#3a2013';
    ctx.fillRect(width * 0.12, height * 0.26, width * 0.12, floorY - height * 0.26);
    ctx.strokeStyle = '#9e7838';
    ctx.strokeRect(width * 0.12, height * 0.26, width * 0.12, floorY - height * 0.26);
    // Overhead ventilation transom louvers
    ctx.fillStyle = '#140c08';
    ctx.fillRect(width * 0.135, height * 0.28, width * 0.09, 22);
    ctx.fillStyle = '#b78c43';
    for (let sy = 0; sy < 4; sy++) {
      ctx.fillRect(width * 0.138, height * 0.284 + sy * 5, width * 0.084, 2);
    }
    // Writing desk
    ctx.fillStyle = '#341c11';
    ctx.fillRect(width * 0.52, height * 0.57, width * 0.18, floorY - height * 0.57);
    // Chalk outline / draped velvet cover beside desk
    ctx.strokeStyle = 'rgba(235, 227, 213, 0.35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(width * 0.43, floorY + 12, 46, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (locationId === 'engine_access') {
    // Riveted steel pressure gauges & pipes
    ctx.fillStyle = '#323840';
    ctx.fillRect(0, height * 0.2, width, 16);
    for (let px = width * 0.18; px < width * 0.85; px += width * 0.22) {
      ctx.fillStyle = '#8b6e3c';
      ctx.beginPath();
      ctx.arc(px, height * 0.34, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#efe5cf';
      ctx.beginPath();
      ctx.arc(px, height * 0.34, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Side vestibule exit doors (Left / Right)
  const loc = TRAIN_LOCATIONS[locationId];
  if (loc.leftExit) {
    drawVestibuleDoor(ctx, 18, height * 0.3, 44, floorY - height * 0.3, '←', isBlackout);
  }
  if (loc.rightExit) {
    drawVestibuleDoor(ctx, width - 62, height * 0.3, 44, floorY - height * 0.3, '→', isBlackout);
  }
}

function drawVestibuleDoor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  arrow: string,
  isBlackout: boolean,
): void {
  ctx.fillStyle = '#20130c';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = isBlackout ? '#332717' : '#9c7838';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  // Frosted glass upper pane
  ctx.fillStyle = isBlackout ? '#090d14' : 'rgba(218, 188, 128, 0.18)';
  ctx.fillRect(x + 7, y + 12, w - 14, h * 0.36);
  ctx.fillStyle = '#d7b56e';
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(arrow, x + w / 2, y + h * 0.62);
}

function drawHotspotProp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  floorNormY: number,
  hs: Hotspot,
  rc: CanvasRenderContext,
  isBlackout: boolean,
): void {
  if (isBlackout) return;
  const cx = hs.x * width;
  const cy = hs.y * height;
  const floorY = floorNormY * height;
  const collected = hs.evidenceId ? rc.state.discoveredEvidenceIds.includes(hs.evidenceId) : false;
  const isHovered = rc.hoveredHotspotId === hs.id;

  ctx.save();
  if (hs.kind === 'door') {
    const dw = hs.width * width;
    const doorTop = height * 0.24;
    const doorBottom = floorY;
    const dh = doorBottom - doorTop;
    const left = cx - dw / 2;

    // Outer mahogany pilaster surround grounded to floor
    ctx.fillStyle = '#22120a';
    ctx.fillRect(left - 8, doorTop - 10, dw + 16, dh + 10);
    ctx.strokeStyle = '#6f5126';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(left - 8, doorTop - 10, dw + 16, dh + 10);

    // Main compartment door leaf
    ctx.fillStyle = isHovered ? '#4d2b1a' : '#381e11';
    ctx.fillRect(left, doorTop, dw, dh);
    ctx.strokeStyle = isHovered ? '#ecc574' : '#a8813e';
    ctx.lineWidth = isHovered ? 2.5 : 1.5;
    ctx.strokeRect(left, doorTop, dw, dh);

    // Overhead ventilation transom louvers
    const transomH = dh * 0.14;
    ctx.fillStyle = '#140b07';
    ctx.fillRect(left + 10, doorTop + 10, dw - 20, transomH);
    ctx.fillStyle = '#b78c43';
    for (let s = 0; s < 4; s++) {
      ctx.fillRect(left + 12, doorTop + 13 + s * ((transomH - 6) / 4), dw - 24, 2);
    }

    // Recessed mahogany panels below transom
    const panelTop = doorTop + transomH + 20;
    const panelH = dh - transomH - 34;
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(left + 12, panelTop, dw - 24, panelH * 0.44);
    ctx.strokeRect(left + 12, panelTop + panelH * 0.5, dw - 24, panelH * 0.46);

    // Brass plate "4"
    ctx.fillStyle = '#c89b48';
    ctx.fillRect(cx - 14, panelTop + 8, 28, 18);
    ctx.fillStyle = '#1b120b';
    ctx.font = '700 12px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText('4', cx, panelTop + 21);

    // Brass doorknob & keyhole escutcheon
    const knobX = left + dw - 16;
    const knobY = doorTop + dh * 0.56;
    ctx.fillStyle = '#9f7937';
    ctx.fillRect(knobX - 4, knobY - 9, 8, 20);
    ctx.fillStyle = '#e7c172';
    ctx.beginPath();
    ctx.arc(knobX, knobY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Brass floor threshold bar
    ctx.fillStyle = '#8b6830';
    ctx.fillRect(left - 6, doorBottom - 3, dw + 12, 4);
  } else {
    // Draw recognizable 1920s diegetic silhouettes for scene objects
    drawPropSilhouette(ctx, hs.id, cx, cy, isHovered, rc.state.observationMode, collected);

    // Diegetic glint / observation ring
    const radius = hs.requiresObservation && !rc.state.observationMode ? 5 : 9;
    const pulse = 0.7 + 0.3 * Math.sin(rc.timeSec * 3.5);

    if (!hs.requiresObservation || rc.state.observationMode || collected) {
      ctx.fillStyle = collected
        ? 'rgba(134, 178, 138, 0.24)'
        : isHovered
          ? 'rgba(232, 184, 92, 0.36)'
          : `rgba(218, 170, 82, ${0.18 * pulse})`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = collected ? '#8bc290' : '#f2ca78';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (rc.state.difficulty === 'casual') {
      ctx.fillStyle = 'rgba(218, 170, 82, 0.14)';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawPropSilhouette(
  ctx: CanvasRenderingContext2D,
  id: string,
  cx: number,
  cy: number,
  isHovered: boolean,
  observationMode: boolean,
  collected: boolean,
): void {
  const stroke = isHovered ? '#eec878' : '#a47d3d';
  switch (id) {
    case 'hs_junction_box': {
      ctx.fillStyle = '#242931';
      ctx.fillRect(cx - 20, cy - 28, 40, 56);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 20, cy - 28, 40, 56);
      ctx.fillStyle = '#c89b48';
      ctx.fillRect(cx + 12, cy - 5, 4, 10);
      ctx.strokeStyle = '#d47448';
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 10);
      ctx.lineTo(cx + 4, cy);
      ctx.lineTo(cx - 4, cy);
      ctx.lineTo(cx + 8, cy + 12);
      ctx.stroke();
      break;
    }
    case 'hs_hale_case': {
      ctx.fillStyle = '#cfa252';
      ctx.fillRect(cx - 13, cy - 8, 26, 16);
      ctx.strokeStyle = '#6f4f1d';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 13, cy - 8, 26, 16);
      ctx.fillStyle = '#3a2714';
      ctx.fillRect(cx - 11, cy - 1, 22, 2);
      break;
    }
    case 'hs_wet_footprint': {
      ctx.fillStyle = observationMode || collected ? 'rgba(130, 175, 205, 0.45)' : 'rgba(18, 12, 10, 0.42)';
      ctx.beginPath();
      ctx.ellipse(cx - 4, cy, 12, 6, -0.15, 0, Math.PI * 2);
      ctx.ellipse(cx + 11, cy + 2, 7, 5, -0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'hs_tool_rack': {
      ctx.fillStyle = '#2b241d';
      ctx.fillRect(cx - 34, cy - 26, 68, 52);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 34, cy - 26, 68, 52);
      ctx.fillStyle = '#8b949e';
      ctx.fillRect(cx - 22, cy - 18, 6, 36);
      ctx.fillRect(cx + 16, cy - 16, 6, 30);
      // Empty middle wrench outline
      ctx.strokeStyle = 'rgba(235, 200, 120, 0.45)';
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(cx - 5, cy - 20, 10, 40);
      ctx.setLineDash([]);
      break;
    }
    case 'hs_grease_jamb': {
      ctx.fillStyle = 'rgba(20, 22, 26, 0.72)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 12, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'hs_typewriter': {
      ctx.fillStyle = '#341e12';
      ctx.fillRect(cx - 28, cy + 8, 56, 18);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx - 16, cy - 12, 32, 20);
      ctx.fillStyle = '#d9cfba';
      ctx.fillRect(cx - 11, cy - 22, 22, 12);
      break;
    }
    case 'hs_punch_log':
    case 'hs_berth_scanner': {
      ctx.fillStyle = '#2d2318';
      ctx.fillRect(cx - 16, cy - 22, 32, 44);
      ctx.strokeStyle = stroke;
      ctx.strokeRect(cx - 16, cy - 22, 32, 44);
      ctx.fillStyle = '#e3d8c2';
      ctx.fillRect(cx - 9, cy - 8, 18, 24);
      break;
    }
    case 'hs_timetable': {
      ctx.fillStyle = '#1f1812';
      ctx.fillRect(cx - 22, cy - 18, 44, 36);
      ctx.strokeStyle = stroke;
      ctx.strokeRect(cx - 22, cy - 18, 44, 36);
      ctx.fillStyle = '#e0d3b8';
      ctx.fillRect(cx - 16, cy - 12, 32, 24);
      break;
    }
    case 'hs_bartender_chit':
    case 'hs_steel_memo':
    case 'hs_tea_receipt': {
      ctx.fillStyle = '#e7dcc5';
      ctx.fillRect(cx - 14, cy - 8, 28, 16);
      ctx.strokeStyle = '#6b573b';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 14, cy - 8, 28, 16);
      break;
    }
    case 'hs_hearth_ash': {
      ctx.fillStyle = '#191412';
      ctx.fillRect(cx - 16, cy - 10, 32, 18);
      ctx.fillStyle = '#ded1b6';
      ctx.fillRect(cx - 8, cy - 5, 16, 10);
      break;
    }
    case 'hs_cognac_stain':
    case 'hs_brandy_glass': {
      ctx.fillStyle = 'rgba(218, 232, 245, 0.25)';
      ctx.strokeStyle = 'rgba(235, 242, 248, 0.72)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#9c5a25';
      ctx.fillRect(cx - 5, cy - 2, 10, 5);
      break;
    }
    case 'hs_mercer_satchel':
    case 'hs_moved_suitcase': {
      ctx.fillStyle = '#3d2415';
      ctx.fillRect(cx - 22, cy - 14, 44, 28);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 22, cy - 14, 44, 28);
      ctx.fillStyle = '#c89b48';
      ctx.fillRect(cx - 4, cy - 6, 8, 6);
      break;
    }
    case 'hs_stopped_watch': {
      ctx.fillStyle = '#cfd6de';
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8b95a1';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = '#1b1a18';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - 6);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 5, cy + 2);
      ctx.stroke();
      break;
    }
    case 'hs_door_scratch': {
      ctx.fillStyle = '#c89b48';
      ctx.fillRect(cx - 14, cy + 6, 28, 7);
      ctx.strokeStyle = '#f2deb1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx + 3, cy + 9, 8, 0.4, 2.5);
      ctx.stroke();
      break;
    }
    case 'hs_sealed_window': {
      ctx.fillStyle = '#8c949c';
      ctx.fillRect(cx - 8, cy + 16, 16, 10);
      ctx.fillStyle = '#c89b48';
      ctx.fillRect(cx - 3, cy + 18, 6, 6);
      break;
    }
    case 'hs_rear_deck': {
      ctx.fillStyle = 'rgba(130, 175, 205, 0.35)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 38, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default:
      break;
  }
}

function drawSuspectFigure(
  ctx: CanvasRenderingContext2D,
  _width: number,
  height: number,
  suspectId: SuspectId,
  x: number,
  floorY: number,
  isHovered: boolean,
  timeSec: number,
  isBlackout: boolean,
): void {
  if (isBlackout) return;
  const scale = Math.max(0.68, Math.min(1.15, height / 620));
  const breath = Math.sin(timeSec * 1.8 + x * 0.01) * 1.4;
  const palette: Record<SuspectId, { coat: string; accent: string }> = {
    clara: { coat: '#185b43', accent: '#efe6d4' },
    victor: { coat: '#24272c', accent: '#c99b49' },
    mercer: { coat: '#2e3238', accent: '#c5ccd6' },
    eleanor: { coat: '#543f2d', accent: '#982c2c' },
    reed: { coat: '#192940', accent: '#d4a64a' },
    arthur: { coat: '#4b4d50', accent: '#c8c3b8' },
  };
  const colors = palette[suspectId];

  ctx.save();
  ctx.translate(x, floorY);
  ctx.scale(scale, scale);

  // Soft shadow on carpet
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isHovered) {
    ctx.strokeStyle = 'rgba(232, 184, 92, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 4, 30, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Legs
  ctx.fillStyle = '#141312';
  ctx.fillRect(-10, -54, 8, 54);
  ctx.fillRect(2, -54, 8, 54);

  // Torso / Coat / Gown
  ctx.fillStyle = colors.coat;
  ctx.beginPath();
  ctx.moveTo(-20, -52);
  ctx.lineTo(-15, -112 + breath);
  ctx.lineTo(15, -112 + breath);
  ctx.lineTo(20, -52);
  ctx.closePath();
  ctx.fill();

  // Accent scarf / pearls / badge
  ctx.fillStyle = colors.accent;
  ctx.fillRect(-5, -108 + breath, 10, 14);

  // Head
  ctx.fillStyle = '#d9b596';
  ctx.beginPath();
  ctx.arc(0, -128 + breath, 13, 0, Math.PI * 2);
  ctx.fill();

  // Hair / Conductor Cap
  ctx.fillStyle = suspectId === 'reed' ? '#16243a' : suspectId === 'mercer' ? '#7b8089' : '#261a14';
  ctx.beginPath();
  ctx.arc(0, -133 + breath, 13.5, Math.PI, Math.PI * 2);
  ctx.fill();
  if (suspectId === 'reed') {
    ctx.fillStyle = '#d4a64a';
    ctx.fillRect(-12, -136 + breath, 24, 4);
  }

  // Nameplate tag beneath suspect
  const profile = SUSPECT_PROFILES[suspectId];
  ctx.fillStyle = isHovered ? '#f3d188' : 'rgba(235, 227, 213, 0.78)';
  ctx.font = '600 12px "Lora", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(profile.name, 0, 22);

  ctx.restore();
}

function drawEliasVane(
  ctx: CanvasRenderingContext2D,
  x: number,
  floorY: number,
  height: number,
  facing: 1 | -1,
  walkPhase: number,
  timeSec: number,
  isBlackout: boolean,
): void {
  const scale = Math.max(0.7, Math.min(1.18, height / 610));
  const stride = Math.sin(walkPhase) * 9;
  const bob = Math.abs(Math.sin(walkPhase)) * 3 + Math.sin(timeSec * 2) * 0.6;

  ctx.save();
  ctx.translate(x, floorY);
  ctx.scale(facing * scale, scale);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.52)';
  ctx.beginPath();
  ctx.ellipse(0, 5, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isBlackout) {
    ctx.globalAlpha = 0.4;
  }

  // Striding legs
  ctx.fillStyle = '#121215';
  ctx.save();
  ctx.translate(-4, -56 - bob);
  ctx.rotate((stride * Math.PI) / 180);
  ctx.fillRect(-4, 0, 8, 56);
  ctx.restore();

  ctx.save();
  ctx.translate(5, -56 - bob);
  ctx.rotate((-stride * Math.PI) / 180);
  ctx.fillRect(-4, 0, 8, 56);
  ctx.restore();

  // Dark charcoal trench coat with subtle brass rim highlight
  ctx.fillStyle = '#1c1d21';
  ctx.beginPath();
  ctx.moveTo(-22, -44 - bob);
  ctx.lineTo(-16, -118 - bob);
  ctx.lineTo(17, -118 - bob);
  ctx.lineTo(24, -44 - bob);
  ctx.closePath();
  ctx.fill();

  // Coat lapel & tie
  ctx.fillStyle = '#383028';
  ctx.fillRect(0, -114 - bob, 11, 22);

  // Head
  ctx.fillStyle = '#d7b292';
  ctx.beginPath();
  ctx.arc(1, -132 - bob, 13.5, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#181412';
  ctx.beginPath();
  ctx.arc(0, -137 - bob, 14, Math.PI * 0.9, Math.PI * 2.05);
  ctx.fill();

  // Warm rim highlight along coat edge
  ctx.strokeStyle = 'rgba(222, 174, 92, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(16, -118 - bob);
  ctx.lineTo(23, -46 - bob);
  ctx.stroke();

  ctx.restore();
}

function drawBrassLighting(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: string,
  locationId: LocationId,
  timeSec: number,
): void {
  const flicker = 0.94 + Math.sin(timeSec * 7.3) * 0.03;
  // Position sconces strictly on solid mahogany wall piers, never over window glass
  const sconcePositions =
    locationId === 'carriage_7'
      ? [0.245, 0.435, 0.645, 0.915]
      : locationId === 'observation_carriage'
        ? [0.275, 0.5, 0.725]
        : [0.065, 0.35, 0.65, 0.935];
  const coneFill =
    theme === 'steel'
      ? `rgba(210, 195, 160, ${0.11 * flicker})`
      : `rgba(244, 184, 84, ${0.14 * flicker})`;

  for (const sx of sconcePositions) {
    const x = sx * width;
    const y = height * 0.26;

    // Brass backplate & glowing sconce globe
    ctx.fillStyle = '#7b5b28';
    ctx.fillRect(x - 3, y - 9, 6, 14);
    ctx.fillStyle = '#f2ca76';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = coneFill;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.lineTo(x + width * 0.12, height * 0.84);
    ctx.lineTo(x - width * 0.12, height * 0.84);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBlackoutOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rc: CanvasRenderContext,
): void {
  const sec = rc.state.blackoutProgress;
  const mx = rc.mouseNormX * width;
  const my = rc.mouseNormY * height;
  const beamR = Math.min(width, height) * 0.24;

  // Fast clipped dark fill leaving a warm pocket-torch circle
  ctx.save();
  ctx.fillStyle = 'rgba(3, 4, 7, 0.94)';
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.arc(mx, my, beamR, 0, Math.PI * 2, true);
  ctx.fill();

  ctx.strokeStyle = 'rgba(232, 188, 96, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mx, my, beamR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // At 11:47:15 (sec 12..28), lightning reveals passing silhouette in Carriage 7!
  if (sec >= 12 && sec <= 28) {
    const sx = width * (0.76 - ((sec - 12) / 16) * 0.24);
    ctx.fillStyle = rc.lightningAlpha > 0.08 ? 'rgba(20, 24, 34, 0.88)' : 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(sx, height * 0.63, 18, 58, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Directional sound ripples during key blackout timestamps
  if (sec >= 14 && sec <= 24) {
    drawSoundRipple(ctx, width * 0.68, height * 0.68, rc.timeSec, 'Soft muffled footsteps...');
  }
  if (sec >= 29 && sec <= 42) {
    drawSoundRipple(ctx, width * 0.56, height * 0.56, rc.timeSec, 'Heavy metallic thud & glass crack!');
  }
  if (sec >= 50 && sec <= 66) {
    drawSoundRipple(ctx, width * 0.54, height * 0.42, rc.timeSec, 'Faint scraping click near the transom...');
  }
}

function drawSoundRipple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timeSec: number,
  caption: string,
): void {
  const ring = (timeSec * 1.4) % 1;
  ctx.strokeStyle = `rgba(218, 174, 92, ${1 - ring})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 16 + ring * 58, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(242, 224, 185, 0.92)';
  ctx.font = 'italic 14px "Lora", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(caption, x, y - 34);
}

function drawObservationOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hotspots: Hotspot[],
  rc: CanvasRenderContext,
): void {
  const hintSpec = getObservationHintSpec(rc.state.difficulty);

  ctx.fillStyle = 'rgba(10, 14, 22, 0.26)';
  ctx.fillRect(0, 0, width, height);

  for (const hs of hotspots) {
    if (hs.kind === 'suspect' || hs.kind === 'door') continue;
    const cx = hs.x * width;
    const cy = hs.y * height;
    const collected = hs.evidenceId ? rc.state.discoveredEvidenceIds.includes(hs.evidenceId) : false;
    if (collected) continue;

    if (hintSpec.highlightRadius > 0) {
      ctx.strokeStyle = `rgba(232, 188, 96, ${hintSpec.highlightOpacity})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, hintSpec.highlightRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  const mx = rc.mouseNormX * width;
  const my = rc.mouseNormY * height;
  ctx.strokeStyle = 'rgba(214, 168, 84, 0.72)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mx, my, 42, 0, Math.PI * 2);
  ctx.stroke();
}

function drawHotspotTooltip(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hs: Hotspot,
  state: GameState,
): void {
  const x = Math.max(120, Math.min(width - 120, hs.x * width));
  const y = Math.max(46, hs.y * height - 48);
  const needsObs = hs.requiresObservation && !state.observationMode;
  const label = needsObs && state.difficulty !== 'master' ? `${hs.label} (Use Observation Mode)` : hs.label;

  ctx.font = '500 13px "Lora", Georgia, serif';
  const metrics = ctx.measureText(label);
  const padX = 12;
  const boxW = metrics.width + padX * 2;
  const boxH = 28;

  ctx.fillStyle = 'rgba(15, 13, 10, 0.92)';
  ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
  ctx.strokeStyle = 'rgba(200, 155, 72, 0.65)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);

  ctx.fillStyle = '#f3e7d1';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y + 4);
}

function drawVignetteAndGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grainPool: GrainDot[],
  _observationMode: boolean,
): void {
  ctx.fillStyle = 'rgba(255, 240, 215, 0.045)';
  const count = Math.min(30, grainPool.length);
  for (let i = 0; i < count; i++) {
    const g = grainPool[i];
    ctx.fillRect(g.x * width, g.y * height, 1.5, 1.5);
  }
}
