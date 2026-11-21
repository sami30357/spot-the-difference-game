// Jungle Spotter v2 — synthesized WebAudio sound effects. No sound files, no
// network: every effect is a short oscillator envelope. The AudioContext is
// created lazily on the first user gesture so autoplay rules never block it.
export function createSfx() {
  let ctx = null;
  let muted = false;

  function ac() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        return null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, dur, type, vol, when = 0, slideTo = null) {
    if (muted) return;
    const c = ac();
    if (!c) return;
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    click() {
      tone(660, 0.07, 'sine', 0.12);
    },
    correct() {
      // bright two-note chirp
      tone(880, 0.1, 'sine', 0.16);
      tone(1318, 0.16, 'sine', 0.16, 0.09);
    },
    wrong() {
      // low dull buzz
      tone(160, 0.22, 'sawtooth', 0.1, 0, 110);
    },
    hint() {
      // soft chime arpeggio
      tone(1046, 0.12, 'triangle', 0.14);
      tone(1568, 0.18, 'triangle', 0.12, 0.1);
    },
    levelClear() {
      // three rising notes when a scene is cleared
      tone(659, 0.12, 'triangle', 0.15);
      tone(880, 0.12, 'triangle', 0.15, 0.1);
      tone(1174, 0.22, 'triangle', 0.15, 0.2);
    },
    win() {
      // little jungle fanfare
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.16, i * 0.12));
      tone(1318, 0.4, 'triangle', 0.14, 0.5);
    },
    tick() {
      tone(1200, 0.05, 'square', 0.06);
    },
    setMuted(m) {
      muted = m;
    },
  };
}
