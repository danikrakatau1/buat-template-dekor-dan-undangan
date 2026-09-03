import { EventBus } from './event-bus.js';
import { EngineStore } from './store.js';
import { Timeline } from './timeline.js';
import { createSceneObserver } from './observer.js';
import { BasicRenderer } from '../renderers/basic-renderer.js';

export class WeddingVisualEngine {
  constructor({ root }) {
    if (!root) throw new Error('WeddingVisualEngine requires a root element.');

    this.root = root;
    this.bus = new EventBus();
    this.store = new EngineStore();
    this.timeline = new Timeline({ reducedMotion: this.store.getState().reducedMotion });
    this.renderer = new BasicRenderer({ root, bus: this.bus, store: this.store });
    this.observer = createSceneObserver({
      onEnter: element => this.enterScene(element),
      onLeave: element => this.leaveScene(element)
    });
  }

  async load(url) {
    this.store.setState({ status: 'loading' });
    this.bus.emit('engine:loading', { url });

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load project: ${response.status}`);
    const project = await response.json();

    this.mount(project);
    return project;
  }

  mount(project) {
    this.store.setState({
      status: 'rendering',
      project,
      activeSceneId: project.scenes?.[0]?.id || null
    });

    this.renderer.renderProject(project);
    this.root.querySelectorAll('[data-scene-id]').forEach(scene => this.observer.observe(scene));
    this.bindTimeline(project);

    this.store.setState({ status: 'ready' });
    this.bus.emit('engine:ready', { project });
  }

  bindTimeline(project) {
    this.timeline.reset();
    const intro = project?.scenes?.find(scene => scene.type === 'cover')?.timeline || [];
    intro.forEach(step => {
      this.timeline.at(step.at || 0, () => {
        this.bus.emit('timeline:step', step);
        if (step.target) {
          const target = this.root.querySelector(`[data-layer-id="${step.target}"]`);
          target?.classList.add('timeline-active');
        }
      });
    });
  }

  playIntro() {
    this.bus.emit('intro:start');
    this.timeline.play();
  }

  enterScene(element) {
    element.classList.add('is-active');
    element.querySelectorAll('[data-motion]').forEach(layer => layer.classList.add('is-visible'));
    const sceneId = element.dataset.sceneId;
    this.store.setState({ activeSceneId: sceneId });
    this.bus.emit('scene:enter', { sceneId, element });
  }

  leaveScene(element) {
    element.classList.remove('is-active');
    this.bus.emit('scene:leave', { sceneId: element.dataset.sceneId, element });
  }

  destroy() {
    this.timeline.cancel();
    this.observer.disconnect();
    this.bus.clear();
    this.root.replaceChildren();
    this.store.setState({ status: 'destroyed', project: null, activeSceneId: null });
  }
}
