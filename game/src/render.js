// Starlight Station — rendering.
// Each scene panel is painted once per variant onto an offscreen canvas, then
// blitted to the visible canvas. Markers, the hint pulse, the magnifier lens
// and the keyboard cursor are drawn on top every frame. The DOM HUD (score,
// timer, dots) is updated from the same state.

import { CONFIG } from './config.js';
import { SCREENS } from './game.js';

const S = CONFIG.panelSize;

function makeOffscreen() {
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  return c;
}

// Paint both variants of a scene once; returns {a, b} offscreen canvases.
export function paintScene(scene) {
  const a = makeOffscreen(), b = makeOffscreen();
  scene.draw(a.getContext('2d'), 0, S);
  scene.draw(b.getContext('2d'), 1, S);
  return { a, b };
}

function drawMarker(ctx, x, y, r, color, check) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.stroke();
  if (check) {
    ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.45, y);
    ctx.lineTo(x - r * 0.1, y + r * 0.4);
    ctx.lineTo(x + r * 0.5, y - r * 0.4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWrongX(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = '#ff5d73'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 14, y - 14); ctx.lineTo(x + 14, y + 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 14, y - 14); ctx.lineTo(x - 14, y + 14); ctx.stroke();
  ctx.restore();
}

export function createRenderer(canvas, game) {
  const ctx = canvas.getContext('2d');
  const m = CONFIG.canvasMargin, gap = CONFIG.panelGap;
  canvas.width = m * 2 + S * 2 + gap;
  canvas.height = m * 2 + S;
  const panelX = [m, m + S + gap];
  const panelY = m;

  let painted = null;      // {a, b} offscreen canvases for the current scene
  let paintedFor = -1;

  function panelAt(px, py) {
    for (let p = 0; p < 2; p++) {
      if (px >= panelX[p] && px < panelX[p] + S && py >= panelY && py < panelY + S) {
        return { panel: p, x: px - panelX[p], y: py - panelY };
      }
    }
    return null;
  }

  function render(now) {
    const st = game.state;
    const scene = game.scene();
    if (paintedFor !== st.sceneIndex) {
      painted = paintScene(scene);
      paintedFor = st.sceneIndex;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0f22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Panels
    ctx.drawImage(painted.a, panelX[0], panelY);
    ctx.drawImage(painted.b, panelX[1], panelY);

    // Gold divider between the two panels
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(panelX[0] + S + 4, panelY, gap - 8, S);

    // Panel frames + labels
    for (let p = 0; p < 2; p++) {
      ctx.strokeStyle = '#2c3f6e'; ctx.lineWidth = 3;
      ctx.strokeRect(panelX[p] - 1.5, panelY - 1.5, S + 3, S + 3);
      ctx.fillStyle = 'rgba(10,15,34,0.85)';
      ctx.fillRect(panelX[p] + 10, panelY + 10, 46, 34);
      ctx.fillStyle = '#eef4ff'; ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p === 0 ? 'A' : 'B', panelX[p] + 33, panelY + 28);
    }

    // Found markers on both panels
    for (const i of st.found) {
      const d = scene.differences[i];
      drawMarker(ctx, panelX[0] + d.x, panelY + d.y, d.r, '#3ddc84', true);
      drawMarker(ctx, panelX[1] + d.x, panelY + d.y, d.r, '#3ddc84', true);
    }

    // Hint pulse — a gold ring that breathes around one unfound difference.
    if (st.hintIndex >= 0 && now < st.hintUntil) {
      const d = scene.differences[st.hintIndex];
      const pulse = 1 + 0.16 * Math.sin(now / 130);
      const r = (d.r + 10) * pulse;
      ctx.save();
      ctx.globalAlpha = 0.65 + 0.35 * Math.sin(now / 130);
      drawMarker(ctx, panelX[0] + d.x, panelY + d.y, r, '#ffd166', false);
      drawMarker(ctx, panelX[1] + d.x, panelY + d.y, r, '#ffd166', false);
      ctx.restore();
    }

    // Wrong-click flash
    if (st.wrongFlash && now < st.wrongFlash.until) {
      const w = st.wrongFlash;
      drawWrongX(ctx, panelX[w.panel] + w.x, panelY + w.y);
    }

    // Keyboard / mouse cursor crosshair (drawn on the active panel)
    if (st.screen === SCREENS.PLAYING && st.cursor.visible) {
      const cx = panelX[st.cursor.panel] + st.cursor.x;
      const cy = panelY + st.cursor.y;
      ctx.save();
      ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx - 8, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 8, cy); ctx.lineTo(cx + 20, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 8); ctx.lineTo(cx, cy + 20); ctx.stroke();
      ctx.restore();
    }

    // Magnifier lens — a 2x zoomed circle following the cursor.
    if (st.screen === SCREENS.PLAYING && st.magnifier && st.cursor.visible) {
      const src = st.cursor.panel === 0 ? painted.a : painted.b;
      const R = CONFIG.magnifierRadius, Z = CONFIG.magnifierZoom;
      const cx = panelX[st.cursor.panel] + st.cursor.x;
      const cy = panelY + st.cursor.y;
      const sw = (R * 2) / Z;
      let sx = st.cursor.x - sw / 2, sy = st.cursor.y - sw / 2;
      sx = Math.max(0, Math.min(S - sw, sx));
      sy = Math.max(0, Math.min(S - sw, sy));
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(src, sx, sy, sw, sw, cx - R, cy - R, R * 2, R * 2);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  // ---- DOM HUD ----------------------------------------------------------
  const hud = {
    scene: document.getElementById('hud-scene'),
    score: document.getElementById('hud-score'),
    best: document.getElementById('hud-best'),
    timer: document.getElementById('hud-timer'),
    timerBar: document.getElementById('hud-timer-bar'),
    left: document.getElementById('hud-left'),
    dots: document.getElementById('hud-dots'),
    hints: document.getElementById('hud-hints'),
    mag: document.getElementById('btn-magnifier'),
    hintBtn: document.getElementById('btn-hint'),
    mute: document.getElementById('btn-mute'),
  };

  function updateHud() {
    const st = game.state;
    const scene = game.scene();
    if (hud.scene) hud.scene.textContent = `Scene ${st.sceneIndex + 1} / 3 — ${scene.name}`;
    if (hud.score) hud.score.textContent = String(st.score);
    if (hud.best) hud.best.textContent = String(st.best);
    const t = Math.max(0, Math.ceil(st.timeLeft));
    if (hud.timer) {
      hud.timer.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
      hud.timer.classList.toggle('urgent', t <= 10 && st.screen === SCREENS.PLAYING);
    }
    if (hud.timerBar) hud.timerBar.style.width = `${(st.timeLeft / CONFIG.timePerSceneSeconds) * 100}%`;
    const left = scene.differences.length - st.found.size;
    if (hud.left) hud.left.textContent = `${left} difference${left === 1 ? '' : 's'} left`;
    if (hud.dots) {
      hud.dots.innerHTML = '';
      scene.differences.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (st.found.has(i) ? ' found' : '');
        hud.dots.appendChild(dot);
      });
    }
    if (hud.hints) hud.hints.textContent = `Hints: ${st.hintsLeft}`;
    if (hud.hintBtn) hud.hintBtn.disabled = st.hintsLeft <= 0 || st.screen !== SCREENS.PLAYING;
    if (hud.mag) hud.mag.classList.toggle('active', st.magnifier);
    if (hud.mute) hud.mute.textContent = st.muted ? '🔇 Sound off' : '🔊 Sound on';
  }

  return { render, updateHud, panelAt, panelX, panelY };
}
