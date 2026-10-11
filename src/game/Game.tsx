// @ts-nocheck
import { useEffect, useRef } from "react";
import {
  useGame, setState, getState, change, pipChange, toast, ITEMS, RECIPES, CAPACITY, invCount, useItem, craft,
  saveGame, loadGame, hasSave, newGame, continueFromCheckpoint, removeItem,
} from "./store";
import { Modal, Sprite, Stars } from "./ui";
import { NOVA, PIP, SHIP } from "./sprites";
import { music, sfx, unlockAudio } from "./audio";
import Level1 from "./levels/Level1";
import Level2 from "./levels/Level2";
import Level3 from "./levels/Level3";
import Level4 from "./levels/Level4";
import Level5 from "./levels/Level5";

const LEVEL_NAMES = ["", "Alone in the Void", "The Meteor Gauntlet", "The Spacewalk Engineer", "The Planet of Living Light", "The Way Home"];

function Bar({ label, v, max = 100, color, icon }: { label: string; v: number; max?: number; color: string; icon: string }) {
  const pct = Math.max(0, Math.min(100, (v / 100) * 100));
  const low = v < 20;
  return (
    <div className={`flex items-center gap-1 ${low ? "animate-blink" : ""}`} title={`${label}: ${Math.round(v)}`}>
      <span className="w-4 text-center text-xs">{icon}</span>
      <div className="relative h-2.5 flex-1 border border-border bg-muted">
        <div className={`h-full ${color} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
        {max < 100 && <div className="absolute inset-y-0 right-0 bg-destructive/40" style={{ width: `${100 - max}%` }} />}
      </div>
      <span className="w-6 text-right text-sm leading-none">{Math.round(v)}</span>
    </div>
  );
}

function Hud() {
  const s = useGame((s) => s);
  return (
    <div className="pixel-panel relative z-20 m-1 p-1.5 sm:m-2 sm:p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="truncate font-pixel text-[8px] text-accent sm:text-[10px]">LV{s.level} · {LEVEL_NAMES[s.level]}</div>
        <div className="flex shrink-0 gap-1">
          <button className="pixel-btn px-2 py-1" onClick={() => setState({ modal: "inventory" })} aria-label="Inventory">🎒 {invCount(s)}/{CAPACITY}</button>
          <button className="pixel-btn px-2 py-1" onClick={() => setState({ modal: "pip" })} aria-label="Pip">🦊</button>
          <button className="pixel-btn px-2 py-1" onClick={() => setState({ modal: "pause", paused: true })} aria-label="Pause">⏸</button>
        </div>
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-x-2 gap-y-1 sm:grid-cols-6">
        <Bar label="Health" icon="❤" v={s.hp} color="bg-hp" />
        <Bar label="Water" icon="💧" v={s.water} color="bg-water" />
        <Bar label="Food" icon="🍖" v={s.food} color="bg-food" />
        <Bar label="Oxygen" icon="🫧" v={s.o2} color="bg-o2" />
        <Bar label="Suit battery" icon="⚡" v={s.battery} color="bg-energy" />
        <Bar label="Ship integrity" icon="🚀" v={s.ship} max={s.shipMax} color="bg-hull" />
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-base leading-tight">
        <span className="text-pip">🦊 ❤{Math.round(s.pip.hp)} ⚡{Math.round(s.pip.bat)} ☺{Math.round(s.pip.happy)} 🤝{Math.round(s.pip.trust)}</span>
        <span className="text-muted-foreground">⛽{Math.round(s.fuel)}</span>
        <span className="min-w-0 flex-1 truncate text-primary">▶ {s.objective}</span>
      </div>
    </div>
  );
}

function Toasts() {
  const t = useGame((s) => s.toasts);
  const tone = { info: "border-primary", good: "border-success", bad: "border-destructive", warn: "border-accent" };
  return (
    <div className="pointer-events-none fixed inset-x-0 top-28 z-50 flex flex-col items-center gap-1 px-2 sm:top-32">
      {t.map((x) => <div key={x.id} className={`pixel-panel border-l-8 px-3 py-1 text-lg ${tone[x.tone]}`}>{x.text}</div>)}
    </div>
  );
}

function Inventory() {
  const inv = useGame((s) => s.inv);
  const close = () => setState({ modal: null });
  return (
    <Modal title={`INVENTORY ${invCount()}/${CAPACITY}`} onClose={close} wide>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Object.entries(inv).filter(([, n]) => n > 0).map(([id, n]) => (
          <div key={id} className="border-2 border-border bg-muted p-2">
            <div className="text-lg">{ITEMS[id]?.icon} {ITEMS[id]?.name} ×{n}</div>
            <div className="text-base text-muted-foreground">{ITEMS[id]?.desc}</div>
            {ITEMS[id]?.use && <button className="pixel-btn mt-1 w-full py-1" onClick={() => { sfx.pickup(); useItem(id); }}>{ITEMS[id].use}</button>}
          </div>
        ))}
        {invCount() === 0 && <p className="text-muted-foreground">Empty.</p>}
      </div>
      <h3 className="mt-4 font-pixel text-[10px] text-accent">CRAFTING</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {RECIPES.map((r, i) => {
          const ok = Object.entries(r.need).every(([k, n]) => (inv[k] ?? 0) >= n);
          return (
            <button key={i} disabled={!ok} className="pixel-btn text-left" onClick={() => { sfx.good(); craft(i); }}>
              {ITEMS[r.out].icon} {ITEMS[r.out].name}
              <span className="block font-term text-base text-muted-foreground">{Object.entries(r.need).map(([k, n]) => `${n}×${ITEMS[k].name}`).join(" + ")}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

export function PipPanel() {
  const pip = useGame((s) => s.pip);
  const inv = useGame((s) => s.inv);
  const act = (fn: () => boolean | void, msg: string) => { if (fn() !== false) { sfx.beep(); toast(msg, "good"); } };
  return (
    <Modal title="PIP — ROBO FOX" onClose={() => setState({ modal: null })}>
      <div className="flex items-center gap-4">
        <div className="animate-floaty"><Sprite rows={PIP} scale={8} /></div>
        <div className="flex-1 space-y-1">
          <Bar label="Pip health" icon="❤" v={pip.hp} color="bg-hp" />
          <Bar label="Pip battery" icon="⚡" v={pip.bat} color="bg-energy" />
          <Bar label="Happiness" icon="☺" v={pip.happy} color="bg-pip" />
          <Bar label="Trust" icon="🤝" v={pip.trust} color="bg-success" />
        </div>
      </div>
      <p className="mt-2 text-lg text-muted-foreground">
        {pip.trust >= 70 ? "Pip trusts you completely: auto-scans, part retrieval and shield field unlocked." : pip.trust >= 45 ? "Pip trusts you: assisted scanning and part retrieval unlocked." : "Pip is cautious. Care for Pip to unlock better help."}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="pixel-btn" disabled={!inv.food} onClick={() => act(() => { if (!removeItem("food")) return false; pipChange({ hp: 10, happy: 10, trust: 3 }); }, "Pip munches a nutrient chip!")}>🍱 Feed (1 food)</button>
        <button className="pixel-btn" disabled={!inv.battery} onClick={() => act(() => { if (!removeItem("battery")) return false; pipChange({ bat: 45, trust: 2 }); }, "Pip recharged!")}>🔋 Recharge</button>
        <button className="pixel-btn" disabled={!inv.parts} onClick={() => act(() => { if (!removeItem("parts")) return false; pipChange({ hp: 30, trust: 4 }); }, "Loose servo tightened.")}>🔩 Repair</button>
        <button className="pixel-btn" onClick={() => act(() => { if (getState().pip.happy >= 100) return false; pipChange({ happy: 6, trust: 1 }); }, "Pip wags a pixel tail ♥")}>♥ Pet Pip</button>
        <button className="pixel-btn col-span-2" disabled={getState().battery < 15} onClick={() => act(() => { change({ battery: -15 }); pipChange({ bat: 20 }); }, "Shared 15 suit battery with Pip")}>⚡ Share suit power (−15)</button>
      </div>
    </Modal>
  );
}

function Pause() {
  const vol = useGame((s) => s.volume);
  const muted = useGame((s) => s.muted);
  const resume = () => setState({ modal: null, paused: false });
  return (
    <Modal title="PAUSED" onClose={resume}>
      <div className="grid gap-2">
        <button className="pixel-btn pixel-btn-primary" onClick={resume}>▶ RESUME</button>
        <button className="pixel-btn" onClick={() => saveGame()}>💾 SAVE GAME</button>
        <button className="pixel-btn" onClick={() => { loadGame(); setState({ modal: null, paused: false }); }}>📂 LOAD GAME</button>
        <button className="pixel-btn" onClick={() => { continueFromCheckpoint(); }}>⟲ RESTART FROM CHECKPOINT</button>
        <label className="mt-2 flex items-center gap-2 text-lg">🔊 Volume
          <input type="range" min={0} max={1} step={0.05} value={vol} className="flex-1 accent-primary" onChange={(e) => setState({ volume: +e.target.value })} />
        </label>
        <button className="pixel-btn" onClick={() => setState({ muted: !muted })}>{muted ? "🔇 SOUND OFF" : "🔊 SOUND ON"}</button>
        <div className="mt-2 border-2 border-border p-2 text-base text-muted-foreground">
          Controls: Mouse/touch on everything. Keyboard: Arrows/WASD move, Space shoot/jump, E interact, Esc pause, Space/Enter advance dialogue.
          Survival: water & food drain over time, oxygen drains outside. Use 🎒 to eat, drink, craft. Care for 🦊 Pip to raise trust.
        </div>
        <button className="pixel-btn pixel-btn-danger" onClick={() => { saveGame(true); setState({ screen: "title", modal: null, paused: false }); }}>⏏ SAVE & QUIT TO TITLE</button>
      </div>
    </Modal>
  );
}

function Title() {
  const canLoad = typeof window !== "undefined" && hasSave();
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden p-4 text-center">
      <Stars speed={0.6} meteors />
      <div className="relative z-10 flex flex-col items-center">
        <div className="animate-floaty"><Sprite rows={SHIP} scale={7} /></div>
        <h1 className="pixel-title mt-6 text-2xl leading-snug text-primary sm:text-4xl">LOST IN THE<br />COSMOS</h1>
        <p className="mt-3 font-pixel text-[10px] text-accent sm:text-xs">A JOURNEY HOME</p>
        <div className="mt-6 flex items-end gap-3"><Sprite rows={NOVA} scale={5} /><div className="animate-floaty"><Sprite rows={PIP} scale={4} /></div></div>
        <div className="mt-8 grid w-64 gap-3">
          <button className="pixel-btn pixel-btn-primary" onClick={() => { unlockAudio(); sfx.good(); newGame(); }}>NEW GAME</button>
          <button className="pixel-btn" disabled={!canLoad} onClick={() => { unlockAudio(); loadGame(); }}>CONTINUE</button>
        </div>
        <p className="mt-6 max-w-sm text-lg text-muted-foreground">Five levels. Survive, repair, explore — and bring Nova and Pip home to Aurelia.</p>
      </div>
    </div>
  );
}

function GameOver() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center p-4 text-center">
      <Stars speed={0.1} tint="#1a0710" />
      <div className="pixel-panel relative z-10 max-w-sm p-6">
        <h1 className="pixel-title text-xl text-destructive">SIGNAL LOST</h1>
        <p className="mt-3 text-xl">Nova's vitals flatlined. Pip curls up beside the suit, beeping softly…</p>
        <div className="mt-5 grid gap-2">
          <button className="pixel-btn pixel-btn-primary" onClick={() => continueFromCheckpoint()}>CONTINUE FROM CHECKPOINT</button>
          <button className="pixel-btn" onClick={() => newGame()}>RESTART JOURNEY</button>
        </div>
      </div>
    </div>
  );
}

const warned: Record<string, boolean> = {};
function useSurvivalTick() {
  useEffect(() => {
    const id = setInterval(() => {
      const s = getState();
      if (s.screen !== "play" || s.paused || s.modal === "pause") return;
      const o2d = s.o2Drain > 0 ? -s.o2Drain : 0.6;
      const d: Record<string, number> = { water: -0.16, food: -0.11, o2: o2d };
      if (s.water <= 0 || s.food <= 0 || s.o2 <= 0) d.hp = s.o2 <= 0 ? -3 : -1;
      change(d);
      pipChange({ bat: -0.08, happy: -0.04 });
      if (s.pip.bat <= 0) pipChange({ hp: -0.3, trust: -0.05 });
      for (const k of ["water", "food", "o2", "battery"] as const) {
        if (s[k] < 20 && !warned[k]) { warned[k] = true; sfx.alarm(); toast(`⚠ ${k.toUpperCase()} CRITICAL — open 🎒 to replenish or craft`, "warn"); }
        if (s[k] > 35) warned[k] = false;
      }
      if (getState().hp <= 0) { sfx.bad(); setState({ screen: "gameover", modal: null }); }
    }, 1000);
    return () => clearInterval(id);
  }, []);
}

export default function Game() {
  const screen = useGame((s) => s.screen);
  const level = useGame((s) => s.level);
  const modal = useGame((s) => s.modal);
  const started = useRef(false);
  useSurvivalTick();
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape" && getState().screen === "play") {
        const m = getState().modal;
        setState(m ? { modal: null, paused: false } : { modal: "pause", paused: true });
      }
      if ((e.key === "i" || e.key === "I") && getState().screen === "play" && !getState().modal) setState({ modal: "inventory" });
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => { if (screen === "play" && !started.current) { started.current = true; music(1); } }, [screen]);

  if (screen === "title") return <Title />;
  if (screen === "gameover") return <GameOver />;
  const L = [Level1, Level1, Level2, Level3, Level4, Level5][level] ?? Level1;
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {screen === "play" && <Hud />}
      <main className="relative min-h-0 flex-1">
        <L key={level} />
      </main>
      <Toasts />
      {modal === "inventory" && <Inventory />}
      {modal === "pip" && <PipPanel />}
      {modal === "pause" && <Pause />}
    </div>
  );
}
