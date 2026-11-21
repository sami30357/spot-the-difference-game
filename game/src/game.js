// Reef Spotter — the rules and the state machine.
// Screens: title, play, level-done, win, game-over. One level is one scene with
// seven differences; finding all seven ends the level with a time bonus, and
// finishing all three scenes wins the game. The clock runs only while playing.

import {
  PANEL,
  DIFFS_PER_SCENE,
  LEVELS,
  LEVEL_SECONDS,
  HINTS_PER_LEVEL,
  POINTS_FOUND,
  POINTS_MISS,
  TIME_BONUS_PER_SECOND,
  HIT_RADIUS,
  BEST_KEY,
  SCENE_NAMES,
} from './config.js';
import { sceneDiffs } from './scenes.js';
import { playFound, playMiss, playHint, playLevel, playWin, playTick, playClick } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL_DONE = 'level-done';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'game-over';

const LEVEL_DONE_MS = 3000;
const HINT_MS = 2500;
const MISS_FLASH_MS = 350;

function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Best score is a nicety; storage failure must not break the game.
  }
}

export function createGame() {
  const game = {
    screen: SCREEN_TITLE,
    level: 0,
    found: new Set(),
    score: 0,
    best: loadBest(),
    timeLeft: LEVEL_SECONDS,
    hintsLeft: HINTS_PER_LEVEL,
    magnifierOn: false,
    hintPulse: null, // { diff, until }
    missFlashUntil: 0,
    levelBonus: 0,
    levelDoneUntil: 0,
    frozen: false, // staged screenshots: the clock and timers stand still
    lastTickSecond: -1,
    message: '',
  };

  function diffs() {
    return sceneDiffs(game.level);
  }

  function resetLevel(level) {
    game.level = level;
    game.found = new Set();
    game.timeLeft = LEVEL_SECONDS;
    game.hintsLeft = HINTS_PER_LEVEL;
    game.hintPulse = null;
    game.levelBonus = 0;
    game.lastTickSecond = -1;
  }

  function startGame() {
    game.score = 0;
    resetLevel(0);
    game.screen = SCREEN_PLAY;
    playClick();
  }

  function completeLevel(now) {
    game.levelBonus = Math.ceil(game.timeLeft) * TIME_BONUS_PER_SECOND;
    game.score += game.levelBonus;
    game.screen = SCREEN_LEVEL_DONE;
    game.levelDoneUntil = now + LEVEL_DONE_MS;
    playLevel();
  }

  function advanceLevel(now) {
    if (game.level + 1 >= LEVELS) {
      game.screen = SCREEN_WIN;
      if (game.score > game.best) {
        game.best = game.score;
        saveBest(game.score);
      }
      playWin();
      return;
    }
    resetLevel(game.level + 1);
    game.screen = SCREEN_PLAY;
  }

  function gameOver() {
    game.screen = SCREEN_OVER;
    if (game.score > game.best) {
      game.best = game.score;
      saveBest(game.score);
    }
    playMiss();
  }

  /** Mark the field position (x, y): find a difference or count a miss. */
  function mark(x, y, now) {
    if (game.screen === SCREEN_TITLE) {
      startGame();
      return;
    }
    if (game.screen === SCREEN_LEVEL_DONE) {
      advanceLevel(now);
      return;
    }
    if (game.screen === SCREEN_WIN || game.screen === SCREEN_OVER) {
      startGame();
      return;
    }
    if (game.screen !== SCREEN_PLAY) return;

    // Which panel was clicked, and where inside it?
    let local = null;
    if (x >= PANEL.leftX && x < PANEL.leftX + PANEL.w && y >= PANEL.y && y < PANEL.y + PANEL.h) {
      local = { x: x - PANEL.leftX, y: y - PANEL.y };
    } else if (x >= PANEL.rightX && x < PANEL.rightX + PANEL.w && y >= PANEL.y && y < PANEL.y + PANEL.h) {
      local = { x: x - PANEL.rightX, y: y - PANEL.y };
    }
    if (!local) return; // Clicked the HUD or the gap: nothing happens.

    const list = diffs();
    // A click on a difference already found is ignored, not a miss.
    for (let i = 0; i < list.length; i += 1) {
      if (!game.found.has(i)) continue;
      const d = list[i];
      const dx = local.x - d.x;
      const dy = local.y - d.y;
      if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) return;
    }
    let hit = -1;
    for (let i = 0; i < list.length; i += 1) {
      if (game.found.has(i)) continue;
      const d = list[i];
      const dx = local.x - d.x;
      const dy = local.y - d.y;
      if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) {
        hit = i;
        break;
      }
    }
    if (hit >= 0) {
      game.found.add(hit);
      game.score += POINTS_FOUND;
      game.hintPulse = null;
      playFound();
      if (game.found.size === DIFFS_PER_SCENE) completeLevel(now);
    } else {
      game.score = Math.max(0, game.score - POINTS_MISS);
      game.missFlashUntil = now + MISS_FLASH_MS;
      playMiss();
    }
  }

  /** Spend one hint: pulse the next unfound difference for a few seconds. */
  function hint(now) {
    if (game.screen !== SCREEN_PLAY) return;
    if (game.hintsLeft <= 0) {
      game.message = 'No hints left!';
      return;
    }
    const list = diffs();
    const remaining = list.map((_, i) => i).filter((i) => !game.found.has(i));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    game.hintPulse = { diff: pick, until: now + HINT_MS };
    game.hintsLeft -= 1;
    game.message = '';
    playHint();
  }

  function toggleMagnifier() {
    game.magnifierOn = !game.magnifierOn;
    playClick();
  }

  function restart() {
    startGame();
  }

  function advance(now) {
    if (game.screen === SCREEN_TITLE) startGame();
    else if (game.screen === SCREEN_LEVEL_DONE) advanceLevel(now);
    else if (game.screen === SCREEN_WIN || game.screen === SCREEN_OVER) startGame();
  }

  /** Advance the clock and any timed overlays. `dt` is seconds, `now` is ms. */
  function update(dt, now) {
    if (game.frozen) return;
    if (game.screen === SCREEN_PLAY) {
      game.timeLeft -= dt;
      const whole = Math.ceil(game.timeLeft);
      if (whole <= 10 && whole > 0 && whole !== game.lastTickSecond) {
        game.lastTickSecond = whole;
        playTick();
      }
      if (game.timeLeft <= 0) {
        game.timeLeft = 0;
        gameOver();
      }
    } else if (game.screen === SCREEN_LEVEL_DONE && now >= game.levelDoneUntil) {
      advanceLevel(now);
    }
    if (game.hintPulse && now >= game.hintPulse.until) game.hintPulse = null;
  }

  /** How many differences are still unfound in this scene. */
  function remaining() {
    return DIFFS_PER_SCENE - game.found.size;
  }

  /** True while the red miss flash is still showing. */
  function missFlashing(now) {
    return now < game.missFlashUntil;
  }

  function sceneName() {
    return SCENE_NAMES[game.level];
  }

  return {
    state: game,
    mark,
    hint,
    toggleMagnifier,
    restart,
    advance,
    update,
    remaining,
    missFlashing,
    sceneName,
    startGame,
    resetLevel,
  };
}


/**
 * Stage a fixed frame for a screenshot (?shot=start|play|play2|win).
 * The frame is what real play looks like — found markers on, several
 * differences still unfound, the counter showing what remains — and the clock
 * is frozen so the frame never changes while the screenshot is taken.
 * Returns the screen the frame shows.
 */
export function stageShot(gameApi, name) {
  const g = gameApi.state;
  g.frozen = true;
  if (name === 'play2') {
    gameApi.resetLevel(1);
    g.found = new Set([1, 3, 4, 5]); // four found, three still to find
    g.score = 400;
    g.timeLeft = 98;
    g.hintsLeft = 2;
    g.screen = SCREEN_PLAY;
    return SCREEN_PLAY;
  }
  if (name === 'win') {
    gameApi.resetLevel(2);
    g.found = new Set([0, 1, 2, 3, 4, 5, 6]);
    g.score = 2450;
    g.timeLeft = 61;
    g.screen = SCREEN_WIN;
    if (g.score > g.best) g.best = g.score;
    return SCREEN_WIN;
  }
  if (name === 'play') {
    gameApi.resetLevel(0);
    g.found = new Set([0, 2, 4]); // three found, four still to find
    g.score = 300;
    g.timeLeft = 132;
    g.hintsLeft = 2;
    g.screen = SCREEN_PLAY;
    return SCREEN_PLAY;
  }
  // Any other name (including 'start') is the title screen.
  gameApi.resetLevel(0);
  g.score = 0;
  g.screen = SCREEN_TITLE;
  return SCREEN_TITLE;
}
