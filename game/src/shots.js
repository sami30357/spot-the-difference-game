// Starlight Station — screenshot helper.
// Reads URL parameters so Playwright can stage exact shots without clicking:
//   ?scene=0&found=0,2,4&autostart=1   — start scene 0 with diffs 0, 2 and 4 found
//   ?scene=1&found=1&hint=3           — start scene 1, pulse a hint on diff 3
//   ?scene=2&mag=1                    — start scene 2 with the magnifier on
// Runs after main.js exposes window.__game. Only used for screenshots; the
// normal game path never passes these parameters.

(function stageShot() {
  const params = new URLSearchParams(location.search);
  if (!params.has('autostart') && !params.has('scene')) return;

  function ready() {
    const game = window.__game;
    if (!game) { setTimeout(ready, 30); return; }
    const sceneIdx = Math.min(2, Math.max(0, Number(params.get('scene') || 0)));
    game.startGame();
    // Jump to the requested scene (startGame always begins at scene 0).
    while (game.state.sceneIndex < sceneIdx) {
      // Force-complete the current scene by marking every difference.
      const diffs = game.scene().differences;
      diffs.forEach((d, i) => { if (!game.state.found.has(i)) game.markAt(0, d.x, d.y); });
      if (game.state.screen === 'level-done') game.nextScene();
      else break;
    }
    // Pre-mark the requested differences as found.
    const found = (params.get('found') || '').split(',').filter(Boolean).map(Number);
    for (const i of found) {
      const d = game.scene().differences[i];
      if (d && !game.state.found.has(i)) game.markAt(0, d.x, d.y);
    }
    // Optional hint pulse on one difference.
    if (params.has('hint')) {
      const i = Number(params.get('hint'));
      if (game.scene().differences[i] && !game.state.found.has(i)) {
        game.state.hintIndex = i;
        game.state.hintUntil = performance.now() + 60000;
        game.state.hintsLeft = Math.max(0, game.state.hintsLeft - 1);
      }
    }
    // Optional magnifier, parked over a difference.
    if (params.get('mag') === '1') {
      game.state.magnifier = true;
      const d = game.scene().differences[0];
      game.state.cursor = { panel: 0, x: d.x, y: d.y, visible: true };
    }
    // Optional explicit cursor: ?cursor=panel,x,y (e.g. cursor=1,300,200).
    if (params.has('cursor')) {
      const [p, x, y] = params.get('cursor').split(',').map(Number);
      game.state.cursor = { panel: p === 1 ? 1 : 0, x: x || 0, y: y || 0, visible: true };
    }
    // Freeze the timer display for stable screenshots.
    game.state.timeLeft = 132;
    window.__shotReady = true;
  }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);
})();
