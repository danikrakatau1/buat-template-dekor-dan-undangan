export class Timeline {
  constructor({ reducedMotion = false } = {}) {
    this.steps = [];
    this.timers = new Set();
    this.reducedMotion = reducedMotion;
  }

  at(ms, callback) {
    this.steps.push({ ms: Math.max(0, Number(ms) || 0), callback });
    return this;
  }

  play() {
    this.cancel();
    const factor = this.reducedMotion ? 0 : 1;
    [...this.steps]
      .sort((a, b) => a.ms - b.ms)
      .forEach(step => {
        const timer = window.setTimeout(() => {
          this.timers.delete(timer);
          step.callback?.();
        }, step.ms * factor);
        this.timers.add(timer);
      });
    return this;
  }

  cancel() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    return this;
  }

  reset() {
    this.cancel();
    this.steps = [];
    return this;
  }
}
