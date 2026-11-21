// Jungle Spotter v2 — game state machine: title, playing, level-complete, win,
// game-over. Pure logic; rendering lives in render.js, input in input.js.
import {
  SCENES,
} from './scenes.js';
import {
  BEST_KEY,
  HINTS_PER_SCENE,
  SCORE_FOUND,
  SCORE_WRONG,
  TIME_BONUS_PER_SEC,
  TIME_PER_SCENE,
} from './config.js';

export function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(score) {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // storage unavailable (private mode) — best score just won't persist
  }
}

export function createGame() {
  return {
    screen: 'title', // title | playing | levelComplete | win | gameOver
    sceneIndex: 0,
    found: new Set(),
    hinted: null, // diff currently revealed by a hint, or null
    hintTimer: 0,
    score: 0,
    best: loadBest(),
    timeLeft: TIME_PER_SCENE,
    hintsLeft: HINTS_PER_SCENE,
    wrongs: 0,
    foundCount: 0,
    totalFound: 0,
    message: '',
    messageTimer: 0,
    flash: null, // {x, y, panel, ok} — brief click feedback ring
    flashTimer: 0,
    crosshair: { panel: 'A', x: 300, y: 220 },
    sceneStartScore: 0,
  };
}

export function currentScene(game) {
  return SCENES[game.sceneIndex];
}

export function diffsLeft(game) {
  return currentScene(game).diffs.length - game.found.size;
}

export function startGame(game) {
  game.sceneIndex = 0;
  game.score = 0;
  game.totalFound = 0;
  game.wrongs = 0;
  game.best = loadBest();
  beginScene(game);
  game.screen = 'playing';
}

export function beginScene(game) {
  game.found = new Set();
  game.hinted = null;
  game.hintTimer = 0;
  game.timeLeft = TIME_PER_SCENE;
  game.hintsLeft = HINTS_PER_SCENE;
  game.sceneStartScore = game.score;
  game.message = '';
  game.messageTimer = 0;
  game.flash = null;
}

export function timeBonus(game) {
  return Math.round(game.timeLeft) * TIME_BONUS_PER_SEC;
}

export function markFound(game, diffIndex, panel) {
  if (game.screen !== 'playing' || game.found.has(diffIndex)) return false;
  game.found.add(diffIndex);
  game.foundCount += 1;
  game.totalFound += 1;
  game.score += SCORE_FOUND;
  game.flash = { x: currentScene(game).diffs[diffIndex].x, y: currentScene(game).diffs[diffIndex].y, panel, ok: true };
  game.flashTimer = 0.5;
  const left = diffsLeft(game);
  if (left === 0) {
    const bonus = timeBonus(game);
    game.score += bonus;
    game.message = `Scene clear! Time bonus +${bonus}`;
    game.messageTimer = 2.5;
    if (game.sceneIndex + 1 >= SCENES.length) {
      game.screen = 'win';
      if (game.score > game.best) {
        game.best = game.score;
        saveBest(game.score);
      }
    } else {
      game.screen = 'levelComplete';
    }
  } else {
    game.message = `Found! ${left} left`;
    game.messageTimer = 1.2;
  }
  return true;
}

export function markWrong(game, x, y, panel) {
  if (game.screen !== 'playing') return;
  game.score = Math.max(0, game.score + SCORE_WRONG);
  game.wrongs += 1;
  game.flash = { x, y, panel, ok: false };
  game.flashTimer = 0.45;
  game.message = 'Not a difference — −10';
  game.messageTimer = 1.2;
}

export function useHint(game) {
  if (game.screen !== 'playing' || game.hintsLeft <= 0) return false;
  const remaining = currentScene(game).diffs
    .map((d, i) => i)
    .filter((i) => !game.found.has(i));
  if (remaining.length === 0) return false;
  game.hintsLeft -= 1;
  // reveal the first unfound difference with a pulsing gold ring
  game.hinted = remaining[0];
  game.hintTimer = 3;
  game.message = `Hint: ${currentScene(game).diffs[remaining[0]].label}`;
  game.messageTimer = 2;
  return true;
}

export function nextScene(game) {
  if (game.screen !== 'levelComplete') return;
  game.sceneIndex += 1;
  beginScene(game);
  game.screen = 'playing';
}

export function tick(game, dt) {
  if (game.messageTimer > 0) game.messageTimer -= dt;
  if (game.flashTimer > 0) game.flashTimer -= dt;
  if (game.hintTimer > 0) {
    game.hintTimer -= dt;
    if (game.hintTimer <= 0) game.hinted = null;
  }
  if (game.screen !== 'playing') return;
  game.timeLeft -= dt;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = 'gameOver';
    if (game.score > game.best) {
      game.best = game.score;
      saveBest(game.score);
    }
  }
}
