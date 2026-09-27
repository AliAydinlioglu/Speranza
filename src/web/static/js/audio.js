const AudioEngine = {
  ctx: null,
  muted: false,
  squelchSource: null,
  squelchGain: null,
  squelchHum: null,

  init() {
    const saved = localStorage.getItem('speranza_audio_muted');
    if (saved !== null) {
      this.muted = saved === 'true';
    }
    this.updateUI();
  },

  ensureContext() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  toggleMute() {
    this.ensureContext();
    this.muted = !this.muted;
    localStorage.setItem('speranza_audio_muted', String(this.muted));
    if (this.muted && this.squelchGain) {
      this.stopCarrierSquelch();
    }
    this.updateUI();
    if (!this.muted) {
      this.playMechanicalClick(true);
    }
    return this.muted;
  },

  updateUI() {
    const label = document.getElementById('audio-label');
    const led = document.getElementById('audio-led');
    if (label) {
      label.textContent = this.muted ? 'AUDIO COMM // [MUTED]' : 'AUDIO COMM // ACTIVE';
      label.className = `text-xs font-mono-code font-bold tracking-wider ${this.muted ? 'text-zinc-500' : 'text-[#4ADE80]'}`;
    }
    if (led) {
      led.className = `led-indicator ${this.muted ? 'bg-zinc-700' : 'led-green'}`;
    }
  },

  playMechanicalClick(pressed = true) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.0, t);

    if (pressed) {
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + 0.018);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.018);
    } else {
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.010);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.010);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.010);
    }
  },

  startCarrierSquelch() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    if (this.squelchGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, t);
    filter.Q.setValueAtTime(1.8, t);

    const hum = this.ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(60, t);

    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.03, t);

    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0.001, t);
    mainGain.gain.linearRampToValueAtTime(0.045, t + 0.04);

    noise.connect(filter);
    filter.connect(mainGain);
    hum.connect(humGain);
    humGain.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    noise.start(t);
    hum.start(t);

    this.squelchSource = noise;
    this.squelchHum = hum;
    this.squelchGain = mainGain;
  },

  stopCarrierSquelch() {
    if (!this.ctx || !this.squelchGain) return;
    const t = this.ctx.currentTime;
    const g = this.squelchGain;
    const src = this.squelchSource;
    const hum = this.squelchHum;

    this.squelchGain = null;
    this.squelchSource = null;
    this.squelchHum = null;

    try {
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.120);
      setTimeout(() => {
        try {
          if (src) src.stop();
          if (hum) hum.stop();
          g.disconnect();
        } catch (_) {}
      }, 130);
    } catch (_) {
      try {
        if (src) src.stop();
        if (hum) hum.stop();
      } catch (_) {}
    }
  },

  playPayloadChime() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1850, t);
    gain1.gain.setValueAtTime(0.18, t);
    gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.250);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3700, t);
    gain2.gain.setValueAtTime(0.12, t);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.250);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.250);
    osc2.start(t);
    osc2.stop(t + 0.250);
  },

  playGlitchStatic() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.080;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }
};
