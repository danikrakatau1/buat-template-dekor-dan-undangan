export class DecorMotionController {
  constructor({ root, store, bus }) {
    this.root = root;
    this.store = store;
    this.bus = bus;
    this.raf = 0;
    this.pointer = { x: 0, y: 0 };
    this.boundPointer = event => this.onPointer(event);
    this.boundScroll = () => this.schedule();
  }

  start() {
    this.root.addEventListener('pointermove', this.boundPointer, { passive: true });
    this.root.addEventListener('scroll', this.boundScroll, { passive: true });
    this.schedule();
  }

  onPointer(event) {
    const rect = this.root.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - .5) * 2;
    this.pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - .5) * 2;
    this.schedule();
  }

  schedule() {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.render();
    });
  }

  render() {
    if (this.store.getState().reducedMotion) return;
    const rootRect = this.root.getBoundingClientRect();
    this.root.querySelectorAll('[data-parallax]').forEach(el => {
      const depth = Number(el.dataset.parallax || 0);
      const scene = el.closest('.engine-scene');
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2) - (rootRect.top + rootRect.height / 2);
      const scrollY = Math.max(-1, Math.min(1, centerOffset / Math.max(rootRect.height, 1)));
      const x = this.pointer.x * depth * 22;
      const y = (-scrollY * depth * 44) + this.pointer.y * depth * 10;
      el.style.setProperty('--parallax-x', `${x.toFixed(2)}px`);
      el.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
    });
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.root.removeEventListener('pointermove', this.boundPointer);
    this.root.removeEventListener('scroll', this.boundScroll);
  }
}
