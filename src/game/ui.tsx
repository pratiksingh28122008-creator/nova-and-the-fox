// @ts-nocheck -- game code uses loose dynamic state for speed of iteration
import { useEffect, useRef, useState, type ReactNode } from "react";
import { drawSprite } from "./sprites";
import { sfx } from "./audio";
import { getState } from "./store";

export function Sprite({ rows, scale = 4, flip = false, className = "" }: { rows: string[]; scale?: number; flip?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!; ctx.clearRect(0, 0, c.width, c.height);
    drawSprite(ctx, rows, 0, 0, scale, flip);
  }, [rows, scale, flip]);
  return <canvas ref={ref} width={rows[0].length * scale} height={rows.length * scale} className={className} />;
}

/** Animated star field with optional meteors. */
export function Stars({ speed = 0.3, meteors = false, tint = "#0b0d22" }: { speed?: number; meteors?: boolean; tint?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    let raf = 0;
    const W = 320, H = 240; c.width = W; c.height = H;
    const st = Array.from({ length: 120 }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 3 + 0.3, t: Math.random() * 6 }));
    const ms: { x: number; y: number; l: number }[] = [];
    const loop = () => {
      ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H);
      for (const s of st) {
        s.x -= s.z * speed; if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
        s.t += 0.05;
        ctx.fillStyle = s.z > 2.4 ? "#ffffff" : s.z > 1.2 ? "#9fd8ff" : "#5a6aa0";
        const sz = s.z > 2.6 && Math.sin(s.t) > 0.6 ? 2 : 1;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), sz, sz);
      }
      if (meteors && Math.random() < 0.02) ms.push({ x: Math.random() * W + 60, y: -10, l: 1 });
      for (const m of ms) {
        m.x -= 3; m.y += 2; m.l -= 0.008;
        for (let i = 0; i < 8; i++) { ctx.fillStyle = i ? `rgba(255,${150 + i * 10},80,${0.6 - i * 0.07})` : "#fff"; ctx.fillRect(m.x + i * 3, m.y - i * 2, 2, 2); }
      }
      while (ms.length && ms[0].l < 0) ms.shift();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [speed, meteors, tint]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

export type Line = { who: string; text: string };
const WHO_COLOR: Record<string, string> = { NOVA: "text-primary", PIP: "text-pip", RADIO: "text-muted-foreground", "???": "text-success", LUMARI: "text-success", NARRATOR: "text-accent" };

export function Dialogue({ lines, onDone, children }: { lines: Line[]; onDone: () => void; children?: ReactNode }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const line = lines[i];
  useEffect(() => { setN(0); }, [i]);
  useEffect(() => {
    if (!line || n >= line.text.length) return;
    const t = setTimeout(() => { setN((v) => v + 2); if (n % 6 === 0) sfx.type(); }, 22);
    return () => clearTimeout(t);
  }, [n, line]);
  const next = () => {
    if (getState().modal) return;
    if (!line) return;
    if (n < line.text.length) return setN(line.text.length);
    sfx.click();
    if (i + 1 >= lines.length) onDone(); else setI(i + 1);
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); next(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  if (!line) return null;
  return (
    <div className="relative h-full w-full cursor-pointer select-none" onClick={next}>
      {children}
      <div className="pixel-panel absolute inset-x-2 bottom-2 p-3 sm:inset-x-6 sm:bottom-6 sm:p-4">
        <div className={`font-pixel text-[10px] ${WHO_COLOR[line.who] ?? "text-foreground"}`}>{line.who}</div>
        <p className="mt-2 min-h-[3em] text-xl leading-tight sm:text-2xl">"{line.text.slice(0, n)}"</p>
        <div className="mt-1 text-right font-pixel text-[8px] text-muted-foreground animate-blink">TAP / SPACE ▶</div>
      </div>
    </div>
  );
}

export function Modal({ title, children, onClose, wide }: { title: string; children: ReactNode; onClose?: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 p-2 backdrop-blur-sm">
      <div className={`pixel-panel max-h-[92vh] w-full overflow-y-auto p-3 sm:p-5 ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-pixel text-xs text-primary sm:text-sm">{title}</h2>
          {onClose && <button className="pixel-btn" onClick={() => { sfx.click(); onClose(); }}>✕</button>}
        </div>
        {children}
      </div>
    </div>
  );
}

export type Opt = { label: string; hint?: string; disabled?: boolean; run: () => void };
export function Choice({ prompt, options }: { prompt: string; options: Opt[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xl leading-tight">{prompt}</p>
      <div className="grid gap-2">
        {options.map((o, i) => (
          <button key={i} disabled={o.disabled} className="pixel-btn text-left" onClick={() => { sfx.click(); o.run(); }}>
            <span className="text-accent">{String.fromCharCode(65 + i)}.</span> {o.label}
            {o.hint && <span className="mt-1 block font-term text-base text-muted-foreground">{o.hint}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Result({ text, onNext, label = "CONTINUE" }: { text: string; onNext: () => void; label?: string }) {
  return (
    <div className="space-y-4">
      <p className="text-xl leading-tight">{text}</p>
      <button className="pixel-btn pixel-btn-primary w-full" onClick={() => { sfx.click(); onNext(); }}>{label} ▶</button>
    </div>
  );
}

/** Hook: held keys + virtual buttons for canvas games. */
export function useControls() {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const map = (k: string) => ({ ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", " ": "act", e: "use", E: "use", f: "use" } as Record<string, string>)[k];
    const dn = (e: KeyboardEvent) => { const m = map(e.key); if (m) { keys.current[m] = true; if (e.key === " " || e.key.startsWith("Arrow")) e.preventDefault(); } };
    const up = (e: KeyboardEvent) => { const m = map(e.key); if (m) keys.current[m] = false; };
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);
  return keys;
}

export function HoldButton({ k, keys, children, className = "" }: { k: string; keys: React.MutableRefObject<Record<string, boolean>>; children: ReactNode; className?: string }) {
  const on = (v: boolean) => (e: React.PointerEvent) => { e.preventDefault(); keys.current[k] = v; };
  return (
    <button className={`pixel-btn touch-none select-none ${className}`} onPointerDown={on(true)} onPointerUp={on(false)} onPointerLeave={on(false)} onPointerCancel={on(false)} onContextMenu={(e) => e.preventDefault()}>
      {children}
    </button>
  );
}
