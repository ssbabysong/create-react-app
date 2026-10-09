// Paper sounds synthesized with WebAudio, so the app ships no audio files.
import { S } from './state';

let AC: AudioContext | null = null;
function actx() {
  if (!S.prefs.sound) return null;
  try {
    AC = AC || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
  } catch {
    AC = null;
  }
  return AC;
}
function nbuf(a: AudioContext, d: number) {
  const b = a.createBuffer(1, Math.max(1, (a.sampleRate * d) | 0), a.sampleRate);
  const c = b.getChannelData(0);
  for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1;
  return b;
}
function burst(a: AudioContext, t: number, d: number, f: number, q: number, g: number, type: BiquadFilterType = 'bandpass') {
  const s = a.createBufferSource();
  s.buffer = nbuf(a, d);
  const fl = a.createBiquadFilter();
  fl.type = type;
  fl.frequency.value = f;
  fl.Q.value = q;
  const gn = a.createGain();
  gn.gain.setValueAtTime(0, t);
  gn.gain.linearRampToValueAtTime(g, t + Math.min(0.008, d / 3));
  gn.gain.exponentialRampToValueAtTime(0.0005, t + d);
  s.connect(fl);
  fl.connect(gn);
  gn.connect(a.destination);
  s.start(t);
  s.stop(t + d + 0.02);
}
const buzz = (n: number) => {
  try {
    navigator.vibrate && navigator.vibrate(n);
  } catch {
    /* not supported */
  }
};

export const SFX = {
  flip() {
    const a = actx();
    if (!a) return;
    const t = a.currentTime;
    const s = a.createBufferSource();
    s.buffer = nbuf(a, 0.62);
    const f = a.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(500, t);
    f.frequency.exponentialRampToValueAtTime(2400, t + 0.3);
    f.frequency.exponentialRampToValueAtTime(700, t + 0.6);
    const g = a.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.1);
    g.gain.linearRampToValueAtTime(0.045, t + 0.32);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.6);
    s.connect(f);
    f.connect(g);
    g.connect(a.destination);
    s.start(t);
    s.stop(t + 0.64);
    burst(a, t + 0.52, 0.09, 260, 1, 0.07, 'lowpass');
  },
  peel() {
    const a = actx();
    if (!a) return;
    const t = a.currentTime;
    for (let i = 0; i < 10; i++) burst(a, t + i * 0.013 + Math.random() * 0.006, 0.016, 2600 + Math.random() * 3400, 2.5, 0.035 + Math.random() * 0.035);
    buzz(5);
  },
  tear() {
    const a = actx();
    if (!a) return;
    const t = a.currentTime;
    burst(a, t, 0.2, 1800, 0.7, 0.035);
    for (let i = 0; i < 18; i++) burst(a, t + i * 0.011 + Math.random() * 0.006, 0.014, 1500 + Math.random() * 4500, 3, 0.05 + Math.random() * 0.04);
    buzz(8);
  },
  press() {
    const a = actx();
    if (!a) return;
    const t = a.currentTime;
    const o = a.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(170, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.09);
    const g = a.createGain();
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.12);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + 0.13);
    burst(a, t, 0.03, 1600, 1, 0.025);
    buzz(6);
  },
  roll() {
    const a = actx();
    if (!a) return;
    const t = a.currentTime;
    burst(a, t, 0.55, 700, 0.6, 0.03, 'lowpass');
    for (let i = 0; i < 7; i++) burst(a, t + 0.05 + i * 0.07, 0.012, 3200, 4, 0.025);
  },
  snip() {
    const a = actx();
    if (!a) return;
    const t = a.currentTime;
    burst(a, t, 0.025, 5200, 6, 0.07);
    burst(a, t + 0.11, 0.025, 4600, 6, 0.07);
    burst(a, t + 0.2, 0.03, 3800, 5, 0.06);
    burst(a, t + 0.05, 0.12, 900, 1, 0.02, 'lowpass');
    buzz(4);
  },
  pen() {
    const a = actx();
    if (!a) return;
    burst(a, a.currentTime, 0.05, 6000, 1, 0.006, 'highpass');
  },
  tick() {
    const a = actx();
    if (!a) return;
    burst(a, a.currentTime, 0.012, 4200, 5, 0.03);
  },
};
