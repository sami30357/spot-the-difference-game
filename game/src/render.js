// Reef Spotter — everything on screen, drawn to an offscreen canvas first.
// The frame is rendered to a 1280x720 offscreen canvas, blitted to the visible
// canvas, and the magnifier lens (when on) reads its zoomed patch from that
// offscreen canvas, so the lens never magnifies itself.

import { FIELD, PANEL, DIFFS_PER_SCENE, LEVELS, PALETTE, FONT, LENS, SCENE_NAMES } from './config.js';
import { drawScene, allDiffs, sceneDiffs } from './scenes.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_LEVEL_DONE, SCREEN_WIN, SCREEN_OVER } from './game.js';
import { isMuted } from './audio.js';

const EMPTY_DIFFS = new Set();

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, colour, weight, align) {
  ctx.fillStyle = colour;
  ctx.font = `${weight || 600} ${size}px ${FONT}`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** The check mark inside a found-difference ring. */
function checkMark(ctx, x, y, r, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.1, y + r * 0.35);
  ctx.lineTo(x + r * 0.5, y - r * 0.35);
  ctx.stroke();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const off = document.createElement('canvas');
  off.width = FIELD.width;
  off.height = FIELD.height;
  const o = off.getContext('2d');

  function drawHud(game) {
    // Top bar.
    o.fillStyle = PALETTE.hud;
    o.fillRect(0, 0, FIELD.width, 96);
    o.fillStyle = PALETTE.hudLine;
    o.fillRect(0, 96, FIELD.width, 3);
    text(o, 'REEF SPOTTER', 28, 34, 30, PALETTE.text, 800);
    text(o, 'spot the difference · coral reef', 28, 68, 15, PALETTE.muted, 500);
    // Scene name and level dots, centred.
    text(o, game.state.level < LEVELS ? SCENE_NAMES[game.state.level] : 'Reef', FIELD.width / 2, 30, 20, PALETTE.accent, 700, 'center');
    for (let i = 0; i < LEVELS; i += 1) {
      o.fillStyle = i < game.state.level ? PALETTE.good : i === game.state.level ? PALETTE.accent : '#2c4a57';
      o.beginPath();
      o.arc(FIELD.width / 2 - 28 + i * 28, 62, 8, 0, Math.PI * 2);
      o.fill();
    }
    // Timer, score and best, right side. Plain text only: emoji glyphs are
    // not guaranteed in the headless font set used for screenshots.
    const urgent = game.state.screen === SCREEN_PLAY && game.state.timeLeft <= 10;
    text(o, `Time ${formatTime(game.state.timeLeft)}`, FIELD.width - 28, 30, 24, urgent ? PALETTE.bad : PALETTE.text, 700, 'right');
    text(o, `Score ${game.state.score}`, FIELD.width - 28, 62, 17, PALETTE.muted, 600, 'right');
    text(o, `Best ${game.state.best}`, FIELD.width - 220, 62, 17, PALETTE.muted, 600, 'right');
  }

  function drawBottomBar(gameApi, now) {
    const g = gameApi.state;
    o.fillStyle = PALETTE.hud;
    o.fillRect(0, 548, FIELD.width, 172);
    o.fillStyle = PALETTE.hudLine;
    o.fillRect(0, 548, FIELD.width, 3);
    // The remaining counter: seven dots, filled for found, plus a big number.
    const dotsX = FIELD.width / 2 - 130;
    for (let i = 0; i < DIFFS_PER_SCENE; i += 1) {
      o.fillStyle = g.found.has(i) ? PALETTE.good : '#2c4a57';
      o.beginPath();
      o.arc(dotsX + i * 26, 596, 9, 0, Math.PI * 2);
      o.fill();
      if (g.found.has(i)) {
        o.strokeStyle = '#06222e';
        o.lineWidth = 2;
        o.beginPath();
        o.moveTo(dotsX + i * 26 - 4, 596);
        o.lineTo(dotsX + i * 26 - 1, 599);
        o.lineTo(dotsX + i * 26 + 5, 592);
        o.stroke();
      }
    }
    const left = gameApi.remaining();
    text(o, `${left} difference${left === 1 ? '' : 's'} left`, FIELD.width / 2 + 80, 596, 26, left === 0 ? PALETTE.good : PALETTE.accent, 800, 'left');
    text(o, 'Click a difference, or move with arrow keys and press Enter', FIELD.width / 2, 648, 16, PALETTE.muted, 500, 'center');
    text(o, 'H hint · M magnifier · R restart', FIELD.width / 2, 676, 16, PALETTE.muted, 500, 'center');
    // Hints as drawn dots (no glyph dependence) and magnifier state, right side.
    text(o, 'Hints', FIELD.width - 108, 596, 17, PALETTE.text, 600, 'right');
    for (let i = 0; i < 3; i += 1) {
      o.fillStyle = i < g.hintsLeft ? PALETTE.accent : '#2c4a57';
      o.beginPath();
      o.arc(FIELD.width - 96 + i * 22, 596, 7, 0, Math.PI * 2);
      o.fill();
    }
    text(o, `Lens ${g.magnifierOn ? 'ON' : 'OFF'} (M)`, FIELD.width - 28, 628, 17, g.magnifierOn ? PALETTE.accent : PALETTE.muted, 600, 'right');
    text(o, isMuted() ? 'Sound off' : 'Sound on', FIELD.width - 28, 660, 15, PALETTE.muted, 500, 'right');
  }

  function drawPanel(gameApi, now, panelX, diffSet, label) {
    const g = gameApi.state;
    // Frame and shadow.
    o.save();
    o.shadowColor = PALETTE.panelShadow;
    o.shadowBlur = 18;
    o.shadowOffsetY = 6;
    o.fillStyle = PALETTE.panelFrame;
    roundRect(o, panelX - 6, PANEL.y - 6, PANEL.w + 12, PANEL.h + 12, 10);
    o.fill();
    o.restore();
    // The scene, clipped to the panel.
    o.save();
    o.beginPath();
    o.rect(panelX, PANEL.y, PANEL.w, PANEL.h);
    o.clip();
    o.translate(panelX, PANEL.y);
    drawScene(o, g.level, diffSet, PANEL.w, PANEL.h);
    o.restore();
    // Panel label.
    o.fillStyle = 'rgba(6,34,46,0.75)';
    roundRect(o, panelX + 10, PANEL.y + 10, 34, 30, 8);
    o.fill();
    text(o, label, panelX + 27, PANEL.y + 26, 18, '#ffffff', 800, 'center');
    // Found markers: a green ring and a check, on both panels alike.
    const list = sceneDiffs(g.level);
    for (const i of g.found) {
      const d = list[i];
      const cx = panelX + d.x;
      const cy = PANEL.y + d.y;
      o.strokeStyle = PALETTE.ringFound;
      o.lineWidth = 4;
      o.beginPath();
      o.arc(cx, cy, 24, 0, Math.PI * 2);
      o.stroke();
      o.fillStyle = 'rgba(74,222,128,0.18)';
      o.beginPath();
      o.arc(cx, cy, 24, 0, Math.PI * 2);
      o.fill();
      checkMark(o, cx, cy, 24, '#ffffff');
    }
    // The hint pulse, if one is active.
    if (g.hintPulse && now < g.hintPulse.until) {
      const d = list[g.hintPulse.diff];
      const pulse = 1 + 0.18 * Math.sin(now / 130);
      const cx = panelX + d.x;
      const cy = PANEL.y + d.y;
      o.strokeStyle = PALETTE.hintPulse;
      o.lineWidth = 4;
      o.globalAlpha = 0.65 + 0.35 * Math.sin(now / 130);
      o.beginPath();
      o.arc(cx, cy, 26 * pulse, 0, Math.PI * 2);
      o.stroke();
      o.globalAlpha = 1;
    }
  }

  function drawCursor(gameApi, input) {
    const g = gameApi.state;
    if (g.screen !== SCREEN_PLAY) return;
    const c = input.cursor;
    o.strokeStyle = PALETTE.cursor;
    o.lineWidth = 2;
    o.beginPath();
    o.arc(c.x, c.y, 14, 0, Math.PI * 2);
    o.stroke();
    o.beginPath();
    o.moveTo(c.x - 20, c.y);
    o.lineTo(c.x - 8, c.y);
    o.moveTo(c.x + 8, c.y);
    o.lineTo(c.x + 20, c.y);
    o.moveTo(c.x, c.y - 20);
    o.lineTo(c.x, c.y - 8);
    o.moveTo(c.x, c.y + 8);
    o.lineTo(c.x, c.y + 20);
    o.stroke();
    o.fillStyle = PALETTE.cursor;
    o.beginPath();
    o.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
    o.fill();
  }

  function drawMagnifier(gameApi, input) {
    const g = gameApi.state;
    if (!g.magnifierOn || !input.mouse.inside || g.screen !== SCREEN_PLAY) return;
    const m = input.mouse;
    const srcSize = (LENS.radius * 2) / LENS.zoom;
    const sx = Math.max(0, Math.min(FIELD.width - srcSize, m.x - srcSize / 2));
    const sy = Math.max(0, Math.min(FIELD.height - srcSize, m.y - srcSize / 2));
    ctx.save();
    ctx.beginPath();
    ctx.arc(m.x, m.y, LENS.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(off, sx, sy, srcSize, srcSize, m.x - LENS.radius, m.y - LENS.radius, LENS.radius * 2, LENS.radius * 2);
    ctx.restore();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(m.x, m.y, LENS.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(6,34,46,0.85)';
    roundRect(ctx, m.x - 22, m.y + LENS.radius - 14, 44, 22, 8);
    ctx.fill();
    text(ctx, '2x', m.x, m.y + LENS.radius - 3, 14, '#ffffff', 700, 'center');
  }

  function overlay(title, lines, accent) {
    o.fillStyle = PALETTE.overlay;
    o.fillRect(0, 0, FIELD.width, FIELD.height);
    o.fillStyle = '#0a3547';
    roundRect(o, FIELD.width / 2 - 330, 150, 660, 420, 18);
    o.fill();
    o.strokeStyle = PALETTE.hudLine;
    o.lineWidth = 2;
    roundRect(o, FIELD.width / 2 - 330, 150, 660, 420, 18);
    o.stroke();
    text(o, title, FIELD.width / 2, 215, 44, accent || PALETTE.accent, 800, 'center');
    let y = 285;
    for (const line of lines) {
      text(o, line.text, FIELD.width / 2, y, line.size || 19, line.colour || PALETTE.text, line.weight || 500, 'center');
      y += line.size ? line.size + 14 : 33;
    }
  }

  function render(gameApi, input, now) {
    const g = gameApi.state;
    // Page background.
    o.fillStyle = PALETTE.page;
    o.fillRect(0, 0, FIELD.width, FIELD.height);

    drawHud(gameApi);
    drawBottomBar(gameApi, now);

    // The two pictures: left has no differences, right has all seven.
    drawPanel(gameApi, now, PANEL.leftX, EMPTY_DIFFS, 'A');
    drawPanel(gameApi, now, PANEL.rightX, allDiffs(g.level), 'B');

    // A red flash across the panels on a miss.
    if (gameApi.missFlashing(now)) {
      o.fillStyle = 'rgba(255,60,60,0.16)';
      o.fillRect(PANEL.leftX, PANEL.y, PANEL.w, PANEL.h);
      o.fillRect(PANEL.rightX, PANEL.y, PANEL.w, PANEL.h);
    }

    drawCursor(gameApi, input);

    // Overlays sit above the playfield.
    if (g.screen === SCREEN_TITLE) {
      overlay('REEF SPOTTER', [
        { text: 'Find 7 differences in each of 3 coral reef scenes.', size: 20 },
        { text: 'Click a difference — or move with the arrow keys', size: 18, colour: PALETTE.muted },
        { text: 'and press Enter. H gives a hint, M opens the magnifier.', size: 18, colour: PALETTE.muted },
        { text: 'Beat the clock: 150 seconds per scene.', size: 18, colour: PALETTE.muted },
        { text: 'Click or press Enter to start', size: 22, colour: PALETTE.accent, weight: 700 },
        { text: g.best > 0 ? `Best score: ${g.best}` : 'First dive — good luck!', size: 17, colour: PALETTE.muted },
      ]);
    } else if (g.screen === SCREEN_LEVEL_DONE) {
      overlay('Scene complete!', [
        { text: `You found all 7 differences in ${SCENE_NAMES[g.level]}.`, size: 20 },
        { text: `Time bonus: +${g.levelBonus} points`, size: 20, colour: PALETTE.good },
        { text: `Score: ${g.score}`, size: 22, colour: PALETTE.accent, weight: 700 },
        { text: 'Next scene coming up…', size: 18, colour: PALETTE.muted },
      ]);
    } else if (g.screen === SCREEN_WIN) {
      overlay('You found them all!', [
        { text: 'Every difference in all three reef scenes — found.', size: 20 },
        { text: `Final score: ${g.score}`, size: 26, colour: PALETTE.accent, weight: 800 },
        { text: `Best score: ${g.best}`, size: 18, colour: PALETTE.muted },
        { text: 'Click or press R to dive again', size: 20, colour: PALETTE.good, weight: 700 },
      ], PALETTE.good);
    } else if (g.screen === SCREEN_OVER) {
      overlay("Time's up!", [
        { text: `The clock ran out on ${SCENE_NAMES[g.level]}.`, size: 20 },
        { text: `Score: ${g.score}`, size: 22, colour: PALETTE.accent, weight: 700 },
        { text: 'Click or press R to try again', size: 20, colour: PALETTE.good, weight: 700 },
      ], PALETTE.bad);
    }

    // Blit the frame, then the magnifier lens on top of it.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off, 0, 0);
    drawMagnifier(gameApi, input);
  }

  return { render };
}
