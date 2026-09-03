const scenes = [
  'Cover',
  'Couple',
  'Event',
  'Story',
  'Gallery',
  'RSVP',
  'Closing'
];

const sceneList = document.querySelector('#scene-list');
const previewFrame = document.querySelector('#preview-frame');
const autoCreate = document.querySelector('#auto-create');

scenes.forEach((name, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `scene-item${index === 0 ? ' active' : ''}`;
  button.textContent = `${String(index + 1).padStart(2, '0')}  ${name}`;
  button.addEventListener('click', () => {
    document.querySelectorAll('.scene-item').forEach(el => el.classList.remove('active'));
    button.classList.add('active');
  });
  sceneList.appendChild(button);
});

document.querySelectorAll('[data-device]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-device]').forEach(el => el.classList.remove('active'));
    button.classList.add('active');
    previewFrame.className = `preview-frame ${button.dataset.device}`;
  });
});

autoCreate.addEventListener('click', () => {
  autoCreate.textContent = 'Generator arrives at Stage #9';
  setTimeout(() => autoCreate.textContent = 'Auto Create', 1800);
});

console.info('[Wedding Template Studio] Stage #1 foundation booted.');
