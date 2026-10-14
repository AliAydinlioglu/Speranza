const GdprController = {
  modal: null,
  btnOpen: null,
  btnClose: null,
  btnExport: null,
  btnErase: null,

  init() {
    this.modal = document.getElementById('gdpr-modal');
    this.btnOpen = document.getElementById('btn-gdpr-open');
    this.btnClose = document.getElementById('btn-gdpr-close');
    this.btnExport = document.getElementById('btn-gdpr-export');
    this.btnErase = document.getElementById('btn-gdpr-erase');

    if (this.btnOpen && !this.btnOpen._bound) {
      this.btnOpen._bound = true;
      this.btnOpen.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.AudioEngine) AudioEngine.playMechanicalClick(true);
        this.open();
      });
    }

    if (this.btnClose && !this.btnClose._bound) {
      this.btnClose._bound = true;
      this.btnClose.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.AudioEngine) AudioEngine.playMechanicalClick(false);
        this.close();
      });
    }

    if (this.modal && !this.modal._bound) {
      this.modal._bound = true;
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          if (window.AudioEngine) AudioEngine.playMechanicalClick(false);
          this.close();
        }
      });
    }

    if (this.btnExport && !this.btnExport._bound) {
      this.btnExport._bound = true;
      this.btnExport.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleExport();
      });
    }

    if (this.btnErase && !this.btnErase._bound) {
      this.btnErase._bound = true;
      this.btnErase.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleErase();
      });
    }
  },

  open() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
  },

  close() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
  },

  async handleExport() {
    const originalText = this.btnExport.textContent;
    this.btnExport.textContent = 'EXPORTING...';
    this.btnExport.disabled = true;

    try {
      const data = await API.exportGdprData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `speranza-gdpr-export-${dateStr}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      if (window.AudioEngine) {
        AudioEngine.playPayloadChime();
      }
      this.btnExport.textContent = 'EXPORTED!';
      setTimeout(() => {
        this.btnExport.textContent = originalText;
        this.btnExport.disabled = false;
      }, 1500);
    } catch (err) {
      this.btnExport.textContent = 'ERROR';
      if (window.AudioEngine) {
        AudioEngine.playGlitchStatic();
      }
      setTimeout(() => {
        this.btnExport.textContent = originalText;
        this.btnExport.disabled = false;
      }, 2000);
    }
  },

  async handleErase() {
    if (!window.ThemedModal) return;

    const confirmed = await ThemedModal.confirm(
      'WARNING: This will permanently erase all saved vocabulary packs, phrases, and translations from your local database in accordance with GDPR Article 17 (Right to Erasure). This operation cannot be reversed. Do you wish to proceed?',
      'PERMANENT DATA PURGE',
      { isDanger: true, confirmText: 'PURGE ALL DATA' }
    );

    if (!confirmed) return;

    try {
      await API.eraseGdprData();
      localStorage.removeItem('speranza_audio_muted');

      if (window.BundlesController) {
        await BundlesController.loadBundles();
      }

      this.close();

      await ThemedModal.alert(
        'All stored vocabulary packs and translations have been permanently erased and the database has been zeroed (GDPR Article 17).',
        'PURGE COMPLETE'
      );
    } catch (err) {
      await ThemedModal.alert(
        `Failed to purge data: ${err.message || 'Unknown error'}`,
        'PURGE ERROR'
      );
    }
  },
};

window.GdprController = GdprController;
