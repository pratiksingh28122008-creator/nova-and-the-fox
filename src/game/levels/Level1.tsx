import { useEffect, useMemo, useRef, useState } from "react";
import { useGame, setFlag, getState, change, pipChange, addItem, toast, setObjective, checkpoint, setState } from "../store";
import { Dialogue, Modal, Sprite, Stars, Choice, Result } from "../ui";
import { NOVA, PIP, SHIP } from "../sprites";
import { sfx } from "../audio";

type Act = "farm" | "power" | "radio" | "supplies" | "pip";
const ROOMS: { id: Act | "obs"; name: string; room: string; icon: string }[] = [
  { id: "radio", name: "Communication Station", room: "Contact home", icon: "📡" },
  { id: "farm", name: "Hydroponic Lab", room: "Build a farm", icon: "🌿" },
  { id: "power", name: "Engineering", room: "Repair power", icon: "⚙" },
  { id: "supplies", name: "Storage Room", room: "Search supplies", icon: "📦" },
  { id: "pip", name: "Cockpit", room: "Care for Pip", icon: "🦊" },
  { id: "obs", name: "Observation Window", room: "Look outside", icon: "🔭" },
];

export default function Level1() {
  const stage = useGame((s) => s.flags.L1stage ?? "intro");
  const done = useGame((s) => (s.flags.l1 ?? {}) as Record<string, boolean>);
  const [open, setOpen] = useState<string | null>(null);
  const count = Object.values(done).filter(Boolean).length;

  useEffect(() => {
    if (stage === "ship") setObjective(count >= 4 ? "Check the navigation screen in the Cockpit." : `Stabilize the ship: complete 4 activities (${count}/4).`);
  }, [stage, count]);

  if (stage === "intro")
    return (
      <Dialogue
        lines={[
          { who: "NARRATOR", text: "Deep space. A cosmic storm tore through the research vessel KESTREL. Its lights flicker. Its engines are silent." },
          { who: "NOVA", text: "Hello? Control, do you read me?" },
          { who: "RADIO", text: "Signal unavailable." },
          { who: "NOVA", text: "Navigation is gone. Fuel is nearly depleted. I have no idea where I am." },
          { who: "PIP", text: "Beep... survival protocol activated!" },
        ]}
        onDone={() => { setFlag("L1stage", "ship"); checkpoint(1); }}
      >
        <Stars speed={0.15} />
        <div className="absolute inset-0 flex items-center justify-center pb-40">
          <div className="animate-shake" style={{ animationDuration: "3s" }}>
            <div style={{ transform: "rotate(-18deg)" }}><Sprite rows={SHIP} scale={10} /></div>
          </div>
        </div>
        <div className="absolute inset-0 bg-destructive/20 animate-alarm" />
      </Dialogue>
    );

  if (stage === "outro")
    return (
      <Dialogue
        lines={[
          { who: "NARRATOR", text: "A coordinate blinks on the navigation screen. A strange repeating signal… from an unknown planet." },
          { who: "NOVA", text: "That signal isn't from Aurelia... but it might be my only chance." },
          { who: "PIP", text: "Unknown destination detected. Survival probability uncertain." },
        ]}
        onDone={() => { setState({ level: 2 }); checkpoint(2); }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-background pb-40">
          <div className="pixel-panel scanlines relative h-48 w-72 overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="absolute left-[70%] top-[30%] h-3 w-3 bg-success animate-blink" />
            <div className="absolute bottom-2 left-2 font-pixel text-[8px] text-success">SIGNAL ▲ 47.2 / −12.9</div>
          </div>
        </div>
      </Dialogue>
    );

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-60"><Stars speed={0.05} /></div>
      <div className="relative z-10 mx-auto max-w-4xl p-2 sm:p-4">
        <div className="mb-2 flex items-center gap-3">
          <Sprite rows={NOVA} scale={4} /><div className="animate-floaty"><Sprite rows={PIP} scale={3} /></div>
          <p className="text-lg leading-tight">The KESTREL drifts. Explore the rooms. Complete at least <b className="text-accent">4 activities</b> to stabilize the ship.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ROOMS.map((r) => (
            <button key={r.id} className={`pixel-panel group relative h-28 p-2 text-left transition hover:border-primary sm:h-36 ${done[r.id] ? "border-success" : ""}`} onClick={() => { sfx.click(); setOpen(r.id); }}>
              <div className="text-3xl transition group-hover:scale-110 sm:text-4xl">{r.icon}</div>
              <div className="mt-1 font-pixel text-[8px] leading-snug text-primary sm:text-[9px]">{r.name}</div>
              <div className="text-base text-muted-foreground">{done[r.id] ? "✔ Done" : r.room}</div>
              {!done[r.id] && r.id !== "obs" && <span className="absolute right-2 top-2 h-2 w-2 bg-accent animate-blink" />}
            </button>
          ))}
        </div>
        <button className="pixel-btn pixel-btn-accent mt-3 w-full" disabled={count < 4} onClick={() => { sfx.alarm(); setFlag("L1stage", "outro"); }}>
          {count < 4 ? `🔒 NAVIGATION OFFLINE (${count}/4)` : "📍 A SIGNAL IS BLINKING ON THE NAV SCREEN"}
        </button>
      </div>
      {open === "farm" && <Farm close={() => setOpen(null)} />}
      {open === "power" && <Power close={() => setOpen(null)} />}
      {open === "radio" && <Radio close={() => setOpen(null)} />}
      {open === "supplies" && <Supplies close={() => setOpen(null)} />}
      {open === "pip" && <PipGame close={() => setOpen(null)} />}
      {open === "obs" && (
        <Modal title="OBSERVATION WINDOW" onClose={() => setOpen(null)}>
          <div className="relative h-48 overflow-hidden border-4 border-border"><Stars speed={0.4} meteors /></div>
          <p className="mt-2 text-lg">Endless stars. Somewhere out there is Aurelia. Pip presses its nose to the glass. (+5 Pip happiness)</p>
          <button className="pixel-btn mt-2 w-full" onClick={() => { if (!getState().flags.obsSeen) { setFlag("obsSeen", true); pipChange({ happy: 5 }); } setOpen(null); }}>CLOSE</button>
        </Modal>
      )}
    </div>
  );
}

const finish = (id: Act) => { setFlag("l1", { ...(getState().flags.l1 ?? {}), [id]: true }); sfx.good(); };

// ---------- A: FARM ----------
const CROPS = {
  algae: { name: "Fast-growing Algae", desc: "Food quickly, drains suit/ship power.", speed: 2, water: [30, 70], light: [60, 95], yield: 3, cost: { battery: -10 } },
  veg: { name: "Hydroponic Vegetables", desc: "Very nutritious, grows slowly.", speed: 0.9, water: [45, 75], light: [45, 75], yield: 5, cost: {} },
  mush: { name: "Emergency Mushrooms", desc: "Grows in darkness, drinks water.", speed: 1.4, water: [60, 95], light: [0, 30], yield: 4, cost: { water: -12 } },
} as const;
const STAGE_ART = ["🫘", "🌱", "🌿", "🪴", "🥬"];
function Farm({ close }: { close: () => void }) {
  const done = useGame((s) => s.flags.l1?.farm);
  const [crop, setCrop] = useState<keyof typeof CROPS | null>(null);
  const [water, setWater] = useState(50); const [light, setLight] = useState(50);
  const [g, setG] = useState(0);
  const c = crop ? CROPS[crop] : null;
  const okW = c ? water >= c.water[0] && water <= c.water[1] : false;
  const okL = c ? light >= c.light[0] && light <= c.light[1] : false;
  useEffect(() => {
    if (!c || g >= 100) return;
    const t = setInterval(() => setG((v) => Math.min(100, v + (okW && okL ? c.speed * 2.2 : okW || okL ? c.speed * 0.6 : 0))), 250);
    return () => clearInterval(t);
  }, [c, okW, okL, g]);
  const art = crop === "mush" ? ["🫘", "·", "🍄", "🍄", "🍄"] : crop === "algae" ? ["🫘", "💧", "🟩", "🟢", "🟢"] : STAGE_ART;
  if (done) return <Modal title="HYDROPONIC LAB" onClose={close}><p className="text-xl">Your {CROPS[getState().flags.crop as keyof typeof CROPS]?.name ?? "farm"} hums quietly, feeding you a little over time.</p></Modal>;
  return (
    <Modal title="HYDROPONIC LAB — MINI FARM" onClose={close}>
      {!crop ? (
        <Choice prompt="Choose what to cultivate. This choice persists for the whole journey." options={(Object.keys(CROPS) as (keyof typeof CROPS)[]).map((k) => ({
          label: CROPS[k].name, hint: CROPS[k].desc, run: () => { setCrop(k); change(CROPS[k].cost); setFlag("crop", k); sfx.pickup(); toast("Seeds planted 🌱"); },
        }))} />
      ) : (
        <div className="space-y-3">
          <div className="flex h-36 items-end justify-around border-4 border-border bg-muted p-2" style={{ filter: `brightness(${0.5 + light / 120})` }}>
            {[0, 1, 2, 3, 4].map((i) => <span key={g >= 100 ? i + "d" : Math.floor(g / 25) + "-" + i} className="animate-grow text-4xl">{art[Math.min(4, Math.floor(g / 25))]}</span>)}
          </div>
          <div className="h-3 border border-border bg-background"><div className="h-full bg-food transition-all" style={{ width: `${g}%` }} /></div>
          <label className="block text-lg">💧 Water {water}% {okW ? "✔" : <span className="text-accent">(ideal {c!.water.join("–")})</span>}
            <input type="range" className="w-full accent-primary" value={water} onChange={(e) => setWater(+e.target.value)} /></label>
          <label className="block text-lg">💡 Light {light}% {okL ? "✔" : <span className="text-accent">(ideal {c!.light.join("–")})</span>}
            <input type="range" className="w-full accent-primary" value={light} onChange={(e) => setLight(+e.target.value)} /></label>
          <button className="pixel-btn pixel-btn-primary w-full" disabled={g < 100} onClick={() => {
            addItem("food", c!.yield); if (crop === "veg") change({ hp: 10 }); setFlag("farmBonus", c!.yield); finish("farm"); toast(`Harvested ${c!.yield} food packs!`, "good"); close();
          }}>{g < 100 ? `GROWING… ${Math.floor(g)}%` : "🌾 HARVEST"}</button>
        </div>
      )}
    </Modal>
  );
}

// ---------- B: POWER ----------
const PATH = [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [1, 2], [1, 3], [2, 3], [3, 3]];
const rot = (m: number) => ((m << 1) | (m >> 3)) & 15;
function buildGrid() {
  const g: number[][] = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  PATH.forEach(([r, c], i) => {
    const conn = (pr: number, pc: number) => (pr < r ? 1 : pr > r ? 4 : pc > c ? 2 : 8);
    if (i === 0) g[r][c] |= 8; else g[r][c] |= conn(PATH[i - 1][0], PATH[i - 1][1]);
    if (i === PATH.length - 1) g[r][c] |= 2; else g[r][c] |= conn(PATH[i + 1][0], PATH[i + 1][1]);
  });
  const shapes = [5, 3, 7];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if (!g[r][c]) g[r][c] = shapes[(r * 3 + c) % 3];
    const k = 1 + ((r * 7 + c * 5) % 3); for (let i = 0; i < k; i++) g[r][c] = rot(g[r][c]);
  }
  return g;
}
function powered(g: number[][]) {
  const seen = new Set<string>(); const q: [number, number][] = [];
  if (g[0][0] & 8) { q.push([0, 0]); seen.add("0,0"); }
  const D: [number, number, number, number][] = [[-1, 0, 1, 4], [0, 1, 2, 8], [1, 0, 4, 1], [0, -1, 8, 2]];
  while (q.length) {
    const [r, c] = q.shift()!;
    for (const [dr, dc, b, ob] of D) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr > 3 || nc > 3 || !(g[r][c] & b) || !(g[nr][nc] & ob) || seen.has(`${nr},${nc}`)) continue;
      seen.add(`${nr},${nc}`); q.push([nr, nc]);
    }
  }
  return { seen, ok: seen.has("3,3") && !!(g[3][3] & 2) };
}
function Tile({ m, on }: { m: number; on: boolean }) {
  const col = on ? "bg-energy" : "bg-muted-foreground/50";
  return (
    <div className="relative h-full w-full bg-background">
      <div className={`absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 ${col}`} />
      {m & 1 ? <div className={`absolute left-1/2 top-0 h-1/2 w-3 -translate-x-1/2 ${col}`} /> : null}
      {m & 4 ? <div className={`absolute bottom-0 left-1/2 h-1/2 w-3 -translate-x-1/2 ${col}`} /> : null}
      {m & 2 ? <div className={`absolute right-0 top-1/2 h-3 w-1/2 -translate-y-1/2 ${col}`} /> : null}
      {m & 8 ? <div className={`absolute left-0 top-1/2 h-3 w-1/2 -translate-y-1/2 ${col}`} /> : null}
    </div>
  );
}
function Power({ close }: { close: () => void }) {
  const done = useGame((s) => s.flags.l1?.power);
  const [mode, setMode] = useState<string | null>(null);
  const [g, setG] = useState(buildGrid);
  const [lit, setLit] = useState(false);
  const p = useMemo(() => powered(g), [g]);
  if (done) return <Modal title="ENGINEERING" onClose={close}><p className="text-xl">Power is stable. Mode: {getState().flags.power}.</p></Modal>;
  if (lit) return <Modal title="SYSTEMS ONLINE"><div className="h-24 bg-energy/30 animate-alarm" /><Result text="Lights flood the corridors. Fans whir. Life support restarts!" onNext={close} /></Modal>;
  return (
    <Modal title="ENGINEERING — POWER GRID" onClose={close}>
      {!mode ? (
        <Choice prompt="Choose how to restore power:" options={[
          { label: "Repair the solar collectors", hint: "Reliable long-term energy. Costs 1 repair part.", run: () => setMode("solar") },
          { label: "Activate the emergency reactor", hint: "Immediate power (+30 battery) but overheating risk (hull −8).", run: () => setMode("reactor") },
          { label: "Disable nonessential systems", hint: "Conserves power, but less comfort and weaker farming.", run: () => setMode("disable") },
        ]} />
      ) : (
        <div>
          <p className="text-lg">Tap tiles to rotate. Route power from ⚡ (top-left) to 🔌 (bottom-right).</p>
          <div className="mx-auto mt-2 flex max-w-xs items-stretch gap-1">
            <div className="flex items-start pt-4 text-xl">⚡</div>
            <div className="grid flex-1 grid-cols-4 gap-1 border-4 border-border bg-border">
              {g.map((row, r) => row.map((m, c) => (
                <button key={`${r}${c}`} className="aspect-square" onClick={() => { sfx.click(); setG((o) => o.map((rr, i) => rr.map((v, j) => (i === r && j === c ? rot(v) : v)))); }}>
                  <Tile m={m} on={p.seen.has(`${r},${c}`)} />
                </button>
              )))}
            </div>
            <div className="flex items-end pb-4 text-xl">🔌</div>
          </div>
          <button className="pixel-btn pixel-btn-primary mt-3 w-full" onClick={() => {
            if (!p.ok) { change({ battery: -3 }); sfx.bad(); return toast("Circuit failed: −3 battery. Try again.", "bad"); }
            setFlag("power", mode);
            if (mode === "solar") { addItem("parts", -0); change({ battery: 15 }); }
            if (mode === "reactor") change({ battery: 30, ship: -8, fuel: 5 });
            if (mode === "disable") change({ battery: 10, food: -5 });
            finish("power"); setLit(true);
          }}>⚡ TEST CIRCUIT</button>
        </div>
      )}
    </Modal>
  );
}

// ---------- C: RADIO ----------
function Radio({ close }: { close: () => void }) {
  const done = useGame((s) => s.flags.l1?.radio);
  const target = useRef({ f: 30 + Math.floor(Math.random() * 50), a: 20 + Math.floor(Math.random() * 60), g: 55 + Math.floor(Math.random() * 30) });
  const [f, setF] = useState(10); const [a, setA] = useState(90); const [gain, setGain] = useState(30);
  const [res, setRes] = useState<string | null>(null);
  const t = target.current;
  const q = Math.max(0, 1 - (Math.abs(f - t.f) / 40 + Math.abs(a - t.a) / 60 + Math.abs(gain - t.g) / 50) / 1.4);
  const wave = useMemo(() => Array.from({ length: 40 }, (_, i) => Math.sin(i * 0.6) * q * 20 + (Math.random() - 0.5) * (1 - q) * 30), [q]);
  if (done) return <Modal title="COMM STATION" onClose={close}><p className="text-xl">Log: signal quality “{getState().flags.signal}”. The strange pattern loops: ▲ ◆ ● ◆ ▲.</p></Modal>;
  if (res) return <Modal title="TRANSMISSION"><Result text={res} onNext={close} /></Modal>;
  return (
    <Modal title="COMM STATION — TUNE SIGNAL" onClose={close}>
      <svg viewBox="0 0 400 60" className="w-full border-4 border-border bg-background">
        <polyline fill="none" stroke="currentColor" className="text-success" strokeWidth="3" points={wave.map((y, i) => `${i * 10},${30 + y}`).join(" ")} />
      </svg>
      <div className="mt-1 text-lg">Signal lock: <span className={q > 0.85 ? "text-success" : q > 0.55 ? "text-accent" : "text-destructive"}>{Math.round(q * 100)}%</span></div>
      <label className="block text-lg">📻 Frequency {f}.0 MHz<input type="range" className="w-full accent-primary" value={f} onChange={(e) => setF(+e.target.value)} /></label>
      <label className="block text-lg">📶 Signal strength {gain}<input type="range" className="w-full accent-primary" value={gain} onChange={(e) => setGain(+e.target.value)} /></label>
      <label className="block text-lg">🧭 Antenna angle {a}°<input type="range" max={120} className="w-full accent-primary" value={a} onChange={(e) => setA(+e.target.value)} /></label>
      <button className="pixel-btn pixel-btn-primary mt-2 w-full" onClick={() => {
        finish("radio");
        if (q > 0.85) { setFlag("signal", "strong"); pipChange({ trust: 5 }); change({ battery: -4 }); setRes("…Aurelia Control… Nova… we're searching… hold on…  Fragments of HOME! Hope surges. (+morale, Pip trust +5) Beneath it, a strange alien pattern loops: ▲ ◆ ● ◆ ▲."); }
        else if (q > 0.55) { setFlag("signal", "partial"); change({ battery: -12, fuel: 8 }); setRes("A partial signal: a navigation coordinate! (+8 fuel efficiency, −12 battery). A strange alien pattern also loops: ▲ ◆ ● ◆ ▲."); }
        else { setFlag("signal", "alien"); change({ battery: -2 }); setRes("Only static… then an UNIDENTIFIED transmission. Not human. A pattern: ▲ ◆ ● ◆ ▲. You record it — it will help track the signal source."); }
      }}>🔒 LOCK SIGNAL</button>
    </Modal>
  );
}

// ---------- D: SUPPLIES ----------
const ICONS = ["🍱", "💧", "🔩", "🔋", "🪨", "⚡"];
function Supplies({ close }: { close: () => void }) {
  const done = useGame((s) => s.flags.l1?.supplies);
  const deck = useMemo(() => [...ICONS, ...ICONS].map((v, i) => ({ v, k: i })).sort(() => Math.random() - 0.5), []);
  const [flip, setFlip] = useState<number[]>([]); const [got, setGot] = useState<string[]>([]); const [miss, setMiss] = useState(0);
  const [lockers, setLockers] = useState<(string | null)[]>([null, null, null]);
  const solved = got.length === ICONS.length;
  const click = (i: number) => {
    if (flip.length === 2 || flip.includes(i) || got.includes(deck[i].v)) return;
    sfx.click(); const nf = [...flip, i]; setFlip(nf);
    if (nf.length === 2) setTimeout(() => {
      if (deck[nf[0]].v === deck[nf[1]].v) { setGot((g) => [...g, deck[nf[0]].v]); sfx.pickup(); } else setMiss((m) => m + 1);
      setFlip([]);
    }, 600);
  };
  if (done) return <Modal title="STORAGE" onClose={close}><p className="text-xl">The shelves are bare now.</p></Modal>;
  return (
    <Modal title="STORAGE — EMERGENCY CABINET" onClose={close}>
      <p className="text-lg">Repair lockers (random):</p>
      <div className="grid grid-cols-3 gap-2">
        {lockers.map((l, i) => (
          <button key={i} disabled={!!l} className="pixel-btn h-14" onClick={() => {
            const r = [["water", "💧 Water cartridge!"], [null, "Empty…"], ["parts", "🔩 Repair parts"], [null, "Damaged rations (spoiled)"], ["mineral", "🪨 Mineral"]][Math.floor(Math.random() * 5)] as [string | null, string];
            if (r[0]) addItem(r[0]); toast(r[1], r[0] ? "good" : "warn");
            setLockers((ls) => ls.map((x, j) => (j === i ? r[1] : x)));
          }}>{l ?? "🗄 OPEN"}</button>
        ))}
      </div>
      <p className="mt-3 text-lg">Cabinet lock — match the supply codes ({miss} misses):</p>
      <div className="grid grid-cols-4 gap-2">
        {deck.map((c, i) => {
          const show = flip.includes(i) || got.includes(c.v);
          return <button key={c.k} className={`pixel-btn aspect-square text-2xl ${show ? "bg-primary/30" : ""}`} onClick={() => click(i)}>{show ? c.v : "?"}</button>;
        })}
      </div>
      <button className="pixel-btn pixel-btn-primary mt-3 w-full" disabled={!solved} onClick={() => {
        addItem("food", 2); addItem("water", 2); addItem("parts", 2);
        if (miss <= 6) { addItem("cell", 1); toast("A RARE ENERGY CELL! ⚡", "good"); }
        finish("supplies"); close();
      }}>{solved ? "🔓 OPEN CABINET" : "🔒 LOCKED"}</button>
    </Modal>
  );
}

// ---------- E: PIP ----------
function PipGame({ close }: { close: () => void }) {
  const done = useGame((s) => s.flags.l1?.pip);
  const [round, setRound] = useState(0); const [lit, setLit] = useState(false); const [times, setTimes] = useState<number[]>([]);
  const t0 = useRef(0); const timer = useRef<number>(0);
  const start = () => { setLit(false); timer.current = window.setTimeout(() => { setLit(true); t0.current = performance.now(); sfx.beep(); }, 800 + Math.random() * 1600); };
  useEffect(() => () => clearTimeout(timer.current), []);
  const hit = () => {
    if (!lit) { clearTimeout(timer.current); toast("Too early! Pip tilts its head.", "warn"); start(); return; }
    const t = performance.now() - t0.current; setTimes((x) => [...x, t]); setLit(false); sfx.pickup();
    if (round + 1 < 5) { setRound(round + 1); start(); } else setRound(5);
  };
  const avg = times.length ? times.reduce((a, b) => a + b) / times.length : 0;
  return (
    <Modal title="COCKPIT — PIP" onClose={close}>
      <div className="flex justify-center animate-floaty"><Sprite rows={PIP} scale={10} /></div>
      {done ? <p className="text-xl">Pip is curled up on the console, purring in binary. Use the 🦊 button anytime to feed, recharge or repair Pip.</p> : round === 0 && !times.length && !lit ? (
        <div className="space-y-2">
          <p className="text-xl">Pip wants to play “Catch the Light”: tap the moment Pip's beacon flashes!</p>
          <button className="pixel-btn pixel-btn-primary w-full" onClick={() => { setRound(0); start(); setTimes([]); setRound(0.0001 as any); }}>PLAY</button>
        </div>
      ) : round < 5 ? (
        <button className={`mt-2 h-32 w-full border-4 font-pixel text-xs ${lit ? "border-energy bg-energy text-primary-foreground" : "border-border bg-muted"}`} onPointerDown={hit}>
          {lit ? "TAP NOW!" : `WAIT… (${Math.floor(round) + 1}/5)`}
        </button>
      ) : (
        <Result text={`Average reaction: ${Math.round(avg)} ms. ${avg < 450 ? "Pip is thrilled! Trust +15." : "Pip had fun! Trust +10."} Pip also self-calibrated a loose servo.`} onNext={() => {
          pipChange({ trust: avg < 450 ? 15 : 10, happy: 20, hp: 10 }); finish("pip"); close();
        }} />
      )}
    </Modal>
  );
}
