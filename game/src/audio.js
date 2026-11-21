// Starlight Station — synthesized sound effects (WebAudio, no sound files).
// Every effect is a short oscillator envelope so the game stays fully offline.

let audioCtx = null;
let muted = false;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(freq, startAt, dur, type, vol, slideTo) {
  const ac = ctx();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + startAt);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + startAt + dur);
  gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
  osc.connect(gain); gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.05);
}

export const sfx = {
  unlock() { ctx(); },
  setMuted(m) { muted = m; },
  isMuted() { return muted; },
  // Soft UI blip when the cursor moves onto a panel or a button is pressed.
  click() { tone(660, 0, 0.07, 'sine', 0.12); },
  // Short ascending blip when a new scene starts.
  levelStart() {
    tone(440, 0, 0.09, 'triangle', 0.14);
    tone(660, 0.08, 0.12, 'triangle', 0.14);
  },
  // Happy two-note chime when a difference is found.
  found() {
    tone(523.25, 0, 0.14, 'triangle', 0.22);
    tone(783.99, 0.09, 0.22, 'triangle', 0.22);
    tone(1046.5, 0.18, 0.28, 'sine', 0.14);
  },
  // Low buzz for a wrong click.
  wrong() { tone(180, 0, 0.22, 'sawtooth', 0.12, 110); },
  // Sparkle arpeggio for a hint.
  hint() {
    tone(880, 0, 0.1, 'sine', 0.14);
    tone(1174.66, 0.08, 0.1, 'sine', 0.14);
    tone(1567.98, 0.16, 0.18, 'sine', 0.12);
  },
  // Rising sweep when a scene is completed.
  levelComplete() {
    tone(523.25, 0, 0.16, 'triangle', 0.2);
    tone(659.25, 0.12, 0.16, 'triangle', 0.2);
    tone(783.99, 0.24, 0.16, 'triangle', 0.2);
    tone(1046.5, 0.36, 0.34, 'triangle', 0.22);
  },
  // Little fanfare for winning the whole game.
  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => tone(n, i * 0.13, 0.22, 'triangle', 0.2));
  },
  // Sad descending notes for game over.
  gameOver() {
    tone(392, 0, 0.22, 'triangle', 0.18);
    tone(311.13, 0.2, 0.22, 'triangle', 0.18);
    tone(233.08, 0.4, 0.4, 'triangle', 0.18);
  },
  // Short tick when the timer drops under ten seconds.
  tick() { tone(1200, 0, 0.05, 'square', 0.05); },
};
