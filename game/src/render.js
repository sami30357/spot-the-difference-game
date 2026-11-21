// Jungle Spotter v2 — all canvas rendering: HUD, side-by-side panels, found
// markers, hint pulse, magnifier lens, and the title / level / win / game-over
// screens. Scene art itself lives in scenes.js and is painted once per scene
// onto two offscreen canvases (A = original, B = with differences).
import {
  BOTTOM_Y,
  CANVAS_H,
  CANVAS_W,
  MAGNIFIER_R,
  MAGNIFIER_ZOOM,
  PANEL_A_X,
  PANEL_B_X,
  PANEL_H,
  PANEL_W,
  PANEL_Y,
  TIME_PER_SCENE,
} from './config.js';
import { SCENES } from './scenes.js';
import { currentScene, diffsLeft } from './game.js';

export function makePanelCanvases() {
  const a = document.createElement('canvas');
  a.width = PANEL_W;
  a.height = PANEL_H;
  const b = document.createElement('canvas');
  b.width = PANEL_W;
  b.height = PANEL_H;
  return { a, b };
}

export function paintPanels(panels, sceneIndex) {
  const scene = SCENES[sceneIndex];
  const flags = {};
  for (const d of scene.diffs) flags[d.flag] = true;
  scene.draw(panels.a.getContext('2d'), {});
  scene.draw(panels.b.getContext('2d'), flags);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPanelFrame(ctx, x, label, active) {
  ctx.save();
  ctx.strokeStyle = active ? '#ffd60a' : '#ffffff';
  ctx.lineWidth = active ? 4 : 2;
  ctx.strokeRect(x - 2, PANEL_Y - 2, PANEL_W + 4, PANEL_H + 4);
  ctx.fillStyle = active ? '#ffd60a' : '#e8f5e9';
  ctx.fillRect(x + 8, PANEL_Y - 16, 34, 26);
  ctx.fillStyle = '#1b5e20';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 25, PANEL_Y - 3);
  ctx.restore();
}

function drawMarker(ctx, px, py, r, ok, pulse) {
  ctx.save();
  ctx.strokeStyle = ok ? '#2ecc71' : '#e63946';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(px, py, r - 4, 0, Math.PI * 2);
  ctx.stroke();
  if (ok) {
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px - r * 0.45, py);
    ctx.lineTo(px - r * 0.1, py + r * 0.35);
    ctx.lineTo(px + r * 0.5, py - r * 0.35);
    ctx.stroke();
  }
  if (pulse) {
    ctx.strokeStyle = `rgba(255,214,10,${0.5 + 0.5 * Math.sin(Date.now() / 150)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, r + 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function render(ctx, game, ui) {
  // backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bg.addColorStop(0, '#e8f5e9');
  bg.addColorStop(1, '#c8e6c9');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // ---- HUD bar
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(0, 0, CANVAS_W, 56);
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('🌿 JUNGLE SPOTTER', 24, 29);
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = '#c8e6c9';
  const scene = currentScene(game);
  ctx.fillText(`Scene ${game.sceneIndex + 1}/3 — ${scene.name}`, 330, 29);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(`Score ${game.score}`, 1010, 29);
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = '#c8e6c9';
  ctx.fillText(`Best ${game.best}`, 1150, 29);

  if (game.screen === 'playing' || game.screen === 'levelComplete') {
    // ---- panels
    ctx.drawImage(ui.panels.a, PANEL_A_X, PANEL_Y);
    ctx.drawImage(ui.panels.b, PANEL_B_X, PANEL_Y);
    drawPanelFrame(ctx, PANEL_A_X, 'A', ui.mouse.panel === 'A');
    drawPanelFrame(ctx, PANEL_B_X, 'B', ui.mouse.panel === 'B');

    // found markers on both panels
    for (const i of game.found) {
      const d = scene.diffs[i];
      drawMarker(ctx, PANEL_A_X + d.x, PANEL_Y + d.y, d.r, true, false);
      drawMarker(ctx, PANEL_B_X + d.x, PANEL_Y + d.y, d.r, true, false);
    }
    // hint pulse on both panels
    if (game.hinted !== null) {
      const d = scene.diffs[game.hinted];
      drawMarker(ctx, PANEL_A_X + d.x, PANEL_Y + d.y, d.r, true, true);
      drawMarker(ctx, PANEL_B_X + d.x, PANEL_Y + d.y, d.r, true, true);
    }
    // click flash
    if (game.flash && game.flashTimer > 0) {
      const fx = (game.flash.panel === 'A' ? PANEL_A_X : PANEL_B_X) + game.flash.x;
      const fy = PANEL_Y + game.flash.y;
      drawMarker(ctx, fx, fy, 22, game.flash.ok, false);
    }
    // keyboard crosshair
    if (ui.keyboardMode) {
      const cx = (game.crosshair.panel === 'A' ? PANEL_A_X : PANEL_B_X) + game.crosshair.x;
      const cy = PANEL_Y + game.crosshair.y;
      ctx.save();
      ctx.strokeStyle = '#ffd60a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy);
      ctx.lineTo(cx + 14, cy);
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx, cy + 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ---- bottom bar
    ctx.fillStyle = '#1b5e20';
    roundRect(ctx, 24, BOTTOM_Y, CANVAS_W - 48, 180, 14);
    ctx.fill();
    // differences-left dots
    const left = diffsLeft(game);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${left} difference${left === 1 ? '' : 's'} left`, 48, BOTTOM_Y + 34);
    for (let i = 0; i < scene.diffs.length; i++) {
      const dx = 48 + i * 30;
      const dy = BOTTOM_Y + 66;
      ctx.beginPath();
      ctx.arc(dx, dy, 9, 0, Math.PI * 2);
      if (game.found.has(i)) {
        ctx.fillStyle = '#2ecc71';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dx - 4, dy);
        ctx.lineTo(dx - 1, dy + 3);
        ctx.lineTo(dx + 5, dy - 4);
        ctx.stroke();
      } else if (game.hinted === i) {
        ctx.fillStyle = '#ffd60a';
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    // timer bar
    const tfrac = Math.max(0, game.timeLeft / TIME_PER_SCENE);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, 48, BOTTOM_Y + 92, 420, 18, 9);
    ctx.fill();
    ctx.fillStyle = tfrac > 0.25 ? '#ffd60a' : '#e63946';
    if (tfrac > 0) {
      roundRect(ctx, 48, BOTTOM_Y + 92, 420 * tfrac, 18, 9);
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText(`⏱ ${Math.ceil(game.timeLeft)}s`, 480, BOTTOM_Y + 101);
    // hints
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`💡 Hints: ${game.hintsLeft}  (H)`, 48, BOTTOM_Y + 142);
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = '#c8e6c9';
    ctx.fillText('Click a difference • Arrows + Enter to mark • M magnifier • H hint', 48, BOTTOM_Y + 168);
    // message
    if (game.messageTimer > 0) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffd60a';
      ctx.font = 'bold 19px system-ui, sans-serif';
      ctx.fillText(game.message, CANVAS_W - 48, BOTTOM_Y + 34);
    }
    // magnifier lens
    if (ui.magnifier && ui.mouse.inside) {
      drawMagnifier(ctx, ui);
    }
  }

  // ---- screens
  if (game.screen === 'title') drawTitle(ctx, game);
  if (game.screen === 'levelComplete') drawLevelComplete(ctx, game);
  if (game.screen === 'win') drawWin(ctx, game);
  if (game.screen === 'gameOver') drawGameOver(ctx, game);
}

function drawMagnifier(ctx, ui) {
  const src = ui.mouse.panel === 'A' ? ui.panels.a : ui.panels.b;
  const px = ui.mouse.panel === 'A' ? PANEL_A_X : PANEL_B_X;
  const sx = ui.mouse.x - (MAGNIFIER_R / MAGNIFIER_ZOOM);
  const sy = ui.mouse.y - (MAGNIFIER_R / MAGNIFIER_ZOOM);
  const cx = px + ui.mouse.x;
  const cy = PANEL_Y + ui.mouse.y;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, MAGNIFIER_R, 0, Math.PI * 2);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    src,
    Math.max(0, sx), Math.max(0, sy),
    (MAGNIFIER_R * 2) / MAGNIFIER_ZOOM, (MAGNIFIER_R * 2) / MAGNIFIER_ZOOM,
    cx - MAGNIFIER_R, cy - MAGNIFIER_R,
    MAGNIFIER_R * 2, MAGNIFIER_R * 2,
  );
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, MAGNIFIER_R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy);
  ctx.lineTo(cx + 8, cy);
  ctx.moveTo(cx, cy - 8);
  ctx.lineTo(cx, cy + 8);
  ctx.stroke();
  ctx.restore();
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(10,40,14,0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function centerText(ctx, text, y, font, color) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, CANVAS_W / 2, y);
}

function drawTitle(ctx, game) {
  // paint scene 1 behind the overlay, softly
  overlay(ctx);
  centerText(ctx, '🌿', 120, '90px system-ui, sans-serif', '#fff');
  centerText(ctx, 'JUNGLE SPOTTER', 220, 'bold 64px system-ui, sans-serif', '#ffd60a');
  centerText(ctx, 'Spot the Difference — Bright Jungle Edition', 275, '24px system-ui, sans-serif', '#e8f5e9');
  centerText(ctx, 'Two jungle pictures side by side. 7 differences hide in each scene.', 340, '20px system-ui, sans-serif', '#fff');
  centerText(ctx, 'Find them all in 3 scenes before the timer runs out!', 372, '20px system-ui, sans-serif', '#fff');
  centerText(ctx, '🖱 Click a difference   •   ⌨ Arrows + Enter   •   H hint   •   M magnifier', 440, '19px system-ui, sans-serif', '#c8e6c9');
  centerText(ctx, `Best score: ${game.best}`, 500, '19px system-ui, sans-serif', '#ffd60a');
  ctx.fillStyle = '#ffd60a';
  roundRect(ctx, CANVAS_W / 2 - 170, 545, 340, 62, 31);
  ctx.fill();
  centerText(ctx, '▶  PRESS ENTER TO PLAY', 576, 'bold 22px system-ui, sans-serif', '#1b5e20');
}

function drawLevelComplete(ctx, game) {
  overlay(ctx);
  centerText(ctx, '🎉 Scene Clear!', 250, 'bold 56px system-ui, sans-serif', '#ffd60a');
  centerText(ctx, `${currentScene(game).name} — all 7 differences found`, 320, '24px system-ui, sans-serif', '#fff');
  centerText(ctx, `Score: ${game.score}`, 380, 'bold 30px system-ui, sans-serif', '#fff');
  centerText(ctx, 'Press ENTER for the next scene', 460, '22px system-ui, sans-serif', '#c8e6c9');
}

function drawWin(ctx, game) {
  overlay(ctx);
  centerText(ctx, '🏆 YOU FOUND THEM ALL!', 220, 'bold 54px system-ui, sans-serif', '#ffd60a');
  centerText(ctx, 'All 21 jungle differences spotted — amazing eyes!', 290, '24px system-ui, sans-serif', '#fff');
  centerText(ctx, `Final score: ${game.score}`, 360, 'bold 34px system-ui, sans-serif', '#fff');
  centerText(ctx, `Best score: ${game.best}`, 410, '22px system-ui, sans-serif', '#ffd60a');
  centerText(ctx, 'Press R to play again', 480, '20px system-ui, sans-serif', '#c8e6c9');
}

function drawGameOver(ctx, game) {
  overlay(ctx);
  centerText(ctx, '⏰ TIME UP!', 250, 'bold 56px system-ui, sans-serif', '#e63946');
  centerText(ctx, `${currentScene(game).name} — ${diffsLeft(game)} difference${diffsLeft(game) === 1 ? '' : 's'} still hiding`, 320, '24px system-ui, sans-serif', '#fff');
  centerText(ctx, `Score: ${game.score}   •   Best: ${game.best}`, 380, 'bold 28px system-ui, sans-serif', '#fff');
  centerText(ctx, 'Press R to try again', 460, '22px system-ui, sans-serif', '#c8e6c9');
}
