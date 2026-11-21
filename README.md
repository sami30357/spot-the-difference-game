# 🌿 Jungle Spotter — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sami30357/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sami30357/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A bright-daylight jungle spot-the-difference game, built for the
[make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
Two near-identical jungle pictures side by side — find the 7 differences in
each of 3 scenes before the timer runs out.

## How to play

- **Click** a difference on either picture (or move with the **arrow keys**
  and press **Enter** / **Space** to mark it).
- Found differences get a green ring + check on **both** pictures.
- **+100** points per difference, **−10** for a wrong click, plus a time
  bonus when you clear a scene.
- **H** spends one of 3 hints per scene (a pulsing gold ring).
- **M** toggles a 2× magnifier lens that follows your mouse.
- 150 seconds per scene — clear all 3 scenes to win.

## Scenes

1. **Jungle Clearing** — sunny clearing with a monkey, a toucan and a pond.
2. **Riverbank** — a slow river with a crocodile, a kingfisher and lily pads.
3. **Canopy Trail** — deep canopy with parrots, a sloth and a shy snake.

## Tech

- Pure procedural Canvas 2D art — every leaf, animal and sunbeam is drawn
  in code. No images, no network requests, no libraries.
- Synthesized WebAudio sound effects (no sound files).
- Best score saved in `localStorage`.
- Static files only: open `game/index.html` or serve the folder with
  `node serve.ts` and visit http://localhost:8080.

## License

MIT — see [LICENSE](LICENSE).
