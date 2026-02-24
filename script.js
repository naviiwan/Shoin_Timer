const modeTitle = document.getElementById('mode-title');
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const setBtn = document.getElementById('set-btn');
const resetBtn = document.getElementById('reset-btn');
const tabTimer = document.getElementById('tab-timer');
const tabStopwatch = document.getElementById('tab-stopwatch');

const setPanel = document.getElementById('set-panel');
const closeSetPanelBtn = document.getElementById('close-set-panel');
const applySetBtn = document.getElementById('apply-set');
const resetSetBtn = document.getElementById('reset-set');
const setPanelHeader = document.getElementById('set-panel-header');

const hourSlider = document.getElementById('hour-slider');
const minuteSlider = document.getElementById('minute-slider');
const secondSlider = document.getElementById('second-slider');
const hourInput = document.getElementById('hour-input');
const minuteInput = document.getElementById('minute-input');
const secondInput = document.getElementById('second-input');

let mode = 'timer';

let timerDurationMs = 0;
let timerRemainingMs = 0;
let timerEndTime = 0;
let timerRunning = false;

let swElapsedMs = 0;
let swStartTime = 0;
let swRunning = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatTime(ms) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function currentStopwatchMs() {
  return swRunning ? swElapsedMs + (performance.now() - swStartTime) : swElapsedMs;
}

function currentTimerMs() {
  if (!timerRunning) return timerRemainingMs;
  const left = timerEndTime - performance.now();
  if (left <= 0) {
    timerRunning = false;
    timerRemainingMs = 0;
    return 0;
  }
  return left;
}

function render() {
  const displayMs = mode === 'timer' ? currentTimerMs() : currentStopwatchMs();
  timeDisplay.textContent = formatTime(displayMs);
  requestAnimationFrame(render);
}

function startAction() {
  if (mode === 'timer') {
    if (timerRunning || timerRemainingMs <= 0) return;
    timerRunning = true;
    timerEndTime = performance.now() + timerRemainingMs;
    return;
  }

  if (swRunning) return;
  swRunning = true;
  swStartTime = performance.now();
}

function stopAction() {
  if (mode === 'timer') {
    if (!timerRunning) return;
    timerRemainingMs = Math.max(0, timerEndTime - performance.now());
    timerRunning = false;
    return;
  }

  if (!swRunning) return;
  swElapsedMs += performance.now() - swStartTime;
  swRunning = false;
}

function resetStopwatch() {
  swElapsedMs = 0;
  swStartTime = performance.now();
  swRunning = false;
}

function toggleSetPanel() {
  if (mode !== 'timer') return;
  setPanel.classList.toggle('hidden');
}

function syncControls() {
  hourInput.value = hourSlider.value;
  minuteInput.value = minuteSlider.value;
  secondInput.value = secondSlider.value;
}

function applyTimerSet() {
  const hours = Number(hourSlider.value);
  const minutes = Number(minuteSlider.value);
  const seconds = Number(secondSlider.value);
  timerDurationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
  timerRemainingMs = timerDurationMs;
  timerRunning = false;
}

function resetSetInputs() {
  hourSlider.value = '0';
  minuteSlider.value = '0';
  secondSlider.value = '0';
  syncControls();
  timerDurationMs = 0;
  timerRemainingMs = 0;
  timerRunning = false;
}

function bindInputAndSlider(inputEl, sliderEl, min, max) {
  sliderEl.addEventListener('input', () => {
    inputEl.value = sliderEl.value;
  });

  const syncFromInput = () => {
    const nextValue = clamp(Number(inputEl.value || '0'), min, max);
    inputEl.value = String(nextValue);
    sliderEl.value = String(nextValue);
  };

  inputEl.addEventListener('input', syncFromInput);
  inputEl.addEventListener('change', syncFromInput);
}

function switchMode(nextMode) {
  mode = nextMode;
  const timerMode = mode === 'timer';
  modeTitle.textContent = timerMode ? 'Shoin Timer' : 'Shoin Stop Watch';
  setBtn.classList.toggle('hidden', !timerMode);
  resetBtn.classList.toggle('hidden', timerMode);
  setPanel.classList.add('hidden');

  tabTimer.classList.toggle('active', timerMode);
  tabStopwatch.classList.toggle('active', !timerMode);
  tabTimer.setAttribute('aria-selected', String(timerMode));
  tabStopwatch.setAttribute('aria-selected', String(!timerMode));
}

[startBtn, stopBtn, setBtn, resetBtn, closeSetPanelBtn, applySetBtn, resetSetBtn, tabTimer, tabStopwatch].forEach((button) => {
  button.type = 'button';
});

startBtn.addEventListener('click', startAction);
stopBtn.addEventListener('click', stopAction);
setBtn.addEventListener('click', toggleSetPanel);
resetBtn.addEventListener('click', resetStopwatch);
closeSetPanelBtn.addEventListener('click', () => setPanel.classList.add('hidden'));
applySetBtn.addEventListener('click', applyTimerSet);
resetSetBtn.addEventListener('click', resetSetInputs);

tabTimer.addEventListener('click', () => switchMode('timer'));
tabStopwatch.addEventListener('click', () => switchMode('stopwatch'));

bindInputAndSlider(hourInput, hourSlider, 0, 99);
bindInputAndSlider(minuteInput, minuteSlider, 0, 59);
bindInputAndSlider(secondInput, secondSlider, 0, 59);

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

syncControls();
switchMode('timer');
render();
