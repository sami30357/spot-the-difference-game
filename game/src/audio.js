// Reef Spotter — every sound is synthesized with WebAudio, no sound files.
// The context is created lazily on the first user gesture, so the game stays
// silent (and error-free) until the player interacts.

let ctx = null;
let muted = false;

/** Create (or resume) the audio context. Safe to call on every gesture. */
export function ensureAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

/** Toggle all sound. Returns the new muted state. */
export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

/** One short oscillator blip: frequency, seconds, wave shape, gain. */
function blip(freq, seconds, type, gain) {
  if (!ctx || muted) return;
  try {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + seconds + 0.02);
  } catch {
    // Sound is decoration; a failure must never break the game.
  }
}

/** A soft tick for the last ten seconds of the clock. */
export function playTick() {
  blip(880, 0.05, 'square', 0.05);
}

/** A soft click for cursor moves and button presses. */
export function playClick() {
  blip(620, 0.06, 'sine', 0.12);
}

/** A bright two-note chime when a difference is found. */
export function playFound() {
  blip(660, 0.12, 'sine', 0.22);
  setTimeout(() => blip(990, 0.18, 'sine', 0.22), 90);
}

/** A low buzz when a click lands on nothing. */
export function playMiss() {
  blip(160, 0.18, 'sawtooth', 0.08);
}

/** A gentle rising chime when a hint is used. */
export function playHint() {
  blip(520, 0.1, 'triangle', 0.16);
  setTimeout(() => blip(780, 0.14, 'triangle', 0.16), 80);
}

/** A short fanfare when a scene is completed. */
export function playLevel() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.2, 'sine', 0.2), i * 110));
}

/** A longer arpeggio for winning the whole game. */
export function playWin() {
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => blip(f, 0.28, 'sine', 0.2), i * 130));
}
