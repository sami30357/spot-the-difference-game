// Jungle Spotter v2 — screenshot presets for ?shot= modes, used by the
// dossier screenshots and by the local Playwright harness. Each preset puts
// the game in a deterministic, photogenic state:
//   start — title screen over scene 1
//   play  — mid-game: 3 differences found (markers on both panels),
//           4 still hiding, counter + timer visible; ?scene=N picks the scene
//   end   — win screen after all 3 scenes
import { SCENES } from './scenes.js';
import { beginScene, markFound } from './game.js';

export function applyShot(game, mode, sceneIndex = 0) {
  const scene = Math.max(0, Math.min(SCENES.length - 1, sceneIndex | 0));
  if (mode === 'start') {
    game.screen = 'title';
    game.sceneIndex = 0;
    beginScene(game);
    return;
  }
  if (mode === 'play') {
    game.sceneIndex = scene;
    game.score = 0;
    game.totalFound = 0;
    beginScene(game);
    game.screen = 'playing';
    // mark the first three differences as found — deterministic, shows markers
    // (each adds +100, so the score reads 300, matching the 3 found)
    for (const i of [0, 2, 4]) markFound(game, i, 'A');
    game.timeLeft = 118;
    game.message = 'Found! 4 left';
    game.messageTimer = 999;
    return;
  }
  if (mode === 'end') {
    game.sceneIndex = SCENES.length - 1;
    beginScene(game);
    game.score = 2450;
    game.totalFound = 21;
    game.best = 2450;
    game.screen = 'win';
    return;
  }
  // unknown mode: fall back to the title screen
  game.screen = 'title';
  beginScene(game);
}
