export function createSceneObserver({ onEnter, onLeave } = {}) {
  if (!('IntersectionObserver' in window)) {
    return {
      observe(element) { onEnter?.(element); },
      unobserve() {},
      disconnect() {}
    };
  }

  return new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) onEnter?.(entry.target, entry);
      else onLeave?.(entry.target, entry);
    });
  }, {
    threshold: [0, 0.2, 0.55],
    rootMargin: '8% 0px 8% 0px'
  });
}
