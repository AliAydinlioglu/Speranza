const TranslateController = {
  debounceTimer: null,
  selectedTargetLangs: new Set(['nl']),
  selectedSourceLang: 'en',
  languages: [],

  async init() {
    await this.loadLanguages();
    this.bindEvents();
    this.renderFrequencySelector();
    this.renderTargetSelectors();
    this.triggerTranslation();
  },

  async loadLanguages() {
    try {
      this.languages = await API.getLanguages();
    } catch (e) {
      console.error(e);
    }
  },

  renderFrequencySelector() {
    const displayBtn = document.getElementById('btn-freq-active');
    const popover = document.getElementById('frequency-tuner-popover');
    if (!displayBtn || !popover) return;

    const currentLang = this.languages.find(l => l.code === this.selectedSourceLang) || {
      code: this.selectedSourceLang,
      name: this.selectedSourceLang.toUpperCase()
    };

    displayBtn.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="led-indicator led-amber"></span>
        <span class="text-[#EDE8D0] font-mono-code font-bold tracking-wider">${currentLang.name.toUpperCase()}</span>
        <span class="text-[11px] text-zinc-400 font-mono-code font-bold">[${currentLang.code.toUpperCase()}]</span>
      </div>
      <div class="flex items-center gap-1.5 text-[10px] font-mono-code text-zinc-400">
        <span class="text-zinc-400">CHANGE</span>
        <span>▾</span>
      </div>
    `;

    const sorted = [...this.languages].sort((a, b) => a.name.localeCompare(b.name));
    popover.innerHTML = '';

    for (const lang of sorted) {
      const isActive = lang.code === this.selectedSourceLang;
      const item = document.createElement('div');
      item.className = `frequency-item p-2 rounded border border-[#2D313D] flex items-center justify-between text-xs font-mono-code mb-1 ${isActive ? 'active' : 'bg-[#0E0F12] text-zinc-300'}`;
      item.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="font-bold text-[#EDE8D0]">${lang.name.toUpperCase()}</span>
          <span class="text-[10px] text-zinc-400 font-bold">[${lang.code.toUpperCase()}]</span>
        </div>
        <span class="led-indicator ${isActive ? 'led-orange' : 'bg-zinc-700'}"></span>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        this.selectedSourceLang = lang.code;
        popover.classList.add('hidden');
        this.renderFrequencySelector();
        this.triggerTranslation();
      });

      popover.appendChild(item);
    }
  },

  renderTargetSelectors() {
    const container = document.getElementById('target-chips-container');
    if (!container) return;
    container.innerHTML = '';

    const sortedLanguages = [...this.languages].sort((a, b) => a.name.localeCompare(b.name));

    for (const lang of sortedLanguages) {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = this.selectedTargetLangs.has(lang.code);
      btn.className = `tactile-chip px-2.5 py-1 text-xs font-mono-code font-bold uppercase rounded cursor-pointer transition ${isActive ? 'active' : ''}`;
      btn.dataset.code = lang.code;
      btn.innerHTML = `${lang.name} <span class="text-[10px] opacity-75">${lang.code}</span>`;

      btn.addEventListener('click', () => {
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        if (this.selectedTargetLangs.has(lang.code)) {
          if (this.selectedTargetLangs.size > 1) {
            this.selectedTargetLangs.delete(lang.code);
            btn.classList.remove('active');
          }
        } else {
          this.selectedTargetLangs.add(lang.code);
          btn.classList.add('active');
        }
        this.triggerTranslation();
      });

      container.appendChild(btn);
    }
  },

  bindEvents() {
    const input = document.getElementById('carrier-input');
    const execBtn = document.getElementById('btn-decrypt-synthesize');
    const freqDisplayBtn = document.getElementById('btn-freq-active');
    const popover = document.getElementById('frequency-tuner-popover');

    if (input) {
      input.addEventListener('input', (e) => {
        const count = document.getElementById('carrier-char-count');
        if (count) count.textContent = `${e.target.value.length} CHARS`;
        if (window.Oscilloscope) {
          Oscilloscope.triggerTyping();
        }
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.triggerTranslation();
        }, 400);
      });
    }

    if (execBtn) {
      execBtn.addEventListener('click', () => {
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        this.triggerTranslation(true);
      });
    }

    if (freqDisplayBtn && popover) {
      freqDisplayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        popover.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!popover.contains(e.target) && !freqDisplayBtn.contains(e.target)) {
          popover.classList.add('hidden');
        }
      });
    }
  },

  async triggerTranslation(immediate = false) {
    const input = document.getElementById('carrier-input');
    if (!input) return;
    const text = input.value.trim();
    const container = document.getElementById('outputs-container');
    const statusText = document.getElementById('synthesis-status');

    if (!text) {
      if (container) {
        container.innerHTML = `
          <div class="p-6 text-center text-xs font-mono-code text-zinc-500">
            Translations will appear here
          </div>
        `;
      }
      if (statusText) statusText.textContent = 'STANDBY';
      if (window.Oscilloscope) Oscilloscope.setState('idle');
      return;
    }

    const targets = Array.from(this.selectedTargetLangs);
    if (targets.length === 0) return;

    if (statusText) {
      statusText.textContent = 'TRANSLATING...';
      statusText.classList.add('text-arc-orange');
    }
    if (container) {
      container.classList.add('crt-distort-active');
    }

    if (window.AudioEngine) {
      AudioEngine.startCarrierSquelch();
    }
    if (window.Oscilloscope) {
      Oscilloscope.setState('processing');
    }

    try {
      const res = await API.translate(text, this.selectedSourceLang, targets);
      if (window.AudioEngine) {
        AudioEngine.stopCarrierSquelch();
        AudioEngine.playPayloadChime();
      }
      if (window.Oscilloscope) {
        Oscilloscope.setState('idle');
      }
      this.renderOutputs(res.translations);
      if (statusText) {
        statusText.textContent = '[OUTPUT]';
        statusText.classList.remove('text-arc-orange');
      }
    } catch (err) {
      if (window.AudioEngine) {
        AudioEngine.stopCarrierSquelch();
        AudioEngine.playGlitchStatic();
      }
      if (window.Oscilloscope) {
        Oscilloscope.setState('corrupted');
      }

      const viewports = document.querySelectorAll('.crt-viewport');
      viewports.forEach(vp => vp.classList.add('signal-corrupted'));
      setTimeout(() => {
        viewports.forEach(vp => vp.classList.remove('signal-corrupted'));
        if (window.Oscilloscope && Oscilloscope.state === 'corrupted') {
          Oscilloscope.setState('idle');
        }
      }, 1800);

      if (statusText) {
        statusText.textContent = 'ERROR';
        statusText.classList.add('text-arc-orange');
      }
      if (container) {
        container.innerHTML = `
          <div class="p-4 text-xs font-mono-code text-red-500 border border-red-900 bg-red-950/30">
            <div class="font-bold tracking-wider">[TRANSLATION ERROR]</div>
            <div class="mt-1 text-[11px] text-red-400/80">${err.message || 'Translation failed'}</div>
          </div>
        `;
      }
    } finally {
      if (container) {
        container.classList.remove('crt-distort-active');
      }
    }
  },

  renderOutputs(translations) {
    const container = document.getElementById('outputs-container');
    if (!container) return;
    container.innerHTML = '';

    const langMap = {};
    for (const l of this.languages) {
      langMap[l.code] = l.name;
    }

    for (const [code, text] of Object.entries(translations)) {
      const card = document.createElement('div');
      card.className = 'crt-viewport p-4 mb-3 border border-zinc-800 rounded bg-[#070B08]';
      const langName = langMap[code] || code.toUpperCase();

      card.innerHTML = `
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] font-mono-code">
          <div class="flex items-center gap-2">
            <span class="led-indicator led-green"></span>
            <span class="text-zinc-200 font-bold tracking-wide">${langName.toUpperCase()}</span>
            <span class="text-[10px] text-zinc-400 font-bold">[${code.toUpperCase()}]</span>
          </div>
          <button type="button" class="copy-btn tactile-btn px-2.5 py-1 text-[11px] font-bold text-zinc-300 rounded hover:text-white" data-text="${encodeURIComponent(text)}">
            COPY
          </button>
        </div>
        <div class="crt-content text-sm leading-relaxed font-mono-code select-all break-words">${text}</div>
      `;

      const copyBtn = card.querySelector('.copy-btn');
      copyBtn.addEventListener('click', async () => {
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        try {
          await navigator.clipboard.writeText(decodeURIComponent(copyBtn.dataset.text));
          copyBtn.textContent = 'COPIED!';
          copyBtn.classList.add('text-crt-green');
          setTimeout(() => {
            copyBtn.textContent = 'COPY';
            copyBtn.classList.remove('text-crt-green');
          }, 1500);
        } catch (_) {}
      });

      container.appendChild(card);
    }
  },
};
window.TranslateController = TranslateController;
