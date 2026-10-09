import { getState } from "./store";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  const s = getState();
  master!.gain.value = s.muted ? 0 : s.volume * 0.5;
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.2, slide = 0, delay = 0) {
  const c = ac(); if (!c || !master) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur: number, vol = 0.3) {
  const c = ac(); if (!c || !master) return;
  const b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource(); const g = c.createGain();
  s.buffer = b; g.gain.value = vol; s.connect(g); g.connect(master); s.start();
}

export const sfx = {
  click: () => tone(660, 0.05, "square", 0.08),
  beep: () => { tone(880, 0.08, "square", 0.1); tone(1320, 0.08, "square", 0.08, 0, 0.09); },
  good: () => { tone(523, 0.1, "square", 0.12); tone(659, 0.1, "square", 0.12, 0, 0.1); tone(784, 0.18, "square", 0.12, 0, 0.2); },
  bad: () => { tone(220, 0.2, "sawtooth", 0.12, -100); },
  shoot: () => tone(900, 0.08, "square", 0.07, -600),
  boom: () => { noise(0.35, 0.35); tone(120, 0.3, "sawtooth", 0.15, -80); },
  hit: () => { noise(0.2, 0.4); tone(90, 0.25, "square", 0.2, -40); },
  pickup: () => { tone(988, 0.06, "square", 0.1); tone(1319, 0.1, "square", 0.1, 0, 0.06); },
  alarm: () => { tone(740, 0.18, "square", 0.1); tone(520, 0.18, "square", 0.1, 0, 0.2); },
  type: () => tone(1200 + Math.random() * 300, 0.02, "square", 0.03),
  jump: () => tone(300, 0.12, "square", 0.08, 400),
};

let musicTimer: number | null = null;
let intensity = 0;
const SCALE = [220, 261.6, 293.7, 329.6, 392, 440, 523.3];
export function music(level: number) {
  intensity = level;
  if (musicTimer !== null || typeof window === "undefined") return;
  let step = 0;
  musicTimer = window.setInterval(() => {
    if (getState().paused) return;
    const fast = intensity >= 2;
    if (!fast && step % 2) { step++; return; }
    const n = SCALE[(step * 3 + Math.floor(step / 8)) % SCALE.length];
    tone(n / 2, fast ? 0.18 : 0.9, "triangle", 0.05);
    if (step % 4 === 0) tone(n / 4, 1.2, "sine", 0.06);
    if (intensity >= 3 && step % 2 === 0) noise(0.05, 0.08);
    step++;
  }, 220);
}
export const setIntensity = (i: number) => { intensity = i; };
export const unlockAudio = () => ac();
