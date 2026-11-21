// Jungle Spotter v2 — three bright-daylight jungle scenes, all procedural Canvas 2D.
// Each scene draws itself twice: panel A with variant flags off, panel B with them on.
// A difference is one flag that changes exactly one small element; its (x, y, r)
// in the 600x440 scene space is where the marker ring and hit test live.

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

function leaf(ctx, x, y, len, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, len, len * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function flower(ctx, x, y, petal, center) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6);
  }
  ctx.fillStyle = center;
  circle(ctx, x, y, 5);
}

function butterfly(ctx, x, y, wing, body) {
  ctx.fillStyle = wing;
  ellipse(ctx, x - 9, y - 6, 10, 7);
  ellipse(ctx, x + 9, y - 6, 10, 7);
  ellipse(ctx, x - 8, y + 7, 8, 6);
  ellipse(ctx, x + 8, y + 7, 8, 6);
  ctx.fillStyle = body;
  ellipse(ctx, x, y, 3, 9);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 2, y - 9);
  ctx.quadraticCurveTo(x - 7, y - 16, x - 10, y - 15);
  ctx.moveTo(x + 2, y - 9);
  ctx.quadraticCurveTo(x + 7, y - 16, x + 10, y - 15);
  ctx.stroke();
}

function sun(ctx, x, y, withRays) {
  if (withRays) {
    ctx.strokeStyle = '#ffb703';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 40, y + Math.sin(a) * 40);
      ctx.lineTo(x + Math.cos(a) * 54, y + Math.sin(a) * 54);
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#ffd60a';
  circle(ctx, x, y, 32);
  ctx.fillStyle = '#fff3b0';
  circle(ctx, x - 8, y - 8, 12);
}

function cloud(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  circle(ctx, x, y, 18 * s);
  circle(ctx, x + 20 * s, y + 4 * s, 15 * s);
  circle(ctx, x - 20 * s, y + 5 * s, 14 * s);
  ellipse(ctx, x, y + 8 * s, 34 * s, 12 * s);
}

function grassTuft(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const dx of [-8, -3, 2, 7]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y);
    ctx.quadraticCurveTo(x + dx + 2, y - 14, x + dx + 6, y - 18);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- scene 1
function drawClearing(ctx, v) {
  // sky + sun
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#7ec8f7');
  sky.addColorStop(1, '#c9ecff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 300);
  sun(ctx, 75, 65, !v.sunRays);
  cloud(ctx, 210, 58, 1);
  cloud(ctx, 430, 42, 0.8);

  // ground
  const ground = ctx.createLinearGradient(0, 300, 0, 440);
  ground.addColorStop(0, '#7ec850');
  ground.addColorStop(1, '#4e9b2f');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 300, 600, 140);

  // big tree left
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(58, 150, 34, 160);
  ctx.fillStyle = '#2f7d32';
  circle(ctx, 75, 130, 62);
  circle(ctx, 30, 160, 42);
  circle(ctx, 122, 158, 44);
  ctx.fillStyle = '#43a047';
  circle(ctx, 60, 105, 34);
  circle(ctx, 100, 118, 30);
  // branch + monkey
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(90, 205);
  ctx.lineTo(265, 195);
  ctx.stroke();
  // monkey body
  ctx.fillStyle = '#8d5a2b';
  circle(ctx, 185, 190, 22);
  circle(ctx, 168, 168, 13);
  circle(ctx, 202, 168, 13);
  ctx.fillStyle = '#d9a066';
  circle(ctx, 185, 196, 12);
  circle(ctx, 185, 184, 7);
  ctx.fillStyle = '#222';
  circle(ctx, 178, 182, 2.5);
  circle(ctx, 192, 182, 2.5);
  // monkey tail: curled up in A, hanging straight down in B
  ctx.strokeStyle = '#8d5a2b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  if (!v.monkeyTail) {
    ctx.moveTo(205, 205);
    ctx.quadraticCurveTo(228, 195, 222, 172);
    ctx.quadraticCurveTo(218, 158, 206, 164);
  } else {
    ctx.moveTo(205, 205);
    ctx.quadraticCurveTo(214, 228, 210, 248);
  }
  ctx.stroke();

  // tree right + toucan
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(505, 160, 30, 150);
  ctx.fillStyle = '#2f7d32';
  circle(ctx, 520, 130, 56);
  circle(ctx, 480, 155, 38);
  circle(ctx, 560, 152, 36);
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(505, 200);
  ctx.lineTo(430, 185);
  ctx.stroke();
  // toucan body
  ctx.fillStyle = '#1b1b1b';
  ellipse(ctx, 452, 178, 20, 15);
  circle(ctx, 470, 162, 11);
  ctx.fillStyle = '#fff';
  circle(ctx, 452, 180, 8);
  // beak: orange in A, leaf-green in B
  ctx.fillStyle = v.toucanBeak ? '#43a047' : '#ff8c1a';
  ctx.beginPath();
  ctx.moveTo(478, 158);
  ctx.lineTo(506, 166);
  ctx.lineTo(478, 172);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#222';
  circle(ctx, 472, 159, 2.5);

  // hanging vines
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 4;
  for (const [vx, len] of [[300, 120], [360, 92]]) {
    ctx.beginPath();
    ctx.moveTo(vx, 0);
    ctx.quadraticCurveTo(vx + 8, len / 2, vx - 4, len);
    ctx.stroke();
  }
  leaf(ctx, 298, 60, 14, 0.6, '#43a047');
  leaf(ctx, 362, 48, 12, -0.5, '#66bb6a');

  // butterfly: present in A, gone in B
  if (!v.butterfly) butterfly(ctx, 350, 150, '#ff5d8f', '#333');

  // flowers along the ground
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 3;
  for (const fx of [250, 300, 340, 380]) {
    ctx.beginPath();
    ctx.moveTo(fx, 410);
    ctx.lineTo(fx, 388);
    ctx.stroke();
  }
  flower(ctx, 250, 384, '#ffd60a', '#ff8c1a');
  if (!v.redFlower) flower(ctx, 300, 382, '#e63946', '#ffd60a');
  flower(ctx, 340, 386, '#9b5de5', '#fff');
  flower(ctx, 380, 384, '#e63946', '#ffd60a');
  grassTuft(ctx, 120, 415, '#2e7d32');
  grassTuft(ctx, 420, 420, '#2e7d32');

  // mushrooms
  ctx.fillStyle = '#fff8e1';
  ctx.fillRect(514, 368, 10, 14);
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.arc(519, 368, 16, Math.PI, 0);
  ctx.fill();
  if (!v.mushroomSpots) {
    ctx.fillStyle = '#fff';
    circle(ctx, 512, 360, 3);
    circle(ctx, 524, 356, 2.5);
    circle(ctx, 520, 365, 2);
  }

  // pond + frog: frog present in A, gone in B
  ctx.fillStyle = '#4db2e8';
  ellipse(ctx, 470, 420, 78, 16);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ellipse(ctx, 440, 416, 30, 4);
  if (!v.frog) {
    ctx.fillStyle = '#43a047';
    circle(ctx, 462, 404, 11);
    circle(ctx, 470, 398, 6);
    circle(ctx, 482, 398, 6);
    ctx.fillStyle = '#fff';
    circle(ctx, 470, 397, 3);
    circle(ctx, 482, 397, 3);
    ctx.fillStyle = '#222';
    circle(ctx, 470, 397, 1.5);
    circle(ctx, 482, 397, 1.5);
  }
}

// ---------------------------------------------------------------- scene 2
function drawRiverbank(ctx, v) {
  const sky = ctx.createLinearGradient(0, 0, 0, 280);
  sky.addColorStop(0, '#8fd3f4');
  sky.addColorStop(1, '#dff3ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 280);
  sun(ctx, 520, 55, !v.sunRays);
  cloud(ctx, 150, 55, 1);
  cloud(ctx, 330, 80, 0.7);

  // river
  const river = ctx.createLinearGradient(0, 280, 0, 440);
  river.addColorStop(0, '#3aa7e0');
  river.addColorStop(1, '#1d7fb8');
  ctx.fillStyle = river;
  ctx.fillRect(0, 280, 600, 160);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 3;
  for (const [wx, wy] of [[120, 320], [300, 350], [460, 310], [200, 400], [420, 405]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + 18, wy - 6, wx + 36, wy);
    ctx.stroke();
  }

  // banks
  ctx.fillStyle = '#8bc34a';
  ctx.beginPath();
  ctx.moveTo(0, 280);
  ctx.lineTo(0, 330);
  ctx.lineTo(140, 280);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8d29a';
  ctx.beginPath();
  ctx.moveTo(600, 280);
  ctx.lineTo(600, 340);
  ctx.lineTo(470, 280);
  ctx.closePath();
  ctx.fill();

  // leaning palm tree left
  ctx.strokeStyle = '#8d5a2b';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(70, 300);
  ctx.quadraticCurveTo(95, 200, 130, 140);
  ctx.stroke();
  ctx.fillStyle = '#2f9e44';
  for (const a of [-2.4, -1.7, -1.0, -0.3, 0.4]) {
    leaf(ctx, 130, 140, 52, a, '#2f9e44');
  }
  // coconuts: 3 in A, 2 in B
  ctx.fillStyle = '#6d4c41';
  circle(ctx, 118, 152, 9);
  circle(ctx, 140, 158, 9);
  if (!v.coconut) circle(ctx, 129, 166, 9);

  // crocodile in the river
  ctx.fillStyle = '#5a8f3c';
  ellipse(ctx, 250, 362, 72, 20);
  ellipse(ctx, 300, 356, 34, 12);
  ctx.fillStyle = '#6da34a';
  circle(ctx, 300, 344, 7);
  circle(ctx, 312, 344, 7);
  ctx.fillStyle = '#fff';
  circle(ctx, 300, 342, 3);
  circle(ctx, 312, 342, 3);
  ctx.fillStyle = '#222';
  circle(ctx, 301, 342, 1.5);
  circle(ctx, 313, 342, 1.5);
  // teeth: present in A, gone in B
  if (!v.crocTeeth) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(288 + i * 8, 364);
      ctx.lineTo(292 + i * 8, 372);
      ctx.lineTo(296 + i * 8, 364);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.strokeStyle = '#4a7a33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(190, 352);
  ctx.lineTo(180, 340);
  ctx.moveTo(195, 368);
  ctx.lineTo(186, 378);
  ctx.stroke();

  // kingfisher on a branch: present in A, gone in B
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(400, 210);
  ctx.lineTo(470, 195);
  ctx.stroke();
  if (!v.kingfisher) {
    ctx.fillStyle = '#1976d2';
    ellipse(ctx, 436, 182, 16, 12);
    circle(ctx, 450, 168, 9);
    ctx.fillStyle = '#ff7043';
    ellipse(ctx, 436, 190, 12, 6);
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(458, 166);
    ctx.lineTo(474, 170);
    ctx.lineTo(458, 174);
    ctx.closePath();
    ctx.fill();
  }

  // lily pads + lotus: pink in A, white in B
  ctx.fillStyle = '#2f9e44';
  ellipse(ctx, 350, 392, 34, 10);
  ellipse(ctx, 392, 400, 26, 8);
  flower(ctx, 350, 384, v.lotus ? '#ffffff' : '#ff5d8f', '#ffd60a');

  // turtle on a rock: present in A, gone in B
  ctx.fillStyle = '#9e9e9e';
  ellipse(ctx, 520, 336, 40, 14);
  if (!v.turtle) {
    ctx.fillStyle = '#5a8f3c';
    ellipse(ctx, 520, 322, 22, 13);
    circle(ctx, 542, 314, 8);
    ctx.fillStyle = '#7cb342';
    ellipse(ctx, 520, 318, 14, 7);
    ctx.strokeStyle = '#4a7a33';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(500, 330);
    ctx.lineTo(492, 336);
    ctx.moveTo(540, 330);
    ctx.lineTo(548, 336);
    ctx.stroke();
  }

  // dragonfly: present in A, gone in B
  if (!v.dragonfly) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ellipse(ctx, 168, 244, 16, 5);
    ellipse(ctx, 192, 244, 16, 5);
    ctx.fillStyle = '#26a69a';
    ellipse(ctx, 180, 252, 3, 12);
  }

  // reeds
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 4;
  for (const rx of [30, 48, 66]) {
    ctx.beginPath();
    ctx.moveTo(rx, 330);
    ctx.lineTo(rx + 4, 288);
    ctx.stroke();
  }
  ctx.fillStyle = '#8d6e63';
  ellipse(ctx, 34, 284, 5, 12);
}

// ---------------------------------------------------------------- scene 3
function drawCanopy(ctx, v) {
  // canopy ceiling
  const sky = ctx.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, '#aee9a0');
  sky.addColorStop(1, '#5da24a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 440);
  ctx.fillStyle = '#1b5e20';
  for (const [lx, ly, lr] of [[60, 40, 90], [220, 20, 110], [400, 30, 100], [550, 50, 90], [140, 90, 70], [330, 80, 80], [480, 100, 70]]) {
    circle(ctx, lx, ly, lr);
  }
  ctx.fillStyle = '#2e7d32';
  for (const [lx, ly, lr] of [[120, 60, 60], [300, 45, 70], [470, 55, 60], [250, 110, 50]]) {
    circle(ctx, lx, ly, lr);
  }

  // sunbeams: one beam missing in B
  ctx.fillStyle = 'rgba(255,244,170,0.45)';
  ctx.beginPath();
  ctx.moveTo(150, 120);
  ctx.lineTo(190, 120);
  ctx.lineTo(120, 440);
  ctx.lineTo(70, 440);
  ctx.closePath();
  ctx.fill();
  if (!v.sunbeam) {
    ctx.beginPath();
    ctx.moveTo(300, 120);
    ctx.lineTo(330, 120);
    ctx.lineTo(400, 440);
    ctx.lineTo(360, 440);
    ctx.closePath();
    ctx.fill();
  }

  // forest floor + path
  ctx.fillStyle = '#4e9b2f';
  ctx.fillRect(0, 340, 600, 100);
  ctx.fillStyle = '#c9a86a';
  ctx.beginPath();
  ctx.moveTo(270, 440);
  ctx.lineTo(285, 210);
  ctx.lineTo(315, 210);
  ctx.lineTo(330, 440);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a9824f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(292, 250);
  ctx.lineTo(308, 250);
  ctx.moveTo(288, 330);
  ctx.lineTo(312, 330);
  ctx.stroke();

  // trees
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(72, 120, 36, 320);
  ctx.fillRect(500, 130, 34, 310);
  // branch across
  ctx.strokeStyle = '#6d4c41';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(90, 180);
  ctx.lineTo(470, 165);
  ctx.stroke();

  // two parrots: second one gone in B
  ctx.fillStyle = '#d32f2f';
  ellipse(ctx, 200, 168, 16, 12);
  circle(ctx, 214, 154, 9);
  ctx.fillStyle = '#1976d2';
  ellipse(ctx, 200, 174, 10, 5);
  ctx.fillStyle = '#ffb703';
  ctx.beginPath();
  ctx.moveTo(222, 152);
  ctx.lineTo(234, 156);
  ctx.lineTo(222, 160);
  ctx.closePath();
  ctx.fill();
  if (!v.parrot2) {
    ctx.fillStyle = '#1976d2';
    ellipse(ctx, 262, 164, 16, 12);
    circle(ctx, 276, 150, 9);
    ctx.fillStyle = '#ff7043';
    ellipse(ctx, 262, 170, 10, 5);
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.moveTo(284, 148);
    ctx.lineTo(296, 152);
    ctx.lineTo(284, 156);
    ctx.closePath();
    ctx.fill();
  }

  // sloth hanging: present in A, gone in B
  if (!v.sloth) {
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(420, 172);
    ctx.lineTo(420, 200);
    ctx.moveTo(436, 172);
    ctx.lineTo(436, 200);
    ctx.stroke();
    ctx.fillStyle = '#a1887f';
    ellipse(ctx, 428, 212, 18, 14);
    circle(ctx, 428, 198, 10);
    ctx.fillStyle = '#efebe9';
    circle(ctx, 428, 200, 6);
    ctx.fillStyle = '#222';
    circle(ctx, 424, 198, 2);
    circle(ctx, 432, 198, 2);
  }

  // snake coiled on the branch: present in A, gone in B
  if (!v.snake) {
    ctx.strokeStyle = '#43a047';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(322, 168);
    ctx.quadraticCurveTo(345, 150, 352, 168);
    ctx.quadraticCurveTo(358, 186, 340, 180);
    ctx.stroke();
    ctx.fillStyle = '#2e7d32';
    circle(ctx, 352, 164, 7);
    ctx.fillStyle = '#ff5252';
    ctx.beginPath();
    ctx.moveTo(358, 166);
    ctx.lineTo(366, 164);
    ctx.lineTo(358, 170);
    ctx.closePath();
    ctx.fill();
  }

  // orchids on the left trunk: pink in A, orange in B
  flower(ctx, 92, 300, v.orchid ? '#ff8c1a' : '#ff5d8f', '#ffd60a');
  flower(ctx, 108, 322, v.orchid ? '#ff8c1a' : '#e040fb', '#fff');
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(90, 310);
  ctx.lineTo(104, 332);
  ctx.stroke();

  // stream + log bridge at the bottom
  ctx.fillStyle = '#4db2e8';
  ctx.fillRect(0, 400, 600, 40);
  ctx.fillStyle = '#8d5a2b';
  ctx.fillRect(240, 402, 130, 14);
  ctx.strokeStyle = '#6d4c41';
  ctx.lineWidth = 2;
  for (const bx of [265, 300, 335]) {
    ctx.beginPath();
    ctx.moveTo(bx, 402);
    ctx.lineTo(bx, 416);
    ctx.stroke();
  }

  // frog on a leaf: present in A, gone in B
  ctx.fillStyle = '#2f9e44';
  ellipse(ctx, 150, 404, 34, 10);
  if (!v.frog) {
    ctx.fillStyle = '#66bb6a';
    circle(ctx, 150, 392, 11);
    circle(ctx, 142, 384, 6);
    circle(ctx, 158, 384, 6);
    ctx.fillStyle = '#fff';
    circle(ctx, 142, 383, 3);
    circle(ctx, 158, 383, 3);
    ctx.fillStyle = '#222';
    circle(ctx, 142, 383, 1.5);
    circle(ctx, 158, 383, 1.5);
  }

  // mushroom: red cap in A, yellow cap in B
  ctx.fillStyle = '#fff8e1';
  ctx.fillRect(474, 378, 9, 12);
  ctx.fillStyle = v.mushroom ? '#ffd60a' : '#e63946';
  ctx.beginPath();
  ctx.arc(478, 378, 14, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#fff';
  circle(ctx, 473, 372, 2.5);
  circle(ctx, 483, 369, 2);
  grassTuft(ctx, 560, 395, '#2e7d32');
  grassTuft(ctx, 40, 400, '#2e7d32');
}

export const SCENES = [
  {
    id: 'clearing',
    name: 'Jungle Clearing',
    hint: 'Sunny clearing — monkey, toucan and a little pond',
    draw: drawClearing,
    diffs: [
      { x: 75, y: 65, r: 42, flag: 'sunRays', label: 'Sun rays' },
      { x: 350, y: 150, r: 24, flag: 'butterfly', label: 'Butterfly' },
      { x: 208, y: 205, r: 28, flag: 'monkeyTail', label: 'Monkey tail' },
      { x: 490, y: 164, r: 24, flag: 'toucanBeak', label: 'Toucan beak' },
      { x: 300, y: 382, r: 18, flag: 'redFlower', label: 'Red flower' },
      { x: 519, y: 362, r: 22, flag: 'mushroomSpots', label: 'Mushroom spots' },
      { x: 470, y: 400, r: 20, flag: 'frog', label: 'Pond frog' },
    ],
  },
  {
    id: 'riverbank',
    name: 'Riverbank',
    hint: 'Slow river — crocodile, kingfisher and lily pads',
    draw: drawRiverbank,
    diffs: [
      { x: 520, y: 55, r: 42, flag: 'sunRays', label: 'Sun rays' },
      { x: 129, y: 164, r: 20, flag: 'coconut', label: 'Coconut' },
      { x: 306, y: 368, r: 26, flag: 'crocTeeth', label: 'Crocodile teeth' },
      { x: 436, y: 180, r: 26, flag: 'kingfisher', label: 'Kingfisher' },
      { x: 350, y: 384, r: 22, flag: 'lotus', label: 'Lotus flower' },
      { x: 520, y: 322, r: 26, flag: 'turtle', label: 'Turtle' },
      { x: 180, y: 250, r: 22, flag: 'dragonfly', label: 'Dragonfly' },
    ],
  },
  {
    id: 'canopy',
    name: 'Canopy Trail',
    hint: 'Deep canopy — parrots, sloth and a shy snake',
    draw: drawCanopy,
    diffs: [
      { x: 343, y: 260, r: 30, flag: 'sunbeam', label: 'Sunbeam' },
      { x: 262, y: 162, r: 26, flag: 'parrot2', label: 'Second parrot' },
      { x: 428, y: 206, r: 26, flag: 'sloth', label: 'Sloth' },
      { x: 340, y: 168, r: 24, flag: 'snake', label: 'Snake' },
      { x: 96, y: 306, r: 20, flag: 'orchid', label: 'Orchid colour' },
      { x: 150, y: 392, r: 22, flag: 'frog', label: 'Leaf frog' },
      { x: 478, y: 374, r: 20, flag: 'mushroom', label: 'Mushroom cap' },
    ],
  },
];
