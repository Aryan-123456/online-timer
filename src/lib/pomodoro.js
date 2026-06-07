import { buildOverlay, openFullscreen, setOnClose } from './fullscreen.js';
import { showTimerDialog } from './dialog.js';

export function initPomodoro() {
  const display = document.getElementById('pomo-display');
  const startBtn = document.getElementById('pomo-start');
  const resetBtn = document.getElementById('pomo-reset');
  const fsBtn = document.getElementById('pomo-fullscreen');

  let remainingSec = 0;
  let isRunning = false;
  let interval = null;
  let fsOverlay = null;
  let fsContentEl = null;

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateDisplay() {
    const text = formatTime(remainingSec);
    if (display) display.textContent = text;
    document.title = `${text} — Pomodoro Timer — Online Timer`;
    if (fsContentEl) {
      const fsTime = fsContentEl.querySelector('.fs-time');
      if (fsTime) fsTime.textContent = text;
    }
  }

  function tick() {
    remainingSec--;
    if (remainingSec <= 0) {
      remainingSec = 0;
      updateDisplay();
      clearInterval(interval);
      interval = null;
      isRunning = false;
      if (startBtn) startBtn.textContent = 'Finished!';
      document.title = 'Pomodoro Timer — Online Timer';
      if (fsContentEl) {
        const fsStart = fsContentEl.querySelector('.fs-start');
        if (fsStart) fsStart.textContent = 'Finished!';
      }
      return;
    }
    updateDisplay();
  }

  function start() {
    if (remainingSec <= 0) {
      const parts = display?.textContent?.split(':') || [];
      if (parts.length !== 2) return;
      const m = parseInt(parts[0]) || 0;
      const s = parseInt(parts[1]) || 0;
      const total = m * 60 + s;
      if (total <= 0) return;
      remainingSec = total;
      updateDisplay();
    }
    if (isRunning) {
      isRunning = false;
      clearInterval(interval);
      interval = null;
      if (startBtn) startBtn.textContent = 'Resume';
      if (fsContentEl) {
        const fsStart = fsContentEl.querySelector('.fs-start');
        if (fsStart) fsStart.textContent = 'Resume';
      }
      return;
    }
    isRunning = true;
    if (startBtn) startBtn.textContent = 'Pause';
    if (fsContentEl) {
      const fsStart = fsContentEl.querySelector('.fs-start');
      if (fsStart) fsStart.textContent = 'Pause';
    }
    interval = setInterval(tick, 1000);
  }

  function reset() {
    clearInterval(interval);
    interval = null;
    isRunning = false;
    remainingSec = 0;
    if (display) display.textContent = '25:00';
    if (startBtn) startBtn.textContent = 'Start';
    if (fsContentEl) {
      const fsStart = fsContentEl.querySelector('.fs-start');
      if (fsStart) fsStart.textContent = 'Start';
    }
    updateDisplay();
    document.title = 'Pomodoro Timer — Online Timer';
  }

  function openDialog() {
    if (isRunning) return;
    if (!display) return;
    const parts = display.textContent.split(':');
    showTimerDialog({
      title: 'Set Focus Time',
      fields: [
        { label: 'Minutes', value: parseInt(parts[0]) || 25, max: 120, toSeconds: 60 },
        { label: 'Seconds', value: parseInt(parts[1]) || 0, max: 59, toSeconds: 1 },
      ],
      onConfirm: (totalSec) => {
        remainingSec = totalSec;
        updateDisplay();
      },
    });
  }

  if (display) display.addEventListener('click', openDialog);

  function handleFsStart() {
    start();
  }

  function handleFsReset() {
    reset();
  }

  function buildFsContent() {
    fsContentEl = document.createElement('div');
    fsContentEl.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%;';

    const time = document.createElement('div');
    time.className = 'fs-time';
    time.textContent = formatTime(remainingSec);
    time.style.cssText = 'font-size: clamp(4rem, 18vw, 10rem); font-weight: 600; color: #ededed; font-family: "JetBrains Mono", monospace; letter-spacing: -0.03em; line-height: 1.1;';
    fsContentEl.appendChild(time);

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; justify-content: center;';

    const fsStartBtn = document.createElement('button');
    fsStartBtn.className = 'fs-start';
    fsStartBtn.textContent = startBtn?.textContent || 'Start';
    fsStartBtn.style.cssText = `
      padding: 14px 36px; border-radius: 100px; min-height: 48px;
      background: #ededed; color: #171717;
      font-size: 16px; font-weight: 500; cursor: pointer;
      border: none; transition: opacity 0.15s;
    `;
    fsStartBtn.addEventListener('mouseenter', () => { fsStartBtn.style.opacity = '0.9'; });
    fsStartBtn.addEventListener('mouseleave', () => { fsStartBtn.style.opacity = '1'; });
    fsStartBtn.addEventListener('click', handleFsStart);
    controls.appendChild(fsStartBtn);

    const fsResetBtn = document.createElement('button');
    fsResetBtn.textContent = 'Reset';
    fsResetBtn.style.cssText = `
      padding: 14px 28px; border-radius: 100px; min-height: 48px;
      background: transparent; color: #a1a1a1;
      font-size: 16px; font-weight: 500; cursor: pointer;
      border: 1px solid #3a3a3a; transition: background 0.15s, color 0.15s;
    `;
    fsResetBtn.addEventListener('mouseenter', () => { fsResetBtn.style.background = '#222'; fsResetBtn.style.color = '#ededed'; });
    fsResetBtn.addEventListener('mouseleave', () => { fsResetBtn.style.background = 'transparent'; fsResetBtn.style.color = '#a1a1a1'; });
    fsResetBtn.addEventListener('click', handleFsReset);
    controls.appendChild(fsResetBtn);

    fsContentEl.appendChild(controls);
    return fsContentEl;
  }

  function handleFullscreen() {
    if (fsOverlay) return;
    const { overlay, content } = buildOverlay();
    fsOverlay = overlay;
    setOnClose(() => {
      fsOverlay = null;
      fsContentEl = null;
    });
    overlay.querySelector('#fs-content').appendChild(buildFsContent());
    openFullscreen(overlay);
  }

  if (startBtn) startBtn.addEventListener('click', start);
  if (resetBtn) resetBtn.addEventListener('click', reset);
  if (fsBtn) fsBtn.addEventListener('click', handleFullscreen);

  if (remainingSec <= 0) {
    remainingSec = 25 * 60;
    updateDisplay();
  }
}
