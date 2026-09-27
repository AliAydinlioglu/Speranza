const Oscilloscope = {
  canvas: null,
  ctx: null,
  state: 'idle',
  time: 0,
  width: 300,
  height: 48,
  typingTimer: null,
  animId: null,

  init(canvasId = 'carrier-oscilloscope') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.render();
  },

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width > 0 ? Math.floor(rect.width) : 320;
    this.height = rect.height > 0 ? Math.floor(rect.height) : 48;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  },

  setState(newState) {
    this.state = newState;
  },

  triggerTyping() {
    if (this.state === 'processing' || this.state === 'corrupted') return;
    this.state = 'typing';
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    this.typingTimer = setTimeout(() => {
      if (this.state === 'typing') {
        this.state = 'idle';
      }
    }, 650);
  },

  render() {
    if (!this.canvas || !this.ctx) return;

    this.ctx.fillStyle = 'rgba(7, 11, 8, 0.2)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const midY = this.height / 2;
    const isCorrupted = this.state === 'corrupted';

    this.ctx.save();
    this.ctx.strokeStyle = isCorrupted ? '#FF003C' : '#33FF77';
    this.ctx.shadowColor = isCorrupted ? '#FF003C' : '#33FF77';
    this.ctx.shadowBlur = isCorrupted ? 8 : 6;
    this.ctx.lineWidth = isCorrupted ? 2 : 1.5;

    this.ctx.beginPath();

    const step = 2;
    for (let x = 0; x <= this.width; x += step) {
      let y = midY;

      if (this.state === 'idle') {
        const primary = Math.sin((x * 0.035) + (this.time * 2.4)) * 3.5;
        const drift = Math.sin((x * 0.012) - (this.time * 1.1)) * 2;
        const jitter = (Math.random() - 0.5) * 1.2;
        y = midY + primary + drift + jitter;
      } else if (this.state === 'typing') {
        const h1 = Math.sin((x * 0.055) + (this.time * 7.5)) * 9;
        const h2 = Math.cos((x * 0.11) - (this.time * 11.0)) * 5;
        const h3 = Math.sin((x * 0.02) + (this.time * 3.2)) * 3;
        const jitter = (Math.random() - 0.5) * 2.5;
        y = midY + h1 + h2 + h3 + jitter;
      } else if (this.state === 'processing') {
        const sweepFreq = 0.10 + 0.06 * Math.sin(this.time * 4.5);
        const carrier = Math.sin((x * sweepFreq) + (this.time * 22.0)) * 13;
        const sub = Math.sin((x * 0.035) + (this.time * 8.0)) * 4;
        const jitter = (Math.random() - 0.5) * 1.8;
        y = midY + carrier + sub + jitter;
      } else if (this.state === 'corrupted') {
        const block = Math.floor(x / 16);
        const pseudo = Math.sin((block * 123.45) + (this.time * 30.0));
        const square = pseudo > 0.35 ? 1 : (pseudo < -0.35 ? -1 : 0);
        const spike = square * (this.height * 0.38);
        const glitchNoise = (Math.random() - 0.5) * 12;
        y = midY + spike + glitchNoise;
      }

      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();

    if (isCorrupted) {
      const clipCount = 2 + Math.floor(Math.random() * 3);
      this.ctx.strokeStyle = 'rgba(255, 0, 60, 0.7)';
      this.ctx.lineWidth = 1;
      for (let i = 0; i < clipCount; i++) {
        const rx = Math.floor(Math.random() * this.width);
        this.ctx.beginPath();
        this.ctx.moveTo(rx, 0);
        this.ctx.lineTo(rx, this.height);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();

    this.time += 0.016;
    this.animId = requestAnimationFrame(() => this.render());
  }
};
window.Oscilloscope = Oscilloscope;
