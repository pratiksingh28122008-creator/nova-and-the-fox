import { useSyncExternalStore } from "react";

export type Pip = { hp: number; bat: number; happy: number; trust: number };
export type Toast = { id: number; text: string; tone: "info" | "good" | "bad" | "warn" };

export type GameState = {
  screen: "title" | "play" | "gameover" | "ending";
  level: number;
  hp: number;
  water: number;
  food: number;
  o2: number;
  battery: number;
  ship: number;
  shipMax: number;
  fuel: number;
  inv: Record<string, number>;
  pip: Pip;
  flags: Record<string, any>;
  objective: string;
  paused: boolean;
  o2Drain: number;
  volume: number;
  muted: boolean;
  toasts: Toast[];
  modal: null | "inventory" | "pip" | "pause";
};

export const CAPACITY = 30;

export const ITEMS: Record<string, { name: string; icon: string; desc: string; use?: string }> = {
  food: { name: "Food Pack", icon: "🍱", desc: "+25 food", use: "Eat" },
  water: { name: "Water Cartridge", icon: "💧", desc: "+25 water", use: "Drink" },
  battery: { name: "Battery", icon: "🔋", desc: "+30 suit battery", use: "Charge suit" },
  mineral: { name: "Mineral", icon: "🪨", desc: "Crafting material" },
  parts: { name: "Repair Parts", icon: "🔩", desc: "Crafting material" },
  crystal: { name: "Lumen Crystal", icon: "💎", desc: "Alien crafting material" },
  seed: { name: "Glow Seed", icon: "🌱", desc: "Bio material" },
  cell: { name: "Rare Energy Cell", icon: "⚡", desc: "+40 battery & +15 fuel", use: "Install" },
  medkit: { name: "Medkit", icon: "🩹", desc: "+35 health", use: "Heal" },
  o2can: { name: "O₂ Canister", icon: "🫧", desc: "+40 oxygen", use: "Breathe" },
  treat: { name: "Pip Treat", icon: "🦴", desc: "Pip +happy +trust", use: "Give Pip" },
  kit: { name: "Hull Kit", icon: "🧰", desc: "+15 ship integrity", use: "Repair ship" },
  frag: { name: "Energy Fragment", icon: "✨", desc: "Crafting energy" },
};

export const RECIPES: { out: string; need: Record<string, number> }[] = [
  { out: "medkit", need: { mineral: 1, seed: 1 } },
  { out: "o2can", need: { crystal: 1, battery: 1 } },
  { out: "treat", need: { food: 1, mineral: 1 } },
  { out: "kit", need: { parts: 2, mineral: 1 } },
  { out: "battery", need: { frag: 2 } },
  { out: "water", need: { crystal: 1 } },
];

export function freshState(): GameState {
  return {
    screen: "title", level: 1,
    hp: 100, water: 70, food: 60, o2: 100, battery: 55, ship: 62, shipMax: 100, fuel: 30,
    inv: { food: 2, water: 2, mineral: 2, parts: 1 },
    pip: { hp: 80, bat: 40, happy: 50, trust: 30 },
    flags: {}, objective: "Wake up.", paused: false, o2Drain: 0,
    volume: 0.6, muted: false, toasts: [], modal: null,
  };
}

let state: GameState = freshState();
const listeners = new Set<() => void>();
export const getState = () => state;
export function setState(p: Partial<GameState> | ((s: GameState) => Partial<GameState>)) {
  const patch = typeof p === "function" ? p(state) : p;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export function useGame<T>(sel: (s: GameState) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(state));
}

const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));
type Stat = "hp" | "water" | "food" | "o2" | "battery" | "ship" | "fuel";
export function change(d: Partial<Record<Stat, number>>) {
  setState((s) => {
    const n: Partial<GameState> = {};
    for (const k of Object.keys(d) as Stat[]) {
      const max = k === "ship" ? s.shipMax : 100;
      n[k] = clamp(s[k] + (d[k] ?? 0), 0, max);
    }
    return n;
  });
}
export function pipChange(d: Partial<Pip>) {
  setState((s) => {
    const p = { ...s.pip };
    for (const k of Object.keys(d) as (keyof Pip)[]) p[k] = clamp(p[k] + (d[k] ?? 0));
    return { pip: p };
  });
}
export function setFlag(k: string, v: any) { setState((s) => ({ flags: { ...s.flags, [k]: v } })); }
export const flag = (k: string) => state.flags[k];
export function invCount(s = state) { return Object.values(s.inv).reduce((a, b) => a + b, 0); }
export function addItem(id: string, n = 1): number {
  const room = CAPACITY - invCount();
  const add = Math.max(0, Math.min(room, n));
  if (add > 0) setState((s) => ({ inv: { ...s.inv, [id]: (s.inv[id] ?? 0) + add } }));
  if (add < n) toast(`Inventory full! ${n - add}× ${ITEMS[id]?.name ?? id} left behind.`, "warn");
  return add;
}
export function removeItem(id: string, n = 1) {
  if ((state.inv[id] ?? 0) < n) return false;
  setState((s) => ({ inv: { ...s.inv, [id]: s.inv[id] - n } }));
  return true;
}
let tid = 1;
export function toast(text: string, tone: Toast["tone"] = "info") {
  const id = tid++;
  setState((s) => ({ toasts: [...s.toasts.slice(-3), { id, text, tone }] }));
  setTimeout(() => setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3800);
}
export const setObjective = (objective: string) => setState({ objective });

export function useItem(id: string) {
  const fx: Record<string, () => void> = {
    food: () => change({ food: 25 }), water: () => change({ water: 25 }),
    battery: () => change({ battery: 30 }), cell: () => change({ battery: 40, fuel: 15 }),
    medkit: () => change({ hp: 35 }), o2can: () => change({ o2: 40 }),
    treat: () => pipChange({ happy: 20, trust: 6, hp: 10 }), kit: () => change({ ship: 15 }),
  };
  if (!fx[id] || !removeItem(id)) return;
  fx[id]();
  toast(`Used ${ITEMS[id].name}`, "good");
}
export function craft(i: number) {
  const r = RECIPES[i];
  for (const [k, n] of Object.entries(r.need)) if ((state.inv[k] ?? 0) < n) return toast("Missing materials", "bad");
  for (const [k, n] of Object.entries(r.need)) removeItem(k, n);
  addItem(r.out);
  toast(`Crafted ${ITEMS[r.out].name}`, "good");
}

// ---- persistence ----
const SAVE_KEY = "litc-save";
const CP_KEY = "litc-checkpoint";
const persistable = (s: GameState) => ({ ...s, toasts: [], modal: null, paused: false });
export function saveGame(silent = false) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(persistable(state))); if (!silent) toast("Game saved", "good"); } catch { /* ignore */ }
}
export function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; } }
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return toast("No save found", "bad");
    state = { ...freshState(), ...JSON.parse(raw), screen: "play", modal: null, paused: false, o2Drain: 0 };
    listeners.forEach((l) => l());
    toast("Save loaded", "good");
  } catch { toast("Save corrupted", "bad"); }
}
export function checkpoint(level: number) {
  setState({ level });
  try { localStorage.setItem(CP_KEY, JSON.stringify(persistable(state))); } catch { /* ignore */ }
  saveGame(true);
}
export function continueFromCheckpoint() {
  try {
    const raw = localStorage.getItem(CP_KEY);
    const cp = raw ? JSON.parse(raw) : freshState();
    state = { ...freshState(), ...cp, screen: "play", modal: null, paused: false, o2Drain: 0,
      hp: Math.max(cp.hp ?? 60, 60), o2: Math.max(cp.o2 ?? 60, 60), water: Math.max(cp.water ?? 40, 40), food: Math.max(cp.food ?? 40, 40) };
    listeners.forEach((l) => l());
    toast("Resumed from checkpoint", "info");
  } catch { newGame(); }
}
export function newGame() {
  const v = state.volume, m = state.muted;
  state = { ...freshState(), screen: "play", volume: v, muted: m };
  listeners.forEach((l) => l());
}
