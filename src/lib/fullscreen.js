let onCloseCallback = null;

export function setOnClose(cb) {
  onCloseCallback = cb;
}

export function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'timer-fullscreen-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; height: 100dvh;
    z-index: 99999; background: #0a0a0a; overflow: hidden;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: Inter, system-ui, sans-serif;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close fullscreen view');
  closeBtn.style.cssText = `
    position: fixed; top: max(16px, env(safe-area-inset-top, 16px)); right: max(16px, env(safe-area-inset-right, 16px)); z-index: 10;
    width: 48px; height: 48px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(34,34,34,0.85); border: 1px solid #3a3a3a; border-radius: 50%;
    color: #a1a1a1; font-size: 26px; cursor: pointer; line-height: 1;
    transition: background 0.15s, color 0.15s;
  `;
  closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = '#2a2a2a'; closeBtn.style.color = '#ededed'; });
  closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'rgba(34,34,34,0.85)'; closeBtn.style.color = '#a1a1a1'; });
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeFullscreen(); });
  overlay.appendChild(closeBtn);

  const content = document.createElement('div');
  content.id = 'fs-content';
  content.style.cssText = `
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 20px; width: 100%; max-width: 700px; padding: 20px;
    padding-top: max(20px, env(safe-area-inset-top, 20px));
    padding-bottom: max(20px, env(safe-area-inset-bottom, 20px));
  `;
  overlay.appendChild(content);

  const hintEl = document.createElement('div');
  hintEl.textContent = 'Tap \u00d7 or press Esc to exit';
  hintEl.style.cssText = 'position: fixed; bottom: max(16px, env(safe-area-inset-bottom, 16px)); left: 50%; transform: translateX(-50%); font-size: 13px; color: #444; font-family: "JetBrains Mono", monospace; text-align: center; pointer-events: none;';
  overlay.appendChild(hintEl);

  return { overlay, content, closeBtn };
}

export function openFullscreen(overlay) {
  document.addEventListener('keydown', handleEsc);
  document.addEventListener('fullscreenchange', handleFsChange);
  document.body.appendChild(overlay);
  if (overlay.requestFullscreen) {
    overlay.requestFullscreen().catch(() => {});
  }
}

export function closeFullscreen() {
  document.removeEventListener('keydown', handleEsc);
  document.removeEventListener('fullscreenchange', handleFsChange);
  if (onCloseCallback) {
    onCloseCallback();
    onCloseCallback = null;
  }
  const overlay = document.getElementById('timer-fullscreen-overlay');
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  if (overlay) overlay.remove();
}

function handleFsChange() {
  if (!document.fullscreenElement) {
    closeFullscreen();
  }
}

function handleEsc(e) {
  if (e.key === 'Escape') closeFullscreen();
}
