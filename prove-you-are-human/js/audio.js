/**
 * Zero-asset Web Audio API Procedural Sound Engine
 * Automatically unlocks on first user gesture and suspends on page hide.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.mosquitoNodes = null;
    this.drawNodes = null;
    this._noiseBuffer = null;

    const unlock = () => {
      this.ensureCtx();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAllLoops();
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      } else if (!this.muted && this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    });
  }

  ensureCtx() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(flag) {
    this.muted = Boolean(flag);
    if (this.muted) {
      this.stopAllLoops();
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    if (!this.muted) this.click();
    return this.muted;
  }

  vibrate(pattern) {
    if (this.muted) return;
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (_) {}
  }

  getNoiseBuffer(ctx) {
    if (this._noiseBuffer && this._noiseBuffer.sampleRate === ctx.sampleRate) {
      return this._noiseBuffer;
    }
    const len = Math.floor(ctx.sampleRate * 0.5);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this._noiseBuffer = buf;
    return buf;
  }

  click() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(780, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.045);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.055);
  }

  dodge() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(980, t + 0.11);
    gain.gain.setValueAtTime(0.13, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  pass() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const st = t + i * 0.075;
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.14, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(st);
      osc.stop(st + 0.24);
    });
    this.vibrate(20);
  }

  fail() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    [155, 164].forEach((freq) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq - 22, t + 0.24);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    });
    this.vibrate([35, 30, 35]);
  }

  slapTable() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    // Heavy low thump
    const osc = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, t);
    osc.frequency.exponentialRampToValueAtTime(36, t + 0.2);
    g1.gain.setValueAtTime(0.35, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(g1).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);

    // Crisp slap noise burst
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1200, t);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.28, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    src.connect(bp).connect(g2).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.1);
    this.vibrate([45]);
  }

  splat() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1400, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.26, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    src.connect(hp).connect(g).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.1);
    this.vibrate(28);
  }

  crank(ratio = 0.5) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600 + ratio * 750, t);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  hammer() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    [880, 1760].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.65, t + 0.08);
      gain.gain.setValueAtTime(idx === 0 ? 0.18 : 0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.095);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
    this.vibrate(25);
  }

  glitch() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(900, t);
    bp.frequency.setValueAtTime(2200, t + 0.1);
    bp.frequency.setValueAtTime(420, t + 0.2);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.setValueAtTime(0.03, t + 0.11);
    gain.gain.setValueAtTime(0.2, t + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
    src.connect(bp).connect(gain).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.36);
  }

  meow() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.exponentialRampToValueAtTime(980, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.28);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  trainBrake() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(10, t);
    bp.frequency.setValueAtTime(2500, t);
    bp.frequency.exponentialRampToValueAtTime(900, t + 0.38);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    src.connect(bp).connect(gain).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.44);
  }

  tick(urgent = false) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(urgent ? 980 : 620, t);
    gain.gain.setValueAtTime(urgent ? 0.1 : 0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  fanfare() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 987.77, 1046.5];
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const st = t + i * 0.095;
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.14, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.55);
      osc.connect(gain).connect(ctx.destination);
      osc.start(st);
      osc.stop(st + 0.6);
    });
    this.vibrate([30, 40, 60]);
  }

  startMosquito() {
    this.stopMosquito();
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const bp = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 540;
    lfo.frequency.value = 11;
    lfoGain.gain.value = 26;
    bp.type = 'bandpass';
    bp.frequency.value = 1350;
    bp.Q.value = 5;
    gain.gain.value = 0.045;

    lfo.connect(lfoGain).connect(osc.frequency);
    osc.connect(bp).connect(gain).connect(ctx.destination);
    osc.start();
    lfo.start();
    this.mosquitoNodes = { osc, lfo, gain };
  }

  setMosquitoAudible(audible, pitchBoost = 0) {
    if (!this.mosquitoNodes || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.mosquitoNodes.gain.gain.setTargetAtTime(audible ? 0.045 : 0.0001, t, 0.03);
    this.mosquitoNodes.osc.frequency.setTargetAtTime(530 + pitchBoost * 110, t, 0.05);
  }

  stopMosquito() {
    if (!this.mosquitoNodes) return;
    try {
      this.mosquitoNodes.osc.stop();
      this.mosquitoNodes.lfo.stop();
    } catch (_) {}
    this.mosquitoNodes = null;
  }

  startDrawTone() {
    this.stopDrawTone();
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 320;
    gain.gain.value = 0.055;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    this.drawNodes = { osc, gain };
  }

  updateDrawTone(score0to100) {
    if (!this.drawNodes || !this.ctx) return;
    const freq = 260 + Math.max(0, Math.min(100, score0to100)) * 4.4;
    this.drawNodes.osc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.04);
  }

  stopDrawTone() {
    if (!this.drawNodes) return;
    try {
      this.drawNodes.osc.stop();
    } catch (_) {}
    this.drawNodes = null;
  }

  stopAllLoops() {
    this.stopMosquito();
    this.stopDrawTone();
  }
}

export const sound = new SoundEngine();
