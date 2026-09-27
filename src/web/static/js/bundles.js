const BundlesController = {
  bundles: [],
  activeBundle: null,
  allLanguages: [],
  activeEntrySourceLang: 'en',

  getFrequency(code) {
    const table = {
      en: '94.6',
      nl: '104.2',
      de: '89.8',
      fr: '98.1',
      es: '102.5',
      it: '91.3',
      pl: '106.7',
      ru: '96.4',
      zh: '107.9',
      ar: '90.2'
    };
    if (table[code]) return table[code];
    let sum = 0;
    for (let i = 0; i < code.length; i++) {
      sum += code.charCodeAt(i) * (i + 1);
    }
    return (88.0 + (sum % 190) * 0.1).toFixed(1);
  },

  async init() {
    await this.loadAllLanguages();
    await this.loadBundles();
    this.bindEvents();
  },

  async loadAllLanguages() {
    try {
      this.allLanguages = await API.getLanguages();
      this.populateModalLanguages();
    } catch (e) {
      console.error(e);
    }
  },

  populateModalLanguages() {
    const container = document.getElementById('new-bundle-languages-container');
    if (!container) return;
    container.innerHTML = '';

    for (const lang of this.allLanguages) {
      const label = document.createElement('label');
      label.className = 'flex items-center gap-2 p-2 bg-[#12141a] border border-[#2B303C] rounded cursor-pointer hover:border-zinc-500 text-xs font-mono-code';
      
      const isChecked = lang.code === 'en' || lang.code === 'nl';
      label.innerHTML = `
        <input type="checkbox" name="bundle_lang" value="${lang.code}" ${isChecked ? 'checked' : ''} class="accent-orange-600 rounded">
        <span>${lang.name} [${lang.code.toUpperCase()}]</span>
      `;
      container.appendChild(label);
    }
  },

  async loadBundles(selectBundleId = null) {
    try {
      this.bundles = await API.getBundles();
      const targetId = selectBundleId || (this.bundles[0] ? this.bundles[0].id : null);

      this.renderCassettes(targetId);
      this.renderBundleSelector(targetId);

      if (targetId) {
        await this.loadBundle(targetId);
      } else {
        this.renderEmptyMatrix();
      }
    } catch (e) {
      console.error(e);
    }
  },

  renderCassettes(activeId) {
    const container = document.getElementById('bundle-cassettes-container');
    if (!container) return;
    container.innerHTML = '';

    if (this.bundles.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-6 text-center text-xs font-mono-code text-zinc-500 border border-dashed border-[#2B303C] rounded-lg">
          [NO MAGNETIC DATA CASSETTES FOUND // INITIALIZE NEW PACK TO COMMENCE RECORDING]
        </div>
      `;
      return;
    }

    this.bundles.forEach((b, idx) => {
      const padIndex = String(idx + 1).padStart(2, '0');
      const isActive = b.id === activeId;
      const pairSummary = b.languages.map(l => l.toUpperCase()).join(' // ');

      const cassette = document.createElement('div');
      cassette.className = `data-cassette p-3 flex flex-col justify-between ${isActive ? 'active' : ''}`;
      cassette.dataset.bundleId = b.id;

      cassette.innerHTML = `
        <div class="cassette-tab cassette-tab-left"></div>
        <div class="cassette-tab cassette-tab-right"></div>

        <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-[#222630] text-[10px] font-mono-code">
          <div class="flex items-center gap-1.5">
            <span class="chassis-screw" style="width: 8px; height: 8px;"></span>
            <span class="text-arc-orange font-bold">[MC-60 // PACK-${padIndex}]</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-zinc-500 font-bold uppercase text-[9px]">${isActive ? 'ACTIVE' : 'STANDBY'}</span>
            <span class="led-indicator ${isActive ? 'led-amber' : 'bg-zinc-700'}"></span>
          </div>
        </div>

        <div class="cassette-label-strip p-2 rounded mb-2.5 flex flex-col gap-0.5">
          <div class="flex items-center justify-between">
            <span class="font-mono-code font-bold text-xs tracking-wider truncate uppercase">${b.name}</span>
            <span class="font-mono-code text-[10px] font-bold text-[#8A3008] flex-shrink-0 ml-2">[${b.item_count} ITEMS]</span>
          </div>
          <div class="flex items-center justify-between text-[10px] font-mono-code text-zinc-700">
            <span class="font-bold tracking-widest truncate">${pairSummary}</span>
            <span class="text-[9px] uppercase tracking-wider flex-shrink-0 ml-2">TYPE-I</span>
          </div>
        </div>

        <div class="cassette-window h-11 p-1.5 flex items-center justify-around relative">
          <div class="cassette-tape-spool left-4 right-4"></div>
          <div class="cassette-reel ${isActive ? 'cassette-reel-active' : ''} z-10">
            <div class="cassette-reel-teeth"></div>
            <div class="cassette-reel-hub"></div>
          </div>
          <div class="z-10 flex flex-col items-center">
            <span class="text-[9px] font-mono-code text-zinc-500 font-bold tracking-widest">SIDE A</span>
            <span class="text-[8px] font-mono-code text-zinc-600">4.75 CM/S</span>
          </div>
          <div class="cassette-reel ${isActive ? 'cassette-reel-active' : ''} z-10">
            <div class="cassette-reel-teeth"></div>
            <div class="cassette-reel-hub"></div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 mt-2 border-t border-[#1C1F27] text-[9px] font-mono-code text-zinc-500">
          <span>SERIAL // SP-${padIndex}-${b.id.slice(0, 4)}</span>
          <span class="chassis-screw" style="width: 8px; height: 8px;"></span>
        </div>
      `;

      cassette.addEventListener('click', async () => {
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        await this.loadBundle(b.id);
        this.renderBundleSelector(b.id);
        this.renderCassettes(b.id);
      });

      container.appendChild(cassette);
    });
  },

  renderBundleSelector(activeId) {
    const btn = document.getElementById('btn-bundle-active');
    const popover = document.getElementById('bundle-select-popover');
    if (!btn || !popover) return;

    if (this.bundles.length === 0) {
      btn.innerHTML = `
        <div class="flex items-center gap-2 text-zinc-500">
          <span class="led-indicator bg-zinc-700"></span>
          <span>[NO BUNDLES INITIALIZED]</span>
        </div>
        <span class="text-zinc-600 text-[10px]">▾</span>
      `;
      popover.innerHTML = '';
      return;
    }

    const current = this.bundles.find(b => b.id === activeId) || this.bundles[0];
    const currentIndex = this.bundles.indexOf(current) + 1;
    const padIndex = String(currentIndex).padStart(2, '0');
    const langSummary = current.languages.length <= 3 
      ? `(${current.languages.join('/')})` 
      : `(${current.languages.slice(0, 2).join('/')}/+${current.languages.length - 2})`;

    btn.innerHTML = `
      <div class="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
        <span class="led-indicator led-orange flex-shrink-0"></span>
        <span class="text-arc-orange font-mono-code font-bold tracking-wider flex-shrink-0">[ PACK-${padIndex} ]</span>
        <span class="text-zinc-200 font-mono-code font-bold truncate">${current.name.toUpperCase()}</span>
        <span class="text-[10px] font-mono-code text-zinc-500 flex-shrink-0">${langSummary}</span>
      </div>
      <div class="flex items-center gap-1.5 text-[10px] font-mono-code text-zinc-400 flex-shrink-0 ml-2">
        <span class="text-zinc-400">[SELECT]</span>
        <span>▾</span>
      </div>
    `;

    popover.innerHTML = '';
    this.bundles.forEach((b, idx) => {
      const pIndex = String(idx + 1).padStart(2, '0');
      const isActive = b.id === current.id;
      const bSummary = b.languages.length <= 4 
        ? `(${b.languages.join('/')})` 
        : `(${b.languages.slice(0, 3).join('/')}/+${b.languages.length - 3})`;
      const item = document.createElement('div');
      item.className = `frequency-item p-2 rounded border border-[#2B303C] flex items-center justify-between text-xs font-mono-code mb-1 ${isActive ? 'active' : 'bg-[#0E0F12] text-zinc-300'}`;
      item.innerHTML = `
        <div class="flex items-center gap-2 truncate min-w-0">
          <span class="font-bold text-arc-orange flex-shrink-0">[ PACK-${pIndex} ]</span>
          <span class="font-bold truncate">${b.name.toUpperCase()}</span>
          <span class="text-[10px] text-zinc-500 flex-shrink-0">${bSummary}</span>
          <span class="text-[10px] text-zinc-400 ml-1 flex-shrink-0">[${b.item_count} ITEMS]</span>
        </div>
        <span class="led-indicator ${isActive ? 'led-orange' : 'bg-zinc-700'} flex-shrink-0 ml-2"></span>
      `;

      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        popover.classList.add('hidden');
        await this.loadBundle(b.id);
        this.renderBundleSelector(b.id);
        this.renderCassettes(b.id);
      });

      popover.appendChild(item);
    });
  },

  async loadBundle(id) {
    if (!id) return;
    try {
      this.activeBundle = await API.getBundle(id);
      if (this.activeBundle && this.activeBundle.languages.length > 0) {
        if (!this.activeBundle.languages.includes(this.activeEntrySourceLang)) {
          this.activeEntrySourceLang = this.activeBundle.languages[0];
        }
      }
      this.renderMatrix();
      this.populateEntrySourceLangs();
    } catch (e) {
      console.error(e);
    }
  },

  populateEntrySourceLangs() {
    const btn = document.getElementById('btn-entry-lang-active');
    const popover = document.getElementById('entry-lang-popover');
    if (!btn || !popover) return;

    if (!this.activeBundle || !this.activeBundle.languages || this.activeBundle.languages.length === 0) {
      btn.innerHTML = `
        <div class="flex items-center gap-1.5 text-zinc-500">
          <span class="led-indicator bg-zinc-700"></span>
          <span>[NO FREQ]</span>
        </div>
        <span class="text-zinc-600 text-[10px]">▾</span>
      `;
      popover.innerHTML = '';
      return;
    }

    const currentLang = this.activeEntrySourceLang;
    const currentMhz = this.getFrequency(currentLang);
    const currentLangObj = this.allLanguages.find(l => l.code === currentLang);
    const currentLabel = currentLangObj ? `${currentLangObj.name.toUpperCase()} // ${currentLang.toUpperCase()}` : currentLang.toUpperCase();

    btn.innerHTML = `
      <div class="flex items-center gap-2 truncate min-w-0">
        <span class="led-indicator led-amber flex-shrink-0"></span>
        <span class="text-arc-amber font-mono-code font-bold tracking-wider flex-shrink-0">[ ${currentMhz} MHz ]</span>
        <span class="text-zinc-200 font-mono-code font-bold truncate">${currentLabel}</span>
      </div>
      <div class="flex items-center gap-1 text-[10px] font-mono-code text-zinc-400 ml-1 flex-shrink-0">
        <span class="hidden sm:inline">[TUNE]</span>
        <span>▾</span>
      </div>
    `;

    popover.innerHTML = '';
    for (const lang of this.activeBundle.languages) {
      const mhz = this.getFrequency(lang);
      const isActive = lang === currentLang;
      const langObj = this.allLanguages.find(l => l.code === lang);
      const label = langObj ? `${langObj.name.toUpperCase()} ${lang.toUpperCase()}` : lang.toUpperCase();
      const item = document.createElement('div');
      item.className = `frequency-item p-2 rounded border border-[#2B303C] flex items-center justify-between text-xs font-mono-code mb-1 ${isActive ? 'active' : 'bg-[#0E0F12] text-zinc-300'}`;
      item.innerHTML = `
        <div class="flex items-center gap-2 truncate">
          <span class="font-bold text-arc-amber">[ ${mhz} MHz ]</span>
          <span class="truncate">${label}</span>
        </div>
        <span class="led-indicator ${isActive ? 'led-amber' : 'bg-zinc-700'} flex-shrink-0 ml-2"></span>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        this.activeEntrySourceLang = lang;
        popover.classList.add('hidden');
        this.populateEntrySourceLangs();
      });

      popover.appendChild(item);
    }
  },

  renderEmptyMatrix() {
    const container = document.getElementById('bundle-matrix-container');
    if (!container) return;
    container.innerHTML = `
      <div class="p-8 text-center text-xs font-mono-code text-zinc-500">
        [NO VOCABULARY PACK DETECTED // INITIALIZE NEW PACK TO COMMENCE CIPHER ARCHIVE]
      </div>
    `;
  },

  renderMatrix() {
    const container = document.getElementById('bundle-matrix-container');
    if (!container || !this.activeBundle) return;

    const langs = this.activeBundle.languages;
    const entries = this.activeBundle.entries || [];

    let ths = langs.map(l => {
      const mhz = this.getFrequency(l);
      return `
        <th class="px-3 py-2 text-left text-xs font-bold text-arc-amber font-mono-code tracking-wider border-b border-[#2B303C]">
          <div class="flex items-center gap-1.5">
            <span class="text-zinc-400 text-[10px]">[${mhz} MHz]</span>
            <span>${l.toUpperCase()}</span>
          </div>
        </th>
      `;
    }).join('');
    ths += `<th class="px-3 py-2 text-right text-xs font-bold text-zinc-500 font-mono-code tracking-wider border-b border-[#2B303C]">ACTION</th>`;

    let rowsHtml = '';
    if (entries.length === 0) {
      rowsHtml = `
        <tr>
          <td colspan="${langs.length + 1}" class="px-4 py-8 text-center text-xs font-mono-code text-zinc-500">
            [EMPTY ARCHIVE MATRIX // ADD PHRASE BELOW TO ENCODE]
          </td>
        </tr>
      `;
    } else {
      for (const entry of entries) {
        let tds = langs.map(l => {
          const val = entry.translations[l] || '<span class="text-zinc-600 font-mono-code text-[11px]">—</span>';
          return `<td class="px-3 py-2 text-xs font-mono-code text-zinc-200 border-b border-[#1A1C23]">${val}</td>`;
        }).join('');

        tds += `
          <td class="px-3 py-2 text-right border-b border-[#1A1C23]">
            <button type="button" class="del-entry-btn tactile-btn px-2 py-0.5 text-[10px] text-red-400 hover:text-red-300 rounded" data-entry-id="${entry.id}">
              PURGE
            </button>
          </td>
        `;

        rowsHtml += `<tr class="hover:bg-[#12141a] transition">${tds}</tr>`;
      }
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-[#14171b]">
              ${ths}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.del-entry-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        const entryId = btn.dataset.entryId;
        if (!confirm('CONFIRM DELETION OF ENCODED ENTRY?')) return;
        try {
          await API.deleteBundleEntry(this.activeBundle.id, entryId);
          await this.loadBundle(this.activeBundle.id);
          await this.loadBundles(this.activeBundle.id);
        } catch (e) {
          alert(`PURGE FAILED: ${e.message}`);
        }
      });
    });
  },

  bindEvents() {
    const btnBundleActive = document.getElementById('btn-bundle-active');
    const bundlePopover = document.getElementById('bundle-select-popover');

    if (btnBundleActive && bundlePopover) {
      btnBundleActive.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        bundlePopover.classList.toggle('hidden');
      });
    }

    const btnEntryLangActive = document.getElementById('btn-entry-lang-active');
    const entryLangPopover = document.getElementById('entry-lang-popover');

    if (btnEntryLangActive && entryLangPopover) {
      btnEntryLangActive.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        entryLangPopover.classList.toggle('hidden');
      });
    }

    document.addEventListener('click', (e) => {
      if (bundlePopover && !bundlePopover.contains(e.target) && btnBundleActive && !btnBundleActive.contains(e.target)) {
        bundlePopover.classList.add('hidden');
      }
      if (entryLangPopover && !entryLangPopover.contains(e.target) && btnEntryLangActive && !btnEntryLangActive.contains(e.target)) {
        entryLangPopover.classList.add('hidden');
      }
    });

    const openModalBtn = document.getElementById('btn-new-bundle');
    const modal = document.getElementById('new-bundle-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');

    if (openModalBtn && modal) {
      openModalBtn.addEventListener('click', () => {
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        modal.classList.remove('hidden');
      });
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener('click', () => {
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        modal.classList.add('hidden');
      });
    }

    const form = document.getElementById('new-bundle-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        const nameInput = document.getElementById('new-bundle-name');
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) return;

        const checkedLangs = Array.from(form.querySelectorAll('input[name="bundle_lang"]:checked')).map(cb => cb.value);
        if (checkedLangs.length < 2) {
          alert('A MINIMUM OF 2 CIPHER FREQUENCIES MUST BE SELECTED');
          return;
        }

        try {
          const created = await API.createBundle(name, checkedLangs);
          if (modal) modal.classList.add('hidden');
          form.reset();
          await this.loadBundles(created.id);
        } catch (err) {
          alert(`CREATION FAILED: ${err.message}`);
        }
      });
    }

    const addEntryForm = document.getElementById('add-entry-form');
    if (addEntryForm) {
      addEntryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.activeBundle) return;
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);

        const input = document.getElementById('entry-text-input');
        const statusEl = document.getElementById('entry-submit-status');
        const submitBtn = document.getElementById('btn-add-entry');

        const text = input ? input.value.trim() : '';
        const sourceLang = this.activeEntrySourceLang;

        if (!text) return;

        if (statusEl) {
          statusEl.textContent = 'DECRYPTING & DISTRIBUTING...';
          statusEl.classList.remove('hidden');
        }
        if (submitBtn) submitBtn.disabled = true;

        try {
          await API.addBundleEntry(this.activeBundle.id, sourceLang, text);
          if (input) input.value = '';
          await this.loadBundle(this.activeBundle.id);
          await this.loadBundles(this.activeBundle.id);
          if (statusEl) {
            statusEl.textContent = 'ENTRY ENCODED';
            setTimeout(() => {
              statusEl.classList.add('hidden');
            }, 1500);
          }
        } catch (err) {
          if (statusEl) statusEl.textContent = `ERR: ${err.message}`;
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  },
};
