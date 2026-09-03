export class EngineStore {
  constructor(initialState = {}) {
    this.state = {
      status: 'boot',
      activeSceneId: null,
      reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
      project: null,
      ...initialState
    };
    this.listeners = new Set();
  }

  getState() {
    return structuredClone(this.state);
  }

  setState(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(listener => listener(this.getState()));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
