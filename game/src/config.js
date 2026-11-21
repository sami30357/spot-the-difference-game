// Starlight Station — Spot the Difference (v3, space theme)
// Shared tuning constants. Everything the other modules need lives here so
// the game can be re-balanced from one place.

export const CONFIG = {
  // One square scene panel, in CSS pixels. Two panels sit side by side.
  panelSize: 620,
  panelGap: 20,
  canvasMargin: 16,

  // Play rules
  differencesPerScene: 7,
  timePerSceneSeconds: 150,
  pointsPerFind: 100,
  pointsPerMiss: -10,
  timeBonusPerSecond: 2,
  hintsPerScene: 3,
  hintPulseMs: 2600,
  magnifierRadius: 95,
  magnifierZoom: 2,

  // Cursor movement (arrow keys)
  cursorStep: 14,
  cursorStepFine: 4,

  // Storage
  bestScoreKey: 'starlightStationBest',

  // Number of scenes in the game.
  sceneCount: 3,

  // Colours used by the HUD chrome (scene art has its own palette)
  hud: {
    ink: '#eef4ff',
    dim: '#9fb2d8',
    accent: '#ffd166',
    good: '#3ddc84',
    bad: '#ff5d73',
    panel: '#101a33',
    panelBorder: '#2c3f6e',
  },
};

// Total differences across the whole game (3 scenes x 7).
export const TOTAL_DIFFERENCES = CONFIG.sceneCount * CONFIG.differencesPerScene;

// "2:30" style clock for a seconds value.
export function formatTime(seconds) {
  const t = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}
