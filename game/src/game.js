// Starlight Station — game state machine.
// Owns the score, timer, found differences, hints and screen flow. Rendering
// lives in render.js, input in input.js; this module only decides what is true.

import { CONFIG, TOTAL_DIFFERENCES } from './config.js';
import { SCENES } from './scenes.js';
import { sfx } from './audio.js';

export const SCREENS = {
  TITLE: 'title',
  PLAYING: 'playing',
  LEVEL_DONE: 'level-done',
  WIN: 'win',
  GAME_OVER: 'game-over',
};

export function createGame(onChange) {
  const state = {
    screen: SCREENS.TITLE,
    sceneIndex: 0,
    score: 0,
    best: 0,
    timeLeft: CONFIG.timePerSceneSeconds,
    found: new Set(),       // indices of found differences in the current scene
    hintsLeft: CONFIG.hintsPerScene,
    hintIndex: -1,          // difference currently pulsing, or -1
    hintUntil: 0,
    magnifier: false,
    cursor: { panel: 0, x: CONFIG.panelSize / 2, y: CONFIG.panelSize / 2, visible: false },
    wrongFlash: null,       // {panel, x, y, until} for a red X
    levelBonus: 0,
    totalFound: 0,
    muted: false,
    lastTickSecond: -1,
  };

  try { state.best = Number(localStorage.getItem(CONFIG.bestScoreKey) || 0) || 0; } catch (_) { state.best = 0; }

  function emit() { if (onChange) onChange(state); }
  function scene() { return SCENES[state.sceneIndex]; }

  function saveBest() {
    if (state.score > state.best) {
      state.best = state.score;
      try { localStorage.setItem(CONFIG.bestScoreKey, String(state.best)); } catch (_) {}
    }
  }

  function startGame() {
    state.sceneIndex = 0;
    state.score = 0;
    state.totalFound = 0;
    state.levelBonus = 0;
    startScene(0);
    state.screen = SCREENS.PLAYING;
    sfx.unlock();
    emit();
  }

  function startScene(i) {
    state.sceneIndex = i;
    state.found = new Set();
    state.timeLeft = CONFIG.timePerSceneSeconds;
    state.hintsLeft = CONFIG.hintsPerScene;
    state.hintIndex = -1;
    state.wrongFlash = null;
    state.lastTickSecond = -1;
    sfx.levelStart();
    emit();
  }

  function markAt(panel, x, y) {
    if (state.screen !== SCREENS.PLAYING) return false;
    const diffs = scene().differences;
    for (let i = 0; i < diffs.length; i++) {
      if (state.found.has(i)) continue;
      const d = diffs[i];
      const dx = x - d.x, dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        state.found.add(i);
        state.totalFound += 1;
        state.score += CONFIG.pointsPerFind;
        sfx.found();
        if (state.found.size === diffs.length) completeScene();
        emit();
        return true;
      }
    }
    // Miss: small penalty, red X flash at the click point.
    state.score = Math.max(0, state.score + CONFIG.pointsPerMiss);
    state.wrongFlash = { panel, x, y, until: performance.now() + 650 };
    sfx.wrong();
    emit();
    return false;
  }

  function completeScene() {
    state.levelBonus = Math.round(state.timeLeft) * CONFIG.timeBonusPerSecond;
    state.score += state.levelBonus;
    saveBest();
    sfx.levelComplete();
    if (state.sceneIndex >= SCENES.length - 1) {
      state.screen = SCREENS.WIN;
      sfx.win();
    } else {
      state.screen = SCREENS.LEVEL_DONE;
    }
    emit();
  }

  function nextScene() {
    startScene(state.sceneIndex + 1);
    state.screen = SCREENS.PLAYING;
    emit();
  }

  function useHint() {
    if (state.screen !== SCREENS.PLAYING) return;
    if (state.hintsLeft <= 0) return;
    const remaining = scene().differences.map((_, i) => i).filter((i) => !state.found.has(i));
    if (!remaining.length) return;
    state.hintsLeft -= 1;
    state.hintIndex = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintUntil = performance.now() + CONFIG.hintPulseMs;
    sfx.hint();
    emit();
  }

  function toggleMagnifier() {
    state.magnifier = !state.magnifier;
    sfx.click();
    emit();
  }

  function toggleMute() {
    state.muted = !state.muted;
    sfx.setMuted(state.muted);
    emit();
  }

  function gameOver() {
    state.screen = SCREENS.GAME_OVER;
    saveBest();
    sfx.gameOver();
    emit();
  }

  function tick(dtSeconds) {
    if (state.screen !== SCREENS.PLAYING) return;
    state.timeLeft -= dtSeconds;
    const whole = Math.ceil(state.timeLeft);
    if (whole <= 10 && whole !== state.lastTickSecond && whole > 0) {
      state.lastTickSecond = whole;
      sfx.tick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      gameOver();
      return;
    }
    if (state.hintIndex >= 0 && performance.now() > state.hintUntil) state.hintIndex = -1;
    if (state.wrongFlash && performance.now() > state.wrongFlash.until) state.wrongFlash = null;
    emit();
  }

  return {
    state,
    scene,
    startGame,
    nextScene,
    markAt,
    useHint,
    toggleMagnifier,
    toggleMute,
    tick,
    get foundCount() { return state.found.size; },
    get remainingCount() { return scene().differences.length - state.found.size; },
    get totalFound() { return state.totalFound; },
    get totalDifferences() { return TOTAL_DIFFERENCES; },
  };
}
