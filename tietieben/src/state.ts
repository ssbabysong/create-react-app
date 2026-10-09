import * as db from './store';
import { addDays, daysInMonth, pad, startOfWeek, today, ymd } from './dates';

export type View = 'year' | 'month' | 'week' | 'day';
export interface Item {
  id: number;
  type: 'sticker' | 'tape' | 'text' | 'photo' | 'collage';
  x: number; // centre, fraction of the 860px spread width
  y: number; // centre, fraction of the 608px page height
  w?: number;
  h?: number;
  rot: number;
  z: number;
  key?: string;
  color?: string;
  pat?: string;
  text?: string;
  font?: string;
  fs?: number;
  img?: string;
  roll?: string;
  idx?: number;
}
export interface Stroke {
  id: number;
  c: string;
  s: number;
  p: number[]; // flat x,y,pressure triples in spread px
}
export interface Spread {
  items: Item[];
  f: Record<string, any>;
  tpl?: { L: string; R: string };
  ink: Stroke[];
}
export interface Notebook {
  id: string;
  year: number;
  name: string;
  cover: string;
  created: number;
}
export interface Mine {
  id: string;
  cat: string;
  img?: string;
  key?: string;
}
export type Tool = 'hand' | 'pen' | 'eraser' | 'tape';

export const PW = 430,
  PH = 608,
  SPW = 860;

export const S = {
  notebooks: [] as Notebook[],
  nb: null as Notebook | null,
  view: 'day' as View,
  date: today(),
  page: 0,
  single: false,
  compact: false,
  overlay: false,
  spreads: new Map<string, Spread>(),
  mine: [] as Mine[],
  imgs: new Map<string, string>(),
  tool: 'hand' as Tool,
  pen: { c: '#3a3127', s: 3 },
  tape: { pat: 'grid', color: '#9cc5a1', h: 24 },
  sel: null as number | null,
  flipping: false,
  drawerOpen: true,
  prefs: { sound: true, dtab: 'pet', pet: 'letters', roll: 'daily', mcat: '全部', lastNb: '' },
};

/** Late-bound hooks so modules can call each other without import cycles at load time. */
export const H = {
  render: () => {},
  renderItems: () => {},
  renderToolbar: () => {},
  renderInk: () => {},
  renderDrawer: () => {},
  fit: (_instant?: boolean) => {},
  toast: (_m: string) => {},
};

let uid = Date.now() % 1e9;
export const nextId = () => ++uid;

/* ---------- spread keys and navigation ---------- */
export const keyOf = (v: View = S.view, d: Date = S.date) =>
  v === 'year' ? 'y' : v === 'month' ? `m-${pad(d.getMonth() + 1)}` : v === 'week' ? `w-${ymd(startOfWeek(d))}` : `d-${ymd(d)}`;
export const curKey = () => keyOf();
const DEPTH: Record<View, number> = { year: 0, month: 1, week: 2, day: 3 };

export function inYear(v: View, d: Date) {
  const y = S.nb ? S.nb.year : d.getFullYear();
  if (v === 'week') {
    const m = startOfWeek(d);
    return m.getFullYear() === y || addDays(m, 6).getFullYear() === y;
  }
  return d.getFullYear() === y;
}
export function stepDate(v: View, d: Date, dir: number): Date | null {
  if (v === 'year') return null;
  let n: Date;
  if (v === 'day') n = addDays(d, dir);
  else if (v === 'week') n = addDays(d, dir * 7);
  else {
    const m = d.getMonth() + dir;
    n = new Date(d.getFullYear(), m, Math.min(d.getDate(), daysInMonth(d.getFullYear(), ((m % 12) + 12) % 12)));
  }
  return inYear(v, n) ? n : null;
}
/** +1 when (v2,d2) comes after (v1,d1) in the notebook. */
export function direction(v1: View, d1: Date, v2: View, d2: Date) {
  const unit = (v: View, d: Date) =>
    v === 'year' ? -1 : v === 'month' ? new Date(d.getFullYear(), d.getMonth(), 1).getTime() : v === 'week' ? startOfWeek(d).getTime() : d.getTime();
  const a = unit(v1, d1),
    b = unit(v2, d2);
  if (v1 === v2) return b >= a ? 1 : -1;
  if (a === b || v1 === 'year' || v2 === 'year') return DEPTH[v2] > DEPTH[v1] ? 1 : -1;
  return b > a ? 1 : -1;
}

/* ---------- persistence ---------- */
const spKey = (k: string) => `sp:${S.nb!.id}:${k}`;
export async function loadSpread(k: string): Promise<Spread> {
  if (S.spreads.has(k)) return S.spreads.get(k)!;
  const v = (await db.get<Spread>(spKey(k))) || { items: [], f: {}, ink: [] };
  v.items = v.items || [];
  v.f = v.f || {};
  v.ink = v.ink || [];
  S.spreads.set(k, v);
  return v;
}
export const spread = (k = curKey()) => {
  if (!S.spreads.has(k)) S.spreads.set(k, { items: [], f: {}, ink: [] });
  return S.spreads.get(k)!;
};
const timers = new Map<string, number>();
export function saveSpread(k = curKey()) {
  const nb = S.nb;
  if (!nb) return;
  clearTimeout(timers.get(k));
  timers.set(
    k,
    window.setTimeout(() => {
      const sp = S.spreads.get(k);
      if (sp) db.set(`sp:${nb.id}:${k}`, sp);
    }, 250)
  );
}
let prefTimer = 0;
export function savePrefs() {
  clearTimeout(prefTimer);
  prefTimer = window.setTimeout(() => db.set('prefs', S.prefs), 200);
}
export const saveNotebooks = () => db.set('notebooks', S.notebooks);
export const saveMine = () => db.set('mine', S.mine);

/* ---------- undo / redo per spread ---------- */
const hist = new Map<string, string[]>(),
  fut = new Map<string, string[]>();
const snap = (sp: Spread) => JSON.stringify({ items: sp.items, ink: sp.ink });
export function commit() {
  const k = curKey();
  const h = hist.get(k) || [];
  h.push(snap(spread()));
  if (h.length > 80) h.shift();
  hist.set(k, h);
  fut.set(k, []);
}
export function dropLastCommitIfUnchanged() {
  const h = hist.get(curKey());
  if (h && h.length && h[h.length - 1] === snap(spread())) h.pop();
}
export const canUndo = () => !!(hist.get(curKey()) || []).length;
export const canRedo = () => !!(fut.get(curKey()) || []).length;
function restore(from: Map<string, string[]>, to: Map<string, string[]>) {
  const k = curKey(),
    a = from.get(k);
  if (!a || !a.length) return false;
  const sp = spread();
  (to.get(k) || to.set(k, []).get(k)!).push(snap(sp));
  const v = JSON.parse(a.pop()!);
  sp.items = v.items;
  sp.ink = v.ink;
  saveSpread(k);
  return true;
}
export const undo = () => restore(hist, fut);
export const redo = () => restore(fut, hist);
