// Audio Engine using Web Audio API - Realistic Procedural Vehicle & Environment SFX
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.initialized = false;

    // Engine sound nodes
    this.engineOsc = null;
    this.engineSub = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.engineNoise = null;
    this.noiseGain = null;

    // Mud/Water sound nodes
    this.mudGain = null;
    this.mudFilter = null;

    // Horn state
    this.isHonking = false;
    this.hornOscs = [];
    this.hornGain = null;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupEngineSound();
      this.setupMudSound();
      this.initialized = true;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("Web Audio not available:", e);
    }
  }

  setupEngineSound() {
    if (!this.ctx) return;

    // Master Engine Gain
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    // Filter to emulate diesel engine resonance
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // Primary engine oscillator (Sawtooth for diesel cylinder rumble)
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(38, this.ctx.currentTime);

    // Sub oscillator (Triangle for heavy exhaust vibration)
    this.engineSub = this.ctx.createOscillator();
    this.engineSub.type = 'triangle';
    this.engineSub.frequency.setValueAtTime(19, this.ctx.currentTime);

    // Noise buffer for exhaust hiss / mechanical turbo hiss
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.engineNoise = this.ctx.createBufferSource();
    this.engineNoise.buffer = noiseBuffer;
    this.engineNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

    this.engineNoise.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.engineGain);

    this.engineOsc.connect(this.engineFilter);
    this.engineSub.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc.start();
    this.engineSub.start();
    this.engineNoise.start();
  }

  setupMudSound() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    this.mudFilter = this.ctx.createBiquadFilter();
    this.mudFilter.type = 'bandpass';
    this.mudFilter.frequency.setValueAtTime(250, this.ctx.currentTime);
    this.mudFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.mudGain = this.ctx.createGain();
    this.mudGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    noise.connect(this.mudFilter);
    this.mudFilter.connect(this.mudGain);
    this.mudGain.connect(this.ctx.destination);
    noise.start();
  }

  updateEngine(speedRatio, isThrottling, isLowRange, mudDepth) {
    if (!this.initialized || !this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Base idle frequency ~ 32Hz, up to ~110Hz at top speed
    let baseFreq = 32 + (speedRatio * 55);
    if (isThrottling) baseFreq += 18;
    if (isLowRange) baseFreq *= 1.35; // higher RPM in low-range 4x4 crawl

    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.08);
    this.engineSub.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.08);

    // Filter frequency responds to throttle
    const filterFreq = 220 + (speedRatio * 450) + (isThrottling ? 200 : 0) + (mudDepth * 150);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);

    // Engine volume
    let vol = 0.12 + (speedRatio * 0.15) + (isThrottling ? 0.08 : 0);
    if (isLowRange) vol *= 1.25;
    this.engineGain.gain.setTargetAtTime(vol, now, 0.05);

    // Turbo/exhaust hiss
    this.noiseGain.gain.setTargetAtTime(0.01 + (speedRatio * 0.05) + (isThrottling ? 0.04 : 0), now, 0.08);

    // Mud resistance churn
    if (mudDepth > 0.05) {
      const mudVol = Math.min(0.25, mudDepth * 0.3 * (0.3 + speedRatio));
      this.mudGain.gain.setTargetAtTime(mudVol, now, 0.05);
      this.mudFilter.frequency.setTargetAtTime(180 + (speedRatio * 200), now, 0.05);
    } else {
      this.mudGain.gain.setTargetAtTime(0.0001, now, 0.1);
    }
  }

  // Play a massive water splash when Thar dives into water pit
  playWaterSplash(impactSpeed) {
    if (!this.initialized || !this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.7);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.6);

    const gain = this.ctx.createGain();
    const volume = Math.min(0.5, 0.15 + (impactSpeed * 0.03));
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Indian Desi 3-Tone Musical Horn
  startHorn() {
    if (!this.initialized || !this.ctx || this.isMuted || this.isHonking) return;
    this.isHonking = true;
    const now = this.ctx.currentTime;

    // Harmonious Indian 4x4 / Truck horn frequencies (F, A, C chord)
    const freqs = [349.23, 440.0, 523.25, 698.46];
    this.hornOscs = [];
    this.hornGain = this.ctx.createGain();
    this.hornGain.gain.setValueAtTime(0.28, now);

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      const fGain = this.ctx.createGain();
      fGain.gain.setValueAtTime(0.25, now);

      osc.connect(fGain);
      fGain.connect(this.hornGain);
      osc.start(now);
      this.hornOscs.push(osc);
    });

    this.hornGain.connect(this.ctx.destination);
  }

  stopHorn() {
    if (!this.isHonking || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.hornGain) {
      this.hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      setTimeout(() => {
        this.hornOscs.forEach(o => {
          try { o.stop(); o.disconnect(); } catch (e) {}
        });
        this.hornOscs = [];
        this.isHonking = false;
      }, 90);
    } else {
      this.isHonking = false;
    }
  }

  // Breakage sound for Earthen Butter Pots (Makhan Matka shatter)
  playPotShatter() {
    if (!this.initialized || !this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // High crack
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);

    // Creamy butter splat
    const bufSize = Math.floor(this.ctx.sampleRate * 0.25);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const splat = this.ctx.createBufferSource();
    splat.buffer = buf;
    const splatFilter = this.ctx.createBiquadFilter();
    splatFilter.type = 'lowpass';
    splatFilter.frequency.setValueAtTime(450, now);
    const splatGain = this.ctx.createGain();
    splatGain.gain.setValueAtTime(0.4, now);
    splatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    splat.connect(splatFilter);
    splatFilter.connect(splatGain);
    splatGain.connect(this.ctx.destination);
    splat.start(now);
  }

  // Temple Ghanta (Sacred Bell) Sound
  playTempleBell() {
    if (!this.initialized || !this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const partials = [
      { f: 587.33, g: 0.35, dur: 2.8 }, // D5
      { f: 880.00, g: 0.25, dur: 2.2 }, // A5
      { f: 1174.66, g: 0.15, dur: 1.6 },// D6
      { f: 1760.00, g: 0.08, dur: 1.0 } // A6
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(p.g, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + p.dur);
    });
  }

  // Divine Bansuri (Flute) intro melody
  playFluteTune() {
    if (!this.initialized || !this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Traditional Raag notes (Sa Re Ga Pa Dha Sa: 440, 493.88, 554.37, 659.25, 739.99)
    const notes = [
      { f: 440.0, time: 0.0, dur: 0.35 },
      { f: 493.88, time: 0.32, dur: 0.35 },
      { f: 554.37, time: 0.65, dur: 0.45 },
      { f: 659.25, time: 1.05, dur: 0.6 },
      { f: 739.99, time: 1.6, dur: 0.5 },
      { f: 880.0, time: 2.05, dur: 1.2 }
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, now + n.time);

      // Add gentle vibrato
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(5.5, now + n.time);
      const vGain = this.ctx.createGain();
      vGain.gain.setValueAtTime(4.0, now + n.time);
      vibrato.connect(vGain);
      vGain.connect(osc.frequency);
      vibrato.start(now + n.time);
      vibrato.stop(now + n.time + n.dur);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.linearRampToValueAtTime(0.18, now + n.time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      if (this.mudGain) this.mudGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

window.soundManager = new SoundManager();
