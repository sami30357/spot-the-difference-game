// Starlight Station — mouse + keyboard input.
// Mouse: click a panel to mark a spot. Keyboard: arrow keys move the gold
// crosshair cursor, Enter/Space marks, H uses a hint, M toggles the magnifier.

import { CONFIG } from './config.js';
import { SCREENS } from './game.js';
import { sfx } from './audio.js';

export function bindInput(canvas, renderer, game) {
  const st = game.state;

  function canvasPoint(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) * (canvas.width / rect.width),
      y: (evt.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function moveCursorTo(px, py) {
    const hit = renderer.panelAt(px, py);
    if (!hit) return;
    st.cursor.panel = hit.panel;
    st.cursor.x = Math.max(0, Math.min(CONFIG.panelSize, hit.x));
    st.cursor.y = Math.max(0, Math.min(CONFIG.panelSize, hit.y));
    st.cursor.visible = true;
  }

  canvas.addEventListener('mousemove', (evt) => {
    if (st.screen !== SCREENS.PLAYING) return;
    moveCursorTo(...Object.values(canvasPoint(evt)));
  });

  canvas.addEventListener('mouseleave', () => { st.cursor.visible = false; });

  canvas.addEventListener('click', (evt) => {
    if (st.screen !== SCREENS.PLAYING) return;
    const p = canvasPoint(evt);
    const hit = renderer.panelAt(p.x, p.y);
    if (!hit) return;
    st.cursor.panel = hit.panel;
    st.cursor.x = hit.x; st.cursor.y = hit.y;
    st.cursor.visible = true;
    game.markAt(hit.panel, hit.x, hit.y);
  });

  // Touch: tap marks a spot. preventDefault stops the synthetic click so a
  // tap is never counted twice (once as touch, once as click).
  canvas.addEventListener('touchstart', (evt) => {
    if (st.screen !== SCREENS.PLAYING) return;
    evt.preventDefault();
    const t = evt.changedTouches[0];
    const p = canvasPoint(t);
    const hit = renderer.panelAt(p.x, p.y);
    if (!hit) return;
    st.cursor.panel = hit.panel;
    st.cursor.x = hit.x; st.cursor.y = hit.y;
    st.cursor.visible = true;
    game.markAt(hit.panel, hit.x, hit.y);
  }, { passive: false });

  window.addEventListener('keydown', (evt) => {
    if (st.screen === SCREENS.TITLE && (evt.key === 'Enter' || evt.key === ' ')) {
      evt.preventDefault();
      game.startGame();
      return;
    }
    if (st.screen !== SCREENS.PLAYING) return;
    const fine = evt.shiftKey ? CONFIG.cursorStepFine : CONFIG.cursorStep;
    const c = st.cursor;
    switch (evt.key) {
      case 'ArrowLeft': evt.preventDefault(); c.x = Math.max(0, c.x - fine); c.visible = true; break;
      case 'ArrowRight': evt.preventDefault(); c.x = Math.min(CONFIG.panelSize, c.x + fine); c.visible = true; break;
      case 'ArrowUp': evt.preventDefault(); c.y = Math.max(0, c.y - fine); c.visible = true; break;
      case 'ArrowDown': evt.preventDefault(); c.y = Math.min(CONFIG.panelSize, c.y + fine); c.visible = true; break;
      case 'Enter':
      case ' ':
        evt.preventDefault();
        c.visible = true;
        game.markAt(c.panel, c.x, c.y);
        break;
      case 'h': case 'H': game.useHint(); break;
      case 'm': case 'M': game.toggleMagnifier(); break;
      default: break;
    }
  });

  // HUD buttons
  const hintBtn = document.getElementById('btn-hint');
  if (hintBtn) hintBtn.addEventListener('click', () => { sfx.unlock(); game.useHint(); });
  const magBtn = document.getElementById('btn-magnifier');
  if (magBtn) magBtn.addEventListener('click', () => { sfx.unlock(); game.toggleMagnifier(); });
  const muteBtn = document.getElementById('btn-mute');
  if (muteBtn) muteBtn.addEventListener('click', () => { sfx.unlock(); game.toggleMute(); });
  const startBtn = document.getElementById('btn-start');
  if (startBtn) startBtn.addEventListener('click', () => game.startGame());
  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) nextBtn.addEventListener('click', () => game.nextScene());
  const againBtns = document.querySelectorAll('[data-restart]');
  againBtns.forEach((b) => b.addEventListener('click', () => game.startGame()));
}
