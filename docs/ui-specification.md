# SUBSYSTEM SPEC: Retro Hardware Aesthetic & Frontend Interface

## 1. Aesthetic Profile
1970s/1980s Cassette Futurism, Industrial Computing, Amber/Green Phosphor CRT monitors, stamped hardware bezels, and mechanical switches.

### Operational Taxonomy
- *Source Input* -> `INCOMING CARRIER // RAW SIGNAL`
- *Language Selector* -> `FREQUENCY BAND // CIPHER CHANNEL`
- *Translate Action* -> `DECRYPT & SYNTHESIZE`
- *Target Output* -> `CLEARED COMMS // DECODED PAYLOAD`
- *Status Indices* -> Flank panels with technical brackets: `[REC-09]`, `STATUS: READY`, `SIGNAL LOCK: SOLID`.

---

## 2. Color Tokens & CSS Variables

Defined in `frontend/static/css/theme.css`:

```css
:root {
  --color-bg-base: #0A0C0E;
  --color-bg-surface: #16181F;
  --color-bg-panel: #101217;
  --color-bg-input: #0E0F12;
  --color-bg-terminal: #070B08;
  --color-bg-subtle: #14171B;

  --color-border: #2B303C;
  --color-border-subtle: #1E222B;
  --color-border-strong: #3D4454;
  --color-border-hover: #F59E0B;

  --color-primary: #FF4D00;
  --color-primary-hover: #FF6A26;
  --color-primary-glow: rgba(255, 77, 0, 0.35);

  --color-secondary: #FFB300;
  --color-secondary-hover: #FFC033;
  --color-secondary-glow: rgba(255, 179, 0, 0.35);

  --color-accent: #38BDF8;
  --color-accent-hover: #0EA5E9;

  --color-success: #4ADE80;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;

  --color-terminal-bg: #070B08;
  --color-terminal-text: #33FF77;
  --color-terminal-cyan: #2EE6D6;
  --color-terminal-amber: #FFB833;

  --color-text-main: #EDE8D0;
  --color-text-muted: #9CA3AF;
  --color-text-dim: #6B7280;

  --font-display: "Chakra Petch", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

---

## 3. CRT Display Pipeline (`frontend/static/css/crt.css`)

Wrap terminal text areas and translated outputs inside `.crt-viewport`:

```css
.crt-viewport {
  position: relative;
  background-color: var(--color-terminal-bg);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 0 25px rgba(0, 0, 0, 0.95), inset 0 0 6px rgba(0, 255, 100, 0.15);
  border: 3px solid var(--color-bg-subtle);
}

.crt-content {
  animation: crt-flicker 0.15s infinite;
  text-shadow: 0 0 4px rgba(51, 255, 119, 0.55), 0 0 8px rgba(51, 255, 119, 0.25);
  color: var(--color-terminal-text);
}
```

---

## 4. Hardware Component Classes

- `.btn`, `.btn-primary`, `.btn-action`, `.btn-secondary`, `.btn-danger`: Tactile 3D beveled pushbuttons.
- `.chip`: Language selection toggles with active indicator states.
- `.pack-card`: Cassette tape pack visual metaphors with animated spools.
- `.dropdown-trigger`, `.dropdown-popover`, `.dropdown-item`: Custom unified select widgets.
- `.hardware-screw`: Industrial screw detail ornaments for panel corners.
- `.spectrum-bar`: 5-band color spectrum accent bar.
- `.panel-accent`: Subtle top glowing edge highlight.
