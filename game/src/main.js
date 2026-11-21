// Jungle Spotter v2 — bootstrap + main loop. Fixed 1280x720 canvas, scaled by
// CSS to fit the window. ?shot=start|play|end presets the state for dossier
// screenshots; ?seed= is accepted and ignored (scenes are hand-built, not
// random). Exposes window.__game for the local Playwright harness.
import { CANVAS_H, CANVAS_W } from './config.js';
import { createGame, tick } from './game.js';
import { createSfx } from './audio.js';
import { attachInput, createUI } from './input.js';
import { makePanelCanvases, paintPanels, render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const game = createGame();
const sfx = createSfx();
const panels = makePanelCanvases();
const ui = createUI(panels);
paintPanels(panels, 0);

let lastScene = game.sceneIndex;
let lastTickSecond = -1;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const sceneParam = Number(params.get('scene') ?? 0);
if (shot) {
  applyShot(game, shot, Number.isFinite(sceneParam) ? sceneParam : 0);
  paintPanels(panels, game.sceneIndex);
  lastScene = game.sceneIndex;
}

attachInput(canvas, game, ui, sfx);

// test hook: lets the Playwright harness drive the game and read state
window.__game = game;
window.__ui = ui;
window.__panels = panels;

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (game.sceneIndex !== lastScene) {
    paintPanels(panels, game.sceneIndex);
    lastScene = game.sceneIndex;
  }
  const prevScreen = game.screen;
  tick(game, dt);
  if (game.screen === 'playing') {
    const sec = Math.ceil(game.timeLeft);
    if (sec !== lastTickSecond) {
      lastTickSecond = sec;
      if (sec <= 10 && sec > 0) sfx.tick();
    }
  }
  if (prevScreen === 'playing' && game.screen === 'win') sfx.win();
  if (prevScreen === 'playing' && game.screen === 'levelComplete') sfx.levelClear();
  render(ctx, game, ui);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
