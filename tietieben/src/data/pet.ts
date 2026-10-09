// PET collage tape: wide clear rolls printed with layered ephemera, drawn as SVG.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type R = () => number;
const hashStr = (s: string) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
};
const TYPEF = "'Special Elite','Courier New',monospace",
  SCRIPTF = "'Caveat',cursive",
  PENF = "'Homemade Apple','Caveat',cursive";

export interface PetTheme {
  id: string;
  name: string;
  sub: string;
  p: string[];
  accent: string;
  ink: string;
  gridc: string;
  tape2: string;
  tone: string[];
  sky: string[];
  photos: string[];
  type: string[];
  script: string[];
  small: string[];
  pen: string[];
}
export const PET: PetTheme[] = [
  { id: 'letters', name: '旧信笺', sub: '牛皮纸、打字机字和邮戳', p: ['#d6bf9b', '#efe4cf', '#b49e80'], accent: '#9b3b2e', ink: '#2b2520', gridc: 'rgba(90,110,140,.35)', tape2: '#7da0a0', tone: ['#3a3027', '#8f7a60', '#e2d2b6'], sky: ['#e9dcc3', '#b9a283'], photos: ['field', 'sea', 'moon'],
    type: ['Slow days', 'are still', 'good days.', 'Keep the', 'little things', 'close.'], script: ['enjoy\nevery\nmoment', 'the sun\ncame up\ntoday'], small: ['dear you, write back soon', 'no. 0921 / airmail', 'keep the little things'], pen: ['Correspondance', 'my dear friend,', 'the leaves turned gold', 'this week. write soon.'] },
  { id: 'film', name: '胶片旅行', sub: '风景照、票根和温度标签', p: ['#c7b498', '#f1ebe0', '#7f97a6'], accent: '#c1492f', ink: '#1f1f1f', gridc: 'rgba(60,80,100,.32)', tape2: '#e3b65c', tone: ['#262b2f', '#6f7c84', '#d5dcdf'], sky: ['#dfe5e6', '#9aa9b1'], photos: ['mountains', 'palm', 'forest'],
    type: ['Somewhere', 'between', 'here and', 'there, the', 'light was', 'perfect.'], script: ['wander\nmore', 'postcards\nfrom\nnowhere'], small: ['roll 03 / iso 400', 'frame 24 / summer', 'not all who wander'], pen: ['Travel notes', 'day four, by the sea,', 'we missed the last bus', 'and walked home.'] },
  { id: 'blue', name: '雾蓝笔记', sub: '方格纸、黑白照和蓝色标签', p: ['#a3b4c3', '#e9eef1', '#5d7486'], accent: '#2f4a63', ink: '#1c232b', gridc: 'rgba(60,90,130,.35)', tape2: '#c9d6dd', tone: ['#1d252c', '#5f7180', '#c9d4dc'], sky: ['#d7dfe5', '#8a9daa'], photos: ['sea', 'moon', 'mountains'],
    type: ['Quiet', 'mornings,', 'cold coffee,', 'a page', 'of my', 'own.'], script: ['memories\nstay', 'blue\nhour'], small: ['memories / vol. 2', 'forget me not', 'hold on to this'], pen: ['Memories', 'some days are soft', 'and that is enough.', 'with love, M.'] },
  { id: 'rose', name: '玫瑰拼贴', sub: '豆沙粉撕纸和波点', p: ['#d9b3a6', '#ecd8cd', '#c7928d'], accent: '#8f3b47', ink: '#3a2526', gridc: 'rgba(140,80,90,.3)', tape2: '#6fa3a0', tone: ['#3d2a2a', '#9c7468', '#ecd3c8'], sky: ['#f0dcd2', '#c39f92'], photos: ['field', 'forest', 'sea'],
    type: ['Bloom', 'where', 'you are', 'planted,', 'slowly and', 'softly.'], script: ['i decide\nmy vibe', 'soft\ndays'], small: ['i swear i will love you more', 'i decide my vibe', 'petal post / 07'], pen: ['Mon amie', 'the roses are out', 'again and i thought', 'of you today.'] },
  { id: 'forest', name: '森林日记', sub: '苔绿、植物标本和野外笔记', p: ['#a9b59a', '#e7e8d8', '#6f7d5f'], accent: '#a5662d', ink: '#22281d', gridc: 'rgba(80,100,70,.32)', tape2: '#d6a240', tone: ['#232b1d', '#66745a', '#d5dcc4'], sky: ['#e1e6d6', '#9fab8f'], photos: ['forest', 'mountains', 'field'],
    type: ['Moss,', 'ferns and', 'a long', 'walk after', 'the rain.', ''], script: ['into the\nwoods', 'breathe\nslowly'], small: ['field notes / no. 12', 'specimen: fern', 'walk slowly'], pen: ['Field notes', 'found three acorns', 'and one quiet hour', 'near the lake.'] },
];

function tornPts(r: R, x: number, y: number, w: number, h: number, j: number, st: number, e: string) {
  const P: number[][] = [],
    J = (on: boolean) => (on ? (r() * 2 - 1) * j : 0);
  for (let i = 0; i <= w; i += st) P.push([x + i, y + J(e.includes('t'))]);
  for (let i = st; i <= h; i += st) P.push([x + w + J(e.includes('r')), y + i]);
  for (let i = w - st; i >= 0; i -= st) P.push([x + i, y + h + J(e.includes('b'))]);
  for (let i = h - st; i > 0; i -= st) P.push([x + J(e.includes('l')), y + i]);
  return P.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
}
function gridL(x: number, y: number, w: number, h: number, c: string) {
  let s = `<g stroke="${c}" stroke-width=".45">`;
  for (let i = x + 7; i < x + w - 2; i += 7) s += `<line x1="${i}" y1="${y + 2}" x2="${i}" y2="${y + h - 2}"/>`;
  for (let i = y + 7; i < y + h - 2; i += 7) s += `<line x1="${x + 2}" y1="${i}" x2="${x + w - 2}" y2="${i}"/>`;
  return s + '</g>';
}
function ruleL(x: number, y: number, w: number, h: number, c: string, m?: string) {
  let s = `<g stroke="${c}" stroke-width=".5">`;
  for (let i = y + 14; i < y + h - 3; i += 9) s += `<line x1="${x + 3}" y1="${i}" x2="${x + w - 3}" y2="${i}"/>`;
  s += '</g>';
  if (m) s += `<line x1="${x + 14}" y1="${y + 2}" x2="${x + 14}" y2="${y + h - 2}" stroke="${m}" stroke-width=".6"/>`;
  return s;
}
function dotsL(x: number, y: number, w: number, h: number, c: string) {
  let s = `<g fill="${c}">`;
  for (let yy = y + 8, row = 0; yy < y + h - 4; yy += 12, row++) for (let xx = x + 6 + (row % 2) * 6; xx < x + w - 4; xx += 12) s += `<circle cx="${xx}" cy="${yy}" r="3.1"/>`;
  return s + '</g>';
}
interface PO { rot?: number; jag?: number; e?: string; op?: number; fiber?: boolean; grid?: string; lines?: string; margin?: string; dots?: string; inner?: string }
function paper(r: R, x: number, y: number, w: number, h: number, fill: string, o: PO = {}) {
  const j = o.jag != null ? o.jag : 2,
    e = o.e || 'tblr';
  let s = `<g transform="rotate(${o.rot || 0} ${x + w / 2} ${y + h / 2})"${o.op != null ? ` opacity="${o.op}"` : ''}>`;
  if (o.fiber) s += `<polygon points="${tornPts(r, x - 1.3, y - 1.3, w + 2.6, h + 2.6, j + 0.9, 5, e)}" fill="#faf6ee"/>`;
  s += `<polygon points="${tornPts(r, x, y, w, h, j, 6, e)}" fill="${fill}"/>`;
  if (o.grid) s += gridL(x, y, w, h, o.grid);
  if (o.lines) s += ruleL(x, y, w, h, o.lines, o.margin);
  if (o.dots) s += dotsL(x, y, w, h, o.dots);
  if (o.inner) s += o.inner;
  return s + '</g>';
}
interface TO { size?: number; lh?: number; font?: string; color?: string; anchor?: string; ls?: number; rot?: number; weight?: number }
function txt(x: number, y: number, lines: string[], o: TO = {}) {
  const sz = o.size || 9,
    lh = o.lh || sz * 1.3;
  return `<text x="${x}" y="${y}" font-family="${o.font || TYPEF}" font-size="${sz}" fill="${o.color || '#2a2520'}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}>${lines.map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${l}</tspan>`).join('')}</text>`;
}
function photo(r: R, x: number, y: number, w: number, h: number, kind: string, t: PetTheme, o: { border?: number; bottom?: number; rot?: number } = {}) {
  const b = o.border || 0,
    [D, M, L] = t.tone,
    ix = x + b,
    iy = y + b,
    iw = w - 2 * b,
    ih = h - 2 * b - (o.bottom || 0),
    B = iy + ih,
    Rr = ix + iw,
    f = (n: number) => n.toFixed(1);
  let s = `<g transform="rotate(${o.rot || 0} ${x + w / 2} ${y + h / 2})">`;
  if (b) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f7f4ee"/>`;
  s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="url(#psky-${t.id})"/>`;
  if (kind === 'mountains')
    s += `<polygon points="${ix},${f(B - ih * 0.35)} ${f(ix + iw * 0.25)},${f(iy + ih * 0.3)} ${f(ix + iw * 0.45)},${f(B - ih * 0.45)} ${f(ix + iw * 0.72)},${f(iy + ih * 0.18)} ${Rr},${f(B - ih * 0.42)} ${Rr},${B} ${ix},${B}" fill="${M}"/><polygon points="${ix},${f(B - ih * 0.18)} ${f(ix + iw * 0.3)},${f(B - ih * 0.34)} ${f(ix + iw * 0.6)},${f(B - ih * 0.14)} ${Rr},${f(B - ih * 0.3)} ${Rr},${B} ${ix},${B}" fill="${D}"/><polygon points="${f(ix + iw * 0.66)},${f(iy + ih * 0.26)} ${f(ix + iw * 0.72)},${f(iy + ih * 0.18)} ${f(ix + iw * 0.78)},${f(iy + ih * 0.27)}" fill="${L}" opacity=".8"/>`;
  else if (kind === 'sea') {
    s += `<circle cx="${f(ix + iw * 0.68)}" cy="${f(iy + ih * 0.36)}" r="${f(ih * 0.11)}" fill="${L}"/><rect x="${ix}" y="${f(iy + ih * 0.56)}" width="${iw}" height="${f(ih * 0.44)}" fill="${M}"/>`;
    for (let k = 0; k < 6; k++) {
      const yy = iy + ih * (0.62 + k * 0.06),
        x1 = ix + iw * (0.15 + r() * 0.3);
      s += `<line x1="${f(x1)}" y1="${f(yy)}" x2="${f(Math.min(Rr - 2, x1 + iw * (0.2 + r() * 0.3)))}" y2="${f(yy)}" stroke="${L}" stroke-width=".8" opacity=".5"/>`;
    }
    s += `<rect x="${ix}" y="${f(B - ih * 0.12)}" width="${iw}" height="${f(ih * 0.12)}" fill="${D}" opacity=".7"/>`;
  } else if (kind === 'forest') {
    s += `<rect x="${ix}" y="${f(B - ih * 0.16)}" width="${iw}" height="${f(ih * 0.16)}" fill="${D}"/>`;
    for (let k = 0; k < 13; k++) {
      const tx = ix + 3 + r() * (iw - 6),
        hw = Math.min(iw * 0.07, tx - ix, Rr - tx),
        th = ih * (0.3 + r() * 0.42);
      s += `<polygon points="${f(tx)},${f(B - th)} ${f(tx + hw)},${f(B - ih * 0.1)} ${f(tx - hw)},${f(B - ih * 0.1)}" fill="${k % 3 ? D : M}"/>`;
    }
  } else if (kind === 'field')
    s += `<polygon points="${ix},${f(B - ih * 0.38)} ${f(ix + iw * 0.5)},${f(B - ih * 0.45)} ${Rr},${f(B - ih * 0.36)} ${Rr},${B} ${ix},${B}" fill="${M}"/><polygon points="${ix},${f(B - ih * 0.2)} ${Rr},${f(B - ih * 0.26)} ${Rr},${B} ${ix},${B}" fill="${D}"/><rect x="${f(ix + iw * 0.62)}" y="${f(B - ih * 0.52)}" width="${f(iw * 0.12)}" height="${f(ih * 0.1)}" fill="${D}"/><polygon points="${f(ix + iw * 0.6)},${f(B - ih * 0.52)} ${f(ix + iw * 0.68)},${f(B - ih * 0.6)} ${f(ix + iw * 0.76)},${f(B - ih * 0.52)}" fill="${D}"/>`;
  else if (kind === 'moon') {
    s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${D}" opacity=".88"/><circle cx="${f(ix + iw * 0.35)}" cy="${f(iy + ih * 0.35)}" r="${f(ih * 0.13)}" fill="${L}"/>`;
    for (let k = 0; k < 9; k++) s += `<circle cx="${f(ix + 3 + r() * (iw - 6))}" cy="${f(iy + 3 + r() * (ih * 0.7))}" r=".7" fill="${L}"/>`;
    s += `<polygon points="${ix},${B} ${ix},${f(B - ih * 0.18)} ${f(ix + iw * 0.4)},${f(B - ih * 0.28)} ${Rr},${f(B - ih * 0.14)} ${Rr},${B}" fill="#000" opacity=".5"/>`;
  } else if (kind === 'palm') {
    s += `<rect x="${ix}" y="${f(iy + ih * 0.62)}" width="${iw}" height="${f(ih * 0.38)}" fill="${M}"/><path d="M${f(ix + iw * 0.3)} ${B} Q${f(ix + iw * 0.36)} ${f(iy + ih * 0.55)} ${f(ix + iw * 0.5)} ${f(iy + ih * 0.26)}" stroke="${D}" stroke-width="2.4" fill="none"/>`;
    [[-0.22, 0.02], [-0.12, 0.16], [0.16, 0.12], [0.2, -0.02], [0.02, -0.12]].forEach(([dx, dy]) => {
      s += `<path d="M${f(ix + iw * 0.5)} ${f(iy + ih * 0.26)} q${f(iw * dx * 0.6)} ${f(ih * (dy - 0.08))} ${f(iw * dx)} ${f(ih * (dy + 0.06))}" stroke="${D}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    });
  }
  s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#000" filter="url(#pgrain)" opacity=".22"/>`;
  return s + '</g>';
}
const brad = (cx: number, cy: number, rr: number, gold: boolean) =>
  `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="url(#${gold ? 'pgold' : 'psilver'})"/><circle cx="${(cx - rr * 0.3).toFixed(1)}" cy="${(cy - rr * 0.35).toFixed(1)}" r="${(rr * 0.28).toFixed(1)}" fill="#fff" opacity=".6"/>`;
const tapeBit = (x: number, y: number, w: number, h: number, c: string, rot: number, op = 0.6) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" opacity="${op}" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"/>`;
const sparkle = (cx: number, cy: number, s: number, c: string) =>
  `<path d="M${cx} ${cy - s}Q${cx + s * 0.16} ${cy - s * 0.16} ${cx + s} ${cy}Q${cx + s * 0.16} ${cy + s * 0.16} ${cx} ${cy + s}Q${cx - s * 0.16} ${cy + s * 0.16} ${cx - s} ${cy}Q${cx - s * 0.16} ${cy - s * 0.16} ${cx} ${cy - s}Z" fill="${c}"/>`;
function starO(cx: number, cy: number, s: number, c: string) {
  let d = '';
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5,
      rr = i % 2 ? s * 0.42 : s;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
  }
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="1.3" stroke-linejoin="round"/>`;
}
function scribble(r: R, x: number, y: number, w: number, h: number, c: string) {
  let d = `M${x} ${y + h / 2}`;
  for (let i = 1; i <= 16; i++) d += ` L${(x + (i * w) / 16 + (r() - 0.5) * 3).toFixed(1)} ${(i % 2 ? y + r() * h * 0.3 : y + h - r() * h * 0.3).toFixed(1)}`;
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`;
}
const postmark = (cx: number, cy: number, rr: number, c: string, lab: string) =>
  `<g fill="none" stroke="${c}" opacity=".55"><circle cx="${cx}" cy="${cy}" r="${rr}" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="${rr - 4}" stroke-width=".6"/>${[0, 1, 2, 3].map((i) => `<path d="M${cx + rr + 2} ${cy - 6 + i * 4} q5 -3 10 0 t10 0" stroke-width=".9"/>`).join('')}</g>` +
  txt(cx, cy + 3, [lab], { size: 7, color: c, anchor: 'middle' }).replace('<text', '<text opacity=".6"');

const RECIPES: ((t: PetTheme, r: R) => string)[] = [
  (t, r) =>
    paper(r, 14, 20, 112, 150, t.p[0], { rot: -4, fiber: true }) + paper(r, 62, 34, 100, 158, '#fbfbf7', { rot: 3, grid: t.gridc, jag: 1.6 }) + tapeBit(30, 10, 46, 13, t.p[2], -9, 0.55) +
    paper(r, 22, 74, 104, 92, t.p[1], { rot: -1, jag: 1.1, inner: txt(30, 92, t.type.slice(0, 6), { size: 9.6, lh: 12.4, color: t.ink }) }) + brad(118, 52, 6.5, true) + sparkle(98, 64, 9, t.ink) + starO(148, 184, 13, t.ink),
  (t, r) =>
    paper(r, 20, 40, 138, 160, t.p[2], { rot: 4, fiber: true, op: 0.95 }) + tapeBit(22, 18, 40, 12, t.accent, -28, 0.5) + photo(r, 30, 22, 118, 112, t.photos[0], t, { border: 7, rot: -3 }) + tapeBit(124, 16, 40, 12, t.accent, 24, 0.5) +
    paper(r, 44, 142, 112, 44, '#f5f0e6', { rot: 1, jag: 1, lines: 'rgba(0,0,0,.12)', inner: txt(50, 157, [t.small[0]], { size: 7.2, color: t.ink }) + txt(50, 172, [t.small[1]], { size: 7.2, color: '#6b6156' }) }) +
    postmark(142, 132, 17, t.ink, 'POST') + `<rect x="14" y="176" width="32" height="18" fill="${t.ink}"/>` + txt(30, 189, ['18°'], { size: 10, color: '#f6f1e7', anchor: 'middle' }),
  (t, r) =>
    paper(r, 52, 16, 112, 186, t.p[0], { rot: 4, fiber: true }) + paper(r, 26, 36, 104, 170, t.p[1], { rot: -3, fiber: true }) + paper(r, 34, 72, 90, 110, t.p[2], { rot: -1, jag: 1.3, dots: t.accent }) +
    paper(r, 38, 28, 96, 40, '#f6f1e6', { rot: -2, jag: 0.8, lines: 'rgba(0,0,0,.14)', inner: txt(44, 40, [t.small[2]], { size: 6.6, color: t.ink }) }) + tapeBit(52, 20, 22, 10, t.tape2, -14, 0.8) + tapeBit(78, 12, 10, 20, t.tape2, 8, 0.7) +
    paper(r, 136, 108, 20, 86, '#ebe1d0', { jag: 0.6, inner: txt(143, 114, [t.small[1]], { size: 7, rot: 90, color: t.ink }) }),
  (t, r) =>
    paper(r, 18, 40, 118, 118, '#fbfbf7', { rot: -3, grid: t.gridc, jag: 1.2 }) + scribble(r, 22, 12, 44, 24, t.ink) + photo(r, 66, 86, 96, 66, t.photos[1], t, { rot: 2 }) + brad(124, 60, 6, true) +
    txt(26, 72, t.script[0].split('\n'), { font: SCRIPTF, size: 28, lh: 23, color: t.accent, rot: -8, weight: 700 }) +
    paper(r, 8, 176, 150, 15, '#f8f5ee', { jag: 0.5, inner: txt(14, 187, [t.small[0].toUpperCase()], { size: 6.6, ls: 0.6, color: t.ink }) }) + starO(156, 160, 13, t.ink) + sparkle(30, 162, 7, t.ink),
  (t, r) =>
    paper(r, 12, 30, 156, 128, '#fbfaf4', { rot: -1.5, jag: 0.9, lines: 'rgba(70,90,130,.25)', margin: 'rgba(190,60,60,.35)', inner: txt(30, 50, [t.pen[0]], { font: PENF, size: 11, color: t.ink }) + txt(32, 77, t.pen.slice(1), { font: PENF, size: 7.6, lh: 15, color: t.ink }) }) +
    photo(r, 112, 104, 50, 64, t.photos[2], t, { rot: 3 }) + paper(r, 98, 138, 15, 48, t.p[2], { jag: 0.4 }) + brad(34, 150, 7.5, false) + sparkle(150, 40, 6, t.accent),
  (t, r) =>
    photo(r, 18, 12, 118, 172, t.photos[0], t, { border: 8, bottom: 46, rot: -2 }) + txt(28, 150, t.type.filter(Boolean).slice(0, 4), { size: 6, lh: 7.6, color: '#6a6158', rot: -2 }) +
    txt(134, 118, t.script[1].split('\n'), { font: SCRIPTF, size: 16, lh: 15, color: t.ink, rot: 4 }) + brad(116, 26, 5.5, true) + scribble(r, 132, 182, 36, 10, t.ink) + tapeBit(6, 150, 28, 9, t.ink, -20, 0.85),
];
export const PET_COUNT = RECIPES.length;
const MCACHE: Record<string, string> = {};
export function motif(rid: string, i: number) {
  const k = rid + '-' + i;
  if (MCACHE[k]) return MCACHE[k];
  const t = PET.find((x) => x.id === rid) || PET[0];
  return (MCACHE[k] = `<svg viewBox="0 0 180 220" aria-hidden="true">${RECIPES[i % RECIPES.length](t, rng(hashStr(k)))}</svg>`);
}
/** Shared gradients and filters referenced by the motifs; injected once into the document. */
export function installPetDefs() {
  const d = document.createElement('div');
  d.setAttribute('aria-hidden', 'true');
  d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = `<svg width="0" height="0"><defs><radialGradient id="pgold" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff3c4"/><stop offset=".45" stop-color="#d9ad4f"/><stop offset="1" stop-color="#8a6420"/></radialGradient><radialGradient id="psilver" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b8bcc0"/><stop offset="1" stop-color="#6c7176"/></radialGradient>
  <filter id="pgrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".95" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.6 -.5"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  ${PET.map((t) => `<linearGradient id="psky-${t.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.sky[0]}"/><stop offset="1" stop-color="${t.sky[1]}"/></linearGradient>`).join('')}</defs></svg>`;
  document.body.appendChild(d);
}
