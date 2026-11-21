// Jungle Spotter v2 — mouse + keyboard input.
// Mouse: move tracks the panel + scene coords (for the magnifier), click
// hit-tests the nearest unfound difference in either panel. Keyboard: arrows
// move a crosshair, Enter/Space marks it, H hints, M toggles the magnifier,
// Enter starts / advances, R restarts, Esc returns to the title.
import { CROSSHAIR_FINE_STEP, CROSSHAIR_STEP, PANEL_A_X, PANEL_B_X, PANEL_H, PANEL_W, PANEL_Y } from './config.js';
import { currentScene, markFound, markWrong, nextScene, startGame, useHint } from './game.js';

export function createUI(panels) {
  return {
    panels,
    mouse: { x: 0, y: 0, panel: null, inside: false },
    magnifier: false,
    keyboardMode: false,
  };
}

export function panelAt(clientX, clientY, rect, scale) {
  const x = (clientX - rect.left) / scale;
  const y = (clientY - rect.top) / scale;
  if (y >= PANEL_Y && y <= PANEL_Y + PANEL_H) {
    if (x >= PANEL_A_X && x <= PANEL_A_X + PANEL_W) {
      return { panel: 'A', x: x - PANEL_A_X, y: y - PANEL_Y };
    }
    if (x >= PANEL_B_X && x <= PANEL_B_X + PANEL_W) {
      return { panel: 'B', x: x - PANEL_B_X, y: y - PANEL_Y };
    }
  }
  return { panel: null, x: 0, y: 0 };
}

export function attachInput(canvas, game, ui, sfx) {
  function scaleOf() {
    const rect = canvas.getBoundingClientRect();
    return { rect, scale: rect.width / canvas.width };
  }

  canvas.addEventListener('mousemove', (e) => {
    const { rect, scale } = scaleOf();
    const hit = panelAt(e.clientX, e.clientY, rect, scale);
    ui.mouse.x = hit.x;
    ui.mouse.y = hit.y;
    ui.mouse.panel = hit.panel;
    ui.mouse.inside = hit.panel !== null;
    ui.keyboardMode = false;
  });

  canvas.addEventListener('mouseleave', () => {
    ui.mouse.inside = false;
    ui.mouse.panel = null;
  });

  canvas.addEventListener('click', (e) => {
    if (game.screen === 'title') {
      startGame(game);
      sfx.click();
      return;
    }
    if (game.screen === 'levelComplete') {
      nextScene(game);
      sfx.click();
      return;
    }
    if (game.screen === 'win' || game.screen === 'gameOver') {
      startGame(game);
      sfx.click();
      return;
    }
    const { rect, scale } = scaleOf();
    const hit = panelAt(e.clientX, e.clientY, rect, scale);
    if (!hit.panel) return;
    tryMark(game, hit.x, hit.y, hit.panel, sfx);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (game.screen === 'title') {
        startGame(game);
        sfx.click();
      } else if (game.screen === 'levelComplete') {
        nextScene(game);
        sfx.click();
      } else if (game.screen === 'win' || game.screen === 'gameOver') {
        startGame(game);
        sfx.click();
      } else if (ui.keyboardMode) {
        tryMark(game, game.crosshair.x, game.crosshair.y, game.crosshair.panel, sfx);
      }
      e.preventDefault();
      return;
    }
    if (e.key === ' ') {
      if (game.screen === 'playing' && ui.keyboardMode) {
        tryMark(game, game.crosshair.x, game.crosshair.y, game.crosshair.panel, sfx);
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      if (game.screen !== 'title') startGame(game);
      return;
    }
    if (e.key === 'Escape') {
      game.screen = 'title';
      return;
    }
    if (e.key === 'h' || e.key === 'H') {
      if (game.screen === 'playing' && useHint(game)) sfx.hint();
      return;
    }
    if (e.key === 'm' || e.key === 'M') {
      ui.magnifier = !ui.magnifier;
      sfx.click();
      return;
    }
    if (e.key.startsWith('Arrow')) {
      if (game.screen !== 'playing') return;
      ui.keyboardMode = true;
      const step = e.shiftKey ? CROSSHAIR_FINE_STEP : CROSSHAIR_STEP;
      const c = game.crosshair;
      if (e.key === 'ArrowLeft') c.x = Math.max(0, c.x - step);
      if (e.key === 'ArrowRight') c.x = Math.min(PANEL_W, c.x + step);
      if (e.key === 'ArrowUp') c.y = Math.max(0, c.y - step);
      if (e.key === 'ArrowDown') c.y = Math.min(PANEL_H, c.y + step);
      // crosshair switches panel with Tab-like wrap: hold Alt+Arrow to swap
      if (e.altKey) c.panel = c.panel === 'A' ? 'B' : 'A';
      e.preventDefault();
    }
    if (e.key === 'Tab') {
      if (game.screen === 'playing') {
        ui.keyboardMode = true;
        game.crosshair.panel = game.crosshair.panel === 'A' ? 'B' : 'A';
        e.preventDefault();
      }
    }
  });
}

function tryMark(game, x, y, panel, sfx) {
  if (game.screen !== 'playing') return;
  const scene = currentScene(game);
  let best = null;
  let bestD = Infinity;
  scene.diffs.forEach((d, i) => {
    if (game.found.has(i)) return;
    const dist = Math.hypot(d.x - x, d.y - y);
    if (dist < d.r + 10 && dist < bestD) {
      best = i;
      bestD = dist;
    }
  });
  if (best !== null) {
    markFound(game, best, panel);
    sfx.correct();
  } else {
    markWrong(game, x, y, panel);
    sfx.wrong();
  }
}
