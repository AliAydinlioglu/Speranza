const ThemedModal = {
  dialog: null,
  titleEl: null,
  messageEl: null,
  confirmBtn: null,
  cancelBtn: null,
  closeBtn: null,
  resolvePromise: null,

  init() {
    this.dialog = document.getElementById('themed-modal');
    this.titleEl = document.getElementById('themed-modal-title');
    this.messageEl = document.getElementById('themed-modal-message');
    this.confirmBtn = document.getElementById('themed-modal-confirm');
    this.cancelBtn = document.getElementById('themed-modal-cancel');
    this.closeBtn = document.getElementById('themed-modal-x');

    if (this.confirmBtn && !this.confirmBtn._bound) {
      this.confirmBtn._bound = true;
      this.confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        this.close(true);
      });
    }

    if (this.cancelBtn && !this.cancelBtn._bound) {
      this.cancelBtn._bound = true;
      this.cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(false);
        this.close(false);
      });
    }

    if (this.closeBtn && !this.closeBtn._bound) {
      this.closeBtn._bound = true;
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(false);
        this.close(false);
      });
    }

    if (this.dialog && !this.dialog._bound) {
      this.dialog._bound = true;
      this.dialog.addEventListener('click', (e) => {
        if (e.target === this.dialog) {
          if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(false);
          this.close(false);
        }
      });
    }

    if (!window._themedModalEscBound) {
      window._themedModalEscBound = true;
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.dialog && !this.dialog.classList.contains('hidden')) {
          if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(false);
          this.close(false);
        }
      });
    }
  },

  confirm(message, title = 'CONFIRM ACTION', options = {}) {
    this.init();
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      if (this.titleEl) this.titleEl.textContent = title;
      if (this.messageEl) this.messageEl.textContent = message;
      if (this.confirmBtn) {
        this.confirmBtn.textContent = options.confirmText || 'CONFIRM';
        if (options.isDanger) {
          this.confirmBtn.className = 'tactile-btn px-5 py-2 text-xs font-mono-code font-bold tracking-wider rounded text-[#FF003C] border border-[#FF003C]/60 hover:bg-[#FF003C]/20 cursor-pointer';
        } else {
          this.confirmBtn.className = 'tactile-btn px-5 py-2 text-xs font-mono-code font-bold tracking-wider rounded text-[#FF4D00] border border-[#FF4D00]/60 hover:bg-[#FF4D00]/20 cursor-pointer';
        }
      }
      if (this.cancelBtn) {
        this.cancelBtn.classList.remove('hidden');
        this.cancelBtn.textContent = options.cancelText || 'CANCEL';
      }
      if (this.dialog) {
        this.dialog.classList.remove('hidden');
        this.dialog.classList.add('flex');
      }
    });
  },

  alert(message, title = 'SYSTEM NOTICE') {
    this.init();
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      if (this.titleEl) this.titleEl.textContent = title;
      if (this.messageEl) this.messageEl.textContent = message;
      if (this.confirmBtn) {
        this.confirmBtn.textContent = 'OK';
        this.confirmBtn.className = 'tactile-btn px-5 py-2 text-xs font-mono-code font-bold tracking-wider rounded text-[#EDE8D0] border border-[#2B303C] hover:border-zinc-400 cursor-pointer';
      }
      if (this.cancelBtn) {
        this.cancelBtn.classList.add('hidden');
      }
      if (this.dialog) {
        this.dialog.classList.remove('hidden');
        this.dialog.classList.add('flex');
      }
    });
  },

  close(result) {
    if (this.dialog) {
      this.dialog.classList.add('hidden');
      this.dialog.classList.remove('flex');
    }
    if (this.resolvePromise) {
      const res = this.resolvePromise;
      this.resolvePromise = null;
      res(result);
    }
  }
};
window.ThemedModal = ThemedModal;

const BundlesController = {
  bundles: [],
  activeBundle: null,
  allLanguages: [],
  activeEntrySourceLang: 'en',

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

    const sortedLangs = [...this.allLanguages].sort((a, b) => a.name.localeCompare(b.name));

    for (const lang of sortedLangs) {
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
      let targetId = selectBundleId;
      if (!targetId || !this.bundles.some(b => b.id === targetId)) {
        targetId = this.bundles[0] ? this.bundles[0].id : null;
      }

      this.renderCassettes(targetId);
      this.renderBundleSelector(targetId);

      if (targetId) {
        await this.loadBundle(targetId);
      } else {
        this.activeBundle = null;
        this.renderEmptyMatrix();
        this.populateEntrySourceLangs();
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
          No vocabulary packs found. Create a new pack to get started.
        </div>
      `;
      return;
    }

    this.bundles.forEach((b, idx) => {
      const padIndex = String(idx + 1).padStart(2, '0');
      const isActive = b.id === activeId;
      const pairSummary = b.languages.map(l => l.toUpperCase()).join(' • ');

      const cassette = document.createElement('div');
      cassette.className = `data-cassette p-3 flex flex-col justify-between ${isActive ? 'active' : ''}`;
      cassette.dataset.bundleId = b.id;

      cassette.innerHTML = `
        <div class="cassette-tab cassette-tab-left"></div>
        <div class="cassette-tab cassette-tab-right"></div>

        <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-[#222630] text-[10px] font-mono-code">
          <div class="flex items-center gap-1.5">
            <span class="chassis-screw" style="width: 8px; height: 8px;"></span>
            <span class="text-arc-orange font-bold">[PACK ${padIndex}]</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-zinc-500 font-bold uppercase text-[9px]">${isActive ? 'SELECTED' : 'SELECT'}</span>
            <span class="led-indicator ${isActive ? 'led-amber' : 'bg-zinc-700'}"></span>
          </div>
        </div>

        <div class="cassette-label-strip p-2 rounded mb-2.5 flex flex-col gap-0.5">
          <div class="flex items-center justify-between">
            <span class="font-mono-code font-bold text-xs tracking-wider truncate uppercase">${b.name}</span>
            <span class="font-mono-code text-[10px] font-bold text-[#8A3008] flex-shrink-0 ml-2">[${b.item_count} WORDS]</span>
          </div>
          <div class="flex items-center justify-between text-[10px] font-mono-code text-zinc-700">
            <span class="font-bold tracking-widest truncate">${pairSummary}</span>
            <span class="text-[9px] uppercase tracking-wider flex-shrink-0 ml-2">VOCAB</span>
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
          <span>PACK-${padIndex}</span>
          <button type="button" class="del-cassette-btn text-[9px] font-mono-code text-zinc-400 hover:text-[#FF003C] transition px-1.5 py-0.5 rounded border border-[#2B303C] hover:border-[#FF003C]/60 flex items-center gap-1 cursor-pointer" data-bundle-id="${b.id}" title="Delete pack">
            <span>[DELETE PACK]</span>
          </button>
        </div>
      `;

      cassette.addEventListener('click', async (e) => {
        if (e.target.closest('.del-cassette-btn')) return;
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        await this.loadBundle(b.id);
        this.renderBundleSelector(b.id);
        this.renderCassettes(b.id);
      });

      const delBtn = cassette.querySelector('.del-cassette-btn');
      if (delBtn) {
        delBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
          const ok = await ThemedModal.confirm(
            `Permanently delete vocabulary pack "${b.name}" and all its saved words?`,
            'DELETE VOCABULARY PACK',
            { isDanger: true, confirmText: 'DELETE PACK' }
          );
          if (!ok) return;

          try {
            await API.deleteBundle(b.id);
            const remaining = this.bundles.filter(item => item.id !== b.id);
            const nextId = remaining.length > 0 ? remaining[0].id : null;
            await this.loadBundles(nextId);
          } catch (err) {
            await ThemedModal.alert(`Failed to delete pack: ${err.message}`, 'DELETE ERROR');
          }
        });
      }

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
          <span>No packs created</span>
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
        <span class="text-zinc-200 font-mono-code font-bold truncate">${current.name}</span>
        <span class="text-[10px] font-mono-code text-zinc-400 flex-shrink-0">${langSummary}</span>
      </div>
      <div class="flex items-center gap-1.5 text-[10px] font-mono-code text-zinc-400 flex-shrink-0 ml-2">
        <span class="text-zinc-400">SELECT</span>
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
          <span class="font-bold truncate text-[#EDE8D0]">${b.name}</span>
          <span class="text-[10px] text-zinc-400 flex-shrink-0">${bSummary}</span>
          <span class="text-[10px] text-zinc-500 ml-1 flex-shrink-0">[${b.item_count} words]</span>
        </div>
        <span class="led-indicator ${isActive ? 'led-orange' : 'bg-zinc-700'} flex-shrink-0 ml-2"></span>
      `;

      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
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
          <span>[NO LANG]</span>
        </div>
        <span class="text-zinc-600 text-[10px]">▾</span>
      `;
      popover.innerHTML = '';
      return;
    }

    const currentLang = this.activeEntrySourceLang;
    const currentLangObj = this.allLanguages.find(l => l.code === currentLang);
    const currentLabel = currentLangObj ? `${currentLangObj.name.toUpperCase()} [${currentLang.toUpperCase()}]` : currentLang.toUpperCase();

    btn.innerHTML = `
      <div class="flex items-center gap-2 truncate min-w-0">
        <span class="led-indicator led-amber flex-shrink-0"></span>
        <span class="text-[#EDE8D0] font-mono-code font-bold truncate">${currentLabel}</span>
      </div>
      <div class="flex items-center gap-1 text-[10px] font-mono-code text-zinc-400 ml-1 flex-shrink-0">
        <span class="hidden sm:inline">CHANGE</span>
        <span>▾</span>
      </div>
    `;

    popover.innerHTML = '';
    for (const lang of this.activeBundle.languages) {
      const isActive = lang === currentLang;
      const langObj = this.allLanguages.find(l => l.code === lang);
      const label = langObj ? `${langObj.name.toUpperCase()}` : lang.toUpperCase();
      const item = document.createElement('div');
      item.className = `frequency-item p-2 rounded border border-[#2B303C] flex items-center justify-between text-xs font-mono-code mb-1 ${isActive ? 'active' : 'bg-[#0E0F12] text-zinc-300'}`;
      item.innerHTML = `
        <div class="flex items-center gap-2 truncate">
          <span class="font-bold text-[#EDE8D0]">${label}</span>
          <span class="text-[10px] text-zinc-400 font-bold">[${lang.toUpperCase()}]</span>
        </div>
        <span class="led-indicator ${isActive ? 'led-amber' : 'bg-zinc-700'} flex-shrink-0 ml-2"></span>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
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
        No vocabulary pack selected. Select or create a pack above.
      </div>
    `;
  },

  renderMatrix() {
    const container = document.getElementById('bundle-matrix-container');
    if (!container || !this.activeBundle) return;

    const langs = this.activeBundle.languages;
    const entries = this.activeBundle.entries || [];

    let ths = langs.map(l => {
      const langObj = this.allLanguages.find(lang => lang.code === l);
      const name = langObj ? langObj.name : l.toUpperCase();
      return `
        <th class="px-3 py-2 text-left text-xs font-bold text-zinc-200 font-mono-code tracking-wider border-b border-[#2B303C]">
          <div class="flex items-center gap-1.5">
            <span>${name}</span>
            <span class="text-zinc-400 text-[10px]">[${l.toUpperCase()}]</span>
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
            This pack has no entries yet. Enter a word or phrase below to translate.
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
            <button type="button" class="del-entry-btn tactile-btn px-2.5 py-1 text-[11px] font-bold text-red-400 hover:text-red-300 rounded cursor-pointer" data-entry-id="${entry.id}">
              DELETE
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
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        const entryId = btn.dataset.entryId;
        if (!this.activeBundle || !this.activeBundle.id) return;
        const ok = await ThemedModal.confirm(
          'Delete this word from the pack?',
          'DELETE ENTRY',
          { isDanger: true, confirmText: 'DELETE' }
        );
        if (!ok) return;

        try {
          await API.deleteBundleEntry(this.activeBundle.id, entryId);
          await this.loadBundle(this.activeBundle.id);
          await this.loadBundles(this.activeBundle.id);
        } catch (e) {
          await ThemedModal.alert(`Delete failed: ${e.message}`, 'ERROR');
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
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        bundlePopover.classList.toggle('hidden');
      });
    }

    const btnEntryLangActive = document.getElementById('btn-entry-lang-active');
    const entryLangPopover = document.getElementById('entry-lang-popover');

    if (btnEntryLangActive && entryLangPopover) {
      btnEntryLangActive.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
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
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        modal.classList.remove('hidden');
      });
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener('click', () => {
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(false);
        modal.classList.add('hidden');
      });
    }

    const form = document.getElementById('new-bundle-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        const nameInput = document.getElementById('new-bundle-name');
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) return;

        const checkedLangs = Array.from(form.querySelectorAll('input[name="bundle_lang"]:checked')).map(cb => cb.value);
        if (checkedLangs.length < 2) {
          await ThemedModal.alert('Please select at least 2 languages.', 'VALIDATION NOTICE');
          return;
        }

        try {
          const created = await API.createBundle(name, checkedLangs);
          if (modal) modal.classList.add('hidden');
          form.reset();
          await this.loadBundles(created.id);
        } catch (err) {
          await ThemedModal.alert(`Failed to create pack: ${err.message}`, 'CREATION ERROR');
        }
      });
    }

    const addEntryForm = document.getElementById('add-entry-form');
    if (addEntryForm) {
      addEntryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.activeBundle) return;
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);

        const input = document.getElementById('entry-text-input');
        const statusEl = document.getElementById('entry-submit-status');
        const submitBtn = document.getElementById('btn-add-entry');

        const text = input ? input.value.trim() : '';
        const sourceLang = this.activeEntrySourceLang;

        if (!text) return;

        if (statusEl) {
          statusEl.textContent = 'Translating and adding...';
          statusEl.classList.remove('hidden');
        }
        if (submitBtn) submitBtn.disabled = true;

        try {
          await API.addBundleEntry(this.activeBundle.id, sourceLang, text);
          if (input) input.value = '';
          await this.loadBundle(this.activeBundle.id);
          await this.loadBundles(this.activeBundle.id);
          if (statusEl) {
            statusEl.textContent = 'Entry added!';
            setTimeout(() => {
              statusEl.classList.add('hidden');
            }, 1500);
          }
        } catch (err) {
          if (statusEl) statusEl.textContent = `Error: ${err.message}`;
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  },
};
window.BundlesController = BundlesController;
