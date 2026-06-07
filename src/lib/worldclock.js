const timezoneData = [
  { label: 'New York', tz: 'America/New_York', flag: '🇺🇸' },
  { label: 'London', tz: 'Europe/London', flag: '🇬🇧' },
  { label: 'Paris', tz: 'Europe/Paris', flag: '🇫🇷' },
  { label: 'Dubai', tz: 'Asia/Dubai', flag: '🇦🇪' },
  { label: 'Tokyo', tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { label: 'Sydney', tz: 'Australia/Sydney', flag: '🇦🇺' },
  { label: 'Los Angeles', tz: 'America/Los_Angeles', flag: '🇺🇸' },
  { label: 'Berlin', tz: 'Europe/Berlin', flag: '🇩🇪' },
  { label: 'Mumbai', tz: 'Asia/Kolkata', flag: '🇮🇳' },
  { label: 'Singapore', tz: 'Asia/Singapore', flag: '🇸🇬' },
  { label: 'São Paulo', tz: 'America/Sao_Paulo', flag: '🇧🇷' },
  { label: 'Moscow', tz: 'Europe/Moscow', flag: '🇷🇺' },
  { label: 'Seoul', tz: 'Asia/Seoul', flag: '🇰🇷' },
  { label: 'Toronto', tz: 'America/Toronto', flag: '🇨🇦' },
  { label: 'Istanbul', tz: 'Europe/Istanbul', flag: '🇹🇷' },
  { label: 'Cairo', tz: 'Africa/Cairo', flag: '🇪🇬' },
];

let fullscreenInterval = null;
let fullscreenActive = false;
let currentLoc = null;
let currentOverlay = null;

function formatTime(date, tz) {
  return date.toLocaleString('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

function formatDate(date, tz) {
  return date.toLocaleString('en-US', {
    timeZone: tz, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function getOffset(date, tz) {
  const parts = date.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'short' }).split(', ');
  const tzName = parts[parts.length - 1] || '';
  const offsetParts = date.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'longOffset' });
  const off = offsetParts.match(/UTC[+-]\d+:\d+/);
  return off ? off[0] : tzName;
}

function updateFullscreenContent() {
  if (!currentOverlay || !currentLoc) return;
  const now = new Date();
  const timeEl = currentOverlay.querySelector('.fs-time');
  const dateEl = currentOverlay.querySelector('.fs-date');
  const offsetEl = currentOverlay.querySelector('.fs-offset');
  if (timeEl) timeEl.textContent = formatTime(now, currentLoc.tz);
  if (dateEl) dateEl.textContent = formatDate(now, currentLoc.tz);
  if (offsetEl) offsetEl.textContent = getOffset(now, currentLoc.tz);
}

function handleFsChange() {
  if (!document.fullscreenElement) {
    closeFullscreen();
  }
}

function openFullscreen(loc) {
  if (fullscreenActive) return;
  fullscreenActive = true;
  currentLoc = loc;

  const overlay = document.createElement('div');
  currentOverlay = overlay;
  overlay.id = 'tz-fullscreen-overlay';
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
  closeBtn.addEventListener('click', closeFullscreen);
  overlay.appendChild(closeBtn);

  const flagEl = document.createElement('div');
  flagEl.textContent = loc.flag;
  flagEl.style.cssText = 'font-size: clamp(48px, 10vw, 80px); margin-bottom: 12px; line-height: 1;';
  overlay.appendChild(flagEl);

  const cityEl = document.createElement('div');
  cityEl.textContent = loc.label;
  cityEl.style.cssText = 'font-size: clamp(16px, 3vw, 24px); color: #a1a1a1; margin-bottom: 8px; font-weight: 500;';
  overlay.appendChild(cityEl);

  const timeEl = document.createElement('div');
  timeEl.className = 'fs-time';
  timeEl.style.cssText = 'font-size: clamp(3.5rem, 15vw, 8rem); font-weight: 600; color: #ededed; font-family: "JetBrains Mono", monospace; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 16px;';
  overlay.appendChild(timeEl);

  const dateEl = document.createElement('div');
  dateEl.className = 'fs-date';
  dateEl.style.cssText = 'font-size: clamp(14px, 2.5vw, 18px); color: #666; margin-bottom: 8px;';
  overlay.appendChild(dateEl);

  const offsetEl = document.createElement('div');
  offsetEl.className = 'fs-offset';
  offsetEl.style.cssText = 'font-size: clamp(12px, 2vw, 16px); color: #666; font-family: "JetBrains Mono", monospace;';
  overlay.appendChild(offsetEl);

  const hintEl = document.createElement('div');
  hintEl.textContent = 'Press Esc or click × to exit fullscreen';
  hintEl.style.cssText = 'position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); font-size: 13px; color: #444; font-family: "JetBrains Mono", monospace; text-align: center;';
  overlay.appendChild(hintEl);

  document.addEventListener('keydown', handleEsc);
  document.addEventListener('fullscreenchange', handleFsChange);

  document.body.appendChild(overlay);

  updateFullscreenContent();
  fullscreenInterval = setInterval(updateFullscreenContent, 1000);

  if (overlay.requestFullscreen) {
    overlay.requestFullscreen().catch(() => {});
  }
}

function closeFullscreen() {
  if (!fullscreenActive) return;
  fullscreenActive = false;
  currentLoc = null;
  if (fullscreenInterval) {
    clearInterval(fullscreenInterval);
    fullscreenInterval = null;
  }
  document.removeEventListener('keydown', handleEsc);
  document.removeEventListener('fullscreenchange', handleFsChange);
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
  }
}

function handleEsc(e) {
  if (e.key === 'Escape') closeFullscreen();
}

export function initWorldClock() {
  const container = document.getElementById('clock-grid');
  if (!container) return;

  function buildClocks() {
    const now = new Date();
    container.innerHTML = '';
    for (const loc of timezoneData) {
      const card = document.createElement('div');
      card.className = 'bg-canvas rounded-lg p-4 sm:p-5 border border-hairline transition-shadow duration-200 hover:shadow-elevated cursor-pointer active:scale-[0.98] transition-transform';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${loc.label} fullscreen`);
      card.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg" aria-hidden="true">${loc.flag}</span>
          <span class="text-sm font-medium text-ink">${loc.label}</span>
        </div>
        <div class="text-2xl font-semibold text-ink tracking-tight font-mono clock-time">${formatTime(now, loc.tz)}</div>
        <div class="flex items-center justify-between mt-1.5">
          <span class="text-xs text-body">${formatDate(now, loc.tz)}</span>
          <span class="text-xs text-mute font-mono">${getOffset(now, loc.tz)}</span>
        </div>
      `;
      card.addEventListener('click', () => openFullscreen(loc));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFullscreen(loc);
        }
      });
      container.appendChild(card);
    }
  }

  buildClocks();
  setInterval(buildClocks, 1000);
}
