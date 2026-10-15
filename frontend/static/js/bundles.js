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
          this.confirmBtn.className = 'btn btn-danger px-5 py-2 text-xs font-mono-code font-bold tracking-wider rounded cursor-pointer';
        } else {
          this.confirmBtn.className = 'btn btn-action px-5 py-2 text-xs font-mono-code font-bold tracking-wider rounded cursor-pointer';
        }
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

  alert(message, title = 'SYSTEM NOTICE') {
    this.init();
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      if (this.titleEl) this.titleEl.textContent = title;
      if (this.messageEl) this.messageEl.textContent = message;
      if (this.confirmBtn) {
        this.confirmBtn.textContent = 'OK';
        this.confirmBtn.className = 'btn px-5 py-2 text-xs font-mono-code font-bold tracking-wider rounded text-main border border-theme hover:border-zinc-400 cursor-pointer';
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

function getBundleStyleIndex(bundle) {
  if (bundle && bundle.style_id !== undefined && bundle.style_id !== null) {
    const parsed = parseInt(bundle.style_id, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed < 12) return parsed;
  }
  const idStr = (bundle && bundle.id) ? String(bundle.id) : (bundle && bundle.name ? String(bundle.name) : '0');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 12;
}

function getRandomStyleIndex() {
  return String(Math.floor(Math.random() * 12));
}

const CASSETTE_SVGS = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#15171C"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#2B303C" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#15171C" stroke="#2B303C" stroke-width="1"/> <line x1="120" y1="214" x2="320" y2="214" stroke="#E64A19" stroke-width="2.5"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#2B303C" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#2B303C" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F5EEDB"/> <rect x="34" y="104" width="372" height="18" fill="#D63E1B"/> <rect x="34" y="126" width="372" height="12" fill="#E65100"/> <rect x="34" y="142" width="372" height="8" fill="#F57C00"/> <rect x="34" y="154" width="372" height="28" fill="#D63E1B"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#15171C" stroke="#F5EEDB" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#F5EEDB" text-anchor="middle">A</text> </g> <g> <text x="386" y="170" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">60</text> </g> </g> <g> <rect x="114" y="96" width="212" height="74" rx="8" fill="#15171C" stroke="#3D4452" stroke-width="0.8"/> <rect x="118" y="100" width="204" height="66" rx="6" fill="#121418"/> <circle cx="160" cy="133" r="34" fill="#2E231F"/> <circle cx="280" cy="133" r="26" fill="#2E231F"/> <g transform="translate(160, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g transform="translate(280, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g stroke="#8E96A0" stroke-width="1.2"> <line x1="216" y1="126" x2="216" y2="140"/> <line x1="220" y1="124" x2="220" y2="142"/> <line x1="224" y1="126" x2="224" y2="140"/> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#E8DFCE"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#D0C4AF" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#DFD6C2" stroke="#D0C4AF" stroke-width="1"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#D0C4AF" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#D0C4AF" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F5EEDB"/> <rect x="34" y="74" width="372" height="108" fill="#4A3227"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#4A3227" stroke="#3A261D" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#E8DFCE" text-anchor="middle">A</text> </g> <g> <text x="382" y="140" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">90</text> </g> </g> <g> <rect x="114" y="96" width="212" height="74" rx="8" fill="#E8DFCE" stroke="#3D4452" stroke-width="0.8"/> <rect x="118" y="100" width="204" height="66" rx="6" fill="#16181D"/> <circle cx="160" cy="133" r="26" fill="#2E231F"/> <circle cx="280" cy="133" r="34" fill="#2E231F"/> <g transform="translate(160, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g transform="translate(280, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g stroke="#8E96A0" stroke-width="1.2"> <line x1="216" y1="126" x2="216" y2="140"/> <line x1="220" y1="124" x2="220" y2="142"/> <line x1="224" y1="126" x2="224" y2="140"/> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#181A20"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#2D323E" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#181A20" stroke="#2D323E" stroke-width="1"/> <line x1="120" y1="214" x2="320" y2="214" stroke="#728448" stroke-width="2"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#2D323E" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#2D323E" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F5EEDB"/> <rect x="34" y="74" width="372" height="84" fill="#728448"/> <rect x="34" y="158" width="372" height="24" fill="#F5EEDB"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#F5EEDB" stroke="#728448" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#222718" text-anchor="middle">B</text> </g> <g> <text x="382" y="170" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#222718" text-anchor="middle">90</text> </g> </g> <g> <rect x="114" y="96" width="212" height="74" rx="8" fill="#181A20" stroke="#3D4452" stroke-width="0.8"/> <rect x="118" y="100" width="204" height="66" rx="6" fill="#121418"/> <circle cx="160" cy="133" r="34" fill="#2E231F"/> <circle cx="280" cy="133" r="26" fill="#2E231F"/> <g transform="translate(160, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g transform="translate(280, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g stroke="#8E96A0" stroke-width="1.2"> <line x1="216" y1="126" x2="216" y2="140"/> <line x1="220" y1="124" x2="220" y2="142"/> <line x1="224" y1="126" x2="224" y2="140"/> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#D5DAE0"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#EEF2F6" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#C8CDD4" stroke="#EEF2F6" stroke-width="1"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#EEF2F6" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#EEF2F6" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F8F4EA"/> <rect x="34" y="74" width="372" height="108" fill="#F0ECE1"/> <line x1="34" y1="74" x2="406" y2="74" stroke="#C8C0B0" stroke-width="1"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#D63E1B" stroke="#A82E12" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#FFFFFF" text-anchor="middle">B</text> </g> <g> <text x="382" y="170" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#D63E1B" text-anchor="middle">60</text> </g> </g> <g> <rect x="114" y="96" width="212" height="74" rx="8" fill="#C8CDD4" stroke="#3D4452" stroke-width="0.8"/> <rect x="118" y="100" width="204" height="66" rx="6" fill="#14171D"/> <circle cx="160" cy="133" r="26" fill="#2E231F"/> <circle cx="280" cy="133" r="34" fill="#2E231F"/> <g transform="translate(160, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g transform="translate(280, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g stroke="#8E96A0" stroke-width="1.2"> <line x1="216" y1="126" x2="216" y2="140"/> <line x1="220" y1="124" x2="220" y2="142"/> <line x1="224" y1="126" x2="224" y2="140"/> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#15171C"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#282C36" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#15171C" stroke="#282C36" stroke-width="1"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#282C36" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#282C36" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F8F3E6"/> <rect x="34" y="74" width="372" height="108" fill="#1C1F26"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#F8F3E6" stroke="#15171C" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#15171C" text-anchor="middle">B</text> </g> <g> <text x="382" y="52" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#15171C" text-anchor="middle">60</text> </g> </g> <g> <g transform="translate(155, 134)"> <circle cx="0" cy="0" r="46" fill="#2E2420"/> <g class="spool-wheel"> <circle cx="0" cy="0" r="36" fill="#F4EFE6" stroke="#9A9084" stroke-width="1"/> <circle cx="20.8" cy="12.0" r="8" fill="#1C1F26"/><circle cx="-20.8" cy="12.0" r="8" fill="#1C1F26"/><circle cx="-0.0" cy="-24.0" r="8" fill="#1C1F26"/> <circle cx="0" cy="0" r="18" fill="#D8D1C5"/> <circle cx="0" cy="0" r="8" fill="#15171C"/> </g> </g> <g transform="translate(285, 134)"> <circle cx="0" cy="0" r="46" fill="#2E2420"/> <g class="spool-wheel"> <circle cx="0" cy="0" r="36" fill="#F4EFE6" stroke="#9A9084" stroke-width="1"/> <circle cx="20.8" cy="12.0" r="8" fill="#1C1F26"/><circle cx="-20.8" cy="12.0" r="8" fill="#1C1F26"/><circle cx="-0.0" cy="-24.0" r="8" fill="#1C1F26"/> <circle cx="0" cy="0" r="18" fill="#D8D1C5"/> <circle cx="0" cy="0" r="8" fill="#15171C"/> </g> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#D8DDE3"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#EFF3F7" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#CCD2D8" stroke="#EFF3F7" stroke-width="1"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#EFF3F7" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#EFF3F7" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F6F1E3"/> <rect x="34" y="74" width="372" height="82" fill="#2548A3"/> <rect x="34" y="156" width="372" height="26" fill="#F6F1E3"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#2548A3" stroke="#1A3578" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#FFFFFF" text-anchor="middle">A</text> </g> <g> <text x="382" y="170" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#2548A3" text-anchor="middle">90</text> </g> </g> <g> <rect x="114" y="96" width="212" height="74" rx="8" fill="#2548A3" stroke="#3D4452" stroke-width="0.8"/> <rect x="118" y="100" width="204" height="66" rx="6" fill="#12151B"/> <circle cx="160" cy="133" r="26" fill="#2E231F"/> <circle cx="280" cy="133" r="34" fill="#2E231F"/> <g transform="translate(160, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g transform="translate(280, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g stroke="#8E96A0" stroke-width="1.2"> <line x1="216" y1="126" x2="216" y2="140"/> <line x1="220" y1="124" x2="220" y2="142"/> <line x1="224" y1="126" x2="224" y2="140"/> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#D84F3B"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#F06E5B" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#C4412F" stroke="#F06E5B" stroke-width="1"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#F06E5B" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#F06E5B" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F5EEDB"/> <rect x="34" y="74" width="372" height="82" fill="#181A1F"/> <line x1="34" y1="84" x2="406" y2="84" stroke="#F5EEDB" stroke-width="2"/> <line x1="34" y1="94" x2="406" y2="94" stroke="#F5EEDB" stroke-width="2"/> <line x1="34" y1="104" x2="406" y2="104" stroke="#F5EEDB" stroke-width="2"/> <line x1="34" y1="144" x2="406" y2="144" stroke="#F5EEDB" stroke-width="2"/> <line x1="34" y1="154" x2="406" y2="154" stroke="#F5EEDB" stroke-width="2"/> <rect x="34" y="156" width="372" height="26" fill="#D84F3B"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#181A1F" stroke="#F5EEDB" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#F5EEDB" text-anchor="middle">B</text> </g> <g> <text x="382" y="170" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">60</text> </g> </g> <g> <rect x="114" y="96" width="212" height="74" rx="8" fill="#D84F3B" stroke="#3D4452" stroke-width="0.8"/> <rect x="118" y="100" width="204" height="66" rx="6" fill="#121418"/> <circle cx="160" cy="133" r="34" fill="#2E231F"/> <circle cx="280" cy="133" r="26" fill="#2E231F"/> <g transform="translate(160, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g transform="translate(280, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g stroke="#8E96A0" stroke-width="1.2"> <line x1="216" y1="126" x2="216" y2="140"/> <line x1="220" y1="124" x2="220" y2="142"/> <line x1="224" y1="126" x2="224" y2="140"/> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#16181F"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#2B303C" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#16181F" stroke="#2B303C" stroke-width="1"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#2B303C" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#2B303C" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F6F1E3"/> <rect x="34" y="74" width="372" height="108" fill="#3E8FDE"/> <rect x="34" y="156" width="372" height="26" fill="#F6F1E3"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#FFFFFF" stroke="#B0C4DE" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#1A1C22" text-anchor="middle">A</text> </g> <g> <rect x="368" y="126" width="28" height="18" rx="2" fill="#FFFFFF"/> <text x="382" y="140" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#1A1C22" text-anchor="middle">90</text> </g> </g> <g> <rect x="114" y="96" width="212" height="74" rx="8" fill="#16181F" stroke="#3D4452" stroke-width="0.8"/> <rect x="118" y="100" width="204" height="66" rx="6" fill="#121418"/> <circle cx="160" cy="133" r="26" fill="#2E231F"/> <circle cx="280" cy="133" r="34" fill="#2E231F"/> <g transform="translate(160, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g transform="translate(280, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g stroke="#8E96A0" stroke-width="1.2"> <line x1="216" y1="126" x2="216" y2="140"/> <line x1="220" y1="124" x2="220" y2="142"/> <line x1="224" y1="126" x2="224" y2="140"/> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#181A20"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#2F3542" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#181A20" stroke="#2F3542" stroke-width="1"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#2F3542" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#2F3542" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F6F1E3"/> <rect x="34" y="74" width="372" height="108" fill="#222630"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#F6F1E3" stroke="#181A20" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#181A20" text-anchor="middle">B</text> </g> <g> <text x="382" y="52" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#181A20" text-anchor="middle">60</text> </g> </g> <g> <g transform="translate(155, 134)"> <circle cx="0" cy="0" r="46" fill="#2E2420"/> <g class="spool-wheel"> <circle cx="0" cy="0" r="36" fill="#F4EFE6" stroke="#9A9084" stroke-width="1"/> <circle cx="20.8" cy="12.0" r="8" fill="#1C1F26"/><circle cx="-20.8" cy="12.0" r="8" fill="#1C1F26"/><circle cx="-0.0" cy="-24.0" r="8" fill="#1C1F26"/> <circle cx="0" cy="0" r="18" fill="#D8D1C5"/> <circle cx="0" cy="0" r="8" fill="#15171C"/> </g> </g> <g transform="translate(285, 134)"> <circle cx="0" cy="0" r="46" fill="#2E2420"/> <g class="spool-wheel"> <circle cx="0" cy="0" r="36" fill="#F4EFE6" stroke="#9A9084" stroke-width="1"/> <circle cx="20.8" cy="12.0" r="8" fill="#1C1F26"/><circle cx="-20.8" cy="12.0" r="8" fill="#1C1F26"/><circle cx="-0.0" cy="-24.0" r="8" fill="#1C1F26"/> <circle cx="0" cy="0" r="18" fill="#D8D1C5"/> <circle cx="0" cy="0" r="8" fill="#15171C"/> </g> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#14161B"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#272B36" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#14161B" stroke="#272B36" stroke-width="1"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#272B36" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#272B36" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F5EEDB"/> <rect x="34" y="116" width="372" height="22" fill="#D63E1B"/> <rect x="34" y="138" width="372" height="44" fill="#F5EEDB"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#14161B" stroke="#F5EEDB" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#F5EEDB" text-anchor="middle">A</text> </g> <g> <text x="382" y="170" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#14161B" text-anchor="middle">90</text> </g> </g> <g> <rect x="114" y="96" width="212" height="74" rx="8" fill="#14161B" stroke="#3D4452" stroke-width="0.8"/> <rect x="118" y="100" width="204" height="66" rx="6" fill="#101216"/> <circle cx="160" cy="133" r="26" fill="#2E231F"/> <circle cx="280" cy="133" r="34" fill="#2E231F"/> <g transform="translate(160, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g transform="translate(280, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g stroke="#8E96A0" stroke-width="1.2"> <line x1="216" y1="126" x2="216" y2="140"/> <line x1="220" y1="124" x2="220" y2="142"/> <line x1="224" y1="126" x2="224" y2="140"/> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#E8DFCE"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#D0C4AF" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#DFD6C2" stroke="#D0C4AF" stroke-width="1"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#D0C4AF" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#D0C4AF" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F5EEDB"/> <rect x="34" y="74" width="372" height="66" fill="#D85A38"/> <rect x="34" y="140" width="372" height="42" fill="#1F232B"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#1F232B" stroke="#1F232B" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#E8DFCE" text-anchor="middle">A</text> </g> <g> <text x="382" y="172" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#D84F3B" text-anchor="middle">90</text> </g> </g> <g> <rect x="114" y="96" width="212" height="74" rx="8" fill="#E8DFCE" stroke="#3D4452" stroke-width="0.8"/> <rect x="118" y="100" width="204" height="66" rx="6" fill="#16181D"/> <circle cx="160" cy="133" r="34" fill="#2E231F"/> <circle cx="280" cy="133" r="26" fill="#2E231F"/> <g transform="translate(160, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g transform="translate(280, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g stroke="#8E96A0" stroke-width="1.2"> <line x1="216" y1="126" x2="216" y2="140"/> <line x1="220" y1="124" x2="220" y2="142"/> <line x1="224" y1="126" x2="224" y2="140"/> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="275" viewBox="0 0 440 275"> <defs> <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%"> <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/> <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/> </linearGradient> </defs> <rect x="0" y="0" width="440" height="275" rx="16" fill="#101216"/> <rect x="4" y="4" width="432" height="267" rx="12" fill="none" stroke="#222630" stroke-width="1.5"/> <rect x="34" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="380" y="0" width="26" height="5" rx="1" fill="#0A0C0E"/> <rect x="0" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <rect x="436" y="86" width="4" height="28" rx="2" fill="#0A0C0E"/> <polygon points="78,275 362,275 348,214 92,214" fill="#101216" stroke="#222630" stroke-width="1"/> <circle cx="118" cy="244" r="8" fill="#0E1015" stroke="#222630" stroke-width="1"/> <circle cx="322" cy="244" r="8" fill="#0E1015" stroke="#222630" stroke-width="1"/> <circle cx="152" cy="252" r="4.5" fill="#0E1015"/> <circle cx="288" cy="252" r="4.5" fill="#0E1015"/> <g> <rect x="34" y="20" width="372" height="162" rx="8" fill="#F5EEDB"/> <rect x="34" y="74" width="372" height="108" fill="#14171E"/> <line x1="34" y1="164" x2="406" y2="164" stroke="#D63E1B" stroke-width="2.5"/> <g transform="translate(46, 28)"> <rect x="0" y="0" width="34" height="34" rx="4" fill="#F5EEDB" stroke="#101216" stroke-width="1.2"/> <text x="17" y="25" font-family="'JetBrains Mono', monospace" font-size="21" font-weight="bold" fill="#101216" text-anchor="middle">A</text> </g> <g> <text x="382" y="172" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#D63E1B" text-anchor="middle">90</text> </g> </g> <g> <rect x="114" y="96" width="212" height="74" rx="8" fill="#101216" stroke="#3D4452" stroke-width="0.8"/> <rect x="118" y="100" width="204" height="66" rx="6" fill="#0D0E12"/> <circle cx="160" cy="133" r="26" fill="#2E231F"/> <circle cx="280" cy="133" r="34" fill="#2E231F"/> <g transform="translate(160, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g transform="translate(280, 133)"> <g class="spool-wheel"> <circle cx="0" cy="0" r="22" fill="#DDE2E6" stroke="#78808A" stroke-width="0.8"/> <circle cx="16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-8.2" cy="14.3" r="2.8" fill="#FFFFFF"/><circle cx="-16.5" cy="0.0" r="2.8" fill="#FFFFFF"/><circle cx="-8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/><circle cx="8.3" cy="-14.3" r="2.8" fill="#FFFFFF"/> <circle cx="0" cy="0" r="11" fill="#DDE2E6" stroke="#78808A" stroke-width="0.6"/> <circle cx="0" cy="0" r="7.5" fill="#181B22"/> </g> </g> <g stroke="#8E96A0" stroke-width="1.2"> <line x1="216" y1="126" x2="216" y2="140"/> <line x1="220" y1="124" x2="220" y2="142"/> <line x1="224" y1="126" x2="224" y2="140"/> </g> </g> <g transform="translate(18, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.9" y1="-1.4" x2="2.9" y2="1.4" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 18)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-1.4" y1="-2.9" x2="1.4" y2="2.9" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(18, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="0.8" y1="-3.1" x2="-0.8" y2="3.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(422, 257)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-2.5" y1="-2.1" x2="2.5" y2="2.1" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> <g transform="translate(220, 244)"> <circle cx="0" cy="0" r="5.5" fill="#8C939E" stroke="#606670" stroke-width="0.8"/> <circle cx="0" cy="0" r="4.2" fill="#4B515B"/> <line x1="-3.1" y1="-0.8" x2="3.1" y2="0.8" stroke="#25282F" stroke-width="1.2" stroke-linecap="round"/> </g> </svg>`,
];

function getCassetteSvg(styleIdx) {
  const idx = (typeof styleIdx === 'number' && styleIdx >= 0 && styleIdx < 12)
    ? styleIdx
    : (parseInt(styleIdx, 10) || 0);
  return CASSETTE_SVGS[idx % 12];
}


const BundlesController = {
  bundles: [],
  activeBundle: null,
  allLanguages: [],
  activeEntrySourceLang: 'en',
  newBundleSelectedLangs: new Set(['en', 'nl']),

  async init() {
    await this.loadAllLanguages();
    await this.loadBundles();
    this.bindEvents();
    if (window.BulkGeneratorController) {
      window.BulkGeneratorController.init();
    }
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
      const btn = document.createElement('button');
      btn.type = 'button';
      const code = (lang.code || '').toLowerCase();
      const isActive = this.newBundleSelectedLangs.has(code);
      btn.className = `chip px-2.5 py-1 text-xs font-mono-code font-bold uppercase rounded cursor-pointer transition ${isActive ? 'active' : ''}`;
      btn.dataset.code = code;
      btn.innerHTML = `${lang.name} <span class="text-[10px] opacity-75">${code.toUpperCase()}</span>`;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        if (this.newBundleSelectedLangs.has(code)) {
          this.newBundleSelectedLangs.delete(code);
          btn.classList.remove('active');
        } else {
          this.newBundleSelectedLangs.add(code);
          btn.classList.add('active');
        }
      });

      container.appendChild(btn);
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
        <div class="col-span-full p-6 text-center text-xs font-mono-code text-zinc-500 border border-dashed border-theme rounded-lg">
          No vocabulary cassettes found. Create a new cassette to get started.
        </div>
      `;
      return;
    }

    this.bundles.forEach((b) => {
      const isActive = b.id === activeId;
      const pairSummary = b.languages.map(l => l.toUpperCase()).join(' • ');
      const styleIdx = getBundleStyleIndex(b);

      const cassette = document.createElement('div');
      cassette.className = `pack-card pack-card-${styleIdx} ${isActive ? 'active' : ''}`;
      cassette.dataset.bundleId = b.id;

      cassette.innerHTML = `
        <div class="cassette-vector-art">
          ${getCassetteSvg(styleIdx)}
        </div>
        <button type="button" class="del-pack-btn cassette-del-tab" data-bundle-id="${b.id}" title="Delete pack">
          ×
        </button>
        <div class="cassette-label-text">
          <div class="cassette-name-line">${b.name}</div>
          <div class="cassette-sub-line">
            <span class="cassette-sub-langs">${pairSummary}</span>
            <span class="cassette-sub-words">[${b.item_count}W]</span>
          </div>
        </div>
      `;

      cassette.addEventListener('click', async (e) => {
        if (e.target.closest('.del-pack-btn')) return;
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        await this.loadBundle(b.id);
        this.renderBundleSelector(b.id);
        this.renderCassettes(b.id);
      });

      const delBtn = cassette.querySelector('.del-pack-btn');
      if (delBtn) {
        delBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
          const ok = await ThemedModal.confirm(
            `Permanently delete vocabulary cassette "${b.name}" and all its saved words?`,
            'DELETE VOCABULARY CASSETTE',
            { isDanger: true, confirmText: 'DELETE CASSETTE' }
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
        <span class="text-primary font-mono-code font-bold tracking-wider flex-shrink-0">[ PACK-${padIndex} ]</span>
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
      item.className = `dropdown-item p-2 rounded flex items-center justify-between text-xs font-mono-code mb-1 ${isActive ? 'active' : ''}`;
      item.innerHTML = `
        <div class="flex items-center gap-2 truncate min-w-0">
          <span class="font-bold text-primary flex-shrink-0">[ PACK-${pIndex} ]</span>
          <span class="font-bold truncate text-main">${b.name}</span>
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
        <span class="text-main font-mono-code font-bold truncate">${currentLabel}</span>
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
      item.className = `dropdown-item p-2 rounded flex items-center justify-between text-xs font-mono-code mb-1 ${isActive ? 'active' : ''}`;
      item.innerHTML = `
        <div class="flex items-center gap-2 truncate">
          <span class="font-bold text-main">${label}</span>
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
        No vocabulary cassette selected. Select or create a cassette above.
      </div>
    `;
  },

  renderMatrix() {
    const container = document.getElementById('bundle-matrix-container');
    if (!container || !this.activeBundle) return;

    const langs = this.activeBundle.languages;
    const entries = this.activeBundle.entries || [];

    let ths = langs.map((l, index) => {
      const langObj = this.allLanguages.find(lang => lang.code === l);
      const name = langObj ? langObj.name : l.toUpperCase();
      return `
        <th class="matrix-col-header px-3 py-2 text-left text-xs font-bold text-zinc-200 font-mono-code tracking-wider border-b border-theme select-none transition-colors"
            draggable="true"
            data-lang-code="${l}"
            data-col-index="${index}"
            title="Drag to rearrange language column">
          <div class="flex items-center gap-1.5 cursor-grab active:cursor-grabbing">
            <span>${name}</span>
            <span class="text-zinc-400 text-[10px]">[${l.toUpperCase()}]</span>
            <span class="matrix-drag-grip text-zinc-600 hover:text-secondary text-xs ml-1">⋮⋮</span>
          </div>
        </th>
      `;
    }).join('');
    ths += `<th class="px-3 py-2 text-right text-xs font-bold text-zinc-500 font-mono-code tracking-wider border-b border-theme select-none">ACTION</th>`;

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
          return `<td class="px-3 py-2 text-xs font-mono-code text-zinc-200 border-b border-subtle">${val}</td>`;
        }).join('');

        tds += `
          <td class="px-3 py-2 text-right border-b border-subtle">
            <button type="button" class="del-entry-btn btn px-2.5 py-1 text-[11px] font-bold text-red-400 hover:text-red-300 rounded cursor-pointer" data-entry-id="${entry.id}">
              DELETE
            </button>
          </td>
        `;

        rowsHtml += `<tr class="hover:bg-subtle transition">${tds}</tr>`;
      }
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-subtle">
              ${ths}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    const headers = container.querySelectorAll('.matrix-col-header');
    let draggedCode = null;

    headers.forEach(th => {
      th.addEventListener('dragstart', (e) => {
        draggedCode = th.dataset.langCode;
        e.dataTransfer.setData('text/plain', draggedCode);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => th.classList.add('dragging'), 0);
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
      });

      th.addEventListener('dragend', () => {
        headers.forEach(h => h.classList.remove('dragging', 'drag-over-left', 'drag-over-right'));
        draggedCode = null;
      });

      th.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const targetCode = th.dataset.langCode;
        if (!draggedCode || draggedCode === targetCode) {
          th.classList.remove('drag-over-left', 'drag-over-right');
          return;
        }

        const rect = th.getBoundingClientRect();
        const isLeft = e.clientX < rect.left + rect.width / 2;
        if (isLeft) {
          th.classList.add('drag-over-left');
          th.classList.remove('drag-over-right');
        } else {
          th.classList.add('drag-over-right');
          th.classList.remove('drag-over-left');
        }
      });

      th.addEventListener('dragleave', () => {
        th.classList.remove('drag-over-left', 'drag-over-right');
      });

      th.addEventListener('drop', async (e) => {
        e.preventDefault();
        th.classList.remove('drag-over-left', 'drag-over-right');
        const sourceCode = draggedCode || e.dataTransfer.getData('text/plain');
        const targetCode = th.dataset.langCode;
        if (!sourceCode || !targetCode || sourceCode === targetCode) return;

        const currentLangs = [...this.activeBundle.languages];
        const sourceIndex = currentLangs.indexOf(sourceCode);
        if (sourceIndex === -1) return;

        currentLangs.splice(sourceIndex, 1);
        const targetIndex = currentLangs.indexOf(targetCode);
        if (targetIndex === -1) return;

        const rect = th.getBoundingClientRect();
        const isLeft = e.clientX < rect.left + rect.width / 2;
        const insertIndex = isLeft ? targetIndex : targetIndex + 1;
        currentLangs.splice(insertIndex, 0, sourceCode);

        this.activeBundle.languages = currentLangs;
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(false);
        this.renderMatrix();
        this.renderCassettes(this.activeBundle.id);

        try {
          await API.updateBundleLanguages(this.activeBundle.id, currentLangs);
          const bundleInList = this.bundles.find(b => b.id === this.activeBundle.id);
          if (bundleInList) bundleInList.languages = currentLangs;
        } catch (err) {
          console.error(err);
        }
      });
    });

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
      if (!e.target.closest('[id^="popover-bulk-"]') && !e.target.closest('[id^="btn-bulk-"]')) {
        document.querySelectorAll('[id^="popover-bulk-"]').forEach((p) => p.classList.add('hidden'));
      }
    });

    const btnSmartBulk = document.getElementById('btn-smart-bulk-generator');
    if (btnSmartBulk && !btnSmartBulk._bound) {
      btnSmartBulk._bound = true;
      btnSmartBulk.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        if (window.BulkGeneratorController) {
          window.BulkGeneratorController.open();
        }
      });
    }

    const openModalBtn = document.getElementById('btn-new-bundle');
    const modal = document.getElementById('new-bundle-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');

    if (openModalBtn && modal) {
      openModalBtn.addEventListener('click', () => {
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        this.newBundleSelectedLangs = new Set(['en', 'nl']);
        this.populateModalLanguages();
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

        const checkedLangs = Array.from(this.newBundleSelectedLangs);
        if (checkedLangs.length < 2) {
          await ThemedModal.alert('Please select at least 2 languages.', 'VALIDATION NOTICE');
          return;
        }

        try {
          const randomStyle = getRandomStyleIndex();
          const created = await API.createBundle(name, checkedLangs, randomStyle);
          if (modal) modal.classList.add('hidden');
          form.reset();
          this.newBundleSelectedLangs = new Set(['en', 'nl']);
          this.populateModalLanguages();
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

const BulkGeneratorController = {
  modal: null,
  candidates: [],
  selectedCandidates: new Set(),
  selectedTargetLangs: new Set(['en', 'nl']),
  pollTimer: null,
  activeTaskId: null,

  dropdowns: {},

  init() {
    this.modal = document.getElementById('bulk-generator-modal');
    this.initDropdowns();
    this.initSlider();
    this.bindEvents();
    this.populateLanguages();
    this.resetDestMode();
  },

  initSlider() {
    const slider = document.getElementById('bulk-limit-slider');
    const readout = document.getElementById('bulk-limit-readout');
    if (!slider || !readout) return;

    const updateReadout = () => {
      const val = Number(slider.value);
      if (val > 5000) {
        readout.textContent = 'ALL';
      } else {
        readout.textContent = String(val);
      }
    };

    slider.addEventListener('input', updateReadout);
    slider.addEventListener('change', updateReadout);
    updateReadout();
  },

  getCandidateLimit() {
    const slider = document.getElementById('bulk-limit-slider');
    if (!slider) return 5000;
    const val = Number(slider.value);
    if (val > 5000) return 999999;
    return val;
  },

  createDropdown({ triggerId, popoverId, options, defaultValue, onChange }) {
    const trigger = document.getElementById(triggerId);
    const popover = document.getElementById(popoverId);
    if (!trigger || !popover) return null;

    let currentVal = defaultValue !== undefined ? defaultValue : (options[0] ? options[0].value : '');
    let currentOptions = [...options];

    const render = () => {
      const selected = currentOptions.find((o) => String(o.value) === String(currentVal)) || currentOptions[0] || { label: '', value: '' };
      trigger.innerHTML = `
        <div class="flex items-center gap-2 truncate min-w-0">
          <span class="led-indicator led-amber flex-shrink-0"></span>
          <span class="text-main font-mono-code font-bold tracking-wider truncate">${selected.label.toUpperCase()}</span>
          ${selected.badge ? `<span class="text-[10px] text-zinc-400 font-mono-code font-bold flex-shrink-0">[${selected.badge}]</span>` : ''}
        </div>
        <div class="flex items-center gap-1.5 text-[10px] font-mono-code text-zinc-400 flex-shrink-0 ml-2">
          <span class="text-zinc-400">SELECT</span>
          <span>▾</span>
        </div>
      `;

      popover.innerHTML = '';
      currentOptions.forEach((opt) => {
        const isActive = String(opt.value) === String(currentVal);
        const item = document.createElement('div');
        item.className = `dropdown-item p-2 rounded flex items-center justify-between text-xs font-mono-code mb-1 cursor-pointer ${isActive ? 'active' : ''}`;
        item.innerHTML = `
          <div class="flex items-center gap-2 truncate min-w-0">
            <span class="font-bold truncate ${isActive ? 'text-secondary' : 'text-main'}">${opt.label}</span>
            ${opt.badge ? `<span class="text-[10px] text-zinc-400 flex-shrink-0">[${opt.badge}]</span>` : ''}
          </div>
          <span class="led-indicator ${isActive ? 'led-amber' : 'bg-zinc-700'} flex-shrink-0"></span>
        `;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
          currentVal = opt.value;
          popover.classList.add('hidden');
          render();
          if (onChange) onChange(currentVal);
        });
        popover.appendChild(item);
      });
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
      const isHidden = popover.classList.contains('hidden');
      document.querySelectorAll('[id^="popover-bulk-"]').forEach((p) => p.classList.add('hidden'));
      if (isHidden) {
        popover.classList.remove('hidden');
      }
    });

    render();

    return {
      getValue: () => currentVal,
      setValue: (v) => {
        currentVal = v;
        render();
      },
      setOptions: (newOpts, newDef) => {
        currentOptions = [...newOpts];
        if (newDef !== undefined) currentVal = newDef;
        render();
      },
    };
  },

  initDropdowns() {
    this.dropdowns = {};

    this.dropdowns.textMode = this.createDropdown({
      triggerId: 'btn-bulk-text-mode',
      popoverId: 'popover-bulk-text-mode',
      options: [
        { value: 'words', label: 'Frequency Words', badge: 'Core Lem' },
        { value: 'sentences', label: '4-12 Word Sentences', badge: 'Phrases' },
      ],
      defaultValue: 'words',
    });
  },

  populatePacksDropdown() {
    const bundles = (window.BundlesController && window.BundlesController.bundles) || [];
    const trigger = document.getElementById('btn-bulk-dest-pack');
    const popover = document.getElementById('popover-bulk-dest-pack');
    if (!trigger || !popover) return;

    if (bundles.length === 0) {
      trigger.innerHTML = `
        <div class="flex items-center gap-2 text-zinc-500 font-mono-code text-xs">
          <span>NO EXISTING PACKS AVAILABLE</span>
        </div>
      `;
      return;
    }

    const options = bundles.map((b) => ({
      value: b.id,
      label: b.name,
      badge: b.languages ? b.languages.map((l) => l.toUpperCase()).join(', ') : '',
      languages: b.languages || [],
    }));

    const activeId = (window.BundlesController && window.BundlesController.activeBundle && window.BundlesController.activeBundle.id) || options[0]?.value;

    this.dropdowns.destPack = this.createDropdown({
      triggerId: 'btn-bulk-dest-pack',
      popoverId: 'popover-bulk-dest-pack',
      options: options,
      defaultValue: activeId,
    });
  },

  resetDestMode() {
    const radioNew = document.getElementById('bulk-dest-new');
    const radioAppend = document.getElementById('bulk-dest-append');
    if (radioNew) radioNew.checked = true;
    if (radioAppend) radioAppend.checked = false;
    const nameRow = document.getElementById('bulk-new-pack-name-row');
    const existingRow = document.getElementById('bulk-existing-pack-row');
    const langsSection = document.getElementById('bulk-languages-section');
    if (nameRow) nameRow.classList.remove('hidden');
    if (existingRow) existingRow.classList.add('hidden');
    if (langsSection) langsSection.classList.remove('hidden');
  },

  open() {
    if (!this.modal) return;
    this.resetDestMode();
    this.populateLanguages();
    this.populatePacksDropdown();
    this.resetTelemetry();
    this.initSlider();
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
  },

  close() {
    if (!this.modal) return;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
  },

  resetTelemetry() {
    const formContainer = document.getElementById('bulk-form-container');
    const telemetry = document.getElementById('bulk-synthesis-telemetry');
    const synthBtn = document.getElementById('btn-bulk-synthesize');
    const bar = document.getElementById('bulk-telemetry-bar');
    const countEl = document.getElementById('bulk-telemetry-count');
    const phraseEl = document.getElementById('bulk-telemetry-phrase');
    const percentEl = document.getElementById('bulk-telemetry-percent');
    const statusEl = document.getElementById('bulk-telemetry-status');

    if (formContainer) formContainer.classList.remove('hidden');
    if (telemetry) telemetry.classList.add('hidden');
    if (synthBtn) {
      synthBtn.disabled = false;
      synthBtn.textContent = 'SYNTHESIZE BULK PACK';
    }
    if (bar) {
      bar.style.width = '0%';
      bar.style.backgroundColor = 'var(--color-success)';
    }
    if (countEl) countEl.textContent = '[0 / 0]';
    if (percentEl) percentEl.textContent = '0%';
    if (phraseEl) phraseEl.textContent = 'Initializing models...';
    if (statusEl) {
      statusEl.textContent = 'BATCH INFERENCE IN PROGRESS';
      statusEl.className = 'font-bold text-success';
    }
  },

  populateLanguages() {
    const container = document.getElementById('bulk-languages-container');
    if (!container || !window.BundlesController) return;
    container.innerHTML = '';
    const sorted = [...(window.BundlesController.allLanguages || [])].sort((a, b) => a.name.localeCompare(b.name));
    for (const lang of sorted) {
      const btn = document.createElement('button');
      btn.type = 'button';
      const code = (lang.code || '').toLowerCase();
      const isActive = this.selectedTargetLangs.has(code);
      btn.className = `chip px-2.5 py-1 text-xs font-mono-code font-bold uppercase rounded cursor-pointer transition ${isActive ? 'active' : ''}`;
      btn.dataset.code = code;
      btn.innerHTML = `${lang.name} <span class="text-[10px] opacity-75">${code.toUpperCase()}</span>`;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(true);
        if (this.selectedTargetLangs.has(code)) {
          this.selectedTargetLangs.delete(code);
          btn.classList.remove('active');
        } else {
          this.selectedTargetLangs.add(code);
          btn.classList.add('active');
        }
      });

      container.appendChild(btn);
    }
  },

  bindEvents() {
    const btnClose = document.getElementById('btn-close-bulk-modal');
    if (btnClose && !btnClose._bound) {
      btnClose._bound = true;
      btnClose.addEventListener('click', () => {
        if (typeof AudioEngine !== 'undefined') AudioEngine.playMechanicalClick(false);
        this.close();
      });
    }

    const fileInput = document.getElementById('bulk-file-input');
    const rawTextEl = document.getElementById('bulk-raw-text');
    const btnClearFile = document.getElementById('btn-clear-file');
    const btnClearText = document.getElementById('btn-clear-raw-text');

    if (fileInput && !fileInput._bound) {
      fileInput._bound = true;
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          if (btnClearFile) btnClearFile.classList.remove('hidden');
          if (rawTextEl) rawTextEl.value = '';
          if (btnClearText) btnClearText.classList.add('hidden');
        } else {
          if (btnClearFile) btnClearFile.classList.add('hidden');
        }
      });
    }

    if (btnClearFile && !btnClearFile._bound) {
      btnClearFile._bound = true;
      btnClearFile.addEventListener('click', () => {
        if (fileInput) fileInput.value = '';
        btnClearFile.classList.add('hidden');
      });
    }

    if (rawTextEl && !rawTextEl._bound) {
      rawTextEl._bound = true;
      rawTextEl.addEventListener('input', () => {
        if (rawTextEl.value.trim().length > 0) {
          if (btnClearText) btnClearText.classList.remove('hidden');
          if (fileInput && fileInput.value) {
            fileInput.value = '';
            if (btnClearFile) btnClearFile.classList.add('hidden');
          }
        } else {
          if (btnClearText) btnClearText.classList.add('hidden');
        }
      });
    }

    if (btnClearText && !btnClearText._bound) {
      btnClearText._bound = true;
      btnClearText.addEventListener('click', () => {
        if (rawTextEl) rawTextEl.value = '';
        btnClearText.classList.add('hidden');
      });
    }

    const btnAnalyzeText = document.getElementById('btn-analyze-text');
    if (btnAnalyzeText && !btnAnalyzeText._bound) {
      btnAnalyzeText._bound = true;
      btnAnalyzeText.addEventListener('click', () => this.analyzeTextOrFile());
    }

    const btnSelectAll = document.getElementById('btn-select-all-candidates');
    const btnDeselectAll = document.getElementById('btn-deselect-all-candidates');
    if (btnSelectAll && !btnSelectAll._bound) {
      btnSelectAll._bound = true;
      btnSelectAll.addEventListener('click', () => {
        this.selectedCandidates = new Set(this.candidates.map((c) => c.text));
        this.renderCandidateChips();
      });
    }
    if (btnDeselectAll && !btnDeselectAll._bound) {
      btnDeselectAll._bound = true;
      btnDeselectAll.addEventListener('click', () => {
        this.selectedCandidates.clear();
        this.renderCandidateChips();
      });
    }

    const radioNew = document.getElementById('bulk-dest-new');
    const radioAppend = document.getElementById('bulk-dest-append');
    const nameRow = document.getElementById('bulk-new-pack-name-row');
    const existingRow = document.getElementById('bulk-existing-pack-row');
    const langsSection = document.getElementById('bulk-languages-section');

    const updateDestMode = () => {
      const isNew = radioNew && radioNew.checked;
      if (nameRow) {
        if (isNew) nameRow.classList.remove('hidden');
        else nameRow.classList.add('hidden');
      }
      if (existingRow) {
        if (isNew) existingRow.classList.add('hidden');
        else {
          existingRow.classList.remove('hidden');
          this.populatePacksDropdown();
        }
      }
      if (langsSection) {
        if (isNew) langsSection.classList.remove('hidden');
        else langsSection.classList.add('hidden');
      }
    };
    if (radioNew) radioNew.addEventListener('change', updateDestMode);
    if (radioAppend) radioAppend.addEventListener('change', updateDestMode);

    const btnSynthesize = document.getElementById('btn-bulk-synthesize');
    if (btnSynthesize && !btnSynthesize._bound) {
      btnSynthesize._bound = true;
      btnSynthesize.addEventListener('click', () => this.startSynthesis());
    }
  },

  async analyzeTextOrFile() {
    const fileInput = document.getElementById('bulk-file-input');
    const rawTextEl = document.getElementById('bulk-raw-text');
    const mode = this.dropdowns?.textMode
      ? this.dropdowns.textMode.getValue()
      : 'words';
    const limit = this.getCandidateLimit();
    const stopwordsCheck = document.getElementById('bulk-filter-stopwords');
    const filterStopwords = stopwordsCheck ? stopwordsCheck.checked : true;

    const rawText = rawTextEl ? rawTextEl.value.trim() : '';
    const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

    if (!rawText && !hasFile) {
      if (window.ThemedModal) window.ThemedModal.alert('Please paste text or select a .txt/.epub file.', 'INPUT REQUIRED');
      return;
    }

    try {
      let res = null;
      if (rawText) {
        res = await API.analyzeCorpusText(rawText, mode, limit > 5000 ? 'ALL' : limit, filterStopwords, 3);
      } else if (hasFile) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('mode', mode);
        formData.append('top_n', limit > 5000 ? 'ALL' : String(limit));
        formData.append('filter_stopwords', String(filterStopwords));
        res = await API.analyzeCorpusFile(formData);
      }

      this.candidates = res.candidates || [];
      this.selectedCandidates = new Set(this.candidates.map((c) => c.text));
      this.renderCandidateChips();
      if (typeof AudioEngine !== 'undefined') AudioEngine.playPayloadChime();
    } catch (err) {
      if (window.ThemedModal) window.ThemedModal.alert(`Analysis failed: ${err.message}`, 'ERROR');
    }
  },

  renderCandidateChips() {
    const container = document.getElementById('bulk-candidates-container');
    const summary = document.getElementById('bulk-candidate-summary');
    if (!container) return;

    if (summary) {
      summary.textContent = `${this.selectedCandidates.size} OF ${this.candidates.length} CANDIDATES SELECTED`;
    }

    if (this.candidates.length === 0) {
      container.innerHTML = '<span class="text-zinc-600 text-xs p-2">Extract candidates above to preview here.</span>';
      return;
    }

    container.innerHTML = '';
    for (const c of this.candidates) {
      const isSelected = this.selectedCandidates.has(c.text);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chip px-2.5 py-1.5 text-xs font-mono-code rounded cursor-pointer transition ${
        isSelected ? 'active' : 'bg-surface text-zinc-400 border border-theme'
      }`;
      chip.innerHTML = `<span>${c.text}</span> ${c.frequency > 1 ? `<span class="opacity-60 text-[10px] ml-1">×${c.frequency}</span>` : ''}`;
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.selectedCandidates.has(c.text)) {
          this.selectedCandidates.delete(c.text);
        } else {
          this.selectedCandidates.add(c.text);
        }
        this.renderCandidateChips();
      });
      container.appendChild(chip);
    }
  },

  async startSynthesis() {
    const selectedPhrases = Array.from(this.selectedCandidates);
    if (selectedPhrases.length === 0) {
      if (window.ThemedModal) window.ThemedModal.alert('Please select at least 1 phrase or word to synthesize.', 'NO CANDIDATES');
      return;
    }

    const radioNew = document.getElementById('bulk-dest-new');
    const isNew = radioNew && radioNew.checked;
    let bundleId = null;
    let bundleName = null;

    if (!isNew) {
      const selectedPackId = this.dropdowns.destPack ? this.dropdowns.destPack.getValue() : null;
      const allBundles = (window.BundlesController && window.BundlesController.bundles) || [];
      const targetBundle = allBundles.find((b) => b.id === selectedPackId);
      if (!targetBundle) {
        if (window.ThemedModal) window.ThemedModal.alert('Please select an existing pack to append to.', 'NO PACK SELECTED');
        return;
      }
      bundleId = targetBundle.id;
      bundleName = targetBundle.name;
    } else {
      const nameInput = document.getElementById('bulk-new-pack-name');
      bundleName = nameInput ? nameInput.value.trim() : '';
      if (!bundleName) {
        if (window.ThemedModal) window.ThemedModal.alert('Please provide a name for the new vocabulary cassette.', 'CASSETTE NAME REQUIRED');
        return;
      }
    }

    let targetLanguages = [];
    if (isNew) {
      targetLanguages = Array.from(this.selectedTargetLangs);
      if (targetLanguages.length < 2) {
        if (window.ThemedModal) window.ThemedModal.alert('Please select at least 2 languages (e.g. English + Dutch).', 'LANGUAGES REQUIRED');
        return;
      }
    } else {
      const allBundles = (window.BundlesController && window.BundlesController.bundles) || [];
      const targetBundle = allBundles.find((b) => b.id === bundleId);
      targetLanguages = targetBundle ? targetBundle.languages : [];
      if (!targetLanguages || targetLanguages.length === 0) {
        if (window.ThemedModal) window.ThemedModal.alert('Selected pack has no configured languages.', 'ERROR');
        return;
      }
    }

    const formContainer = document.getElementById('bulk-form-container');
    const telemetry = document.getElementById('bulk-synthesis-telemetry');
    const synthBtn = document.getElementById('btn-bulk-synthesize');

    if (formContainer) formContainer.classList.add('hidden');
    if (telemetry) telemetry.classList.remove('hidden');
    if (synthBtn) synthBtn.disabled = true;

    try {
      const randomStyle = isNew ? getRandomStyleIndex() : null;
      const res = await API.bulkGenerateBundle(
        isNew ? bundleName : null,
        isNew ? null : bundleId,
        targetLanguages,
        'en',
        selectedPhrases,
        randomStyle
      );

      this.activeTaskId = res.task_id;
      this.pollProgress(res.task_id, res.bundle_id);
    } catch (err) {
      this.resetTelemetry();
      if (window.ThemedModal) window.ThemedModal.alert(`Failed to start bulk synthesis: ${err.message}`, 'SYNTHESIS ERROR');
    }
  },

  pollProgress(taskId, bundleId) {
    if (this.pollTimer) clearInterval(this.pollTimer);

    const bar = document.getElementById('bulk-telemetry-bar');
    const countEl = document.getElementById('bulk-telemetry-count');
    const phraseEl = document.getElementById('bulk-telemetry-phrase');
    const percentEl = document.getElementById('bulk-telemetry-percent');
    const statusEl = document.getElementById('bulk-telemetry-status');

    this.pollTimer = setInterval(async () => {
      try {
        const task = await API.getBulkTaskProgress(taskId);

        if (task.status === 'completed') {
          clearInterval(this.pollTimer);
          this.pollTimer = null;
          if (bar) {
            bar.style.width = '100%';
            bar.style.backgroundColor = 'var(--color-success)';
          }
          if (countEl) countEl.textContent = `[${task.total_items} / ${task.total_items}]`;
          if (percentEl) percentEl.textContent = '100%';
          if (phraseEl) phraseEl.textContent = 'Complete';
          if (statusEl) statusEl.textContent = 'SYNTHESIS COMPLETE';
          if (typeof AudioEngine !== 'undefined') AudioEngine.playPayloadChime();

          setTimeout(async () => {
            this.close();
            if (window.BundlesController) {
              const targetId = task.bundle_id || bundleId;
              await window.BundlesController.loadBundles(targetId);
              if (targetId) {
                await window.BundlesController.loadBundle(targetId);
              }
            }
            if (window.ThemedModal) {
              const skipped = task.skipped_duplicates > 0 ? ` (${task.skipped_duplicates} duplicate phrases skipped)` : '';
              window.ThemedModal.alert(
                `Successfully synthesized ${task.total_items} items across all target languages${skipped}.`,
                'PACK READY'
              );
            }
          }, 600);
        } else if (task.status === 'failed') {
          clearInterval(this.pollTimer);
          this.pollTimer = null;
          if (statusEl) {
            statusEl.textContent = 'SYNTHESIS FAILED';
            statusEl.className = 'font-bold text-danger';
          }
          if (phraseEl) phraseEl.textContent = task.error || 'Unknown error occurred.';
        } else {
          const pct = Math.max(0, Math.min(100, Number(task.progress_percent) || 0));
          if (bar) {
            bar.style.width = `${pct}%`;
            bar.style.backgroundColor = 'var(--color-success)';
          }
          if (countEl) countEl.textContent = `[${task.processed_items} / ${task.total_items}]`;
          if (percentEl) percentEl.textContent = `${pct}%`;
          if (phraseEl) phraseEl.textContent = task.current_phrase ? `Translating: "${task.current_phrase}"` : 'Processing chunk...';
        }
      } catch (_) {}
    }, 600);
  },
};

window.BulkGeneratorController = BulkGeneratorController;

