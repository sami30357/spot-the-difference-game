// Reef Spotter — the three scenes, drawn fresh every frame with Canvas 2D.
// Each scene is one function that paints the same picture twice: the left panel
// with no differences applied, the right panel with all seven. A difference is
// always a small, local change (a missing fish, a recoloured shell, a shorter
// blade), so the two pictures stay near-identical and every difference has a
// fixed centre and radius for hit-testing.
//
// Panel-local coordinates: x 0..560, y 0..420. The sand starts near y 350.

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function star(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(ang) * rad;
    const py = y + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** A simple fish facing right: body, tail, eye and (optionally) white stripes. */
function fish(ctx, x, y, size, body, stripes) {
  ctx.fillStyle = body;
  ellipse(ctx, x, y, size, size * 0.55);
  ctx.beginPath();
  ctx.moveTo(x - size * 0.8, y);
  ctx.lineTo(x - size * 1.5, y - size * 0.55);
  ctx.lineTo(x - size * 1.5, y + size * 0.55);
  ctx.closePath();
  ctx.fill();
  if (stripes > 0) {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < stripes; i += 1) {
      const sx = x - size * 0.45 + i * size * 0.45;
      ctx.fillRect(sx, y - size * 0.5, size * 0.14, size);
    }
  }
  ctx.fillStyle = '#10222b';
  circle(ctx, x + size * 0.55, y - size * 0.12, size * 0.11);
  ctx.fillStyle = '#ffffff';
  circle(ctx, x + size * 0.58, y - size * 0.16, size * 0.04);
}

/** A bubble: pale ring with a bright highlight dot. */
function bubble(ctx, x, y, r) {
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  circle(ctx, x - r * 0.35, y - r * 0.35, r * 0.22);
}

/** A coral branch: a tapered, curving stalk with a round tip. */
function branch(ctx, x, y, len, bend, width, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + bend, y - len * 0.55, x + bend * 1.4, y - len);
  ctx.stroke();
  ctx.fillStyle = colour;
  circle(ctx, x + bend * 1.4, y - len, width * 0.75);
}

/** A swaying seaweed blade, drawn as a filled tapering curve. */
function blade(ctx, x, y, height, lean, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x - 5, y);
  ctx.quadraticCurveTo(x + lean - 8, y - height * 0.6, x + lean, y - height);
  ctx.quadraticCurveTo(x + lean + 8, y - height * 0.6, x + 5, y);
  ctx.closePath();
  ctx.fill();
}

/** The shared backdrop: bright water, sun rays from above, sandy floor. */
function backdrop(ctx, w, h, sandY) {
  const water = ctx.createLinearGradient(0, 0, 0, h);
  water.addColorStop(0, '#4fd2ea');
  water.addColorStop(0.55, '#2aa8c6');
  water.addColorStop(1, '#1a7f9e');
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, w, h);
  // Distant reef silhouettes on the horizon, for depth.
  ctx.fillStyle = 'rgba(16, 90, 115, 0.35)';
  ctx.beginPath();
  ctx.moveTo(0, sandY);
  ctx.quadraticCurveTo(90, sandY - 52, 180, sandY - 18);
  ctx.quadraticCurveTo(260, sandY - 66, 350, sandY - 22);
  ctx.quadraticCurveTo(440, sandY - 58, 560, sandY - 14);
  ctx.lineTo(560, sandY);
  ctx.closePath();
  ctx.fill();
  // Sun rays slanting down from the surface.
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (let i = 0; i < 5; i += 1) {
    const rx = 30 + i * 118;
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx + 46, 0);
    ctx.lineTo(rx + 110, sandY);
    ctx.lineTo(rx + 30, sandY);
    ctx.closePath();
    ctx.fill();
  }
  // Floating plankton motes drifting in the light.
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  const motes = [[70, 60], [140, 130], [210, 50], [260, 200], [330, 90], [390, 160], [450, 60], [510, 140], [180, 240], [300, 260], [470, 230], [90, 190], [360, 40], [520, 260]];
  for (const [mx, my] of motes) circle(ctx, mx, my, 2);
  // Sandy floor with speckles.
  ctx.fillStyle = '#f2ddab';
  ctx.fillRect(0, sandY, w, h - sandY);
  ctx.fillStyle = '#e3c98f';
  const speckles = [[30, 372], [120, 398], [210, 366], [300, 404], [390, 372], [470, 398], [520, 366], [80, 412], [350, 388], [500, 412]];
  for (const [sx, sy] of speckles) ellipse(ctx, sx, sy, 9, 4);
  // A soft vignette so the picture reads as a framed photograph.
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(4,40,56,0.22)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

/** A shell: a fan of arcs on the sand. */
function shell(ctx, x, y, size, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, size, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin((i * Math.PI) / 5) * size, y - Math.cos((i * Math.PI) / 5) * size);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Scene 0 — Reef Garden. Differences:
//   0 clownfish stripes 3 -> 2      (150, 150)
//   1 starfish present -> gone      (120, 385)
//   2 shell pink -> blue            (430, 390)
//   3 bubble present -> gone        (280, 90)
//   4 coral tip orange -> purple    (464, 232) — the branch tip itself
//   5 seaweed blade tall -> short   (65, 280) — the blade's top half
//   6 yellow fish present -> gone   (300, 220)
// ---------------------------------------------------------------------------
export const DIFFS_0 = [
  { x: 150, y: 150, r: 30, label: 'clownfish stripes' },
  { x: 120, y: 385, r: 26, label: 'starfish' },
  { x: 430, y: 390, r: 24, label: 'shell colour' },
  { x: 280, y: 90, r: 18, label: 'bubble' },
  { x: 464, y: 232, r: 30, label: 'coral tip' },
  { x: 65, y: 280, r: 30, label: 'seaweed blade' },
  { x: 300, y: 220, r: 24, label: 'yellow fish' },
];

export function drawScene0(ctx, w, h, diffs) {
  backdrop(ctx, w, h, 350);
  // Coral clusters on the sand.
  branch(ctx, 60, 352, 90, -14, 12, '#ff7f9e');
  branch(ctx, 84, 352, 70, 10, 10, '#ff7f9e');
  branch(ctx, 108, 352, 95, 4, 11, '#ff9db4');
  branch(ctx, 430, 352, 80, -10, 11, '#ff9f43');
  branch(ctx, 452, 352, 100, 8, 12, '#ff9f43');
  // Difference 4: the tall orange branch tip turns purple.
  if (diffs.has(4)) branch(ctx, 472, 352, 120, -6, 12, '#b388ff');
  else branch(ctx, 472, 352, 120, -6, 12, '#ff9f43');
  branch(ctx, 500, 352, 75, 12, 10, '#c084fc');
  branch(ctx, 522, 352, 95, -8, 11, '#c084fc');
  // Seaweed blades along the floor.
  blade(ctx, 40, 352, 90, 14, '#2fae6e');
  // Difference 5: this blade is short instead of tall.
  blade(ctx, 60, 352, diffs.has(5) ? 34 : 108, 10, '#37bd7a');
  blade(ctx, 200, 352, 84, -12, '#2fae6e');
  blade(ctx, 330, 352, 96, 12, '#37bd7a');
  blade(ctx, 540, 352, 88, -14, '#2fae6e');
  // The clownfish: three white stripes on the left picture, two on the right.
  fish(ctx, 150, 150, 34, '#ff8c1a', diffs.has(0) ? 2 : 3);
  // A blue tang and a yellow fish.
  fish(ctx, 400, 100, 26, '#3b82f6', 0);
  if (!diffs.has(6)) fish(ctx, 300, 220, 20, '#ffd93b', 0);
  // Two more swimmers that never change: a pink fish and a green fish.
  fish(ctx, 350, 300, 18, '#ff7fb0', 0);
  fish(ctx, 520, 80, 16, '#4ade80', 0);
  // Bubbles rising from the coral.
  bubble(ctx, 240, 140, 9);
  if (!diffs.has(3)) bubble(ctx, 280, 90, 11);
  bubble(ctx, 320, 170, 7);
  bubble(ctx, 500, 120, 8);
  bubble(ctx, 140, 200, 7);
  bubble(ctx, 460, 60, 6);
  // Difference 1: the starfish on the sand.
  if (!diffs.has(1)) star(ctx, 120, 385, 22, '#ff8c69');
  star(ctx, 520, 380, 15, '#ffb347');
  // Shells on the sand; difference 2 recolours the big one.
  shell(ctx, 430, 390, 20, diffs.has(2) ? '#6ea8ff' : '#ff9db4');
  shell(ctx, 250, 398, 14, '#e8b4d8');
  shell(ctx, 520, 396, 12, '#ffd166');
}

// ---------------------------------------------------------------------------
// Scene 1 — Turtle Cove. Differences:
//   0 turtle shell spot present -> gone   (272, 184) — the top-centre spot
//   1 seahorse present -> gone            (90, 260)
//   2 school fish 5 -> 4                  (180, 68) — the middle fish
//   3 anemone pink -> orange              (470, 360)
//   4 coral arch branch present -> gone   (495, 275) — the branch's middle
//   5 bubble near turtle present -> gone  (350, 140)
//   6 rock grey -> brown                  (200, 380)
// ---------------------------------------------------------------------------
export const DIFFS_1 = [
  { x: 272, y: 184, r: 26, label: 'turtle shell spot' },
  { x: 90, y: 260, r: 28, label: 'seahorse' },
  { x: 180, y: 68, r: 22, label: 'school fish' },
  { x: 470, y: 360, r: 28, label: 'anemone colour' },
  { x: 495, y: 275, r: 30, label: 'coral arch branch' },
  { x: 350, y: 140, r: 18, label: 'bubble' },
  { x: 200, y: 380, r: 24, label: 'rock colour' },
];

function turtle(ctx, x, y, diffs) {
  // Flippers.
  ctx.fillStyle = '#2f9e6e';
  ellipse(ctx, x - 78, y - 28, 26, 12);
  ellipse(ctx, x - 78, y + 34, 26, 12);
  ellipse(ctx, x + 82, y - 24, 24, 11);
  ellipse(ctx, x + 82, y + 30, 24, 11);
  // Head.
  ellipse(ctx, x + 96, y + 4, 22, 16);
  ctx.fillStyle = '#10222b';
  circle(ctx, x + 106, y - 2, 4);
  // Shell: a big dome with a rim and pattern spots.
  ctx.fillStyle = '#3f8f5f';
  ellipse(ctx, x, y, 88, 62);
  ctx.fillStyle = '#2b6e47';
  ellipse(ctx, x, y - 6, 70, 46);
  ctx.fillStyle = '#7cc79a';
  const spots = [[-40, -12], [-8, -26], [28, -18], [-28, 18], [8, 22], [44, 8]];
  for (const [sx, sy] of spots) {
    // Difference 0: the top-centre spot is missing on the right picture.
    if (sx === -8 && sy === -26 && diffs.has(0)) continue;
    circle(ctx, x + sx, y + sy, 8);
  }
  ctx.strokeStyle = '#1d4d33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y, 88, 62, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function seahorse(ctx, x, y) {
  ctx.strokeStyle = '#ff9f43';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + 34);
  ctx.quadraticCurveTo(x - 16, y + 10, x - 4, y - 12);
  ctx.quadraticCurveTo(x + 4, y - 26, x + 14, y - 30);
  ctx.stroke();
  ctx.fillStyle = '#ff9f43';
  circle(ctx, x + 18, y - 32, 9);
  ctx.fillStyle = '#10222b';
  circle(ctx, x + 21, y - 34, 2.5);
  ctx.strokeStyle = '#e07b1f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 34);
  ctx.quadraticCurveTo(x - 22, y + 44, x - 26, y + 30);
  ctx.stroke();
}

function anemone(ctx, x, y, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let i = -4; i <= 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + i * 8, y - 22, x + i * 11, y - 40 - Math.abs(i) * -2);
    ctx.stroke();
  }
  ctx.fillStyle = colour;
  circle(ctx, x, y, 8);
}

export function drawScene1(ctx, w, h, diffs) {
  backdrop(ctx, w, h, 352);
  // Coral arch on the right.
  branch(ctx, 480, 352, 130, -30, 13, '#ff7f9e');
  if (!diffs.has(4)) branch(ctx, 505, 352, 150, -12, 12, '#ff9db4');
  branch(ctx, 530, 352, 120, 16, 12, '#ff7f9e');
  // Rocks on the floor.
  ctx.fillStyle = diffs.has(6) ? '#8b5a2b' : '#8d9aa5';
  ellipse(ctx, 200, 384, 34, 18);
  ctx.fillStyle = '#7c8a95';
  ellipse(ctx, 320, 390, 28, 15);
  // The turtle, centre stage.
  turtle(ctx, 280, 210, diffs);
  // Difference 1: the seahorse clinging to the left coral.
  if (!diffs.has(1)) seahorse(ctx, 90, 260);
  // A school of small fish, upper left; one is missing on the right.
  const school = [[120, 70], [150, 88], [180, 68], [205, 92], [230, 74]];
  school.forEach(([fx, fy], i) => {
    if (i === 2 && diffs.has(2)) return;
    fish(ctx, fx, fy, 13, '#ffd93b', 0);
  });
  // Bubbles from the turtle.
  bubble(ctx, 380, 120, 8);
  if (!diffs.has(5)) bubble(ctx, 350, 140, 10);
  bubble(ctx, 410, 150, 6);
  bubble(ctx, 120, 160, 7);
  // Two small fish cruising low, and a coral sprig on the left floor.
  fish(ctx, 200, 300, 15, '#ff7fb0', 0);
  fish(ctx, 390, 300, 14, '#4ade80', 0);
  branch(ctx, 40, 352, 55, 8, 9, '#c084fc');
  // Anemone, bottom right; difference 3 recolours it.
  anemone(ctx, 470, 360, diffs.has(3) ? '#ff8c1a' : '#ff7fb0');
  // A starfish and a shell.
  star(ctx, 420, 392, 18, '#ff8c69');
  shell(ctx, 90, 392, 14, '#e8b4d8');
}

// ---------------------------------------------------------------------------
// Scene 2 — Sunken Treasure. Differences:
//   0 octopus arm 8 -> 7                   (420, 225) — the third arm's middle
//   1 jewel red -> green                    (350, 370)
//   2 coin stack top coin present -> gone   (230, 370) — the stack itself
//   3 anchor rope present -> gone           (90, 244) — the rope's middle
//   4 small fish present -> gone            (480, 70)
//   5 coral pink -> orange                  (515, 305) — the branch's middle
//   6 bubble present -> gone                (200, 100)
// ---------------------------------------------------------------------------
export const DIFFS_2 = [
  { x: 420, y: 225, r: 26, label: 'octopus arm' },
  { x: 350, y: 370, r: 22, label: 'jewel colour' },
  { x: 230, y: 370, r: 22, label: 'coin stack' },
  { x: 90, y: 244, r: 26, label: 'anchor rope' },
  { x: 480, y: 70, r: 22, label: 'small fish' },
  { x: 515, y: 305, r: 26, label: 'coral colour' },
  { x: 200, y: 100, r: 18, label: 'bubble' },
];

function octopus(ctx, x, y, diffs) {
  // Arms: eight curving strokes; difference 0 drops the third one.
  ctx.strokeStyle = '#b06fd6';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i += 1) {
    if (i === 2 && diffs.has(0)) continue;
    const spread = (i - 3.5) * 16;
    ctx.beginPath();
    ctx.moveTo(x + spread * 0.4, y + 18);
    ctx.quadraticCurveTo(x + spread, y + 52, x + spread * 1.25, y + 82);
    ctx.stroke();
  }
  // Dome head with two eyes and a smile.
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.arc(x, y, 42, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  circle(ctx, x - 15, y - 12, 9);
  circle(ctx, x + 15, y - 12, 9);
  ctx.fillStyle = '#10222b';
  circle(ctx, x - 15, y - 12, 4.5);
  circle(ctx, x + 15, y - 12, 4.5);
  ctx.strokeStyle = '#10222b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y + 6, 10, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

function chest(ctx, x, y, diffs) {
  // The wooden chest, lid open, gold spilling out.
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(x - 52, y - 6, 104, 52);
  ctx.fillStyle = '#a06a35';
  ctx.fillRect(x - 52, y - 6, 104, 10);
  ctx.save();
  ctx.translate(x, y - 6);
  ctx.rotate(-0.5);
  ctx.fillStyle = '#7a4a22';
  ctx.fillRect(-52, -34, 104, 34);
  ctx.restore();
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x - 6, y - 6, 12, 52);
  // Coins spilling from the chest.
  ctx.fillStyle = '#ffd166';
  const coins = [[-38, 52], [-18, 58], [4, 54], [26, 60], [44, 52], [-28, 40], [14, 40]];
  for (const [cx, cy] of coins) circle(ctx, x + cx, y + cy, 8);
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 2;
  for (const [cx, cy] of coins) {
    ctx.beginPath();
    ctx.arc(x + cx, y + cy, 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  // The coin stack beside the chest; difference 2 takes its top coin.
  ctx.fillStyle = '#ffd166';
  const stack = [[-70, 52], [-70, 40], [-70, 28]];
  stack.forEach(([sx, sy], i) => {
    if (i === 2 && diffs.has(2)) return;
    ellipse(ctx, x + sx, y + sy, 12, 5);
  });
}

function jewel(ctx, x, y, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x + 11, y);
  ctx.lineTo(x, y + 12);
  ctx.lineTo(x - 11, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 6);
  ctx.lineTo(x + 2, y - 6);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
}

function anchor(ctx, x, y, diffs) {
  ctx.strokeStyle = '#5b6b76';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  // Difference 3: the rope from the anchor ring is missing.
  if (!diffs.has(3)) {
    ctx.beginPath();
    ctx.moveTo(x, y - 78);
    ctx.lineTo(x, y - 34);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x, y - 40);
  ctx.lineTo(x, y + 34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 26, y - 26);
  ctx.lineTo(x + 26, y - 26);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + 34, 22, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#5b6b76';
  circle(ctx, x - 18, y + 50, 6);
  circle(ctx, x + 18, y + 50, 6);
  circle(ctx, x, y - 46, 8);
}

export function drawScene2(ctx, w, h, diffs) {
  backdrop(ctx, w, h, 348);
  // Coral at the edges; difference 5 recolours the right-hand one.
  branch(ctx, 40, 350, 80, 10, 11, '#ff7f9e');
  branch(ctx, 520, 350, 88, -10, 11, diffs.has(5) ? '#ff9f43' : '#ff7f9e');
  branch(ctx, 540, 350, 70, 8, 10, '#ff9db4');
  blade(ctx, 70, 350, 86, 12, '#2fae6e');
  blade(ctx, 490, 350, 80, -10, '#37bd7a');
  // The sunken chest, centre floor.
  chest(ctx, 300, 330, diffs);
  // Jewels scattered on the sand; difference 1 recolours the red one.
  jewel(ctx, 350, 370, diffs.has(1) ? '#4ade80' : '#ef4444');
  jewel(ctx, 180, 388, '#3b82f6');
  jewel(ctx, 420, 392, '#4ade80');
  // The anchor on the left.
  anchor(ctx, 90, 300, diffs);
  // The octopus, upper right.
  octopus(ctx, 440, 170, diffs);
  // Difference 4: the small fish near the top right.
  if (!diffs.has(4)) fish(ctx, 480, 70, 16, '#ffd93b', 0);
  fish(ctx, 150, 130, 18, '#3b82f6', 0);
  fish(ctx, 120, 180, 14, '#4ade80', 0);
  // Bubbles.
  if (!diffs.has(6)) bubble(ctx, 200, 100, 10);
  bubble(ctx, 240, 70, 7);
  bubble(ctx, 380, 90, 8);
  bubble(ctx, 500, 200, 6);
  // A few loose coins and a blue jewel on the sand.
  ctx.fillStyle = '#ffd166';
  circle(ctx, 160, 402, 7);
  circle(ctx, 460, 380, 7);
  jewel(ctx, 250, 395, '#3b82f6');
  star(ctx, 520, 392, 16, '#ff8c69');
}

// ---------------------------------------------------------------------------
// Registry: every scene's painter and its seven differences.
// ---------------------------------------------------------------------------
export const SCENES = [
  { name: 'Reef Garden', draw: drawScene0, diffs: DIFFS_0 },
  { name: 'Turtle Cove', draw: drawScene1, diffs: DIFFS_1 },
  { name: 'Sunken Treasure', draw: drawScene2, diffs: DIFFS_2 },
];

/** Paint one scene into `ctx` (panel-local space, w x h). `diffs` is a Set of
 *  difference ids to apply; an empty Set paints the left picture. */
export function drawScene(ctx, sceneIndex, diffs, w, h) {
  SCENES[sceneIndex].draw(ctx, w, h, diffs);
}

/** The differences of a scene, as a fresh array of {x, y, r, label}. */
export function sceneDiffs(sceneIndex) {
  return SCENES[sceneIndex].diffs.map((d) => ({ ...d }));
}

/** A Set holding every difference id of a scene (what the right panel applies). */
export function allDiffs(sceneIndex) {
  return new Set(SCENES[sceneIndex].diffs.map((_, i) => i));
}
