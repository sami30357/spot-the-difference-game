// Reef Spotter — boot and the animation loop.
// The canvas is a fixed 1280x720 logical field, scaled by CSS to fit the
// window; the game updates on a fixed 1/60s step so play is identical at any
// display rate. A ?shot= URL stages a frozen frame for screenshots.

import { FIELD } from './config.js';
import { createGame } from './game.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import { ensureAudio, toggleMute } from './audio.js';
import { shotFromUrl, stageNamedShot } from './shots.js';

const STEP = 1 / 60;

const canvas = document.getElementById('game');
const status = document.getElementById('status');

const gameApi = createGame();
const renderer = createRenderer(canvas);
const input = createInput(canvas, {
  onAnyGesture: ensureAudio,
  onMark: (x, y) => gameApi.mark(x, y, performance.now()),
  onHint: () => gameApi.hint(performance.now()),
  onMagnifier: () => gameApi.toggleMagnifier(),
  onRestart: () => gameApi.restart(),
  onAdvance: () => gameApi.advance(performance.now()),
});

// A staged screenshot frame, when the URL asks for one.
const shot = shotFromUrl();
if (shot.name) stageNamedShot(gameApi, shot.name);

/** Keep the canvas at the logical size and the status line current. */
function resize() {
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;
}

function announce() {
  const g = gameApi.state;
  if (!status) return;
  const screen = g.screen;
  if (screen === 'play') {
    status.textContent = `${g.level + 1} of 3 scenes: ${gameApi.remaining()} differences left, ${Math.ceil(g.timeLeft)} seconds, score ${g.score}.`;
  } else if (screen === 'title') {
    status.textContent = 'Reef Spotter. Find 7 differences in each of 3 coral reef scenes. Press Enter to start.';
  } else if (screen === 'level-done') {
    status.textContent = `Scene complete! Time bonus ${g.levelBonus} points, score ${g.score}. Next scene coming up.`;
  } else if (screen === 'win') {
    status.textContent = `You found them all. Final score ${g.score}.`;
  } else if (screen === 'game-over') {
    status.textContent = `Time ran out. Score ${g.score}. Press R to try again.`;
  }
}

let last = performance.now();
let accumulator = 0;
let announced = '';

function frame(now) {
  const dt = Math.min(0.25, (now - last) / 1000);
  last = now;
  accumulator += dt;
  while (accumulator >= STEP) {
    gameApi.update(STEP, now);
    accumulator -= STEP;
  }
  renderer.render(gameApi, input, now);
  // The line includes the whole seconds left, so the status line (and any
  // test reading it) refreshes once a second while the clock runs.
  const line = `${gameApi.state.screen}|${gameApi.state.level}|${gameApi.state.found.size}|${gameApi.state.score}|${Math.ceil(gameApi.state.timeLeft)}`;
  if (line !== announced) {
    announced = line;
    announce();
  }
  requestAnimationFrame(frame);
}

// U toggles sound on and off (the magnifier is M, handled by input.js).
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'u') {
    const muted = toggleMute();
    if (status) status.textContent = muted ? 'Sound off.' : 'Sound on.';
  }
});

resize();
window.addEventListener('resize', resize);
requestAnimationFrame(frame);
