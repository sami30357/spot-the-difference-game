// Reef Spotter — the staged frames behind ?shot=start|play|play2|win.
// Each shot is a real game state reached through the game's own rules (the
// staged finds are marked through the same `found` set real clicks fill), so
// the frame is what genuine play looks like and the same URL always gives the
// same frame: the clock is frozen while a shot is staged.

import { stageShot } from './game.js';

/** Read the ?shot= parameter (and an optional ?seed=) from the page URL. */
export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get('shot') || '',
    seed: Number(params.get('seed') || 1),
  };
}

/** The shot names this game stages, in the order shots.json lists them. */
export const SHOT_NAMES = ['play', 'play2', 'start', 'win'];

/**
 * Stage the named shot on `gameApi` and return the screen it shows.
 * An empty or unknown name leaves the game on its title screen.
 */
export function stageNamedShot(gameApi, name) {
  if (!name) return null;
  return stageShot(gameApi, name);
}
