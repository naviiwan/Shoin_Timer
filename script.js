const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const setBtn = document.getElementById('set-btn');

const setPanel = document.getElementById('set-panel');
const closeSetPanelBtn = document.getElementById('close-set-panel');
const applySetBtn = document.getElementById('apply-set');
const resetSetBtn = document.getElementById('reset-set');
const setPanelHeader = document.getElementById('set-panel-header');

const hourSlider = document.getElementById('hour-slider');
const minuteSlider = document.getElementById('minute-slider');
const secondSlider = document.getElementById('second-slider');

const hourValue = document.getElementById('hour-value');
const minuteValue = document.getElementById('minute-value');
const secondValue = document.getElementById('second-value');

let elapsedMs = 0;
let startTime = 0;
let animationFrameId;
let isRunning = false;

function formatTime(ms) {
  const tenth = Math.floor(ms / 100) % 10;
  const totalSeconds = Math.floor(ms / 1000);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${tenth}`;
}

function render() {
  const currentElapsed = isRunning ? elapsedMs + (performance.now() - startTime) : elapsedMs;
  timeDisplay.textContent = formatTime(currentElapsed);

  if (isRunning) {
    animationFrameId = requestAnimationFrame(render);
  }
}

function startStopwatch() {
  if (isRunning) return;
  isRunning = true;
  startTime = performance.now();
  render();
}

function stopStopwatch() {
  if (!isRunning) return;
  elapsedMs += performance.now() - startTime;
  isRunning = false;
  cancelAnimationFrame(animationFrameId);
  render();
}

function toggleSetPanel() {
  setPanel.classList.toggle('hidden');
}

function syncSliderValues() {
  hourValue.textContent = hourSlider.value;
  minuteValue.textContent = minuteSlider.value;
  secondValue.textContent = secondSlider.value;
}

function setFromSliders() {
  const hours = Number(hourSlider.value);
  const minutes = Number(minuteSlider.value);
  const seconds = Number(secondSlider.value);
  elapsedMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
  startTime = performance.now();
  render();
}

function resetSetInputs() {
  hourSlider.value = '0';
  minuteSlider.value = '0';
  secondSlider.value = '0';
  syncSliderValues();
  elapsedMs = 0;
  startTime = performance.now();
  render();
}

[startBtn, stopBtn, setBtn, closeSetPanelBtn, applySetBtn, resetSetBtn].forEach((button) => {
  button.type = 'button';
});

startBtn.addEventListener('click', startStopwatch);
stopBtn.addEventListener('click', stopStopwatch);
setBtn.addEventListener('click', toggleSetPanel);
closeSetPanelBtn.addEventListener('click', () => setPanel.classList.add('hidden'));
applySetBtn.addEventListener('click', setFromSliders);
resetSetBtn.addEventListener('click', resetSetInputs);

[hourSlider, minuteSlider, secondSlider].forEach((slider) => {
  slider.addEventListener('input', syncSliderValues);
});

// ドラッグ移動
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

setPanelHeader.addEventListener('mousedown', (event) => {
  dragging = true;
  const rect = setPanel.getBoundingClientRect();
  dragOffsetX = event.clientX - rect.left;
  dragOffsetY = event.clientY - rect.top;
  setPanel.style.left = `${rect.left + window.scrollX}px`;
  setPanel.style.top = `${rect.top + window.scrollY}px`;
  setPanel.style.right = 'auto';
});

document.addEventListener('mousemove', (event) => {
  if (!dragging) return;
  setPanel.style.left = `${event.clientX + window.scrollX - dragOffsetX}px`;
  setPanel.style.top = `${event.clientY + window.scrollY - dragOffsetY}px`;
});

document.addEventListener('mouseup', () => {
  dragging = false;
});

syncSliderValues();
render();
