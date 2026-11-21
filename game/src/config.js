// Reef Spotter — tuning, layout and palette in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

// The two picture panels, side by side. Every scene is drawn in panel-local
// coordinates (0..PANEL.w, 0..PANEL.h) and difference hit-tests use the same space.
export const PANEL = { w: 560, h: 420, leftX: 40, rightX: 680, y: 112 };

export const DIFFS_PER_SCENE = 7;
export const LEVELS = 3;

// Seconds of play per scene; the clock stops on the win screen and on title.
export const LEVEL_SECONDS = 150;
export const HINTS_PER_LEVEL = 3;
export const POINTS_FOUND = 100;
export const POINTS_MISS = 10;
export const TIME_BONUS_PER_SECOND = 5;

// How close a click (panel-local) must land to a difference centre to count.
export const HIT_RADIUS = 30;
// The keyboard cursor's step in logical pixels; Shift multiplies it.
export const CURSOR_STEP = 8;
export const CURSOR_STEP_FAST = 26;

// Magnifier lens: radius on screen, zoom factor, and the toggle key.
export const LENS = { radius: 95, zoom: 2 };

export const PALETTE = {
  page: '#0b2b3a',
  hud: '#06222e',
  hudLine: '#1d5a73',
  panelFrame: '#f7e9c8',
  panelShadow: 'rgba(0,0,0,0.35)',
  text: '#f4fbff',
  muted: '#9fc6d4',
  accent: '#ffd166',
  good: '#4ade80',
  bad: '#ff6b6b',
  ring: '#ffd166',
  ringFound: '#4ade80',
  cursor: '#ffffff',
  hintPulse: '#ffd166',
  button: '#0e7d9b',
  buttonHover: '#12a0c4',
  overlay: 'rgba(4, 26, 36, 0.78)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Keyboard: arrows move the cursor, Enter/Space marks, H hints, M magnifies. */
export const KEYS = {
  hint: 'h',
  magnifier: 'm',
  restart: 'r',
  advance: 'Enter',
  mark: ' ',
};

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'reef-spotter.best';

/** The three scenes, in play order, with their display names. */
export const SCENE_NAMES = ['Reef Garden', 'Turtle Cove', 'Sunken Treasure'];
