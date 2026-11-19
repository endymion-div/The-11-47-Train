import type { EndingTier } from './types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceStarted = false;
  private musicInterval: number | null = null;
  private railInterval: number | null = null;
  private chordStep = 0;
  private muted = false;
  private observationDucked = false;
  private blackoutActive = false;

  public ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : 0.75;
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.28;
        this.musicGain.connect(this.masterGain);

        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.gain.value = 0.34;
        this.ambienceGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.65;
        this.sfxGain.connect(this.masterGain);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.ambienceStarted) {
      this.startLoops();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.75, this.ctx.currentTime, 0.06);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setObservationMode(active: boolean): void {
    this.observationDucked = active;
    if (!this.ctx || !this.ambienceGain || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.ambienceGain.gain.setTargetAtTime(active ? 0.14 : 0.34, now, 0.15);
    this.musicGain.gain.setTargetAtTime(active ? 0.18 : 0.28, now, 0.15);
  }

  public setBlackoutMode(active: boolean): void {
    this.blackoutActive = active;
    if (!this.ctx || !this.ambienceGain || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.ambienceGain.gain.setTargetAtTime(active ? 0.22 : 0.34, now, 0.12);
    this.musicGain.gain.setTargetAtTime(active ? 0.12 : 0.28, now, 0.12);
  }

  public stopLoops(): void {
    if (this.musicInterval !== null) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.railInterval !== null) {
      window.clearInterval(this.railInterval);
      this.railInterval = null;
    }
    this.ambienceStarted = false;
  }

  private startLoops(): void {
    if (!this.ctx || !this.ambienceGain || !this.musicGain) return;
    this.ambienceStarted = true;

    // Continuous rain & distant wind noise bed
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.04 * white) / 1.04;
      data[i] = lastOut * 2.4;
    }

    const rainSrc = this.ctx.createBufferSource();
    rainSrc.buffer = noiseBuffer;
    rainSrc.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1150;
    rainFilter.Q.value = 0.65;

    const rainGain = this.ctx.createGain();
    rainGain.gain.value = 0.18;

    rainSrc.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.ambienceGain);
    rainSrc.start();

    // Subtle low engine / coach rumble
    const rumbleOsc = this.ctx.createOscillator();
    rumbleOsc.type = 'triangle';
    rumbleOsc.frequency.value = 46;
    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 90;
    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.value = 0.14;
    rumbleOsc.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.ambienceGain);
    rumbleOsc.start();

    // Rhythmic rail joint "clack-clack ... clack-clack"
    if (this.railInterval !== null) window.clearInterval(this.railInterval);
    this.railInterval = window.setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      this.triggerRailClack();
      window.setTimeout(() => this.triggerRailClack(0.75), 140);
      if (Math.random() < 0.08 && !this.blackoutActive) {
        this.triggerDistantThunder();
      }
    }, 1180);

    // Noir chamber underscore (D minor noir progression: Dm9 -> Bbmaj7 -> Gm7 -> A7b9)
    const chords = [
      { bass: 73.42, notes: [220.0, 261.63, 329.63, 349.23] }, // Dm9
      { bass: 58.27, notes: [174.61, 220.0, 261.63, 293.66] }, // Bbmaj7
      { bass: 98.0, notes: [174.61, 233.08, 293.66, 349.23] }, // Gm7
      { bass: 55.0, notes: [196.0, 233.08, 277.18, 329.63] }, // A7b9
    ];

    if (this.musicInterval !== null) window.clearInterval(this.musicInterval);
    this.musicInterval = window.setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const chord = chords[this.chordStep % chords.length];
      this.chordStep++;
      this.playNoirChord(chord.bass, chord.notes);
    }, 2900);
  }

  private playNoirChord(bassFreq: number, notes: number[]): void {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    // Upright bass pluck
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(bassFreq, now);
    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.exponentialRampToValueAtTime(this.blackoutActive ? 0.25 : 0.36, now + 0.04);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    bass.connect(bassGain);
    bassGain.connect(this.musicGain);
    bass.start(now);
    bass.stop(now + 2.5);

    if (this.blackoutActive) {
      // Suspense pulse during blackout instead of full lounge harmony
      const pulse = this.ctx.createOscillator();
      const pulseGain = this.ctx.createGain();
      pulse.type = 'sine';
      pulse.frequency.setValueAtTime(62, now + 0.5);
      pulseGain.gain.setValueAtTime(0.001, now + 0.5);
      pulseGain.gain.exponentialRampToValueAtTime(0.22, now + 0.58);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      pulse.connect(pulseGain);
      pulseGain.connect(this.musicGain);
      pulse.start(now + 0.5);
      pulse.stop(now + 1.3);
      return;
    }

    // Muted felt-piano arpeggio notes
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.musicGain) return;
      const start = now + idx * 0.28;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      filter.type = 'lowpass';
      filter.frequency.value = this.observationDucked ? 520 : 980;
      g.gain.setValueAtTime(0.001, start);
      g.gain.exponentialRampToValueAtTime(0.11, start + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, start + 2.0);
      osc.connect(filter);
      filter.connect(g);
      g.connect(this.musicGain);
      osc.start(start);
      osc.stop(start + 2.1);
    });
  }

  private triggerRailClack(scale = 1): void {
    if (!this.ctx || !this.ambienceGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(108 * scale, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.06);
    g.gain.setValueAtTime(0.12 * scale, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(g);
    g.connect(this.ambienceGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  public triggerDistantThunder(): void {
    if (!this.ctx || !this.ambienceGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(58, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 1.8);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 110;
    g.gain.setValueAtTime(0.001, now);
    g.gain.exponentialRampToValueAtTime(0.18, now + 0.25);
    g.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.ambienceGain);
    osc.start(now);
    osc.stop(now + 2.1);
  }

  public playFootstep(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    const pitch = 95 + (Math.random() - 0.5) * 14;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.055);
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playClueDiscovered(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.muted) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      g.gain.setValueAtTime(0.001, now + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.18, now + i * 0.07 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.45);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.5);
    });
  }

  public playNotebookToggle(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.06);
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playContradiction(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.muted) return;
    const now = ctx.currentTime;
    [311.13, 466.16, 622.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1400;
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      g.gain.setValueAtTime(0.15, now + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.5);
      osc.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain!);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.55);
    });
  }

  public playDoorTransition(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.14);
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playRelayDrop(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.45);
    g.gain.setValueAtTime(0.28, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  public playBlackoutClatter(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.muted) return;
    const now = ctx.currentTime;
    [130, 840, 1320].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.22);
      g.gain.setValueAtTime(idx === 0 ? 0.35 : 0.12, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  public playBlackoutWireClick(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1680, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playEndingSting(tier: EndingTier): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.muted) return;
    const now = ctx.currentTime;
    const notes =
      tier === 'MASTER_DETECTIVE' || tier === 'PERFECT_SOLUTION'
        ? [293.66, 349.23, 440.0, 587.33]
        : [293.66, 277.18, 246.94, 220.0];
    notes.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.14);
      g.gain.setValueAtTime(0.2, now + idx * 0.14);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.9);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.95);
    });
  }
}

export const audioEngine = new AudioEngine();
