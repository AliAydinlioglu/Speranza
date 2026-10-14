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

    const unlock = () => {
      this.ensureContext();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('click', unlock);
  },

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  toggleMute() {
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.muted) {
      this.playPowerDownTone();
      this.muted = true;
      if (this.squelchGain) {
        this.stopCarrierSquelch();
      }
    } else {
      this.muted = false;
      this.playTestBeep();
    }

    localStorage.setItem('speranza_audio_muted', String(this.muted));
    this.updateUI();
    return this.muted;
  },

  updateUI() {
    const label = document.getElementById('audio-label');
    const led = document.getElementById('audio-led');
    if (label) {
      label.textContent = this.muted ? 'SOUND: OFF' : 'SOUND: ON';
      label.className = `text-xs font-mono-code font-bold tracking-wider ${this.muted ? 'text-[#FF003C]' : 'text-[#4ADE80]'}`;
    }
    if (led) {
      led.className = `led-indicator ${this.muted ? 'led-red' : 'led-green'}`;
    }
  },

  playPowerDownTone() {
    this.ensureContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch (_) {}
  },

  playTestBeep() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t);
      osc.frequency.setValueAtTime(880, t + 0.08);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.setValueAtTime(0.28, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.23);
    } catch (_) {}
  },

  playMechanicalClick(pressed = true) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      if (pressed) {
        osc.type = 'square';
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.Q.setValueAtTime(2.5, t);

        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.024);

        gain.gain.setValueAtTime(0.38, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.03);
      } else {
        osc.type = 'triangle';
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(950, t);
        filter.Q.setValueAtTime(2.0, t);

        osc.frequency.setValueAtTime(850, t);
        osc.frequency.exponentialRampToValueAtTime(280, t + 0.016);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.019);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.02);
      }
    } catch (_) {}
  },

  startCarrierSquelch() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    if (this.squelchGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const t = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.5);
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
      filter.frequency.setValueAtTime(650, t);
      filter.Q.setValueAtTime(2.0, t);

      const hum = this.ctx.createOscillator();
      hum.type = 'triangle';
      hum.frequency.setValueAtTime(120, t);

      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.06, t);

      const mainGain = this.ctx.createGain();
      mainGain.gain.setValueAtTime(0.001, t);
      mainGain.gain.linearRampToValueAtTime(0.08, t + 0.05);

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
    } catch (_) {}
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
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      setTimeout(() => {
        try {
          if (src) src.stop();
          if (hum) hum.stop();
          g.disconnect();
        } catch (_) {}
      }, 110);
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
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, t);
      gain1.gain.setValueAtTime(0.28, t);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, t + 0.06);
      gain2.gain.setValueAtTime(0.28, t + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.23);
      osc2.start(t + 0.06);
      osc2.stop(t + 0.33);
    } catch (_) {}
  },

  playGlitchStatic() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const t = this.ctx.currentTime;
      const dur = 0.1;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, t);
      filter.Q.setValueAtTime(1.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
    } catch (_) {}
  }
};
window.AudioEngine = AudioEngine;
