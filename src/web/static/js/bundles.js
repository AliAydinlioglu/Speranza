const BundlesController = {
  bundles: [],
  activeBundle: null,
  allLanguages: [],

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
      label.className = 'flex items-center gap-2 p-2 bg-[#12141a] border border-[#2D313D] rounded cursor-pointer hover:border-zinc-500 text-xs font-mono-code';
      
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
      const select = document.getElementById('bundle-select');
      if (!select) return;

      select.innerHTML = '';
      if (this.bundles.length === 0) {
        select.innerHTML = '<option value="">[NO BUNDLES INITIALIZED]</option>';
        this.renderEmptyMatrix();
        return;
      }

      for (const b of this.bundles) {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.name.toUpperCase()} (${b.languages.join('/')}) [${b.item_count} ITEMS]`;
        select.appendChild(opt);
      }

      const targetId = selectBundleId || (this.bundles[0] ? this.bundles[0].id : null);
      if (targetId) {
        select.value = targetId;
        await this.loadBundle(targetId);
      }
    } catch (e) {
      console.error(e);
    }
  },

  async loadBundle(id) {
    if (!id) return;
    try {
      this.activeBundle = await API.getBundle(id);
      this.renderMatrix();
      this.populateEntrySourceLangs();
    } catch (e) {
      console.error(e);
    }
  },

  populateEntrySourceLangs() {
    const select = document.getElementById('entry-source-lang');
    if (!select || !this.activeBundle) return;
    select.innerHTML = '';

    for (const lang of this.activeBundle.languages) {
      const opt = document.createElement('option');
      opt.value = lang;
      opt.textContent = lang.toUpperCase();
      select.appendChild(opt);
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

    let ths = langs.map(l => `<th class="px-3 py-2 text-left text-xs font-bold text-arc-amber font-mono-code tracking-wider border-b border-[#2D313D]">${l.toUpperCase()}</th>`).join('');
    ths += `<th class="px-3 py-2 text-right text-xs font-bold text-zinc-500 font-mono-code tracking-wider border-b border-[#2D313D]">ACTION</th>`;

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
    const bundleSelect = document.getElementById('bundle-select');
    if (bundleSelect) {
      bundleSelect.addEventListener('change', async (e) => {
        await this.loadBundle(e.target.value);
      });
    }

    const openModalBtn = document.getElementById('btn-new-bundle');
    const modal = document.getElementById('new-bundle-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');

    if (openModalBtn && modal) {
      openModalBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    const form = document.getElementById('new-bundle-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
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

        const input = document.getElementById('entry-text-input');
        const sourceSelect = document.getElementById('entry-source-lang');
        const statusEl = document.getElementById('entry-submit-status');
        const submitBtn = document.getElementById('btn-add-entry');

        const text = input ? input.value.trim() : '';
        const sourceLang = sourceSelect ? sourceSelect.value : 'en';

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
