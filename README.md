# ★ Starlight Station — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sami30357/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sami30357/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A bright, cheerful spot-the-difference game set in space — built for the
[best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
bounty on [make.fun](https://make.fun).

## How to play

Two pictures sit side by side and look identical — but **7 things are
different**. Click a difference (or move the gold cursor with the arrow keys
and press **Enter**) to mark it with a green ring and a check mark. Find all
7 before the **2:30** timer runs out to clear the scene.

- **+100 points** per difference found, **−10** for a wrong click
- **Time bonus** when a scene is cleared
- **H** — hint: a pulsing gold ring around one difference you haven't found yet (3 per scene)
- **M** — 2× magnifier lens that follows your cursor
- **Shift + arrows** — fine cursor movement

## The three scenes

1. **Moon Base Alpha** — a lunar outpost under a big blue Earth: a habitat
   dome, a rocket, a rover, an astronaut and a solar panel.
2. **Orbital Station** — a bright station above a ringed teal planet, with
   solar wings, a docking shuttle and a tethered astronaut.
3. **Alien Planet Garden** — a friendly world of mushroom houses, crystal
   clusters, puffball trees and a three-eyed alien.

All artwork is drawn procedurally on canvas — no images, no network requests,
no sound files (effects are synthesized with WebAudio). Your best score is
saved in localStorage.

## Run it

```sh
# serve the game/ folder with any static server, then open index.html
npx serve game
```

## Verify it

```sh
# from the repo root — builds the dossier the judge reads
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are staged with URL parameters (see `game/src/shots.js`), e.g.
`index.html?scene=0&found=0,2,4&autostart=1` starts scene 1 with three
differences already found.

## Files

- `game/index.html` — page, HUD and screens
- `game/src/config.js` — tuning constants
- `game/src/scenes.js` — the three procedural scenes and their differences
- `game/src/game.js` — state machine (score, timer, hints, screens)
- `game/src/render.js` — canvas rendering, markers, magnifier, HUD
- `game/src/input.js` — mouse + keyboard controls
- `game/src/audio.js` — synthesized WebAudio sound effects
- `game/src/main.js` — bootstrap and animation loop
- `game/src/shots.js` — screenshot staging helper (URL parameters)
- `main.ts` — make.fun entry point, builds `dossier.json`
