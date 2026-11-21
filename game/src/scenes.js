// Starlight Station — scene art (v3, space theme)
// Three original scenes, all drawn procedurally on canvas. Each scene is a
// function draw(ctx, variant, size) plus a list of 7 differences. Variant 0
// and variant 1 differ ONLY at the listed difference spots; everything else
// is drawn identically, so the two panels are a fair pair.

// Deterministic pseudo-random so star fields are identical in both variants.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}

function starField(ctx, size, seed, count, maxR) {
  const rand = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = rand() * size, y = rand() * size * 0.72, r = 0.8 + rand() * maxR;
    const tw = 0.55 + rand() * 0.45;
    ctx.globalAlpha = tw;
    circle(ctx, x, y, r, rand() > 0.85 ? '#ffd166' : '#ffffff');
  }
  ctx.globalAlpha = 1;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------------------------------------------------------------- scene 1
// Moon Base Alpha — a cheerful lunar outpost under a big blue Earth.
function drawMoonBase(ctx, v, S) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, S);
  sky.addColorStop(0, '#0b1030'); sky.addColorStop(0.55, '#241b52'); sky.addColorStop(1, '#3a2a6e');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S);
  starField(ctx, S, 11, 90, 1.6);

  // Earth, top right — difference 1: cloud swirls (variant 1 only)
  circle(ctx, 505, 95, 58, '#2f7fe0');
  ctx.save();
  ctx.beginPath(); ctx.arc(505, 95, 58, 0, Math.PI * 2); ctx.clip();
  circle(ctx, 488, 82, 20, '#3fae6a');
  circle(ctx, 522, 112, 16, '#3fae6a');
  circle(ctx, 512, 70, 10, '#2f9e5f');
  if (v === 1) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(468, 88); ctx.quadraticCurveTo(495, 76, 522, 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(478, 118); ctx.quadraticCurveTo(505, 108, 530, 120); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(505, 95, 58, 0, Math.PI * 2); ctx.stroke();

  // Moon ground
  ctx.fillStyle = '#b9bdc7'; ctx.fillRect(0, 440, S, S - 440);
  ctx.fillStyle = '#a9adb8'; ctx.fillRect(0, 440, S, 10);
  circle(ctx, 60, 480, 18, '#9aa0ad'); circle(ctx, 430, 560, 26, '#9aa0ad');
  circle(ctx, 250, 580, 14, '#9aa0ad'); circle(ctx, 560, 500, 12, '#9aa0ad');
  // Difference 5: an extra crater (variant 1 only)
  if (v === 1) { circle(ctx, 120, 530, 26, '#9aa0ad'); circle(ctx, 120, 530, 17, '#8b919e'); }

  // Habitat dome, centre-left
  ctx.fillStyle = '#e8ecf4';
  ctx.beginPath(); ctx.arc(170, 440, 95, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8b93a5'; ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(170 + i * 30, 345 + Math.abs(i) * 8);
    ctx.lineTo(170 + i * 30, 440); ctx.stroke();
  }
  ctx.fillStyle = '#ffd166'; circle(ctx, 140, 395, 9, '#ffd166'); circle(ctx, 200, 395, 9, '#ffd166');
  ctx.fillStyle = '#5b6b8c'; roundRect(ctx, 152, 400, 36, 40, 6); ctx.fill();
  ctx.fillStyle = '#ffd166'; circle(ctx, 170, 420, 4, '#ffd166');

  // Flag on a pole — difference 2: flag colour (red vs teal)
  ctx.strokeStyle = '#dfe5f2'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(300, 300); ctx.lineTo(300, 440); ctx.stroke();
  ctx.fillStyle = v === 0 ? '#ff5d73' : '#2ec4b6';
  ctx.beginPath(); ctx.moveTo(300, 302); ctx.lineTo(340, 314); ctx.lineTo(300, 328); ctx.closePath(); ctx.fill();

  // Rocket, right side — difference 3: middle window (variant 0 has 3, variant 1 has 2)
  ctx.fillStyle = '#f2f5fb';
  roundRect(ctx, 445, 210, 52, 150, 24); ctx.fill();
  ctx.fillStyle = '#ff5d73';
  ctx.beginPath(); ctx.moveTo(445, 218); ctx.quadraticCurveTo(471, 168, 497, 218); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff5d73';
  ctx.beginPath(); ctx.moveTo(445, 330); ctx.lineTo(424, 366); ctx.lineTo(445, 360); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(497, 330); ctx.lineTo(518, 366); ctx.lineTo(497, 360); ctx.closePath(); ctx.fill();
  circle(ctx, 471, 232, 10, '#7ec8ff'); circle(ctx, 471, 302, 10, '#7ec8ff');
  if (v === 0) circle(ctx, 471, 267, 10, '#7ec8ff');
  ctx.fillStyle = '#ffb703'; ctx.beginPath(); ctx.moveTo(458, 366); ctx.lineTo(484, 366); ctx.lineTo(471, 392); ctx.closePath(); ctx.fill();

  // Rover — difference 4: front wheel (variant 0 has it, variant 1 does not)
  ctx.fillStyle = '#ff9f1c'; roundRect(ctx, 318, 462, 78, 30, 10); ctx.fill();
  ctx.fillStyle = '#2c3f6e'; roundRect(ctx, 336, 446, 34, 20, 6); ctx.fill();
  ctx.fillStyle = '#7ec8ff'; roundRect(ctx, 340, 450, 26, 12, 3); ctx.fill();
  circle(ctx, 332, 498, 13, '#333a48'); circle(ctx, 332, 498, 5, '#9aa0ad');
  if (v === 0) { circle(ctx, 382, 498, 13, '#333a48'); circle(ctx, 382, 498, 5, '#9aa0ad'); }

  // Astronaut — difference 6: gold helmet lamp (variant 0 only)
  circle(ctx, 255, 408, 16, '#f2f5fb'); // helmet
  ctx.fillStyle = '#1d2b4d'; circle(ctx, 258, 408, 10, '#1d2b4d'); // visor
  if (v === 0) circle(ctx, 244, 398, 5, '#ffd166');
  ctx.fillStyle = '#f2f5fb'; roundRect(ctx, 240, 424, 30, 34, 10); ctx.fill(); // suit
  ctx.fillStyle = '#ff5d73'; roundRect(ctx, 246, 432, 18, 12, 3); ctx.fill(); // chest pack
  ctx.strokeStyle = '#f2f5fb'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(240, 432); ctx.lineTo(228, 452); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(270, 432); ctx.lineTo(282, 452); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(246, 458); ctx.lineTo(244, 478); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(264, 458); ctx.lineTo(266, 478); ctx.stroke();

  // Solar panel — difference 7: cracked dark cell (variant 1 only)
  ctx.save(); ctx.translate(520, 415); ctx.rotate(-0.28);
  ctx.fillStyle = '#2c6fd6'; ctx.fillRect(-34, -22, 68, 44);
  ctx.strokeStyle = '#bcd6ff'; ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 22, -22); ctx.lineTo(i * 22, 22); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.stroke();
  if (v === 1) { ctx.fillStyle = '#12233f'; ctx.fillRect(12, 0, 22, 22); }
  ctx.restore();
  ctx.strokeStyle = '#8b93a5'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(520, 437); ctx.lineTo(520, 470); ctx.stroke();
}

// ---------------------------------------------------------------- scene 2
// Orbital Station — a bright station above a teal ringed planet.
function drawStation(ctx, v, S) {
  ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, S, S);
  // Nebula blobs
  ctx.globalAlpha = 0.35;
  circle(ctx, 110, 130, 90, '#7b2fbe'); circle(ctx, 520, 90, 70, '#0e7c86'); circle(ctx, 480, 520, 100, '#5b2a86');
  ctx.globalAlpha = 1;
  starField(ctx, S, 22, 110, 1.5);
  // Difference 7: shooting star (variant 1 only)
  if (v === 1) {
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(70, 96); ctx.lineTo(132, 128); ctx.stroke();
    circle(ctx, 70, 96, 4, '#ffd166');
  }

  // Ringed teal planet, bottom left
  ctx.save();
  ctx.beginPath(); ctx.arc(60, 720, 230, 0, Math.PI * 2); ctx.clip();
  const pg = ctx.createLinearGradient(0, 480, 0, 620);
  pg.addColorStop(0, '#2ec4b6'); pg.addColorStop(1, '#0e7c86');
  ctx.fillStyle = pg; ctx.fillRect(-170, 480, 460, 260);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-170, 520, 460, 14); ctx.fillRect(-170, 556, 460, 9);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,209,102,0.8)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(60, 560, 250, 26, -0.18, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();

  // Solar wings
  function wing(x0) {
    ctx.fillStyle = '#1b4fd8';
    for (let i = 0; i < 3; i++) ctx.fillRect(x0 + i * 34, 252, 30, 76);
    ctx.strokeStyle = '#bcd6ff'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) { ctx.strokeRect(x0 + i * 34, 252, 30, 76); ctx.beginPath(); ctx.moveTo(x0 + i * 34, 290); ctx.lineTo(x0 + i * 34 + 30, 290); ctx.stroke(); }
  }
  wing(78); wing(448);
  // Difference 1: one left-wing cell goes dark (variant 1 only)
  if (v === 1) { ctx.fillStyle = '#0d1b3d'; ctx.fillRect(112, 252, 30, 38); }

  // Central station cylinder
  const grad = ctx.createLinearGradient(0, 250, 0, 330);
  grad.addColorStop(0, '#f4f7fd'); grad.addColorStop(0.5, '#c9d2e4'); grad.addColorStop(1, '#8b96ad');
  ctx.fillStyle = grad; roundRect(ctx, 178, 252, 264, 76, 34); ctx.fill();
  ctx.strokeStyle = '#6b7690'; ctx.lineWidth = 2;
  for (const x of [226, 290, 354, 410]) { ctx.beginPath(); ctx.moveTo(x, 254); ctx.lineTo(x, 326); ctx.stroke(); }
  // Windows row — difference 2: middle window lit (variant 0) or dark (variant 1)
  circle(ctx, 250, 290, 9, '#ffd166'); circle(ctx, 410, 290, 9, '#ffd166');
  circle(ctx, 330, 290, 9, v === 0 ? '#ffd166' : '#22304f');
  circle(ctx, 290, 290, 9, '#7ec8ff'); circle(ctx, 370, 290, 9, '#7ec8ff');

  // Antenna + beacon — difference 6: beacon colour (red vs green)
  ctx.strokeStyle = '#dfe5f2'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(310, 252); ctx.lineTo(310, 196); ctx.stroke();
  circle(ctx, 310, 190, 8, v === 0 ? '#ff5d73' : '#3ddc84');
  ctx.globalAlpha = 0.35; circle(ctx, 310, 190, 15, v === 0 ? '#ff5d73' : '#3ddc84'); ctx.globalAlpha = 1;

  // Dish — difference 3: the feed arm tilts left (variant 0) or right (variant 1)
  ctx.strokeStyle = '#dfe5f2'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(360, 252); ctx.lineTo(360, 234); ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath(); ctx.arc(360, 232, 19, 0.08 * Math.PI, 0.92 * Math.PI); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#d9a400'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(360, 232, 19, 0.08 * Math.PI, 0.92 * Math.PI); ctx.stroke();
  ctx.strokeStyle = '#e8ecf4'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(360, 232); ctx.lineTo(v === 0 ? 346 : 374, 212); ctx.stroke();
  circle(ctx, v === 0 ? 346 : 374, 212, 4, '#ff5d73');

  // Astronaut on a tether — difference 4: present (variant 0) or away (variant 1)
  if (v === 0) {
    ctx.strokeStyle = '#e8ecf4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(240, 328); ctx.quadraticCurveTo(210, 380, 200, 420); ctx.stroke();
    circle(ctx, 200, 428, 15, '#f2f5fb'); ctx.fillStyle = '#1d2b4d'; circle(ctx, 203, 428, 9, '#1d2b4d');
    ctx.fillStyle = '#f2f5fb'; roundRect(ctx, 186, 442, 28, 32, 9); ctx.fill();
    ctx.fillStyle = '#ff5d73'; roundRect(ctx, 192, 450, 16, 11, 3); ctx.fill();
  }

  // Docked shuttle — difference 5: docked (variant 0) or gone (variant 1)
  if (v === 0) {
    ctx.fillStyle = '#ff9f1c'; roundRect(ctx, 448, 408, 58, 26, 12); ctx.fill();
    ctx.fillStyle = '#f2f5fb'; circle(ctx, 470, 421, 7, '#f2f5fb');
    ctx.fillStyle = '#2ec4b6'; circle(ctx, 470, 421, 4, '#2ec4b6');
    ctx.fillStyle = '#ff5d73'; ctx.beginPath(); ctx.moveTo(448, 412); ctx.lineTo(432, 404); ctx.lineTo(448, 420); ctx.closePath(); ctx.fill();
  }

  // Small satellite, top right
  ctx.fillStyle = '#c9d2e4'; roundRect(ctx, 500, 150, 44, 26, 5); ctx.fill();
  ctx.fillStyle = '#2c6fd6'; ctx.fillRect(462, 158, 34, 12); ctx.fillRect(548, 158, 34, 12);
  ctx.strokeStyle = '#dfe5f2'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(522, 150); ctx.lineTo(522, 128); ctx.stroke();
  circle(ctx, 522, 124, 5, '#ff5d73');
}

// ---------------------------------------------------------------- scene 3
// Alien Planet Garden — a bright, friendly world with mushroom houses.
function drawAlienGarden(ctx, v, S) {
  const sky = ctx.createLinearGradient(0, 0, 0, S);
  sky.addColorStop(0, '#ffb37a'); sky.addColorStop(0.45, '#ff7eb6'); sky.addColorStop(1, '#c86bff');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S);
  circle(ctx, 510, 85, 46, '#ffe9f6');
  circle(ctx, 496, 72, 9, '#f3c6e2'); circle(ctx, 524, 100, 12, '#f3c6e2'); circle(ctx, 522, 66, 6, '#f3c6e2');
  // Difference 1: a second small moon (variant 0 only)
  if (v === 0) { circle(ctx, 420, 72, 22, '#fff3c4'); circle(ctx, 414, 66, 5, '#f0d48a'); }

  // UFO — difference 2: light beam (variant 0 only)
  if (v === 0) {
    ctx.fillStyle = 'rgba(255, 240, 140, 0.4)';
    ctx.beginPath(); ctx.moveTo(430, 152); ctx.lineTo(472, 152); ctx.lineTo(500, 260); ctx.lineTo(402, 260); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#c9d2e4';
  ctx.beginPath(); ctx.ellipse(451, 148, 52, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7ec8ff';
  ctx.beginPath(); ctx.arc(451, 142, 22, Math.PI, 0); ctx.closePath(); ctx.fill();
  circle(ctx, 420, 150, 5, '#ffd166'); circle(ctx, 451, 154, 5, '#ff5d73'); circle(ctx, 482, 150, 5, '#3ddc84');

  // Rolling purple ground
  ctx.fillStyle = '#7b4bc9'; ctx.beginPath(); ctx.moveTo(0, 470); ctx.quadraticCurveTo(160, 420, 320, 462);
  ctx.quadraticCurveTo(480, 500, 620, 452); ctx.lineTo(620, 620); ctx.lineTo(0, 620); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8f63d8'; ctx.beginPath(); ctx.moveTo(0, 500); ctx.quadraticCurveTo(200, 462, 420, 500);
  ctx.quadraticCurveTo(540, 522, 620, 496); ctx.lineTo(620, 620); ctx.lineTo(0, 620); ctx.closePath(); ctx.fill();
  // Teal grass tufts
  ctx.strokeStyle = '#2ec4b6'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const [gx, gy] of [[60, 560], [180, 590], [360, 580], [540, 570], [420, 540]]) {
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 8, gy - 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 8, gy - 16); ctx.stroke();
  }

  // Alien trees with puffball canopies
  function tree(x, y, s) {
    ctx.fillStyle = '#5b2a86'; ctx.fillRect(x - 7 * s, y, 14 * s, 60 * s);
    ctx.fillStyle = '#2ec4b6';
    circle(ctx, x, y - 18 * s, 34 * s, '#2ec4b6'); circle(ctx, x - 26 * s, y - 4 * s, 22 * s, '#2ec4b6'); circle(ctx, x + 26 * s, y - 4 * s, 22 * s, '#2ec4b6');
    circle(ctx, x - 12 * s, y - 26 * s, 8 * s, '#7ef0d4'); circle(ctx, x + 14 * s, y - 14 * s, 7 * s, '#7ef0d4');
  }
  tree(120, 380, 1); tree(505, 372, 0.9);
  // Difference 4: orange fruit on the right tree (variant 0 only)
  if (v === 0) {
    circle(ctx, 488, 330, 8, '#ff9f1c'); circle(ctx, 522, 344, 8, '#ff9f1c'); circle(ctx, 505, 312, 8, '#ff9f1c');
  }

  // Crystal cluster — difference 3: pink (variant 0) vs blue (variant 1) crystals
  const crystal = v === 0 ? '#ff5da2' : '#4fc3ff';
  const crystalDark = v === 0 ? '#d63d82' : '#2a8fd6';
  ctx.fillStyle = crystal;
  ctx.beginPath(); ctx.moveTo(128, 500); ctx.lineTo(142, 438); ctx.lineTo(158, 500); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(152, 500); ctx.lineTo(168, 452); ctx.lineTo(184, 500); ctx.closePath(); ctx.fill();
  ctx.fillStyle = crystalDark;
  ctx.beginPath(); ctx.moveTo(142, 438); ctx.lineTo(150, 470); ctx.lineTo(142, 500); ctx.lineTo(128, 500); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.moveTo(138, 452); ctx.lineTo(143, 470); ctx.lineTo(138, 470); ctx.closePath(); ctx.fill();

  // Mushroom house — difference 6: door colour (yellow vs purple)
  ctx.fillStyle = '#fff3e0'; roundRect(ctx, 228, 462, 52, 46, 8); ctx.fill();
  ctx.fillStyle = '#ff5d73';
  ctx.beginPath(); ctx.arc(254, 462, 46, Math.PI, 0); ctx.closePath(); ctx.fill();
  circle(ctx, 228, 448, 8, '#ffffff'); circle(ctx, 254, 436, 9, '#ffffff'); circle(ctx, 280, 450, 8, '#ffffff');
  ctx.fillStyle = v === 0 ? '#ffd166' : '#7b4bc9';
  roundRect(ctx, 244, 478, 20, 30, 8); ctx.fill();
  circle(ctx, 244, 494, 6, '#ffd166'); circle(ctx, 280, 494, 6, '#ffd166');

  // Friendly alien — difference 5: three eyes (variant 0) or two (variant 1)
  circle(ctx, 300, 428, 34, '#8be04e');
  ctx.strokeStyle = '#8be04e'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(288, 396); ctx.quadraticCurveTo(282, 372, 272, 366); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(312, 396); ctx.quadraticCurveTo(318, 372, 328, 366); ctx.stroke();
  circle(ctx, 272, 364, 6, '#ffd166'); circle(ctx, 328, 364, 6, '#ffd166');
  circle(ctx, 286, 420, 8, '#ffffff'); circle(ctx, 314, 420, 8, '#ffffff');
  circle(ctx, 287, 421, 4, '#1d2b4d'); circle(ctx, 315, 421, 4, '#1d2b4d');
  if (v === 0) { circle(ctx, 300, 404, 8, '#ffffff'); circle(ctx, 300, 405, 4, '#1d2b4d'); }
  ctx.strokeStyle = '#1d2b4d'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(300, 440, 10, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.strokeStyle = '#8be04e'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(268, 448); ctx.lineTo(256, 470); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(332, 448); ctx.lineTo(344, 470); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(288, 460); ctx.lineTo(286, 482); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(312, 460); ctx.lineTo(314, 482); ctx.stroke();

  // Flowers — difference 7: middle flower (variant 0 has it, variant 1 does not)
  function flower(x, y) {
    ctx.strokeStyle = '#2e9e6b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 16); ctx.stroke();
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      circle(ctx, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5, '#ffd166');
    }
    circle(ctx, x, y, 5, '#ff5d73');
  }
  flower(70, 536); flower(120, 544);
  if (v === 0) flower(95, 528);
  flower(560, 540); flower(585, 528);
}

// ------------------------------------------------------------------ registry
export const SCENES = [
  {
    id: 'moon-base',
    name: 'Moon Base Alpha',
    tagline: 'A lunar outpost under a big blue Earth',
    draw: drawMoonBase,
    differences: [
      { x: 505, y: 95, r: 40, label: 'Earth clouds' },
      { x: 312, y: 318, r: 26, label: 'Flag colour' },
      { x: 471, y: 267, r: 24, label: 'Rocket window' },
      { x: 382, y: 498, r: 24, label: 'Rover wheel' },
      { x: 120, y: 530, r: 30, label: 'Extra crater' },
      { x: 244, y: 398, r: 20, label: 'Helmet lamp' },
      { x: 520, y: 415, r: 26, label: 'Solar cell' },
    ],
  },
  {
    id: 'orbital-station',
    name: 'Orbital Station',
    tagline: 'A bright station above a ringed planet',
    draw: drawStation,
    differences: [
      { x: 130, y: 290, r: 26, label: 'Solar cell' },
      { x: 330, y: 290, r: 22, label: 'Station window' },
      { x: 360, y: 226, r: 28, label: 'Dish tilt' },
      { x: 200, y: 430, r: 30, label: 'Astronaut' },
      { x: 470, y: 421, r: 30, label: 'Shuttle' },
      { x: 310, y: 190, r: 18, label: 'Beacon light' },
      { x: 100, y: 110, r: 30, label: 'Shooting star' },
    ],
  },
  {
    id: 'alien-garden',
    name: 'Alien Planet Garden',
    tagline: 'A friendly world of mushroom houses',
    draw: drawAlienGarden,
    differences: [
      { x: 420, y: 72, r: 24, label: 'Second moon' },
      { x: 451, y: 200, r: 30, label: 'UFO beam' },
      { x: 152, y: 470, r: 30, label: 'Crystal colour' },
      { x: 505, y: 330, r: 26, label: 'Tree fruit' },
      { x: 300, y: 404, r: 26, label: 'Third eye' },
      { x: 254, y: 493, r: 22, label: 'Door colour' },
      { x: 95, y: 528, r: 22, label: 'Missing flower' },
    ],
  },
];
