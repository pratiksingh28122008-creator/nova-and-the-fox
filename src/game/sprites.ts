export const PAL: Record<string, string> = {
  w: "#eef6ff", g: "#9fb3c8", d: "#4a5a78", v: "#38d9f0", k: "#101426", o: "#ff8a3d",
  y: "#ffd23f", r: "#ff4d5e", b: "#2b6bff", p: "#ff9ec7", c: "#7cf7c9", m: "#b07cff", n: "#6b3b1f", e: "#1e2a44",
};

export const NOVA = [
  "..wwww..",
  ".wggggw.",
  "wgvvvvgw",
  "wgvkkvgw",
  ".wggggw.",
  "owwwwwwo",
  "wwgwwgww",
  "w.wwww.w",
  "..ww.ww.",
  "..dd.dd.",
];
export const PIP = [
  "o.....o.",
  "oo...oo.",
  "ooooooo.",
  "okoookoo",
  "ooowooo.",
  ".gggggo.",
  ".g.g.g..",
];
export const SHIP = [
  ".....ww.....",
  "....wvvw....",
  "...wwvvww...",
  "..wwwwwwww..",
  ".rwwgwwgwwr.",
  "rrwwwwwwwwrr",
  "r.dd.oo.dd.r",
  "....o..o....",
];
export const ALIEN = [
  "..c..c..",
  "..c..c..",
  ".cccccc.",
  "cckcckcc",
  "cccccccc",
  ".cmmmmc.",
  ".c.cc.c.",
  "c..cc..c",
];
export const CRITTER = [
  ".m..m.",
  "mmmmmm",
  "mkmmkm",
  "mmmmmm",
  ".m..m.",
];

export function drawSprite(ctx: CanvasRenderingContext2D, rows: string[], x: number, y: number, s: number, flip = false) {
  const w = rows[0].length;
  for (let j = 0; j < rows.length; j++)
    for (let i = 0; i < w; i++) {
      const ch = rows[j][flip ? w - 1 - i : i];
      if (ch === ".") continue;
      ctx.fillStyle = PAL[ch] ?? "#f0f";
      ctx.fillRect(Math.round(x + i * s), Math.round(y + j * s), s, s);
    }
}
