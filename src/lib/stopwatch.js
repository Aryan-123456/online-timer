import { buildOverlay, openFullscreen, setOnClose } from './fullscreen.js';
import { showTimerDialog } from './dialog.js';

export function initStopwatch() {
  const display = document.getElementById('sw-display');
  const startBtn = document.getElementById('sw-start');
  const lapBtn = document.getElementById('sw-lap');
  const resetBtn = document.getElementById('sw-reset');
  const lapsContainer = document.getElementById('sw-laps');
  const fsBtn = document.getElementById('sw-fullscreen');

  let ms = 0;
  let isRunning = false;
  let interval = null;
  let lapCount = 0;
  let lastLapTime = 0;
  let fsOverlay = null;
  let fsContentEl = null;
  let fsLapsEl = null;

  function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  }

  function formatLapTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  }

  function updateDisplay() {
    const text = formatTime(ms);
    if (display) display.textContent = text;
    if (fsContentEl) {
      const fsTime = fsContentEl.querySelector('.fs-time');
      if (fsTime) fsTime.textContent = text;
    }
  }

  function tick() {
    ms += 10;
    updateDisplay();
  }

  function start() {
    if (!isRunning) {
      isRunning = true;
      interval = setInterval(tick, 10);
      if (startBtn) {
        startBtn.textContent = 'Pause';
        startBtn.classList.remove('bg-ink');
        startBtn.classList.add('bg-warning', 'text-ink');
      }
      if (lapBtn) lapBtn.disabled = false;
      if (fsContentEl) {
        const fsToggle = fsContentEl.querySelector('.fs-toggle');
        if (fsToggle) fsToggle.textContent = 'Pause';
      }
    }
  }

  function pause() {
    if (isRunning) {
      isRunning = false;
      clearInterval(interval);
      interval = null;
      if (startBtn) {
        startBtn.textContent = 'Resume';
        startBtn.classList.add('bg-ink');
        startBtn.classList.remove('bg-warning', 'text-ink');
      }
      if (fsContentEl) {
        const fsToggle = fsContentEl.querySelector('.fs-toggle');
        if (fsToggle) fsToggle.textContent = 'Resume';
      }
    }
  }

  function reset() {
    pause();
    ms = 0;
    lapCount = 0;
    lastLapTime = 0;
    updateDisplay();
    if (startBtn) {
      startBtn.textContent = 'Start';
      startBtn.classList.add('bg-ink');
      startBtn.classList.remove('bg-warning', 'text-ink');
    }
    if (lapBtn) lapBtn.disabled = true;
    if (lapsContainer) lapsContainer.innerHTML = '';
    if (fsContentEl) {
      const fsToggle = fsContentEl.querySelector('.fs-toggle');
      if (fsToggle) fsToggle.textContent = 'Start';
      const fsLaps = fsContentEl.querySelector('.fs-laps');
      if (fsLaps) fsLaps.innerHTML = '';
    }
  }

  function lap() {
    if (!isRunning) return;
    lapCount++;
    const lapMs = ms - lastLapTime;
    lastLapTime = ms;
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between py-2 px-4 border-b border-hairline text-sm';
    row.innerHTML = `
      <span class="text-mute font-mono">Lap ${lapCount}</span>
      <span class="text-ink font-mono font-medium">${formatLapTime(lapMs)}</span>
      <span class="text-ink font-mono">${formatTime(ms)}</span>
    `;
    if (lapsContainer) lapsContainer.appendChild(row);

    if (fsContentEl) {
      const fsLaps = fsContentEl.querySelector('.fs-laps');
      if (fsLaps) {
        const fsRow = document.createElement('div');
        fsRow.style.cssText = 'display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid #2a2a2a; font-size: 14px;';
        fsRow.innerHTML = `
          <span style="color:#666;font-family:'JetBrains Mono',monospace">Lap ${lapCount}</span>
          <span style="color:#ededed;font-family:'JetBrains Mono',monospace;font-weight:500">${formatLapTime(lapMs)}</span>
          <span style="color:#ededed;font-family:'JetBrains Mono',monospace">${formatTime(ms)}</span>
        `;
        fsLaps.appendChild(fsRow);
      }
    }
  }

  function openDialog() {
    if (isRunning) return;
    if (!display) return;
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    showTimerDialog({
      title: 'Set Starting Time',
      fields: [
        { label: 'Minutes', value: min, max: 99, toSeconds: 60 },
        { label: 'Seconds', value: sec, max: 59, toSeconds: 1 },
      ],
      onConfirm: (totalSec) => {
        ms = totalSec * 1000;
        lastLapTime = ms;
        updateDisplay();
      },
    });
  }

  if (display) display.addEventListener('click', openDialog);

  function handleFsToggle() {
    if (isRunning) pause();
    else start();
  }

  function buildFsContent() {
    fsContentEl = document.createElement('div');
    fsContentEl.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%;';

    const time = document.createElement('div');
    time.className = 'fs-time';
    time.textContent = formatTime(ms);
    time.style.cssText = 'font-size: clamp(4rem, 18vw, 10rem); font-weight: 600; color: #ededed; font-family: "JetBrains Mono", monospace; letter-spacing: -0.03em; line-height: 1.1;';
    fsContentEl.appendChild(time);

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; justify-content: center;';

    const fsToggleBtn = document.createElement('button');
    fsToggleBtn.className = 'fs-toggle';
    fsToggleBtn.textContent = startBtn?.textContent || 'Start';
    fsToggleBtn.style.cssText = `
      padding: 14px 36px; border-radius: 100px; min-height: 48px;
      background: #ededed; color: #171717;
      font-size: 16px; font-weight: 500; cursor: pointer;
      border: none; transition: opacity 0.15s;
    `;
    fsToggleBtn.addEventListener('mouseenter', () => { fsToggleBtn.style.opacity = '0.9'; });
    fsToggleBtn.addEventListener('mouseleave', () => { fsToggleBtn.style.opacity = '1'; });
    fsToggleBtn.addEventListener('click', handleFsToggle);
    controls.appendChild(fsToggleBtn);

    const fsLapBtn = document.createElement('button');
    fsLapBtn.textContent = 'Lap';
    fsLapBtn.style.cssText = `
      padding: 14px 28px; border-radius: 100px; min-height: 48px;
      background: transparent; color: #a1a1a1;
      font-size: 16px; font-weight: 500; cursor: pointer;
      border: 1px solid #3a3a3a; transition: background 0.15s, color 0.15s;
    `;
    fsLapBtn.addEventListener('mouseenter', () => { fsLapBtn.style.background = '#222'; fsLapBtn.style.color = '#ededed'; });
    fsLapBtn.addEventListener('mouseleave', () => { fsLapBtn.style.background = 'transparent'; fsLapBtn.style.color = '#a1a1a1'; });
    fsLapBtn.addEventListener('click', lap);
    controls.appendChild(fsLapBtn);

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
    fsResetBtn.addEventListener('click', reset);
    controls.appendChild(fsResetBtn);

    fsContentEl.appendChild(controls);

    fsLapsEl = document.createElement('div');
    fsLapsEl.className = 'fs-laps';
    fsLapsEl.style.cssText = 'width: 100%; max-height: 200px; overflow-y: auto; margin-top: 8px; border-top: 1px solid #2a2a2a; padding-top: 8px;';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; padding: 4px 12px 8px; font-size: 11px; color: #666; font-family: "JetBrains Mono", monospace; text-transform: uppercase; letter-spacing: 1px;';
    header.innerHTML = '<span>Lap</span><span>Lap Time</span><span>Total Time</span>';
    fsLapsEl.appendChild(header);

    fsContentEl.appendChild(fsLapsEl);

    return fsContentEl;
  }

  function handleFullscreen() {
    if (fsOverlay) return;
    const { overlay, content } = buildOverlay();
    fsOverlay = overlay;
    setOnClose(() => {
      fsOverlay = null;
      fsContentEl = null;
      fsLapsEl = null;
    });
    overlay.querySelector('#fs-content').appendChild(buildFsContent());
    openFullscreen(overlay);
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (isRunning) pause();
      else start();
    });
  }
  if (lapBtn) lapBtn.addEventListener('click', lap);
  if (resetBtn) resetBtn.addEventListener('click', reset);
  if (fsBtn) fsBtn.addEventListener('click', handleFullscreen);
}
