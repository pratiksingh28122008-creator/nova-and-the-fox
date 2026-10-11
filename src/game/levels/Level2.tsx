// @ts-nocheck -- game code uses loose dynamic state for speed of iteration
import { useEffect, useRef, useState } from "react";
import { useGame, setFlag, getState, change, addItem, toast, setObjective, checkpoint, setState, pipChange } from "../store";
import { Dialogue, Modal, Stars, Result, useControls, HoldButton, Sprite } from "../ui";
import { drawSprite, SHIP } from "../sprites";
import { sfx, setIntensity } from "../audio";

const PHASES = [
  { name: "WARNING FIELD", dur: 25, every: 1.0, kinds: ["m"], speed: 80 },
  { name: "FRAGMENT FIELD", dur: 35, every: 0.55, kinds: ["s", "m", "l"], speed: 125 },
  { name: "THE STORM CORE", dur: 45, every: 0.36, kinds: ["s", "m", "l", "s"], speed: 165 },
];

export default function Level2() {
  const stage = useGame((s) => s.flags.L2stage ?? "intro");
  const go = (s: string) => setFlag("L2stage", s);
  useEffect(() => {
    setObjective({ intro: "Follow the signal.", nav: "Find the strongest radio signal.", tut: "Prepare for the meteor shower.", flight: "Survive the meteor gauntlet!", outro: "Escape the storm." }[stage as string] ?? "");
    setIntensity(stage === "flight" ? 3 : 1);
  }, [stage]);

  if (stage === "intro")
    return <Dialogue lines={[
      { who: "NARRATOR", text: "With the little fuel left, the KESTREL turns toward the mysterious signal. A pale planet glimmers far ahead." },
      { who: "PIP", text: "Radio pulses detected. Triangulation required." },
    ]} onDone={() => go("nav")}><Stars speed={0.8} /><Planet /></Dialogue>;
  if (stage === "nav") return <Nav onDone={() => go("tut")} />;
  if (stage === "tut")
    return (
      <div className="relative h-full"><Stars speed={1} meteors />
        <Modal title="⚠ METEOR SHOWER INBOUND">
          <p className="text-xl">Three phases ahead. Dodge meteors, shoot small ones, grab ✨ energy fragments.</p>
          <ul className="mt-2 text-lg text-muted-foreground"><li>◀ ▶ / A D — move</li><li>SHOOT / Space — energy pulse</li><li>BACK / Esc — pause flight</li></ul>
          <button className="pixel-btn pixel-btn-primary mt-3 w-full" onClick={() => { setFlag("flightPhase", 0); go("flight"); }}>LAUNCH ▶</button>
        </Modal>
      </div>
    );
  if (stage === "flight") return <Flight onWin={() => go("outro")} />;
  const dmg = getState().flags.wingDmg ?? 18;
  return <Dialogue lines={[
    { who: "NARRATOR", text: "METEOR FIELD CLEARED! The KESTREL bursts out of the storm…" },
    { who: "NARRATOR", text: `CRACK! One last giant meteor clips the starboard wing. Sparks. Alarms. Smoke. (Ship −${dmg})` },
    { who: "NOVA", text: "We made it... Pip, please tell me that wasn't the important wing." },
    { who: "PIP", text: "Structural integrity compromised. Repair recommended immediately." },
  ]} onDone={() => { setState({ level: 3 }); checkpoint(3); }}>
    <Stars speed={0.4} />
    <div className="absolute inset-0 flex items-center justify-center pb-40"><div className="animate-shake"><Sprite rows={SHIP} scale={10} /></div><span className="absolute text-5xl animate-blink">💥</span></div>
    <div className="absolute inset-0 bg-destructive/20 animate-alarm" />
  </Dialogue>;
}

function Planet() {
  return <div className="absolute right-[10%] top-[12%] h-24 w-24 rounded-full bg-success/70 shadow-[0_0_40px] shadow-success/50 sm:h-36 sm:w-36" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--success) 90%, white), transparent 70%)" }} />;
}

function Nav({ onDone }: { onDone: () => void }) {
  const [round, setRound] = useState(0);
  const [seed] = useState(() => [0, 1, 2].map(() => Math.floor(Math.random() * 3)));
  const help = getState().flags.signal === "alien";
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT((v) => v + 1), 120); return () => clearInterval(id); }, []);
  if (round >= 3) return <div className="relative h-full"><Stars speed={2} /><Modal title="SIGNAL LOCKED"><Result text="The planet's pulse is strong and clear. But the scanner screams: a meteor shower is directly in the path!" onNext={onDone} /></Modal></div>;
  const correct = seed[round];
  return (
    <div className="relative h-full"><Stars speed={0.6} /><Planet />
      <div className="relative z-10 mx-auto max-w-xl p-3">
        <div className="pixel-panel p-3">
          <h2 className="font-pixel text-xs text-primary">NAVIGATION — JUMP {round + 1}/3</h2>
          <p className="text-lg">Which heading carries the strongest radio pulse? Wrong turns cost fuel. {help && <span className="text-success">Your recorded alien pattern ▲◆● highlights the true pulse.</span>}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["◤ PORT", "▲ AHEAD", "◥ STARBOARD"].map((lab, i) => {
              const amp = i === correct ? 16 : 8 + ((i * 5 + round * 3) % 6);
              return (
                <button key={i} className={`pixel-btn p-1 ${help && i === correct ? "border-success" : ""}`} onClick={() => {
                  if (i === correct) { sfx.good(); setRound(round + 1); toast("Signal stronger!", "good"); }
                  else { sfx.bad(); change({ fuel: -4, food: -2 }); toast("Static… wrong heading. −4 fuel", "bad"); }
                }}>
                  <svg viewBox="0 0 60 40" className="w-full"><polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-success" points={Array.from({ length: 30 }, (_, k) => `${k * 2},${20 + Math.sin((k + t) * (0.5 + i * 0.13)) * amp * (0.7 + Math.random() * 0.3)}`).join(" ")} /></svg>
                  {lab}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

type M = { x: number; y: number; r: number; vx: number; vy: number; hp: number; k: string; w: number };
function Flight({ onWin }: { onWin: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const keys = useControls();
  const [ui, setUi] = useState<"play" | "pause" | "fail">("play");
  const uiRef = useRef(ui); uiRef.current = ui;
  const [runId, setRunId] = useState(0);
  const startPhase = useRef<number>(getState().flags.flightPhase ?? 0);

  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    const W = 360, H = 520; c.width = W; c.height = H;
    const handling = getState().flags.repairQ === "perfect" ? 1.15 : 1;
    const g = {
      x: W / 2, hull: Math.max(40, getState().ship), phase: startPhase.current, t: 0, spawn: 0, cd: 0, inv: 0, shake: 0,
      ms: [] as M[], bs: [] as { x: number; y: number }[], fr: [] as { x: number; y: number }[], ps: [] as { x: number; y: number; vx: number; vy: number; l: number; c: string }[],
      stars: Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 3 + 0.5 })),
      hits: getState().flags.flightHits ?? 0, frags: getState().flags.flightFrags ?? 0, banner: 2.5, flip: 0,
    };
    let last = performance.now(), raf = 0;
    const boom = (x: number, y: number, n: number, col = "#ffb347") => { for (let i = 0; i < n; i++) g.ps.push({ x, y, vx: (Math.random() - 0.5) * 200, vy: (Math.random() - 0.5) * 200, l: 0.6, c: i % 2 ? col : "#fff" }); };
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      raf = requestAnimationFrame(loop);
      if (uiRef.current !== "play" || getState().modal) { if (keys.current.back) { keys.current.back = false; } return; }
      if (keys.current.back) { keys.current.back = false; setUi("pause"); return; }
      const P = PHASES[g.phase];
      g.t += dt; g.banner -= dt; g.cd -= dt; g.inv -= dt; g.shake *= 0.9;
      const sp = 210 * handling;
      if (keys.current.left) g.x -= sp * dt; if (keys.current.right) g.x += sp * dt;
      g.x = Math.max(18, Math.min(W - 18, g.x));
      if (keys.current.act && g.cd <= 0) { g.bs.push({ x: g.x, y: H - 70 }); g.cd = 0.22; sfx.shoot(); }
      // spawn
      g.spawn -= dt;
      if (g.spawn <= 0 && g.banner < 1.5) {
        g.spawn = P.every * (0.7 + Math.random() * 0.6);
        const k = P.kinds[Math.floor(Math.random() * P.kinds.length)];
        const r = k === "s" ? 7 : k === "m" ? 14 : 28;
        let x = Math.random() * (W - 2 * r) + r;
        // Fairness: keep a lane clear around the ship for large meteors
        if (k === "l" && Math.abs(x - g.x) < 50) x = (x + W / 2) % (W - 2 * r) + r;
        g.ms.push({ x, y: -r, r, k, hp: k === "l" ? 4 : k === "m" ? 2 : 1, vx: k === "s" ? (Math.random() - 0.5) * 80 : 0, vy: P.speed * (k === "s" ? 1.5 : k === "l" ? 0.6 : 1) * (0.85 + Math.random() * 0.3), w: Math.random() * 6 });
        if (g.phase >= 1 && Math.random() < 0.18) g.fr.push({ x: Math.random() * (W - 40) + 20, y: -10 });
      }
      if (g.phase === 2) { g.flip -= dt; if (g.flip <= 0) { g.flip = 3; const d = Math.random() < 0.5 ? -1 : 1; g.ms.forEach((m) => { if (m.k !== "l") m.vx = d * (30 + Math.random() * 50); }); } }
      const sy = H - 60;
      for (const m of g.ms) {
        m.y += m.vy * dt; m.x += m.vx * dt + (m.k === "s" ? Math.sin(g.t * 4 + m.w) * 40 * dt : 0);
        if (m.x < m.r || m.x > W - m.r) m.vx *= -1;
        if (g.inv <= 0 && Math.hypot(m.x - g.x, m.y - sy) < m.r + 13) {
          const d = m.k === "l" ? 16 : m.k === "m" ? 10 : 6; g.hull -= d; g.hits++; g.inv = 1; g.shake = 8; m.hp = 0; m.y = H + 99;
          sfx.hit(); boom(g.x, sy, 14, "#ff4d5e");
        }
      }
      for (const b of g.bs) {
        b.y -= 420 * dt;
        for (const m of g.ms) if (m.hp > 0 && Math.hypot(b.x - m.x, b.y - m.y) < m.r + 3) {
          m.hp--; b.y = -99;
          if (m.hp <= 0) { sfx.boom(); boom(m.x, m.y, m.r); m.y = H + 99; if (m.k === "l" && Math.random() < 0.6) g.fr.push({ x: m.x, y: m.y - H - 99 + m.y }); } else { m.r *= 0.85; sfx.click(); }
        }
      }
      for (const f of g.fr) { f.y += 90 * dt; if (Math.hypot(f.x - g.x, f.y - sy) < 20) { f.y = H + 99; g.frags++; sfx.pickup(); } }
      g.ms = g.ms.filter((m) => m.y < H + 40 && m.hp > 0); g.bs = g.bs.filter((b) => b.y > -10); g.fr = g.fr.filter((f) => f.y < H + 20);
      for (const p of g.ps) { p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; } g.ps = g.ps.filter((p) => p.l > 0);
      if (g.hull <= 0) { sfx.bad(); setFlag("flightPhase", g.phase); setUi("fail"); return; }
      if (g.t >= P.dur) {
        if (g.phase < 2) { g.phase++; g.t = 0; g.banner = 2.5; g.ms = []; setFlag("flightPhase", g.phase); sfx.alarm(); change({ water: -2, food: -1 }); }
        else {
          cancelAnimationFrame(raf);
          const dmg = Math.max(6, 24 - Math.min(10, g.frags) - (g.hits === 0 ? 6 : g.hits < 4 ? 3 : 0));
          setState({ ship: Math.max(5, Math.min(getState().shipMax, g.hull) - dmg) });
          setFlag("wingDmg", dmg); setFlag("flightStats", { hits: g.hits, frags: g.frags });
          addItem("frag", g.frags); if (g.hits <= 3) { addItem("cell", 1); toast("Skilled flying! Bonus energy cell ⚡", "good"); }
          pipChange({ trust: 5 }); sfx.good(); onWin(); return;
        }
      }
      setFlag("flightHits", g.hits); 
      // draw
      ctx.save(); ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
      ctx.fillStyle = g.phase === 2 ? "#1a0b22" : "#070a1c"; ctx.fillRect(-10, -10, W + 20, H + 20);
      for (const s of g.stars) { s.y += s.z * (40 + g.phase * 40) * dt; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } ctx.fillStyle = s.z > 2.5 ? "#fff" : "#6a7ab0"; ctx.fillRect(s.x, s.y, 1, s.z * 1.5); }
      for (const m of g.ms) {
        const r = Math.round(m.r);
        ctx.fillStyle = m.k === "l" ? "#6b4a3a" : m.k === "s" ? "#c96a3a" : "#8a6450";
        for (let yy = -r; yy <= r; yy += 3) for (let xx = -r; xx <= r; xx += 3) if (xx * xx + yy * yy <= r * r) ctx.fillRect(Math.round(m.x + xx), Math.round(m.y + yy), 3, 3);
        ctx.fillStyle = "#ffcf7a"; ctx.fillRect(m.x - r / 3, m.y - r / 2, 3, 3);
        ctx.fillStyle = "rgba(255,140,60,.35)"; ctx.fillRect(m.x - 2, m.y - r - 10, 4, 8);
      }
      ctx.fillStyle = "#7cf7c9"; for (const b of g.bs) ctx.fillRect(b.x - 2, b.y - 6, 4, 10);
      for (const f of g.fr) { ctx.fillStyle = Math.sin(g.t * 10) > 0 ? "#ffd23f" : "#fff"; ctx.fillRect(f.x - 4, f.y - 4, 8, 8); }
      for (const p of g.ps) { ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 3, 3); }
      if (g.inv <= 0 || Math.floor(g.t * 12) % 2) {
        drawSprite(ctx, SHIP, g.x - 18, sy - 12, 3);
        ctx.fillStyle = Math.random() > 0.5 ? "#ffd23f" : "#ff8a3d"; ctx.fillRect(g.x - 4, sy + 13, 3, 6 + Math.random() * 8); ctx.fillRect(g.x + 2, sy + 13, 3, 6 + Math.random() * 8);
      }
      ctx.restore();
      ctx.fillStyle = "#fff"; ctx.font = "10px 'Press Start 2P'";
      ctx.fillText(`PHASE ${g.phase + 1}/3 ${Math.ceil(P.dur - g.t)}s`, 8, 18);
      ctx.fillText(`✨${g.frags}`, W - 60, 18);
      ctx.fillStyle = "#333"; ctx.fillRect(8, 26, 120, 6); ctx.fillStyle = g.hull < 30 ? "#ff4d5e" : "#9fb3c8"; ctx.fillRect(8, 26, (Math.max(0, g.hull) / 100) * 120, 6);
      if (g.hull < 30 && Math.floor(g.t * 3) % 2) { ctx.fillStyle = "#ff4d5e"; ctx.fillText("⚠ HULL CRITICAL", 100, 50); }
      if (g.banner > 0) { ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(0, H / 2 - 40, W, 70); ctx.fillStyle = "#ffd23f"; ctx.textAlign = "center"; ctx.fillText(P.name, W / 2, H / 2 - 8); ctx.fillStyle = "#fff"; ctx.font = "8px 'Press Start 2P'"; ctx.fillText(["Slow meteors. Learn to dodge & shoot.", "Small ones zigzag. Big ones need 4 hits.", "Storm winds shift every few seconds!"][g.phase], W / 2, H / 2 + 14); ctx.textAlign = "left"; }
    };
    raf = requestAnimationFrame(loop);
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setUi((u) => (u === "play" ? "pause" : u)); } };
    window.addEventListener("keydown", esc, true);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", esc, true); };
  }, [runId]);

  const retry = (fromStart: boolean) => {
    change({ fuel: -5, food: -4, water: -4 });
    if (fromStart) { startPhase.current = 0; setFlag("flightPhase", 0); setFlag("flightFrags", 0); } else startPhase.current = getState().flags.flightPhase ?? 0;
    setFlag("flightHits", 0);
    if (getState().ship < 50) setState({ ship: 50 });
    toast("Emergency patch applied. Retry cost: −5 fuel, −4 food, −4 water", "warn");
    setUi("play"); setRunId((r) => r + 1);
  };

  return (
    <div className="flex h-full flex-col items-center gap-1 p-1">
      <div className="relative min-h-0 w-full flex-1">
        <canvas ref={ref} className="mx-auto h-full max-w-full border-4 border-border" style={{ aspectRatio: "360/520" }} />
      </div>
      <div className="grid w-full max-w-md grid-cols-4 gap-1 pb-1">
        <HoldButton k="left" keys={keys} className="h-16 text-lg">◀<br /><span className="text-[8px]">LEFT</span></HoldButton>
        <HoldButton k="right" keys={keys} className="h-16 text-lg">▶<br /><span className="text-[8px]">RIGHT</span></HoldButton>
        <HoldButton k="act" keys={keys} className="pixel-btn-accent h-16 text-lg">✸<br /><span className="text-[8px]">SHOOT</span></HoldButton>
        <button className="pixel-btn h-16" onClick={() => setUi("pause")}>⟲<br /><span className="text-[8px]">BACK</span></button>
      </div>
      {ui === "pause" && (
        <Modal title="FLIGHT PAUSED">
          <p className="text-xl">Return to the start of the meteor sequence checkpoint? Your inventory and resources are kept, but the current run is lost.</p>
          <div className="mt-3 grid gap-2">
            <button className="pixel-btn pixel-btn-primary" onClick={() => setUi("play")}>▶ RESUME FLIGHT</button>
            <button className="pixel-btn" onClick={() => retry(true)}>⟲ RETURN TO CHECKPOINT (phase 1)</button>
          </div>
        </Modal>
      )}
      {ui === "fail" && (
        <Modal title="SIGNAL LOST — TRY AGAIN">
          <p className="text-xl">The hull buckled. Pip reroutes emergency power to keep you alive.</p>
          <div className="mt-3 grid gap-2">
            <button className="pixel-btn pixel-btn-primary" onClick={() => retry(false)}>↻ REPLAY PHASE {(getState().flags.flightPhase ?? 0) + 1}</button>
            <button className="pixel-btn" onClick={() => retry(true)}>⟲ RESTART SEQUENCE</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
