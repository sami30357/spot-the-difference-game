// Reef Spotter — mouse and keyboard input in one place.
// The canvas is scaled to the window; every pointer position is converted back
// to the 1280x720 logical field before the game sees it. The keyboard cursor
// is a crosshair the arrow keys move; Enter or Space marks where it stands.
// Mouse movement also moves the crosshair, so the two never disagree.

import { FIELD, CURSOR_STEP, CURSOR_STEP_FAST, KEYS } from './config.js';

/** Convert a pointer event's client position to logical field coordinates. */
function toField(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = FIELD.width / rect.width;
  const scaleY = FIELD.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

/**
 * Attach input handling to `canvas`.
 * `hooks` is { onMark(x, y), onHint(), onMagnifier(), onRestart(), onAdvance(),
 *               onAnyGesture() } — every hook is optional.
 * Returns { cursor, mouse, destroy() }.
 */
export function createInput(canvas, hooks) {
  const cursor = { x: FIELD.width / 2, y: 320, visible: true };
  const mouse = { x: FIELD.width / 2, y: 320, inside: false };

  function gesture() {
    if (hooks.onAnyGesture) hooks.onAnyGesture();
  }

  function onPointerMove(event) {
    const p = toField(canvas, event.clientX, event.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.inside = true;
    cursor.x = p.x;
    cursor.y = p.y;
  }

  function onPointerDown(event) {
    gesture();
    const p = toField(canvas, event.clientX, event.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.inside = true;
    cursor.x = p.x;
    cursor.y = p.y;
    if (hooks.onMark) hooks.onMark(p.x, p.y);
  }

  function onKeyDown(event) {
    const key = event.key;
    if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();
      gesture();
      const step = event.shiftKey ? CURSOR_STEP_FAST : CURSOR_STEP;
      if (key === 'ArrowLeft') cursor.x = Math.max(0, cursor.x - step);
      if (key === 'ArrowRight') cursor.x = Math.min(FIELD.width, cursor.x + step);
      if (key === 'ArrowUp') cursor.y = Math.max(0, cursor.y - step);
      if (key === 'ArrowDown') cursor.y = Math.min(FIELD.height, cursor.y + step);
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      gesture();
      if (hooks.onMark) hooks.onMark(cursor.x, cursor.y);
      return;
    }
    const lower = key.toLowerCase();
    if (lower === KEYS.hint) {
      gesture();
      if (hooks.onHint) hooks.onHint();
    } else if (lower === KEYS.magnifier) {
      gesture();
      if (hooks.onMagnifier) hooks.onMagnifier();
    } else if (lower === KEYS.restart) {
      gesture();
      if (hooks.onRestart) hooks.onRestart();
    } else if (key === 'Escape') {
      // Escape also advances past overlays, like Enter.
      gesture();
      if (hooks.onAdvance) hooks.onAdvance();
    }
  }

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);

  return {
    cursor,
    mouse,
    destroy() {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}
