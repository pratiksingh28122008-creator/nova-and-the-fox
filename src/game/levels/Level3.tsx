// @ts-nocheck -- game code uses loose dynamic state for speed of iteration
import { useEffect, useRef, useState } from "react";
import { useGame, setFlag, getState, change, pipChange, addItem, removeItem, toast, setObjective, checkpoint, setState } from "../store";
import { Dialogue, Modal, Stars, Choice, Result, useControls, HoldButton, Sprite } from "../ui";
import { drawSprite, NOVA, PIP, SHIP } from "../sprites";
import { sfx } from "../audio";

const OBJ: Record<string, string> = {
  intro: "Prepare for the spacewalk.", scan: "A: Diagnose the wing damage.", strategy: "B: Choose a repair strategy.",
  retrieve: "C: Retrieve the missing components.", build: "D: Rebuild the wing.", calib: "E: Calibrate the wing.",
  flare: "F: Survive the solar flare!", outro: "Return to the cockpit.",
};

export default function Level3() {
  const stage = useGame((s) => s.flags.L3stage ?? "intro");
  const go = (s: string) => setFlag("L3stage", s);
  useEffect(() => {
    setObjective(OBJ[stage] ?? "");
    setState({ o2Drain: ["scan", "strategy", "retrieve", "build", "calib", "flare"].includes(stage) ? 0.28 : 0 });
    return () => setState({ o2Drain: 0 });
  }, [stage]);

  return (
    <div className="relative h-full overflow-hidden">
      <Stars speed={0.1} />
      <div className="relative z-10 h-full overflow-y-auto">
        {stage === "intro" && (
          <Dialogue lines={[
            { who: "NARRATOR", text: "Nova stares through the cockpit window at the mangled starboard wing." },
            { who: "NOVA", text: "The stabilizer is gone. If I don't repair it, we'll never survive atmospheric entry." },
            { who: "PIP", text: "External repair protocol available. Warning: oxygen reserves limited." },
            { who: "NARRATOR", text: "Suit sealed. Oxygen check: green. The airlock hisses open, and Nova floats out into the silent dark…" },
          ]} onDone={() => { checkpoint(3); change({ o2: 100 }); go("scan"); }}>
            <div className="absolute inset-0 flex items-center justify-center gap-6 pb-40"><Sprite rows={SHIP} scale={9} /><div className="animate-floaty"><Sprite rows={NOVA} scale={5} /></div></div>
          </Dialogue>
        )}
        {stage === "scan" && <Scan onDone={() => go("strategy")} />}
        {stage === "strategy" && <Strategy onDone={() => go("retrieve")} />}
        {stage === "retrieve" && <Retrieve onDone={() => go("build")} />}
        {stage === "build" && <Build onDone={() => go("calib")} />}
        {stage === "calib" && <Calib onDone={() => go("flare")} />}
        {stage === "flare" && <Flare onDone={() => go("outro")} />}
        {stage === "outro" && (
          <Dialogue lines={[
            { who: "NARRATOR", text: "Back in the cockpit. CLUNK — the wing locks into place. The engine coughs, then roars. The navigation display stabilizes." },
            { who: "PIP", text: "Wing repair complete. Survival probability improved!" },
            { who: "NOVA", text: "Good work, little buddy. Let's find out who sent that signal." },
          ]} onDone={() => { setState({ level: 4 }); checkpoint(4); }}>
            <div className="absolute inset-0 flex items-center justify-center pb-40"><div className="animate-floaty"><Sprite rows={SHIP} scale={10} /></div></div>
          </Dialogue>
        )}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl p-2 sm:p-4"><div className="pixel-panel p-3"><h2 className="mb-2 font-pixel text-[10px] text-primary sm:text-xs">{title}</h2>{children}</div></div>;
}

// ---------- A ----------
const DAMAGE = [
  { id: "stab", name: "Broken stabilizer", x: 70, y: 30, info: "Stabilizer fin sheared off. Needs a full replacement plate." },
  { id: "wire", name: "Loose wiring", x: 45, y: 55, info: "Three wires torn: RED → power, BLUE → sensor, YELLOW → ground." },
  { id: "panel", name: "Cracked outer panel", x: 25, y: 40, info: "Thermal shield cracked. Must be replaced before entry heat." },
  { id: "conn", name: "Damaged power connector", x: 55, y: 75, info: "Connector melted. A spare is in cargo." },
  { id: "bolts", name: "Missing fastening bolts", x: 85, y: 65, info: "4 bolts gone. Tighten in a STAR pattern: 1 → 3 → 2 → 4 to avoid warping." },
];
function Scan({ onDone }: { onDone: () => void }) {
  const [rev, setRev] = useState<string[]>([]); const [seen, setSeen] = useState<string[]>([]); const [sel, setSel] = useState<string | null>(null);
  const trust = useGame((s) => s.pip.trust);
  const scan = (n: number, cost: number) => {
    if (getState().battery < cost) return toast("Not enough suit battery!", "bad");
    change({ battery: -cost }); sfx.beep();
    const hidden = DAMAGE.filter((d) => !rev.includes(d.id)).map((d) => d.id);
    setRev([...rev, ...hidden.slice(0, n)]);
  };
  const d = DAMAGE.find((x) => x.id === sel);
  return (
    <Panel title="STAGE A — DIAGNOSE THE DAMAGE">
      <p className="text-lg">Scan the wing, then tap each damaged area to inspect it. ({seen.length}/5 inspected)</p>
      <div className="relative mt-2 h-48 border-4 border-border bg-background sm:h-56">
        <div className="absolute left-[10%] top-[25%] h-[50%] w-[80%] bg-hull/60" style={{ clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 70%)" }} />
        <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,var(--primary)_95%)] bg-[length:100%_12px] opacity-30" />
        {DAMAGE.map((x) => rev.includes(x.id) && (
          <button key={x.id} className={`absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 border-2 ${seen.includes(x.id) ? "border-success bg-success/40" : "border-destructive bg-destructive/50 animate-blink"}`} style={{ left: `${x.x}%`, top: `${x.y}%` }} onClick={() => { sfx.click(); setSel(x.id); if (!seen.includes(x.id)) setSeen([...seen, x.id]); }}>!</button>
        ))}
      </div>
      {d && <div className="mt-2 border-2 border-accent p-2 text-lg"><b className="text-accent">{d.name}:</b> {d.info}</div>}
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button className="pixel-btn" onClick={() => scan(2, 4)}>Quick scan (−4⚡, 2 areas)</button>
        <button className="pixel-btn" onClick={() => scan(5, 12)}>Deep scan (−12⚡, all)</button>
        <button className="pixel-btn" disabled={trust < 45} onClick={() => { pipChange({ bat: -8, trust: 2 }); setRev(DAMAGE.map((x) => x.id)); sfx.beep(); toast("Pip: Full damage map uploaded!", "good"); }}>🦊 Pip scan {trust < 45 ? "(trust 45)" : "(free)"}</button>
      </div>
      <button className="pixel-btn pixel-btn-primary mt-3 w-full" disabled={seen.length < 5} onClick={() => { setFlag("clues", true); onDone(); }}>DIAGNOSIS COMPLETE ▶</button>
    </Panel>
  );
}

// ---------- B ----------
function Strategy({ onDone }: { onDone: () => void }) {
  const inv = useGame((s) => s.inv);
  return (
    <Panel title="STAGE B — REPAIR STRATEGY">
      <Choice prompt="How will you replace the stabilizer? This affects your ship for the rest of the journey." options={[
        { label: "Salvage a part from the cargo bay", hint: "Cheap, but you must retrieve extra parts from drifting debris (4 components).", run: () => { setFlag("strategy", "salvage"); onDone(); } },
        { label: "Fabricate a replacement", hint: `Costs 3 minerals (you have ${inv.mineral ?? 0}). Stronger wing: max integrity +10. 3 components to grab.`, disabled: (inv.mineral ?? 0) < 3, run: () => { removeItem("mineral", 3); setState((s) => ({ shipMax: 110 })); setFlag("strategy", "fabricate"); onDone(); } },
        { label: "Apply an emergency patch", hint: "Fastest (2 components), but ship max durability −15 permanently.", run: () => { setState({ shipMax: 85 }); setFlag("strategy", "patch"); onDone(); } },
      ]} />
    </Panel>
  );
}

// ---------- C ----------
function Retrieve({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const keys = useControls();
  const need = { salvage: 4, fabricate: 3, patch: 2 }[getState().flags.strategy as string] ?? 3;
  const [hud, setHud] = useState({ got: 0, carry: 0, tether: true });
  const [won, setWon] = useState(false);
  const trust = useGame((s) => s.pip.trust);
  const pipReq = useRef(false);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!; const W = 480, H = 320; c.width = W; c.height = H;
    const ship = { x: 40, y: H / 2 };
    const anchors = [{ x: 60, y: H / 2 }, { x: 200, y: 80 }, { x: 220, y: 250 }, { x: 360, y: 160 }];
    const parts = Array.from({ length: need }, (_, i) => ({ x: 280 + (i % 2) * 140 * Math.random() + 20, y: 40 + ((i * 97) % 240), got: false, wrong: false }));
    const decoys = Array.from({ length: 3 }, (_, i) => ({ x: 250 + i * 70, y: 60 + ((i * 131) % 200), got: false, wrong: true }));
    const junk = Array.from({ length: 6 }, (_, i) => ({ x: 130 + i * 55, y: (i * 73) % H, vx: (i % 2 ? 1 : -1) * 18, vy: 22 + i * 4 }));
    const p = { x: 70, y: H / 2, vx: 0, vy: 0, anchor: 0, carry: 0, got: 0, inv: 0 };
    let raf = 0, last = performance.now(), t = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now; raf = requestAnimationFrame(loop);
      if (getState().modal) return;
      t += dt; p.inv -= dt;
      const a = 160;
      if (keys.current.left) p.vx -= a * dt; if (keys.current.right) p.vx += a * dt;
      if (keys.current.up) p.vy -= a * dt; if (keys.current.down) p.vy += a * dt;
      p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
      if (keys.current.left || keys.current.right || keys.current.up || keys.current.down) change({ battery: -0.02 });
      // tether
      const an = anchors[p.anchor];
      if (Math.hypot(p.x - an.x, p.y - an.y) > 170 || p.x < 0 || p.y < 0 || p.x > W || p.y > H) {
        p.x = an.x + 10; p.y = an.y; p.vx = p.vy = 0; change({ o2: -4 }); sfx.bad(); toast("Tether snapped taut! Reeled back to anchor (−4 O₂). Clip a nearer anchor with INTERACT.", "warn");
      }
      if (keys.current.use) {
        keys.current.use = false;
        const near = anchors.findIndex((q) => Math.hypot(q.x - p.x, q.y - p.y) < 28);
        if (near >= 0) { p.anchor = near; sfx.beep(); toast("Tether clipped ⚓", "good"); }
        for (const q of [...parts, ...decoys]) if (!q.got && Math.hypot(q.x - p.x, q.y - p.y) < 22) {
          if (q.wrong) { toast("Wrong part — that's a heat sink, not a wing component.", "warn"); sfx.bad(); q.got = true; }
          else { q.got = true; p.carry++; sfx.pickup(); }
        }
      }
      if (pipReq.current) {
        pipReq.current = false; const q = parts.find((x) => !x.got);
        if (q) { q.got = true; p.carry++; pipChange({ bat: -10 }); sfx.pickup(); toast("Pip zipped off and fetched a component!", "good"); }
      }
      if (p.carry && Math.hypot(p.x - ship.x, p.y - ship.y) < 50) { p.got += p.carry; p.carry = 0; sfx.good(); }
      for (const j of junk) {
        j.x += j.vx * dt; j.y += j.vy * dt; if (j.y > H + 10) j.y = -10; if (j.x < 100 || j.x > W) j.vx *= -1;
        if (p.inv <= 0 && Math.hypot(j.x - p.x, j.y - p.y) < 16) { p.inv = 1.2; change({ hp: -6, o2: -3 }); sfx.hit(); p.vx = -p.vx - 30; }
      }
      setHud((h) => (h.got !== p.got || h.carry !== p.carry ? { got: p.got, carry: p.carry, tether: true } : h));
      if (p.got >= need) { cancelAnimationFrame(raf); setWon(true); return; }
      // draw
      ctx.fillStyle = "#060818"; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) { ctx.fillStyle = "#4a5a90"; ctx.fillRect((i * 97) % W, (i * 53) % H, 1, 1); }
      drawSprite(ctx, SHIP, ship.x - 30, ship.y - 20, 5);
      ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.beginPath(); ctx.arc(an.x, an.y, 170, 0, 7); ctx.stroke();
      for (const [i, q] of anchors.entries()) { ctx.fillStyle = i === p.anchor ? "#7cf7c9" : "#ffd23f"; ctx.fillRect(q.x - 5, q.y - 5, 10, 10); }
      ctx.strokeStyle = "#ffd23f"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(an.x, an.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.setLineDash([]);
      const glow = trust >= 45;
      for (const q of parts) if (!q.got) { ctx.fillStyle = Math.sin(t * 6) > 0 ? "#38d9f0" : "#eef6ff"; ctx.fillRect(q.x - 6, q.y - 6, 12, 12); if (glow) { ctx.strokeStyle = "rgba(56,217,240,.5)"; ctx.strokeRect(q.x - 12, q.y - 12, 24, 24); } }
      for (const q of decoys) if (!q.got) { ctx.fillStyle = "#9fb3c8"; ctx.fillRect(q.x - 6, q.y - 6, 12, 12); }
      for (const j of junk) { ctx.fillStyle = "#ff4d5e"; ctx.beginPath(); ctx.moveTo(j.x, j.y - 10); ctx.lineTo(j.x + 9, j.y + 7); ctx.lineTo(j.x - 9, j.y + 7); ctx.fill(); }
      if (p.inv <= 0 || Math.floor(t * 10) % 2) drawSprite(ctx, NOVA, p.x - 8, p.y - 10, 2);
      drawSprite(ctx, PIP, p.x + 10 + Math.sin(t * 2) * 4, p.y - 18, 1.5 as any);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  if (won) return <Panel title="COMPONENTS SECURED"><Result text="All components are clamped to the wing. Time to rebuild." onNext={onDone} /></Panel>;
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-1 p-1">
      <div className="pixel-panel p-2 text-lg leading-tight">STAGE C — Grab the <span className="text-primary">glowing blue</span> components (not grey), avoid <span className="text-destructive">red shards</span>, bring them back to the ship. Stay within your tether ⚓ — clip nearer anchors with INTERACT. Delivered {hud.got}/{need} · carrying {hud.carry}</div>
      <canvas ref={ref} className="w-full border-4 border-border" style={{ aspectRatio: "480/320" }} />
      <div className="grid grid-cols-3 gap-1">
        <div /><HoldButton k="up" keys={keys} className="h-12">▲</HoldButton><div />
        <HoldButton k="left" keys={keys} className="h-12">◀</HoldButton>
        <button className="pixel-btn pixel-btn-accent h-12" onClick={() => (keys.current.use = true)}>INTERACT</button>
        <HoldButton k="right" keys={keys} className="h-12">▶</HoldButton>
        <button className="pixel-btn h-12" disabled={trust < 40} onClick={() => (pipReq.current = true)}>🦊 FETCH</button>
        <HoldButton k="down" keys={keys} className="h-12">▼</HoldButton><div className="self-center text-center text-sm text-muted-foreground">E = interact</div>
      </div>
    </div>
  );
}

// ---------- D ----------
const STEPS = [
  { part: "frame", label: "Align the wing frame", rot: true },
  { part: "plate", label: "Insert the stabilizer plate", rot: true },
  { part: "wiring", label: "Connect the electrical wiring" },
  { part: "bolts", label: "Secure the bolts in order" },
  { part: "shield", label: "Install the thermal shield" },
  { part: "sealant", label: "Apply repair sealant" },
  { part: "diag", label: "Run diagnostic calibration" },
];
const PARTS: Record<string, string> = { frame: "🦴 Wing frame", plate: "🛡 Stabilizer plate", conn: "🔌 Power connector", wiring: "〰 Wiring", bolts: "🔩 Fastening bolts", shield: "🔥 Thermal shield", sealant: "🧴 Sealant" };
function Build({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [rots, setRots] = useState<Record<string, number>>({ frame: 90, plate: 270 });
  const [zoom, setZoom] = useState(false);
  const [sub, setSub] = useState<null | "wires" | "bolts">(null);
  const [wires, setWires] = useState<Record<string, string>>({});
  const [bolts, setBolts] = useState<number[]>([]);
  const cur = STEPS[step];
  const place = (part: string) => {
    if (!cur) return;
    if (part !== cur.part && !(cur.part === "wiring" && part === "conn")) { sfx.bad(); change({ battery: -1 }); return toast(`Hint: the guide says “${cur.label}”. That's not the ${PARTS[part]?.slice(2)} step.`, "warn"); }
    if (cur.rot && (rots[part] ?? 0) % 360 !== 0) { sfx.bad(); return toast(`Misaligned! Rotate the ${PARTS[part].slice(2)} to 0° first (blueprint shows ▲).`, "warn"); }
    if (part === "wiring" || part === "conn") return setSub("wires");
    if (part === "bolts") return setSub("bolts");
    sfx.good(); setStep(step + 1); setSel(null);
  };
  if (step >= STEPS.length - 1) return (
    <Panel title="STAGE D — ASSEMBLY COMPLETE"><Result text="Every component sits snug in the blueprint. Holo-guide: proceed to calibration." onNext={onDone} label="RUN DIAGNOSTIC CALIBRATION" /></Panel>
  );
  return (
    <Panel title="STAGE D — REBUILD THE WING">
      <div className="text-lg">Holo-guide step {step + 1}/7: <span className="text-accent">{cur.label}</span></div>
      <div className={`relative mt-2 overflow-hidden border-4 border-primary/60 bg-background transition-all ${zoom ? "h-64" : "h-36"}`}
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => place(e.dataTransfer.getData("p"))} onClick={() => sel && place(sel)}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)", backgroundSize: zoom ? "32px 32px" : "16px 16px" }} />
        <div className="absolute inset-0 flex flex-wrap content-center items-center justify-center gap-2 p-2">
          {STEPS.slice(0, -1).map((s, i) => (
            <div key={s.part} className={`flex h-12 min-w-20 items-center justify-center border-2 border-dashed px-1 text-center text-sm leading-none ${i < step ? "border-success bg-success/30" : i === step ? "border-accent bg-accent/20 animate-blink" : "border-border"}`}>
              {i < step ? PARTS[s.part] : i === step ? "DROP HERE" : `slot ${i + 1}`}{s.rot && i >= step && <div className="ml-1">▲</div>}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1 text-base text-muted-foreground">Drag a part onto the blueprint, or tap a part then tap the blueprint.</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.entries(PARTS).map(([id, name]) => (
          <div key={id} draggable onDragStart={(e) => e.dataTransfer.setData("p", id)} onClick={() => { sfx.click(); setSel(id); }}
            className={`pixel-btn flex items-center justify-between gap-1 px-2 ${sel === id ? "border-accent bg-accent/30" : ""}`}>
            <span style={{ transform: `rotate(${rots[id] ?? 0}deg)` }} className="inline-block">{name.slice(0, 2)}</span>
            <span className="flex-1 truncate">{name.slice(2)}</span>
            {(id === "frame" || id === "plate") && <button className="border border-border px-1" onClick={(e) => { e.stopPropagation(); sfx.click(); setRots((r) => ({ ...r, [id]: ((r[id] ?? 0) + 90) % 360 })); }}>↻</button>}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <button className="pixel-btn" onClick={() => setZoom(!zoom)}>{zoom ? "🔍−" : "🔍+"} ZOOM</button>
        <button className="pixel-btn" onClick={() => toast(DAMAGE.map((d) => d.info).filter((x) => /wire|bolt/i.test(x)).join(" "), "info")}>📋 CLUES</button>
        <button className="pixel-btn" onClick={() => { pipChange({ bat: -2 }); sfx.beep(); toast(`Pip: Use the ${PARTS[cur.part === "wiring" ? "wiring" : cur.part]?.slice(2)}${cur.rot ? `, rotated to 0° (now ${rots[cur.part]}°)` : ""}!`, "info"); }}>🦊 HINT</button>
      </div>
      {sub === "wires" && (
        <Modal title="CONNECT THE WIRING" onClose={() => setSub(null)}>
          <p className="text-lg">Match each wire to its terminal (clue from diagnosis).</p>
          {["RED", "BLUE", "YELLOW"].map((w) => (
            <div key={w} className="mt-2 flex items-center gap-2"><span className="w-20 font-pixel text-[9px]">{w}</span>
              {["POWER", "SENSOR", "GROUND"].map((t) => <button key={t} className={`pixel-btn flex-1 px-1 ${wires[w] === t ? "pixel-btn-primary" : ""}`} onClick={() => setWires({ ...wires, [w]: t })}>{t}</button>)}
            </div>
          ))}
          <button className="pixel-btn pixel-btn-accent mt-3 w-full" onClick={() => {
            if (wires.RED === "POWER" && wires.BLUE === "SENSOR" && wires.YELLOW === "GROUND") { sfx.good(); setSub(null); setStep(step + 1); }
            else { sfx.bad(); change({ battery: -5, hp: -3 }); toast("ZAP! Short circuit (−5⚡ −3❤). Rework the wiring.", "bad"); setWires({}); }
          }}>⚡ POWER UP</button>
        </Modal>
      )}
      {sub === "bolts" && (
        <Modal title="SECURE THE BOLTS" onClose={() => setSub(null)}>
          <p className="text-lg">Tighten the 4 bolts in the correct order. Sequence: {bolts.join(" → ") || "—"}</p>
          <div className="mx-auto mt-2 grid w-48 grid-cols-2 gap-6 border-4 border-border p-4">
            {[1, 2, 3, 4].map((b) => <button key={b} className={`pixel-btn aspect-square text-xl ${bolts.includes(b) ? "pixel-btn-primary" : ""}`} onClick={() => {
              const nb = [...bolts, b]; setBolts(nb); sfx.click();
              const ORDER = [1, 3, 2, 4];
              if (nb[nb.length - 1] !== ORDER[nb.length - 1]) { sfx.bad(); toast("The panel warps! Loosen and retry — remember the star pattern.", "warn"); change({ food: -1 }); setBolts([]); }
              else if (nb.length === 4) { sfx.good(); setSub(null); setStep(step + 1); }
            }}>{b}</button>)}
          </div>
        </Modal>
      )}
    </Panel>
  );
}

// ---------- E ----------
function Calib({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0); const [scores, setScores] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const targets = useRef([[30, 45], [60, 72], [15, 25]]);
  const [phase, setPhase] = useState<"sliders" | "wind" | "route" | "done">("sliders");
  const [sw, setSw] = useState([false, false, false, false]);
  useEffect(() => {
    if (phase !== "sliders") return;
    let raf = 0; const t0 = performance.now();
    const loop = (n: number) => { setPos(50 + 50 * Math.sin(((n - t0) / 1000) * (1.6 + i * 0.5))); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [i, phase]);
  const lock = () => {
    const [a, b] = targets.current[i]; const mid = (a + b) / 2;
    const s = pos >= a && pos <= b ? 2 : Math.abs(pos - mid) < 18 ? 1 : 0;
    sfx[s === 2 ? "good" : s ? "beep" : "bad"](); const ns = [...scores, s]; setScores(ns);
    if (i < 2) setI(i + 1); else setPhase("wind");
  };
  useEffect(() => { if (phase === "wind") { const t = setTimeout(() => setPhase("route"), 3500); return () => clearTimeout(t); } }, [phase]);
  const TARGET = [true, false, true, true];
  const total = scores.reduce((a, b) => a + b, 0);
  return (
    <Panel title="STAGE E — CALIBRATE THE WING">
      {phase === "sliders" && <>
        <p className="text-lg">Press LOCK when the needle is inside the green target. Slider {i + 1}/3</p>
        {[0, 1, 2].map((k) => (
          <div key={k} className="relative mt-3 h-6 border-2 border-border bg-background">
            <div className="absolute inset-y-0 bg-success/50" style={{ left: `${targets.current[k][0]}%`, width: `${targets.current[k][1] - targets.current[k][0]}%` }} />
            <div className="absolute inset-y-0 w-1.5 bg-accent" style={{ left: `${k === i ? pos : k < i ? 50 : 0}%` }} />
            {k < i && <span className="absolute -right-1 -top-6 text-lg">{["✖", "~", "✔"][scores[k]]}</span>}
          </div>
        ))}
        <button className="pixel-btn pixel-btn-accent mt-4 h-14 w-full" onPointerDown={lock}>🔒 LOCK</button>
      </>}
      {phase === "wind" && <div className="space-y-2"><p className="text-lg">Simulated wind test… flaps cycling.</p><div className="flex h-28 items-center justify-center overflow-hidden border-4 border-border"><div className="animate-shake"><Sprite rows={SHIP} scale={8} /></div></div><div className="text-success">≋≋≋ ≋≋ ≋≋≋≋ ≋</div></div>}
      {phase === "route" && <>
        <p className="text-lg">Power-routing: match the switches to the blueprint pattern ▮▯▮▮.</p>
        <div className="mt-2 grid grid-cols-4 gap-2">{sw.map((v, k) => <button key={k} className={`pixel-btn h-16 ${v ? "pixel-btn-primary" : ""}`} onClick={() => { sfx.click(); setSw(sw.map((x, j) => (j === k ? !x : x))); }}>{v ? "ON" : "OFF"}</button>)}</div>
        <button className="pixel-btn pixel-btn-accent mt-3 w-full" onClick={() => {
          if (sw.some((v, k) => v !== TARGET[k])) { sfx.bad(); change({ battery: -3 }); return toast("Routing fault (−3⚡). Check the pattern.", "bad"); }
          const q = total >= 5 ? "perfect" : total >= 3 ? "good" : "emergency";
          setFlag("repairQ", q);
          const max = getState().shipMax;
          setState({ ship: q === "perfect" ? max : q === "good" ? Math.round(max * 0.85) : Math.round(max * 0.65) });
          if (q === "emergency") toast("Emergency-grade repair: higher fuel use later.", "warn");
          setPhase("done"); sfx.good();
        }}>RUN TEST</button>
      </>}
      {phase === "done" && <Result text={`Repair quality: ${String(getState().flags.repairQ).toUpperCase()}. ${getState().flags.repairQ === "perfect" ? "Maximum integrity and improved handling!" : getState().flags.repairQ === "good" ? "Normal ship performance." : "Lower durability, but it will hold."}`} onNext={onDone} />}
    </Panel>
  );
}

// ---------- F ----------
function Flare({ onDone }: { onDone: () => void }) {
  const [res, setRes] = useState<string | null>(null);
  const pip = useGame((s) => s.pip);
  return (
    <div className="relative h-full"><div className="pointer-events-none absolute inset-0 bg-accent/30 animate-alarm" />
      <Panel title="☀ STAGE F — SOLAR FLARE!">
        {res ? <Result text={res} onNext={onDone} /> : (
          <Choice prompt="A solar flare erupts! Radiation will hit in seconds. What do you do?" options={[
            { label: "Return to the airlock", hint: "Safe for you, but costs oxygen sprinting back; unsealed repair loses quality.", run: () => { change({ o2: -15, food: -4 }); if (getState().flags.repairQ === "perfect") setFlag("repairQ", "good"); setRes("You dive into the airlock as the light crashes over the hull. Safe — but the sealant cured unevenly."); } },
            { label: "Anchor and shield behind the wing", hint: "Keeps the repair intact, but some radiation damage.", run: () => { change({ hp: -18, battery: -8 }); setRes("You clamp to the hull and press behind the new wing. Your suit sizzles (−18❤), but the repair holds perfectly."); } },
            { label: "Ask Pip to activate a protective field", hint: pip.bat >= 30 && pip.trust >= 45 ? "Pip has enough energy & trust." : "Needs Pip battery 30+ and trust 45+.", disabled: !(pip.bat >= 30 && pip.trust >= 45), run: () => { pipChange({ bat: -30, trust: 8, happy: 5 }); setRes("Pip unfolds a shimmering shield. The flare washes over you harmlessly. Pip looks very proud. (Trust +8)"); } },
          ]} />
        )}
      </Panel>
    </div>
  );
}
