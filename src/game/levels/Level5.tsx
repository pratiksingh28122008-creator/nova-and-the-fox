// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { useGame, setFlag, getState, change, pipChange, addItem, removeItem, toast, setObjective, checkpoint, setState, newGame } from "../store";
import { Dialogue, Modal, Choice, Result, Sprite, Stars } from "../ui";
import { NOVA, PIP, ALIEN, SHIP } from "../sprites";
import { sfx, setIntensity } from "../audio";

const OBJ: Record<string, string> = { intro: "Settle into the cave.", base: "Prepare your base camp.", meet: "Meet the signal's senders.", trial: "Pass the Lumari light trial.", rebuild: "Rebuild the ship with alien tech.", launch: "Launch for home!", ending: "Home." };

export default function Level5() {
  const stage = useGame((s) => s.flags.L5stage ?? "intro");
  const go = (s: string) => setFlag("L5stage", s);
  useEffect(() => { setObjective(OBJ[stage] ?? ""); setIntensity(stage === "launch" ? 2 : 1); }, [stage]);
  return (
    <div className="relative h-full overflow-hidden">
      <Stars speed={0.05} tint={stage === "ending" ? "#0b0d22" : "#0a0f18"} />
      <div className="relative z-10 h-full overflow-y-auto">
        {stage === "intro" && <Dialogue lines={[
          { who: "NARRATOR", text: "The cave walls glow softly. Ancient carvings of the signal pattern ▲◆● cover every surface." },
          { who: "PIP", text: "Atmosphere stable. Shelter rating: excellent." },
          { who: "NOVA", text: "Home for now, buddy. Let's get ready for whoever's out there." },
        ]} onDone={() => { change({ o2: 100 }); go("base"); }}><Scene /></Dialogue>}
        {stage === "base" && <Base onDone={() => go("meet")} />}
        {stage === "meet" && <Meet onDone={() => go("trial")} />}
        {stage === "trial" && <Trial onDone={() => go("rebuild")} />}
        {stage === "rebuild" && <Rebuild onDone={() => { checkpoint(5); go("launch"); }} />}
        {stage === "launch" && <Launch onDone={() => go("ending")} />}
        {stage === "ending" && <Ending />}
      </div>
    </div>
  );
}

function Scene({ alien = false }: { alien?: boolean }) {
  return <div className="absolute inset-0 flex items-end justify-center gap-6 pb-48"><Sprite rows={NOVA} scale={6} /><div className="animate-floaty"><Sprite rows={PIP} scale={5} /></div>{alien && <div className="animate-floaty"><Sprite rows={ALIEN} scale={8} /></div>}</div>;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mx-auto max-w-xl p-2 sm:p-4"><div className="pixel-panel p-3"><h2 className="mb-2 font-pixel text-[10px] text-primary sm:text-xs">{title}</h2>{children}</div></div>;
}

function Base({ onDone }: { onDone: () => void }) {
  const [used, setUsed] = useState<string[]>([]);
  const act = (id: string, fn: () => void, msg: string) => { if (used.includes(id)) return; fn(); setUsed([...used, id]); sfx.good(); toast(msg, "good"); };
  const crop = getState().flags.crop;
  return (
    <Panel title="BASE CAMP — THE STABLE CAVE">
      <div className="flex justify-center"><Sprite rows={NOVA} scale={5} /><span className="mx-2 self-end text-3xl">🔥</span><Sprite rows={PIP} scale={4} /></div>
      <p className="mt-2 text-lg">Do at least 2 preparations, then follow the lights deeper into the cave.</p>
      <div className="mt-2 grid gap-2">
        <button className="pixel-btn" disabled={used.includes("rest")} onClick={() => act("rest", () => change({ hp: 30, food: -8 }), "Rested: +30❤")}>😴 Rest by the fire (+30❤, −8 food)</button>
        <button className="pixel-btn" disabled={used.includes("water")} onClick={() => act("water", () => { change({ water: 30, battery: -6 }); }, "Purified cave water: +30")}>💧 Purify cave spring (+30 water, −6⚡)</button>
        <button className="pixel-btn" disabled={used.includes("plant")} onClick={() => act("plant", () => { const n = removeItem("seed", 2) ? 3 : 1; addItem("food", n + (crop === "veg" ? 1 : 0)); }, "Planted a cave garden")}>🌱 Plant a cave garden (uses 2 glow seeds if you have them)</button>
        <button className="pixel-btn" disabled={used.includes("pip")} onClick={() => act("pip", () => pipChange({ bat: 100, happy: 20, trust: 5 }), "Pip charged from a Lumari crystal!")}>🦊 Charge Pip at the glowing crystal</button>
        <button className="pixel-btn pixel-btn-primary" disabled={used.length < 2} onClick={onDone}>FOLLOW THE LIGHTS ▶</button>
      </div>
    </Panel>
  );
}

function Meet({ onDone }: { onDone: () => void }) {
  const [res, setRes] = useState<string | null>(null);
  const hostile = getState().flags.hostile; const wisdom = getState().flags.wisdom ?? 0;
  if (!res && !getState().flags.metIntro)
    return <Dialogue lines={[
      { who: "NARRATOR", text: "Deep inside, the walls part. Tall beings of living light step forward — the LUMARI." },
      { who: "LUMARI", text: hostile ? "You broke our beacon, traveller. Why should we help you?" : "Our beacon called. You answered. Few do." },
      { who: "PIP", text: "Translation matrix… 87% confident. They seem curious." },
    ]} onDone={() => setFlag("metIntro", true)}><Scene alien /></Dialogue>;
  return (
    <Panel title="FIRST CONTACT">
      <div className="flex justify-center animate-floaty"><Sprite rows={ALIEN} scale={8} /></div>
      {res ? <Result text={res} onNext={onDone} /> : (
        <Choice prompt="How do you greet the Lumari?" options={[
          { label: "Repeat the signal pattern ▲ ◆ ● ◆ ▲ with your suit light", hint: wisdom >= 6 ? "Your careful exploration taught you its meaning." : "You're not sure what it means…", run: () => { const ok = wisdom >= 6; setFlag("alliance", ok ? 2 : 1); setRes(ok ? "The Lumari glow brilliant gold. ‘You understand. You are welcome, friend.’ (Alliance: strong)" : "They tilt their heads — close, but you mixed the order. Still, they seem amused. (Alliance: cautious)"); } },
          { label: "Let Pip greet them", hint: `Pip trust ${Math.round(getState().pip.trust)}`, run: () => { const ok = getState().pip.trust >= 55; setFlag("alliance", ok ? 2 : 1); pipChange({ trust: 5 }); setRes(ok ? "Pip bounds forward and does a happy spin. The Lumari laugh like chimes. ‘Your companion vouches for you.’" : "Pip hides behind your leg. The Lumari wait patiently. (Alliance: cautious)"); } },
          { label: "Offer your Lumen crystals as a gift", hint: `You have ${getState().inv.crystal ?? 0}`, disabled: !(getState().inv.crystal), run: () => { removeItem("crystal"); setFlag("alliance", hostile ? 1 : 2); setRes("‘You return what the river gave. Generous.’ They accept your gift."); } },
        ]} />
      )}
    </Panel>
  );
}

const SYM = ["▲", "◆", "●", "■"];
function Trial({ onDone }: { onDone: () => void }) {
  const [round, setRound] = useState(0); const [seq, setSeq] = useState<number[]>([]); const [show, setShow] = useState(-1); const [input, setInput] = useState<number[]>([]); const [playing, setPlaying] = useState(false);
  const [mist, setMist] = useState(0);
  const play = (s: number[]) => {
    setPlaying(true); setInput([]);
    s.forEach((v, i) => { setTimeout(() => { setShow(v); sfx.beep(); }, 700 * i + 300); setTimeout(() => setShow(-1), 700 * i + 750); });
    setTimeout(() => setPlaying(false), 700 * s.length + 400);
  };
  const start = () => { const s = Array.from({ length: 3 + round }, () => Math.floor(Math.random() * 4)); setSeq(s); play(s); };
  if (round >= 3) return <Panel title="TRIAL COMPLETE"><Result text={`The Lumari hum in harmony. ‘You listen well.’ (${mist} mistakes)`} onNext={() => { setFlag("trialMist", mist); onDone(); }} /></Panel>;
  return (
    <Panel title={`THE LIGHT TRIAL — ${round + 1}/3`}>
      <p className="text-lg">Watch the Lumari light sequence, then repeat it.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {SYM.map((s, i) => <button key={i} disabled={playing || !seq.length} className={`pixel-btn h-20 text-3xl ${show === i ? "pixel-btn-accent" : ""}`} onClick={() => {
          const ni = [...input, i]; setInput(ni); sfx.click();
          if (seq[ni.length - 1] !== i) { sfx.bad(); setMist(mist + 1); change({ battery: -3 }); toast("The light flickers — try again.", "warn"); play(seq); return; }
          if (ni.length === seq.length) { sfx.good(); setSeq([]); setRound(round + 1); }
        }}>{s}</button>)}
      </div>
      <button className="pixel-btn pixel-btn-primary mt-3 w-full" disabled={playing || seq.length > 0} onClick={start}>▶ WATCH SEQUENCE</button>
    </Panel>
  );
}

function Rebuild({ onDone }: { onDone: () => void }) {
  const inv = useGame((s) => s.inv);
  const [core, setCore] = useState<string | null>(null);
  const [spent, setSpent] = useState(0);
  const give = (id: string, amt: number) => { if (removeItem(id)) { change({ ship: amt }); setSpent(spent + 1); sfx.pickup(); } };
  const ship = useGame((s) => s.ship); const max = useGame((s) => s.shipMax);
  return (
    <Panel title="REBUILDING THE KESTREL">
      {!core ? <Choice prompt="The Lumari offer a navigation core that can fold space toward Aurelia. What do you do?" options={[
        { label: "Accept the core and promise to return as a friend", run: () => { setCore("friend"); setFlag("core", "friend"); change({ fuel: 60 }); } },
        { label: "Accept the core and offer Pip's star-map data in exchange", hint: "Pip will need to agree…", run: () => { setCore("trade"); setFlag("core", "trade"); change({ fuel: 60 }); pipChange({ trust: getState().pip.trust >= 60 ? 5 : -8 }); } },
        { label: "Decline — fix the old engines with your own resources", hint: "Harder: needs much more material.", run: () => { setCore("self"); setFlag("core", "self"); change({ fuel: 25 }); } },
      ]} /> : (
        <div className="space-y-2">
          <p className="text-lg">Hull: <b className="text-primary">{Math.round(ship)}/{max}</b>. Reach at least 60 to launch. Lumari crafters assist ({getState().flags.alliance === 2 ? "+15 per part" : "+10 per part"}).</p>
          <div className="grid grid-cols-2 gap-2">
            {(["parts", "mineral", "crystal", "kit", "frag"] as const).map((id) => <button key={id} disabled={!inv[id]} className="pixel-btn" onClick={() => give(id, getState().flags.alliance === 2 ? 15 : 10)}>Use {id} ({inv[id] ?? 0})</button>)}
            <button className="pixel-btn" onClick={() => { change({ ship: 6, food: -6, water: -6, hp: -4 }); sfx.click(); toast("Hard manual labour: +6 hull", "info"); }}>🔧 Manual labour (+6)</button>
          </div>
          <button className="pixel-btn pixel-btn-primary w-full" disabled={ship < 60} onClick={onDone}>🚀 PREPARE LAUNCH</button>
        </div>
      )}
    </Panel>
  );
}

function Launch({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0); const [lvl, setLvl] = useState(0); const [score, setScore] = useState(0);
  const hold = useRef(false); const [done, setDone] = useState(false);
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setLvl((v) => Math.max(0, Math.min(100, v + (hold.current ? 2.4 : -1.6)))), 30);
    return () => clearInterval(id);
  }, [done]);
  const release = () => {
    hold.current = false;
    if (lvl < 5) return;
    const ok = lvl >= 60 && lvl <= 80; sfx[ok ? "good" : "bad"](); if (!ok) change({ fuel: -5 });
    toast(ok ? `Thruster ${i + 1} perfect!` : `Thruster ${i + 1} unstable (−5 fuel)`, ok ? "good" : "warn");
    const ns = score + (ok ? 1 : 0); setScore(ns); setLvl(0);
    if (i < 2) setI(i + 1); else { setFlag("launchScore", ns); setDone(true); }
  };
  if (done) return <Dialogue lines={[
    { who: "NARRATOR", text: "Three thrusters ignite. The KESTREL rises from the glowing clearing, Lumari lights waving below." },
    { who: "PIP", text: "Navigation core online. Destination: AURELIA. Survival probability... excellent!" },
    { who: "NOVA", text: "Let's go home, Pip." },
  ]} onDone={onDone}><div className="absolute inset-0 flex items-center justify-center pb-40"><div className="animate-floaty"><Sprite rows={SHIP} scale={12} /></div></div></Dialogue>;
  return (
    <Panel title={`LAUNCH SEQUENCE — THRUSTER ${i + 1}/3`}>
      <p className="text-lg">HOLD the ignition, RELEASE when pressure is in the green band.</p>
      <div className="relative mx-auto mt-3 h-56 w-16 border-4 border-border bg-background">
        <div className="absolute inset-x-0 bg-success/40" style={{ bottom: "60%", height: "20%" }} />
        <div className={`absolute inset-x-0 bottom-0 ${lvl > 80 ? "bg-destructive" : "bg-energy"}`} style={{ height: `${lvl}%` }} />
      </div>
      <button className="pixel-btn pixel-btn-accent mt-3 h-16 w-full touch-none" onPointerDown={() => (hold.current = true)} onPointerUp={release} onPointerLeave={() => hold.current && release()}>🔥 HOLD TO IGNITE</button>
    </Panel>
  );
}

function Ending() {
  const s = getState(); const f = s.flags;
  const pipBond = s.pip.trust >= 70 ? "Pip never leaves Nova's side again. On Aurelia, they're known as the bravest duo in the fleet." : s.pip.trust >= 45 ? "Pip settles into Nova's home, curling up on the windowsill each night to watch the stars." : "Pip is quiet for a while — but on the first night home, it creeps onto Nova's bed. Trust takes time.";
  const lumari = f.alliance === 2 ? (f.core === "friend" ? "Nova returns a year later with an Aurelian envoy. The Lumari and Aurelia become allies among the stars." : "The star-map Pip shared helps the Lumari find lost cousins across the galaxy.") : f.core === "self" ? "Nova flew home on human ingenuity alone — but he never forgets the planet of living light." : "The Lumari watch from afar, curious about the strange visitor who came and went.";
  const [show, setShow] = useState(false);
  useEffect(() => { setState({ screen: "ending" }); }, []);
  if (!show)
    return <Dialogue lines={[
      { who: "NARRATOR", text: "Space folds like a curtain. And there it is — blue oceans, white clouds. AURELIA." },
      { who: "RADIO", text: "…KESTREL, this is Aurelia Control. Nova… is that really you?" },
      { who: "NOVA", text: "Control, I read you. Two coming home." },
      { who: "PIP", text: "Beep! Home protocol activated." },
    ]} onDone={() => setShow(true)}><div className="absolute right-[15%] top-[15%] h-32 w-32 rounded-full bg-water shadow-[0_0_60px] shadow-water/60 sm:h-48 sm:w-48" /><Scene /></Dialogue>;
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center p-4 text-center">
      <h1 className="pixel-title text-xl text-primary sm:text-3xl">HOME AT LAST</h1>
      <div className="mt-4 flex items-end gap-4"><Sprite rows={NOVA} scale={6} /><div className="animate-floaty"><Sprite rows={PIP} scale={5} /></div></div>
      <div className="pixel-panel mt-4 space-y-2 p-4 text-left text-xl">
        <p>{pipBond}</p><p>{lumari}</p>
        <p className="text-muted-foreground">Farm: {f.crop ?? "—"} · Power: {f.power ?? "—"} · Signal: {f.signal ?? "—"} · Wing repair: {f.repairQ ?? "—"} · Wisdom: {f.wisdom ?? 0}/11 · Pip trust: {Math.round(s.pip.trust)}</p>
      </div>
      <button className="pixel-btn pixel-btn-primary mt-6" onClick={() => newGame()}>PLAY AGAIN</button>
    </div>
  );
}
