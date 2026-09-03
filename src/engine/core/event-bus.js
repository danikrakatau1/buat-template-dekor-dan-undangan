export class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(name, handler) {
    if (!this.events.has(name)) this.events.set(name, new Set());
    this.events.get(name).add(handler);
    return () => this.off(name, handler);
  }

  once(name, handler) {
    const unsubscribe = this.on(name, payload => {
      unsubscribe();
      handler(payload);
    });
    return unsubscribe;
  }

  off(name, handler) {
    this.events.get(name)?.delete(handler);
  }

  emit(name, payload) {
    this.events.get(name)?.forEach(handler => handler(payload));
  }

  clear(name) {
    if (name) this.events.delete(name);
    else this.events.clear();
  }
}
