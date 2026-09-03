const MOTION_PRESETS = Object.freeze({
  'fade-in': { enter: { opacity: 0 }, visible: { opacity: 1 } },
  'fade-up': { enter: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } },
  'fade-down': { enter: { opacity: 0, y: -28 }, visible: { opacity: 1, y: 0 } },
  'fade-left': { enter: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } },
  'fade-right': { enter: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } },
  'zoom-in': { enter: { opacity: 0, scale: .94 }, visible: { opacity: 1, scale: 1 } },
  'clip-up': { enter: { opacity: 0, y: 32, clip: 'inset(100% 0 0 0)' }, visible: { opacity: 1, y: 0, clip: 'inset(0 0 0 0)' } },
  'rise-soft': { enter: { opacity: 0, y: 42, scale: .97 }, visible: { opacity: 1, y: 0, scale: 1 } },
  'zoom-soft': { enter: { opacity: 0, scale: .92 }, visible: { opacity: 1, scale: 1 } }
});

function setVars(el, values = {}) {
  if (values.x != null) el.style.setProperty('--motion-x', `${values.x}px`);
  if (values.y != null) el.style.setProperty('--motion-y', `${values.y}px`);
  if (values.scale != null) el.style.setProperty('--motion-scale', values.scale);
  if (values.opacity != null) el.style.setProperty('--motion-opacity', values.opacity);
  if (values.clip) el.style.setProperty('--motion-clip', values.clip);
}

export class MotionController {
  constructor({ root, store, bus }) {
    this.root = root;
    this.store = store;
    this.bus = bus;
  }

  prepare() {
    this.root.querySelectorAll('[data-motion]').forEach(el => {
      const preset = MOTION_PRESETS[el.dataset.motion] || MOTION_PRESETS['fade-in'];
      setVars(el, preset.enter);
      el.classList.add('motion-ready');
    });
  }

  revealWithin(scope) {
    const reduced = this.store.getState().reducedMotion;
    scope.querySelectorAll('[data-motion]').forEach(el => {
      const preset = MOTION_PRESETS[el.dataset.motion] || MOTION_PRESETS['fade-in'];
      if (reduced) {
        el.classList.add('is-visible');
        return;
      }
      requestAnimationFrame(() => {
        setVars(el, preset.visible);
        el.classList.add('is-visible');
      });
    });
  }

  replay(scope = this.root) {
    scope.querySelectorAll('[data-motion]').forEach(el => {
      const preset = MOTION_PRESETS[el.dataset.motion] || MOTION_PRESETS['fade-in'];
      el.classList.remove('is-visible', 'timeline-active');
      setVars(el, preset.enter);
    });
    requestAnimationFrame(() => this.revealWithin(scope));
    this.bus.emit('motion:replay', { scope });
  }
}

export { MOTION_PRESETS };
