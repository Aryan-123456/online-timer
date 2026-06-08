import { buildOverlay, openFullscreen, setOnClose } from './fullscreen.js';
import { showTimerDialog } from './dialog.js';

export function initCountdown() {
  const display = document.getElementById('countdown-display');
  const startBtn = document.getElementById('countdown-start');
  const resetBtn = document.getElementById('countdown-reset');
  const shareBtn = document.getElementById('countdown-share');
  const shareUrl = document.getElementById('share-url');
  const progressRing = document.getElementById('countdown-progress');
  const fsBtn = document.getElementById('countdown-fullscreen');

  let totalMs = 0;
  let remainingMs = 0;
  let isRunning = false;
  let isPaused = false;
  let interval = null;
  let initialMs = 0;
  let fsOverlay = null;
  let fsContentEl = null;

  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function setTimeFromMs(ms) {
    totalMs = ms;
    remainingMs = ms;
    initialMs = ms;
    updateDisplay();
  }

  function updateDisplay() {
    const text = formatTime(remainingMs);
    if (display) display.textContent = text;
    if (progressRing) {
      if (initialMs > 0) {
        const pct = (remainingMs / initialMs) * 283;
        progressRing.style.strokeDashoffset = String(pct);
      } else {
        progressRing.style.strokeDashoffset = '283';
      }
    }
    if (fsContentEl) {
      const fsTime = fsContentEl.querySelector('.fs-time');
      if (fsTime) fsTime.textContent = text;
      const fsRing = fsContentEl.querySelector('.fs-progress');
      if (fsRing) {
        if (initialMs > 0) {
          const pct = (remainingMs / initialMs) * 283;
          fsRing.style.strokeDashoffset = String(pct);
        } else {
          fsRing.style.strokeDashoffset = '283';
        }
      }
    }
  }

  function tick() {
    remainingMs -= 100;
    if (remainingMs <= 0) {
      remainingMs = 0;
      clearInterval(interval);
      interval = null;
      isRunning = false;
      if (display) display.classList.add('text-error');
      if (startBtn) startBtn.textContent = 'Finished!';
      if (fsContentEl) {
        const fsStart = fsContentEl.querySelector('.fs-start');
        if (fsStart) fsStart.textContent = 'Finished!';
      }
      updateDisplay();
      return;
    }
    updateDisplay();
  }

  function start() {
    if (remainingMs <= 0) {
      const parts = display?.textContent?.split(':') || [];
      if (parts.length !== 3) return;
      const sec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      if (sec <= 0) { openDialog(); return; }
      setTimeFromMs(sec * 1000);
    }
    if (isRunning) {
      clearInterval(interval);
      interval = null;
      isRunning = false;
      isPaused = true;
      if (startBtn) startBtn.textContent = 'Resume';
      if (fsContentEl) {
        const fsStart = fsContentEl.querySelector('.fs-start');
        if (fsStart) fsStart.textContent = 'Resume';
      }
      return;
    }
    isRunning = true;
    isPaused = false;
    if (display) display.classList.remove('text-error');
    if (startBtn) startBtn.textContent = 'Pause';
    if (fsContentEl) {
      const fsStart = fsContentEl.querySelector('.fs-start');
      if (fsStart) fsStart.textContent = 'Pause';
    }
    interval = setInterval(tick, 100);
  }

  function reset() {
    clearInterval(interval);
    interval = null;
    isRunning = false;
    isPaused = false;
    remainingMs = 0;
    initialMs = 0;
    if (display) display.textContent = '00:00:00';
    if (display) display.classList.remove('text-error');
    if (startBtn) startBtn.textContent = 'Start';
    if (fsContentEl) {
      const fsStart = fsContentEl.querySelector('.fs-start');
      if (fsStart) fsStart.textContent = 'Start';
    }
    updateDisplay();
    if (shareUrl) shareUrl.classList.add('hidden');
  }

  function openDialog() {
    if (isRunning || isPaused) return;
    if (!display) return;
    const parts = display.textContent.split(':');
    showTimerDialog({
      title: 'Set Countdown',
      fields: [
        { label: 'Hours', value: parseInt(parts[0]) || 0, max: 99, toSeconds: 3600 },
        { label: 'Minutes', value: parseInt(parts[1]) || 0, max: 59, toSeconds: 60 },
        { label: 'Seconds', value: parseInt(parts[2]) || 0, max: 59, toSeconds: 1 },
      ],
      onConfirm: (totalSec) => setTimeFromMs(totalSec * 1000),
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
    fsContentEl.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%;';

    const container = document.createElement('div');
    container.style.cssText = 'position: relative; display: inline-flex; align-items: center; justify-content: center;';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.style.cssText = 'transform: rotate(-90deg); width: clamp(200px, 60vmin, 500px); height: clamp(200px, 60vmin, 500px);';
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', '50');
    bgCircle.setAttribute('cy', '50');
    bgCircle.setAttribute('r', '45');
    bgCircle.setAttribute('fill', 'none');
    bgCircle.setAttribute('stroke', '#2a2a2a');
    bgCircle.setAttribute('stroke-width', '6');
    svg.appendChild(bgCircle);
    const fgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    fgCircle.setAttribute('cx', '50');
    fgCircle.setAttribute('cy', '50');
    fgCircle.setAttribute('r', '45');
    fgCircle.setAttribute('fill', 'none');
    fgCircle.setAttribute('stroke', '#ededed');
    fgCircle.setAttribute('stroke-width', '6');
    fgCircle.setAttribute('stroke-linecap', 'round');
    fgCircle.setAttribute('stroke-dasharray', '283');
    fgCircle.setAttribute('stroke-dashoffset', '283');
    fgCircle.classList.add('fs-progress');
    fgCircle.style.cssText = 'transition: stroke-dashoffset 0.1s linear;';
    svg.appendChild(fgCircle);
    container.appendChild(svg);

    const time = document.createElement('div');
    time.className = 'fs-time';
    time.textContent = formatTime(remainingMs);
    time.style.cssText = 'position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: clamp(1.5rem, 5vw, 5rem); font-weight: 600; color: #ededed; font-family: "JetBrains Mono", monospace; letter-spacing: -0.03em; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; user-select: none;';
    time.addEventListener('click', openDialog);
    container.appendChild(time);

    fsContentEl.appendChild(container);

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
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    `;
    if (window.matchMedia('(hover: hover)').matches) {
      fsStartBtn.addEventListener('mouseenter', () => { fsStartBtn.style.opacity = '0.9'; });
      fsStartBtn.addEventListener('mouseleave', () => { fsStartBtn.style.opacity = '1'; });
    }
    fsStartBtn.addEventListener('click', handleFsStart);
    controls.appendChild(fsStartBtn);

    const fsResetBtn = document.createElement('button');
    fsResetBtn.textContent = 'Reset';
    fsResetBtn.style.cssText = `
      padding: 14px 28px; border-radius: 100px; min-height: 48px;
      background: transparent; color: #a1a1a1;
      font-size: 16px; font-weight: 500; cursor: pointer;
      border: 1px solid #3a3a3a; transition: background 0.15s, color 0.15s;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    `;
    if (window.matchMedia('(hover: hover)').matches) {
      fsResetBtn.addEventListener('mouseenter', () => { fsResetBtn.style.background = '#222'; fsResetBtn.style.color = '#ededed'; });
      fsResetBtn.addEventListener('mouseleave', () => { fsResetBtn.style.background = 'transparent'; fsResetBtn.style.color = '#a1a1a1'; });
    }
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

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const sec = totalMs > 0 ? Math.floor(totalMs / 1000) : 0;
      if (sec <= 0) return;
      const url = new URL(window.location.href);
      url.searchParams.set('t', String(sec));
      const urlStr = url.toString();

      if (navigator.share) {
        try {
          await navigator.share({ title: 'Countdown Timer', url: urlStr });
          return;
        } catch {}
      }

      try {
        await navigator.clipboard.writeText(urlStr);
        if (shareUrl) {
          shareUrl.textContent = '✓ Copied to clipboard!';
          shareUrl.classList.remove('hidden');
        }
      } catch {
        if (shareUrl) {
          shareUrl.textContent = urlStr;
          shareUrl.classList.remove('hidden');
        }
      }
    });
  }

  const params = new URLSearchParams(window.location.search);
  const t = params.get('t');
  if (t) {
    const sec = parseInt(t);
    if (sec && sec > 0) {
      setTimeFromMs(sec * 1000);
      start();
    }
  }

  if (remainingMs <= 0) {
    setTimeFromMs(600000);
  }
}
