export function showTimerDialog({ title, fields, onConfirm }) {
  const old = document.getElementById('timer-dialog-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'timer-dialog-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: #171717; border: 1px solid #2a2a2a;
    border-radius: 12px; padding: 28px 24px 24px;
    max-width: 360px; width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  `;

  const h2 = document.createElement('h2');
  h2.textContent = title;
  h2.style.cssText = `
    font-size: 18px; font-weight: 600; color: #ededed;
    text-align: center; margin: 0 0 20px; font-family: Inter, sans-serif;
  `;
  box.appendChild(h2);

  const row = document.createElement('div');
  row.style.cssText = 'display: flex; gap: 12px; justify-content: center; margin-bottom: 24px;';
  box.appendChild(row);

  const inputs = [];

  for (const f of fields) {
    const col = document.createElement('div');
    col.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 4px;';
    row.appendChild(col);

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    if (f.max !== undefined) input.max = String(f.max);
    input.value = String(f.value ?? 0);
    input.autocomplete = 'off';
    input.style.cssText = `
      width: 72px; height: 48px; text-align: center;
      font-size: 18px; font-family: 'JetBrains Mono', monospace;
      font-weight: 600; color: #ededed;
      background: #222; border: 1px solid #2a2a2a;
      border-radius: 6px; outline: none; transition: border-color 0.15s;
      -moz-appearance: textfield;
    `;
    input.addEventListener('focus', () => { input.style.borderColor = '#ededed'; });
    input.addEventListener('blur', () => { input.style.borderColor = '#2a2a2a'; });
    col.appendChild(input);
    inputs.push(input);

    const label = document.createElement('label');
    label.textContent = f.label;
    label.style.cssText = 'font-size: 11px; color: #666; font-family: Inter, sans-serif; text-transform: uppercase; letter-spacing: 0.5px;';
    col.appendChild(label);

    if (inputs.length === 1) {
      setTimeout(() => input.focus(), 50);
    }
  }

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display: flex; gap: 10px; justify-content: center;';
  box.appendChild(btnRow);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `
    flex: 1; padding: 10px 0; border-radius: 100px; min-height: 44px;
    background: transparent; color: #a1a1a1; font-size: 15px;
    font-weight: 500; cursor: pointer; border: 1px solid #2a2a2a;
    transition: background 0.15s; font-family: Inter, sans-serif;
  `;
  cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.background = '#222'; });
  cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.background = 'transparent'; });
  cancelBtn.addEventListener('click', close);
  btnRow.appendChild(cancelBtn);

  const setBtn = document.createElement('button');
  setBtn.textContent = 'Set';
  setBtn.style.cssText = `
    flex: 1; padding: 10px 0; border-radius: 100px; min-height: 44px;
    background: #ededed; color: #171717; font-size: 15px;
    font-weight: 500; cursor: pointer; border: none;
    transition: opacity 0.15s; font-family: Inter, sans-serif;
  `;
  setBtn.addEventListener('mouseenter', () => { setBtn.style.opacity = '0.9'; });
  setBtn.addEventListener('mouseleave', () => { setBtn.style.opacity = '1'; });
  setBtn.addEventListener('click', confirm);
  btnRow.appendChild(setBtn);

  overlay.appendChild(box);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter') {
      e.preventDefault();
      confirm();
    }
  }
  document.addEventListener('keydown', onKey);

  function close() {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }

  function confirm() {
    let totalSec = 0;
    for (let i = 0; i < fields.length; i++) {
      const val = parseInt(inputs[i].value) || 0;
      totalSec += val * (fields[i].toSeconds || 60);
    }
    if (totalSec <= 0) return;
    onConfirm(totalSec);
    close();
  }

  document.body.appendChild(overlay);
}
