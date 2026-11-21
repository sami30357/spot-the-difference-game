// Reef Spotter — a complete spot-the-difference game (Node 22, standard
// library only). The game is this directory's game/ folder: plain static files
// a desktop browser loads offline (game/index.html and its ES modules, no
// library and no network request). This program hands it in: it copies game/
// and screenshots/ from beside this file to the output directory and writes
// output/dossier.json, the summary the judge reads, with the vendored
// make.fun library.
//
// The grader runs `node /bot/main.ts` with the repo read-only at /bot,
// MAKEFUN_BOT_DIR=/bot and MAKEFUN_OUTPUT_DIR=/output. The dossier builder's
// first argument is the ENTRY directory (the repo root, where game/ and
// screenshots/ live), never the output directory; the dossier itself is
// written to join(OUTPUT, 'dossier.json').
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The entry directory: the repo root, from the grader's env var when present.
// When MAKEFUN_BOT_DIR is set, the grader's repo is there; otherwise this file
// sits at the repo root, so its own directory is the entry.
const entry = process.env.MAKEFUN_BOT_DIR ?? fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(entry, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(entry, 'screenshots'))) {
  cpSync(join(entry, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of
// game files, in all, or a path under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(entry, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
