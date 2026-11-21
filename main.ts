// Starlight Station — entry point (Node 22, standard library only).
// The grader runs `node /bot/main.ts` with the repo mounted read-only at /bot
// and an empty output dir at MAKEFUN_OUTPUT_DIR. This script copies the game
// and screenshots beside it into the output dir and writes dossier.json there
// with the vendored make.fun library.
//
//   MAKEFUN_BOT_DIR  — entry (repo) dir; defaults to this file's own dir.
//   MAKEFUN_OUTPUT_DIR — output dir; defaults to /output.
//   Locally: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const entryDir = process.env.MAKEFUN_BOT_DIR || fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(entryDir, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(entryDir, 'screenshots'))) {
  cpSync(join(entryDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of
// game files, in all, or a path under game/ over 1000 bytes).
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Starlight Station dossier written: ${dossier.length} bytes -> ${join(outDir, 'dossier.json')}`);
