// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { useGame, setFlag, getState, change, pipChange, addItem, toast, setObjective, checkpoint, setState } from "../store";
import { Dialogue, Modal, Choice, Result, useControls, HoldButton, Sprite, Stars } from "../ui";
import { drawSprite, NOVA, PIP, CRITTER, SHIP } from "../sprites";
import { sfx, setIntensity } from "../audio";

type Opt = { label: string; best?: boolean; out: string; fx?: () => void };
type Spot = { x: number; id: string; title: string; prompt: string; opts: Opt[] };
const wise = () => setFlag("wisdom", (getState().flags.wisdom ?? 0) + 1);

const SPOTS: Spot[] = [
  { x: 520, id: "forestQ", title: "ROUTE A — THE GLOWING FOREST", prompt: "A glowing plant closes when you approach. What should you do?", opts: [
    { label: "Touch it repeatedly.", out: "It snaps shut and sprays a stinging mist! (−8❤)", fx: () => change({ hp: -8 }) },
    { label: "Observe its light pattern with the scanner.", best: true, out: "The light pulses toward a hidden trail. Safe path revealed! You find a supply cache.", fx: () => { addItem("food"); addItem("seed", 2); } },
    { label: "Cut it down.", out: "The whole forest dims defensively. You lose your way for a while. (−6 food, −6 water)", fx: () => change({ food: -6, water: -6 }) },
  ] },
  { x: 820, id: "forestB", title: "ROUTE A — LUMINOUS PLANTS", prompt: "Plants react to your suit light. How do you proceed?", opts: [
    { label: "Follow the brightest plants.", out: "They lead to a pool of nectar. (+15 water) but it's a detour.", fx: () => change({ water: 15, food: -3 }) },
    { label: "Scan the plant patterns with Pip.", best: true, out: "Pip decodes a trail marker — part of the ancient map!", fx: () => { setFlag("map", (getState().flags.map ?? 0) + 1); pipChange({ trust: 3, bat: -5 }); } },
    { label: "Harvest glowing fruit for food.", out: "Delicious! (+2 food) A vine lashes you lightly (−4❤).", fx: () => { addItem("food", 2); change({ hp: -4 }); } },
  ] },
  { x: 1150, id: "creature", title: "MOVEMENT IN THE FLOWERS", prompt: "Pip detects movement behind a group of alien flowers. What do you do?", opts: [
    { label: "Scan from a safe distance.", best: true, out: "Harmless 'glimmerhoppers'. Now you know they only nip when startled.", fx: () => setFlag("critterSafe", true) },
    { label: "Run into the flowers.", out: "Startled critters nip you! (−10❤)", fx: () => change({ hp: -10 }) },
    { label: "Waste a battery charge shooting randomly.", out: "Nothing hit. Pip looks at you with disappointment. (−15⚡, Pip trust −4)", fx: () => { change({ battery: -15 }); pipChange({ trust: -4 }); } },
  ] },
  { x: 1500, id: "river", title: "ROUTE B — THE CRYSTAL RIVER", prompt: "Your water detector finds liquid in the crystal river. What is the safest first step?", opts: [
    { label: "Drink it immediately.", out: "Mild alien bacteria. Stomach cramps! (−12❤, +10 water)", fx: () => change({ hp: -12, water: 10 }) },
    { label: "Test a sample with the suit's analyzer.", best: true, out: "Analyzer: safe after filtration. You fill up and collect crystals! (+3 water cartridges, +2 crystals)", fx: () => { addItem("water", 3); addItem("crystal", 2); } },
    { label: "Ignore all water.", out: "You walk on, thirsty. (−5 water)", fx: () => change({ water: -5 }) },
  ] },
  { x: 1780, id: "crossing", title: "ROUTE B — CROSSING", prompt: "How will you cross the river?", opts: [
    { label: "Cross the narrow crystal bridge.", out: "It cracks under you — you scramble across, soaked. (−6❤) but grab a crystal.", fx: () => { change({ hp: -6 }); addItem("crystal"); } },
    { label: "Follow the river downstream.", out: "Longer, but you spot luminous fish & minerals. (+2 minerals, −4 food)", fx: () => { addItem("mineral", 2); change({ food: -4 }); } },
    { label: "Use the scanner to identify a safe crossing.", best: true, out: "Stepping stones of solid crystal light up. Safe! (−4⚡)", fx: () => change({ battery: -4 }) },
  ] },
  { x: 2150, id: "ruins", title: "ROUTE C — THE ANCIENT RUINS", prompt: "Three symbols glow on an ancient door: ▲ ◆ ●. How should you proceed?", opts: [
    { label: "Guess randomly.", out: "Wrong combination — a jolt of energy throws you back. (−8❤)", fx: () => change({ hp: -8 }) },
    { label: "Compare the symbols with the radio signal pattern.", best: true, out: "▲ ◆ ● ◆ ▲ — it matches the signal! The door slides open: supplies and a map fragment.", fx: () => { setFlag("map", (getState().flags.map ?? 0) + 1); addItem("cell"); addItem("mineral", 2); } },
    { label: "Force the door open.", out: "It barely budges and you strain your suit. (−10⚡, −5 food)", fx: () => change({ battery: -10, food: -5 }) },
  ] },
  { x: 2400, id: "terminal", title: "ROUTE C — ALIEN TERMINAL", prompt: "A small alien terminal sits dark. What do you do?", opts: [
    { label: "Restore power with your suit battery.", best: true, out: "It flickers alive, showing a civilisation of light-beings: the LUMARI. Another map fragment!", fx: () => { change({ battery: -12 }); setFlag("map", (getState().flags.map ?? 0) + 1); setFlag("lore", true); } },
    { label: "Ask Pip to scan the structure.", out: "Pip finds a hidden compartment: parts! (Pip −8⚡)", fx: () => { pipChange({ bat: -8, trust: 2 }); addItem("parts", 2); } },
    { label: "Search the ruins for supplies.", out: "You find old seeds and a ration. (+food, +seed)", fx: () => { addItem("food"); addItem("seed"); } },
  ] },
  { x: 2700, id: "spore", title: "ROUTE D — THE SPORE VALLEY", prompt: "Giant plants release glowing spores ahead. How do you approach?", opts: [
    { label: "Sneak past the plants.", out: "You hold your breath… mostly. Spores will drain O₂ faster in the valley.", fx: () => setFlag("sporeMode", "sneak") },
    { label: "Distract them using a light source.", out: "The plants turn toward your flare — spores drift away. (−6⚡)", fx: () => { change({ battery: -6 }); setFlag("sporeMode", "light"); } },
    { label: "Wear the suit's filtered mask.", best: true, out: "Filter engaged. Spores can't reach you.", fx: () => setFlag("sporeMode", "mask") },
    { label: "Take a longer route around the valley.", out: "Safe, but tiring. (−8 food, −8 water)", fx: () => { change({ food: -8, water: -8 }); setFlag("sporeMode", "mask"); } },
  ] },
  { x: 3050, id: "o2Q", title: "DEEP IN THE VALLEY", prompt: "Your oxygen drops while exploring the toxic valley. What should you prioritize?", opts: [
    { label: "Collect every resource.", out: "You grab spores… and choke. (−12❤, −10 O₂)", fx: () => change({ hp: -12, o2: -10 }) },
    { label: "Reach a safe area and restore your supplies.", best: true, out: "A glowing safe-pod refills your air. Nova and Pip breathe easy. (+40 O₂)", fx: () => { change({ o2: 40 }); pipChange({ hp: 10 }); } },
    { label: "Continue without checking the meter.", out: "Your vision blurs. (−15❤)", fx: () => change({ hp: -15 }) },
  ] },
  { x: 3350, id: "beacon", title: "THE DAMAGED BEACON", prompt: "A damaged alien beacon points toward a cave. What should you do?", opts: [
    { label: "Repair or power the beacon.", best: true, out: "It beams a shortest-path line across the hills. (−1 part)", fx: () => { setFlag("map", (getState().flags.map ?? 0) + 1); } },
    { label: "Destroy it.", out: "Sparks die. Somewhere far away, something notices. (Lumari trust −)", fx: () => setFlag("hostile", true) },
    { label: "Ignore every clue.", out: "You wander for an hour. (−8 food, −8 water)", fx: () => change({ food: -8, water: -8 }) },
  ] },
  { x: 3700, id: "cave", title: "TWO CAVES", prompt: "You find two caves. One has strange noises, the other a stable energy reading. What is the best first step?", opts: [
    { label: "Scan both caves before entering.", best: true, out: "The noisy cave is a nest. The stable one hums with ancient Lumari power. Perfect for a base.", fx: () => setFlag("cave", "stable") },
    { label: "Rush into the noisy cave.", out: "Creatures swarm! You retreat to the stable cave, bruised. (−12❤)", fx: () => { change({ hp: -12 }); setFlag("cave", "stable"); } },
    { label: "Camp outside.", out: "Spores at night… you move into the stable cave at dawn. (−10 O₂, −5 food)", fx: () => { change({ o2: -10, food: -5 }); setFlag("cave", "stable"); } },
  ] },
];
const WORLD = 3900;
const PLATS = [[700, 190, 90], [1000, 170, 80], [1650, 200, 100], [2250, 180, 90], [2550, 150, 70], [3200, 180, 100]];
const ROOTS = [[960, 140], [2500, 120]];
const SEEDS = [740, 1020, 1300, 1690, 2280, 2570, 2900, 3240, 3500];

export default function Level4() {
  const stage = useGame((s) => s.flags.L4stage ?? "intro");
  useEffect(() => { setIntensity(1); setObjective(stage === "explore" ? "Explore and find a safe cave (→ east)." : "Approach the planet."); }, [stage]);
  if (stage === "intro")
    return <Dialogue lines={[
      { who: "NARRATOR", text: "The repaired KESTREL approaches the planet. Clouds, oceans, and glowing forests swell in the window." },
      { who: "NOVA", text: "I've never seen anything like this." },
      { who: "PIP", text: "Unknown biosphere detected. Recommend cautious exploration." },
      { who: "NARRATOR", text: "TURBULENCE! Warning lights flash. Instruments fail. The ship plunges through alien clouds…" },
      { who: "NARRATOR", text: "…and slams into an overgrown clearing. Glowing spores swirl. Nova is alive — but the ship won't fly again without major repairs." },
    ]} onDone={() => { change({ ship: -15, hp: -5 }); setFlag("L4stage", "explore"); checkpoint(4); }}>
      <Stars speed={2} tint="#0a1a1a" />
      <div className="absolute inset-0 flex items-center justify-center pb-40"><div className="animate-shake"><Sprite rows={SHIP} scale={10} /></div></div>
      <div className="absolute inset-0 bg-destructive/20 animate-alarm" />
    </Dialogue>;
  if (stage === "done")
    return <div className="relative h-full"><Stars speed={0.1} tint="#06141a" /><Modal title="SAFE CAVE FOUND"><Result text={`You found the stable cave. Wisdom score: ${getState().flags.wisdom ?? 0}/11. Map fragments: ${getState().flags.map ?? 0}. This will be your base.`} onNext={() => { setState({ level: 5 }); checkpoint(5); }} /></Modal></div>;
  return <Explore />;
}

function Explore() {
  const ref = useRef<HTMLCanvasElement>(null);
  const keys = useControls();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [out, setOut] = useState<string | null>(null);
  const spotRef = useRef<Spot | null>(null); spotRef.current = spot;
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!; const W = 480, H = 270; c.width = W; c.height = H;
    const GY = 230;
    const p = { x: 80, y: GY, vx: 0, vy: 0, ground: true, face: false, inv: 0 };
    const seeds = SEEDS.map((x) => ({ x, y: GY - 60 - (x % 50), got: false }));
    const critters = [1200, 1900, 2800].map((x) => ({ x, d: 1, b: 0 }));
    const done = new Set<string>(getState().flags.l4done ?? []);
    let raf = 0, last = performance.now(), t = 0, o2t = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now; raf = requestAnimationFrame(loop);
      if (spotRef.current || getState().modal) return;
      t += dt; p.inv -= dt;
      const sp = 130;
      p.vx = (keys.current.right ? sp : 0) - (keys.current.left ? sp : 0);
      if (p.vx) p.face = p.vx < 0;
      if ((keys.current.act || keys.current.up) && p.ground) { p.vy = -330; p.ground = false; sfx.jump(); }
      const onRoot = ROOTS.some(([rx, top]) => Math.abs(p.x - rx) < 14 && p.y > top);
      if (onRoot && keys.current.up) p.vy = -110;
      else p.vy += 800 * dt;
      p.x = Math.max(10, Math.min(WORLD - 10, p.x + p.vx * dt));
      const ny = p.y + p.vy * dt; p.ground = false;
      for (const [px, py, pw] of PLATS) if (p.vy >= 0 && p.x > px && p.x < px + pw && p.y <= py && ny >= py) { p.y = py; p.vy = 0; p.ground = true; }
      if (!p.ground) { if (ny >= GY) { p.y = GY; p.vy = 0; p.ground = true; } else p.y = ny; }
      // spores
      const inSpore = p.x > 2750 && p.x < 3300;
      const mode = getState().flags.sporeMode;
      setState({ o2Drain: inSpore ? (mode === "mask" ? 0 : mode === "light" ? 0.4 : 1.2) : 0 });
      o2t += dt;
      for (const s of seeds) if (!s.got && Math.abs(s.x - p.x) < 14 && Math.abs(s.y - (p.y - 12)) < 22) { s.got = true; addItem("seed"); sfx.pickup(); }
      for (const cr of critters) {
        cr.x += cr.d * 30 * dt; cr.b += dt; if (cr.b > 3) { cr.b = 0; cr.d *= -1; }
        if (p.inv <= 0 && Math.abs(cr.x - p.x) < 14 && p.y > GY - 20) { p.inv = 1.5; if (!getState().flags.critterSafe) { change({ hp: -5 }); sfx.hit(); toast("A critter nipped you! Scanning them first helps.", "warn"); } else { toast("The glimmerhopper nuzzles you.", "info"); } }
      }
      const near = SPOTS.find((s) => !done.has(s.id) && Math.abs(s.x - p.x) < 30);
      if (near && keys.current.use) {
        keys.current.use = false; done.add(near.id); setFlag("l4done", [...done]); setSpot(near); sfx.beep();
      }
      // draw
      const cam = Math.max(0, Math.min(WORLD - W, p.x - W / 2));
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#0b1030"); sky.addColorStop(1, inSpore ? "#3a1a40" : "#0e3a3a"); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = "#cfe"; ctx.fillRect((i * 131 - cam * 0.05) % W, (i * 37) % 120, 1, 1); }
      ctx.fillStyle = "#14243a"; for (let i = 0; i < 12; i++) { const mx = (i * 220 - cam * 0.2) % (W + 220) - 100; ctx.beginPath(); ctx.moveTo(mx, 200); ctx.lineTo(mx + 110, 90 + (i % 3) * 20); ctx.lineTo(mx + 220, 200); ctx.fill(); }
      ctx.save(); ctx.translate(-cam, 0);
      // trees & mushrooms
      for (let x = 100; x < WORLD; x += 140) {
        const h = 60 + ((x * 7) % 50);
        ctx.fillStyle = "#2a1b3d"; ctx.fillRect(x, GY - h, 8, h);
        ctx.fillStyle = Math.sin(t * 2 + x) > 0 ? "#38d9f0" : "#2bb8d0"; ctx.fillRect(x - 16, GY - h - 14, 40, 16);
        ctx.fillStyle = "#b07cff"; ctx.fillRect(x + 40, GY - 10, 10, 6); ctx.fillStyle = "#7cf7c9"; ctx.fillRect(x + 43, GY - 4, 4, 4);
      }
      // river
      ctx.fillStyle = "#1e6bff88"; ctx.fillRect(1400, GY + 4, 450, 12); for (let i = 0; i < 10; i++) { ctx.fillStyle = "#9ff"; ctx.fillRect(1420 + i * 44, GY - 6 - (i % 3) * 4, 6, 8); }
      // ruins
      ctx.fillStyle = "#5a5a7a"; ctx.fillRect(2100, GY - 90, 20, 90); ctx.fillRect(2200, GY - 90, 20, 90); ctx.fillRect(2090, GY - 100, 140, 14);
      ctx.fillStyle = "#ffd23f"; ctx.font = "10px monospace"; ctx.fillText("▲◆●", 2140, GY - 50);
      // cave
      ctx.fillStyle = "#1a1220"; ctx.beginPath(); ctx.arc(3760, GY, 50, Math.PI, 0); ctx.fill(); ctx.fillStyle = "#7cf7c9"; ctx.fillRect(3755, GY - 30, 10, 10);
      // spores
      if (true) for (let i = 0; i < 40; i++) { ctx.fillStyle = "#ff9ec7"; ctx.fillRect(2750 + ((i * 97 + t * 30) % 550), GY - ((i * 53 + t * 20) % 160), 2, 2); }
      ctx.fillStyle = "#1b3a2a"; ctx.fillRect(0, GY, WORLD, H - GY);
      ctx.fillStyle = "#2f6a4a"; for (let x = 0; x < WORLD; x += 6) ctx.fillRect(x, GY, 4, 3);
      for (const [px, py, pw] of PLATS) { ctx.fillStyle = "#5a3a6a"; ctx.fillRect(px, py, pw, 8); ctx.fillStyle = "#7cf7c9"; ctx.fillRect(px, py, pw, 2); }
      for (const [rx, top] of ROOTS) { ctx.fillStyle = "#6b3b1f"; ctx.fillRect(rx - 3, top, 6, GY - top); for (let y = top; y < GY; y += 10) ctx.fillRect(rx - 6, y, 12, 2); }
      for (const s of seeds) if (!s.got) { ctx.fillStyle = Math.sin(t * 6 + s.x) > 0 ? "#ffd23f" : "#7cf7c9"; ctx.fillRect(s.x - 3, s.y - 3, 6, 6); }
      for (const cr of critters) drawSprite(ctx, CRITTER, cr.x - 6, GY - 10 - Math.abs(Math.sin(t * 6)) * 4, 2);
      for (const s of SPOTS) if (!done.has(s.id)) { ctx.fillStyle = "#ffd23f"; ctx.fillRect(s.x - 2, GY - 70 + Math.sin(t * 3) * 3, 4, 10); ctx.fillRect(s.x - 2, GY - 56 + Math.sin(t * 3) * 3, 4, 4); }
      if (p.inv <= 0 || Math.floor(t * 10) % 2) drawSprite(ctx, NOVA, p.x - 8, p.y - 20, 2, p.face);
      drawSprite(ctx, PIP, p.x + (p.face ? 12 : -26), p.y - 14 + Math.sin(t * 4) * 2, 2, p.face);
      ctx.restore();
      if (near) { ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(W / 2 - 110, 10, 220, 22); ctx.fillStyle = "#ffd23f"; ctx.font = "8px 'Press Start 2P'"; ctx.textAlign = "center"; ctx.fillText("PRESS INTERACT (E)", W / 2, 25); ctx.textAlign = "left"; }
      if (inSpore && mode !== "mask") { ctx.fillStyle = "#ff4d5e"; ctx.font = "8px 'Press Start 2P'"; ctx.fillText("☣ TOXIC SPORES — O₂ DRAINING", 8, H - 8); }
      ctx.fillStyle = "#fff"; ctx.font = "8px 'Press Start 2P'"; ctx.fillText(`${Math.floor((p.x / WORLD) * 100)}% →`, W - 60, H - 8);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); setState({ o2Drain: 0 }); };
  }, []);
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-1 p-1">
      <canvas ref={ref} className="w-full border-4 border-border" style={{ aspectRatio: "480/270" }} />
      <div className="grid grid-cols-5 gap-1">
        <HoldButton k="left" keys={keys} className="h-14 text-lg">◀</HoldButton>
        <HoldButton k="right" keys={keys} className="h-14 text-lg">▶</HoldButton>
        <HoldButton k="up" keys={keys} className="h-14 text-[8px]">▲<br />CLIMB</HoldButton>
        <HoldButton k="act" keys={keys} className="h-14 text-[8px]">⤒<br />JUMP</HoldButton>
        <button className="pixel-btn pixel-btn-accent h-14 text-[8px]" onClick={() => (keys.current.use = true)}>E<br />ACT</button>
      </div>
      <p className="text-center text-base text-muted-foreground">Walk east. Yellow markers = discoveries. Collect glowing seeds. Climb roots with ▲.</p>
      {spot && (
        <Modal title={spot.title}>
          {out ? <Result text={out} onNext={() => { const last = spot.id === "cave"; setOut(null); setSpot(null); if (last) setFlag("L4stage", "done"); }} /> : (
            <Choice prompt={spot.prompt} options={spot.opts.map((o) => ({ label: o.label, run: () => { o.fx?.(); if (o.best) { wise(); sfx.good(); } else sfx.bad(); setOut((o.best ? "✔ " : "") + o.out); } }))} />
          )}
        </Modal>
      )}
    </div>
  );
}
