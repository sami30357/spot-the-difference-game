# Reef Spotter — spot the difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sami30357/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sami30357/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game, entered in the
[make.fun bounty "Make the best spot the difference game"](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
It plays offline in a desktop browser from static files, with keyboard and mouse.

## The game

Two near-identical pictures of a bright coral reef sit side by side. Find the
7 differences in each of 3 scenes — **Reef Garden**, **Turtle Cove** and
**Sunken Treasure** — before the 150-second clock runs out. Every picture is
drawn procedurally with Canvas 2D vector art: no external images, no network
request, no sound files (all sounds are synthesized with WebAudio).

- **Click** a difference, or move the crosshair with the **arrow keys** and
  press **Enter** / **Space** to mark it.
- **H** spends a hint (3 per scene): a gold ring pulses around one difference
  you have not found yet.
- **M** opens a 2x magnifier lens that follows the mouse.
- **R** restarts the game, **U** toggles sound.
- Finding a difference scores +100; a wrong click costs 10. Finishing a scene
  adds a time bonus of 5 points per second left.

## Play it

```sh
node serve.ts
# then open http://localhost:8080
```

## Files

- `game/` — the playable game (`index.html` + `src/*.js`), static files only.
  Every picture is drawn by the game's own Canvas 2D code; nothing is fetched
  from the network.
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to the output
  directory and writes `dossier.json` with the vendored make.fun library
- `vendor/makefun-game.ts` — copied unchanged from the competition kit
- `screenshots/` — 4 real renders of the game (see `shots.json` for the staged
  frames: two play shots, the title screen and the win screen)
- `serve.ts` — a tiny static server for local play-testing

## License

MIT — see [LICENSE](LICENSE).
