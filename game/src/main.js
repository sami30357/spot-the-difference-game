// Starlight Station — bootstrap + animation loop.
// Wires the game state, renderer and input together, runs the timer, and
// swaps the title / level-complete / win / game-over overlays.

import { CONFIG } from './config.js';
import { createGame, SCREENS } from './game.js';
import { createRenderer } from './render.js';
import { bindInput } from './input.js';
import { sfx } from './audio.js';

const canvas = document.getElementById('game-canvas');
const overlays = {
  title: document.getElementById('screen-title'),
  level: document.getElementById('screen-level'),
  win: document.getElementById('screen-win'),
  over: document.getElementById('screen-over'),
};

const game = createGame((st) => {
  renderer.updateHud();
  showScreen(st);
});
const renderer = createRenderer(canvas, game);
bindInput(canvas, renderer, game);

// Expose for the screenshot helper and for Playwright-driven checks.
window.__game = game;
window.__renderer = renderer;

function showScreen(st) {
  const map = {
    [SCREENS.TITLE]: overlays.title,
    [SCREENS.LEVEL_DONE]: overlays.level,
    [SCREENS.WIN]: overlays.win,
    [SCREENS.GAME_OVER]: overlays.over,
  };
  for (const el of Object.values(overlays)) if (el) el.classList.add('hidden');
  const active = map[st.screen];
  if (active) active.classList.remove('hidden');

  if (st.screen === SCREENS.LEVEL_DONE) {
    const bonus = document.getElementById('level-bonus');
    if (bonus) bonus.textContent = `Time bonus: +${st.levelBonus}`;
    const found = document.getElementById('level-found');
    if (found) found.textContent = `You found all 7 differences in ${game.scene().name}!`;
    const score = document.getElementById('level-score');
    if (score) score.textContent = `Score: ${st.score}`;
  }
  if (st.screen === SCREENS.WIN) {
    const total = document.getElementById('win-total');
    if (total) total.textContent = `Final score: ${st.score}`;
    const best = document.getElementById('win-best');
    if (best) best.textContent = `Best score: ${st.best}`;
    const found = document.getElementById('win-found');
    if (found) found.textContent = `You found all ${game.totalDifferences} differences across 3 space scenes!`;
  }
  if (st.screen === SCREENS.GAME_OVER) {
    const score = document.getElementById('over-score');
    if (score) score.textContent = `Score: ${st.score} — you found ${st.totalFound} of ${game.totalDifferences} differences.`;
  }
  if (st.screen === SCREENS.TITLE) {
    const best = document.getElementById('title-best');
    if (best) best.textContent = st.best > 0 ? `Best score: ${st.best}` : 'Find all 7 differences in each of the 3 space scenes!';
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.25, (now - last) / 1000);
  last = now;
  game.tick(dt);
  renderer.render(now);
  requestAnimationFrame(loop);
}

renderer.updateHud();
showScreen(game.state);
requestAnimationFrame(loop);

// First user gesture unlocks audio (browsers block sound before interaction).
window.addEventListener('pointerdown', () => sfx.unlock(), { once: true });
window.addEventListener('keydown', () => sfx.unlock(), { once: true });

// R restarts from the win or game-over screens, without hunting for the button.
window.addEventListener('keydown', (evt) => {
  if ((evt.key === 'r' || evt.key === 'R') &&
      (game.state.screen === SCREENS.WIN || game.state.screen === SCREENS.GAME_OVER)) {
    game.startGame();
  }
});
