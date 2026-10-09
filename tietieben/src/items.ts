// Stickers, tape, text and ink on the spread, and every pointer gesture on the pages.
import { getStroke } from 'perfect-freehand';
import { ST, dateStamp, esc, svg } from './data/art';
import { motif } from './data/pet';
import { MONTH_SHORT, pad } from './dates';
import { SFX } from './sound';
import { H, type Item, PH, S, SPW, type Stroke, commit, dropLastCommitIfUnchanged, nextId, saveSpread, spread } from './state';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- rendering ---------- */
export function art(it: Partial<Item>, d: Date = S.date) {
  if (it.type === 'sticker') {
    const c = it.color || '#e2675e';
    const a = it.key === 'date' ? dateStamp(c, MONTH_SHORT[d.getMonth()], pad(d.getDate()), String(d.getFullYear())) : (ST[it.key!] || ST.star)(c);
    return `<div class="die">${svg(a)}</div>`;
  }
  if (it.type === 'tape') return `<span class="tape tp-${it.pat}" style="--c:${it.color};width:100%;height:${Math.round(it.h || 24)}px"></span>`;
  if (it.type === 'photo') {
    const src = S.imgs.get(it.img!);
    return src ? `<img class="die" src="${src}" alt="照片贴纸" draggable="false">` : `<div class="missing">图片加载中</div>`;
  }
  if (it.type === 'collage') return `<div class="pet">${motif(it.roll!, it.idx!)}</div>`;
  return `<div class="txt" style="font-family:${it.font};color:${it.color};font-size:${it.fs}px">${esc(it.text)}</div>`;
}
const inner = (it: Item) => `<div class="inr">${art(it)}</div>`;
const HDL = '<span class="hdl rot" title="旋转"></span><span class="hdl scl" title="缩放"></span>';
export function place(el: HTMLElement | null, it: Item) {
  if (!el) return;
  el.style.left = it.x * SPW + 'px';
  el.style.top = it.y * PH + 'px';
  if (it.type !== 'text') el.style.width = it.w + 'px';
  el.style.transform = `translate(-50%,-50%) rotate(${it.rot}deg)`;
  el.style.zIndex = String(it.z);
}
export const staticItemsHTML = (items: Item[], d: Date) =>
  items.map((it) => `<div class="sitem" style="left:${it.x * 100}%;top:${it.y * 100}%;${it.type !== 'text' ? `width:${it.w}px;` : ''}transform:translate(-50%,-50%) rotate(${it.rot}deg);z-index:${it.z}"><div class="inr">${art(it, d)}</div></div>`).join('');
const itemsEl = () => $('#items');
export const get = (id: number | null) => spread().items.find((i) => i.id === id);
export const elOf = (id: number) => itemsEl().querySelector<HTMLElement>(`[data-id="${id}"]`);
export function renderItems() {
  const box = itemsEl();
  box.innerHTML = '';
  spread().items.forEach((it) => {
    const el = document.createElement('div');
    el.className = 'item' + (it.id === S.sel ? ' sel' : '');
    el.dataset.id = String(it.id);
    el.innerHTML = inner(it) + HDL;
    place(el, it);
    box.appendChild(el);
  });
}
export function refresh(it: Item) {
  const el = elOf(it.id);
  if (el) {
    el.innerHTML = inner(it) + HDL;
    place(el, it);
  }
}
export function select(id: number | null) {
  S.sel = id;
  itemsEl()
    .querySelectorAll<HTMLElement>('.item')
    .forEach((n) => n.classList.toggle('sel', +n.dataset.id! === id));
  H.renderToolbar();
}
function landFx(it: Item) {
  const el = elOf(it.id);
  if (!el) return;
  el.classList.add('land');
  setTimeout(() => el.classList.remove('land'), 520);
  if (RM) return;
  const p = document.createElement('span');
  p.className = 'pulse';
  p.style.left = it.x * SPW + 'px';
  p.style.top = it.y * PH + 'px';
  itemsEl().appendChild(p);
  setTimeout(() => p.remove(), 620);
}
export function pushItem(o: Partial<Item>, fx: number, fy: number) {
  commit();
  const sp = spread();
  const it = { rot: 0, ...o, id: nextId(), x: fx, y: fy, z: Math.max(0, ...sp.items.map((i) => i.z)) + 1 } as Item;
  sp.items.push(it);
  saveSpread();
  renderItems();
  select(it.id);
  landFx(it);
  SFX.press();
  H.renderToolbar();
  return it;
}
export function defaultSpot(): [number, number] {
  const n = spread().items.length;
  const fx = S.single ? (S.page ? 0.75 : 0.25) : n % 2 ? 0.72 : 0.28;
  return [fx + (Math.random() - 0.5) * 0.05, 0.42 + (Math.random() - 0.5) * 0.1];
}
export function peelAway(els: (HTMLElement | null)[], cb: () => void) {
  const list = els.filter(Boolean) as HTMLElement[];
  if (RM || !list.length) return cb();
  list.forEach((el, i) => {
    el.classList.remove('sel');
    el.style.setProperty('--d', i * 40 + 'ms');
    el.classList.add('off');
  });
  setTimeout(cb, 360 + list.length * 40);
}

/* ---------- ink ---------- */
const pathCache = new Map<number, string>();
function strokePath(s: Stroke) {
  if (pathCache.has(s.id)) return pathCache.get(s.id)!;
  const pts: number[][] = [];
  for (let i = 0; i < s.p.length; i += 3) pts.push([s.p[i], s.p[i + 1], s.p[i + 2]]);
  const d = outline(getStroke(pts, { size: s.s * 2.2, thinning: 0.6, smoothing: 0.55, streamline: 0.45, simulatePressure: pts.every((p) => p[2] === 0.5), last: true }));
  pathCache.set(s.id, d);
  return d;
}
function outline(pts: number[][]) {
  if (!pts.length) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}Q`;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i],
      [x1, y1] = pts[(i + 1) % pts.length];
    d += `${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} `;
  }
  return d + 'Z';
}
export const inkSVG = (strokes: Stroke[], cls: string) =>
  `<svg class="${cls}" viewBox="0 0 ${SPW} ${PH}" preserveAspectRatio="none">${strokes.map((s) => `<path d="${strokePath(s)}" fill="${s.c}"/>`).join('')}</svg>`;
export function renderInk() {
  $('#ink').innerHTML = spread()
    .ink.map((s) => `<path data-s="${s.id}" d="${strokePath(s)}" fill="${s.c}"/>`)
    .join('');
}

/* ---------- pointer gestures on the pages ---------- */
const ptrs = new Map<number, { x: number; y: number }>();
let act: any = null;
const isField = (t: HTMLElement) => !!t.closest('input,textarea,[data-t],[data-v],[data-c],.foot,.corner');
export function wirePages() {
  const pages = $('#pages');
  const toPx = (e: PointerEvent, r: DOMRect) => [((e.clientX - r.left) / r.width) * SPW, ((e.clientY - r.top) / r.height) * PH];
  pages.addEventListener('pointerdown', (e) => {
    if (S.flipping) return;
    const t = e.target as HTMLElement;
    if (t.closest('.foot') || t.closest('.corner')) return;
    const r = pages.getBoundingClientRect();
    const penInput = S.tool === 'pen' || (e.pointerType === 'pen' && S.tool === 'hand' && !isField(t) && !t.closest('.item'));
    if (penInput || S.tool === 'eraser') {
      e.preventDefault();
      pages.setPointerCapture(e.pointerId);
      commit();
      const [x, y] = toPx(e, r);
      if (S.tool === 'eraser') {
        act = { mode: 'erase', r, hit: false };
        eraseAt(x, y);
        return;
      }
      const s: Stroke = { id: nextId(), c: S.pen.c, s: S.pen.s, p: [x, y, e.pointerType === 'pen' ? e.pressure || 0.5 : 0.5] };
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', s.c);
      $('#ink').appendChild(path);
      act = { mode: 'ink', r, s, path, pen: e.pointerType === 'pen' };
      return;
    }
    if (S.tool === 'tape' && !t.classList.contains('hdl')) {
      const [x, y] = toPx(e, r);
      commit();
      const sp = spread();
      const it: Item = { id: nextId(), type: 'tape', pat: S.tape.pat, color: S.tape.color, h: S.tape.h, x: x / SPW, y: y / PH, w: 8, rot: 0, z: Math.max(0, ...sp.items.map((i) => i.z)) + 1 };
      sp.items.push(it);
      S.sel = null;
      renderItems();
      act = { mode: 'lay', it, r, sx: x, sy: y };
      pages.setPointerCapture(e.pointerId);
      e.preventDefault();
      SFX.tick();
      return;
    }
    if (isField(t)) {
      if (S.sel != null) select(null);
      return;
    }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const el = t.closest<HTMLElement>('.item');
    if (ptrs.size === 2 && S.sel != null) {
      const it = get(S.sel)!,
        [a, b] = [...ptrs.values()];
      act = { mode: 'pinch', it, r, d0: Math.hypot(b.x - a.x, b.y - a.y), a0: Math.atan2(b.y - a.y, b.x - a.x), w0: it.w, fs0: it.fs, rot0: it.rot };
      pages.setPointerCapture(e.pointerId);
      return;
    }
    if (!el) {
      (document.activeElement as HTMLElement)?.blur?.();
      select(null);
      act = null;
      return;
    }
    const it = get(+el.dataset.id!)!;
    if (S.sel !== it.id) select(it.id);
    commit();
    act = { it, r, moved: false };
    const cx = r.left + it.x * r.width,
      cy = r.top + it.y * r.height;
    if (t.classList.contains('rot')) act.mode = 'rot';
    else if (t.classList.contains('scl')) {
      act.mode = 'scl';
      act.d0 = Math.hypot(e.clientX - cx, e.clientY - cy);
      act.w0 = it.w;
      act.fs0 = it.fs;
    } else {
      act.mode = 'move';
      act.dx = (e.clientX - r.left) / r.width - it.x;
      act.dy = (e.clientY - r.top) / r.height - it.y;
      act.x0 = e.clientX;
      act.y0 = e.clientY;
    }
    pages.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  pages.addEventListener('pointermove', (e) => {
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!act) return;
    const { r } = act;
    if (act.mode === 'ink') {
      const evs = (e as any).getCoalescedEvents ? (e as any).getCoalescedEvents() : [e];
      for (const ev of evs) {
        const [x, y] = toPx(ev, r);
        act.s.p.push(x, y, act.pen ? ev.pressure || 0.5 : 0.5);
      }
      pathCache.delete(act.s.id);
      act.path.setAttribute('d', strokePath(act.s));
      pathCache.delete(act.s.id);
      return;
    }
    if (act.mode === 'erase') {
      const [x, y] = toPx(e, r);
      eraseAt(x, y);
      return;
    }
    const it: Item = act.it;
    const cx = r.left + it.x * r.width,
      cy = r.top + it.y * r.height;
    if (act.mode === 'lay') {
      const [x, y] = toPx(e, r),
        dx = x - act.sx,
        dy = y - act.sy;
      it.w = Math.max(8, Math.round(Math.hypot(dx, dy)));
      it.rot = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
      it.x = (act.sx + x) / 2 / SPW;
      it.y = (act.sy + y) / 2 / PH;
      refresh(it);
      return;
    }
    if (act.mode === 'move') {
      if (!act.moved && Math.hypot(e.clientX - act.x0, e.clientY - act.y0) > 3) {
        act.moved = true;
        elOf(it.id)?.classList.add('lifting');
      }
      it.x = Math.min(1.02, Math.max(-0.02, (e.clientX - r.left) / r.width - act.dx));
      it.y = Math.min(1.03, Math.max(-0.03, (e.clientY - r.top) / r.height - act.dy));
    } else if (act.mode === 'rot') {
      let a = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
      if (a > 180) a -= 360;
      it.rot = Math.round(a);
    } else if (act.mode === 'scl' || (act.mode === 'pinch' && ptrs.size === 2)) {
      let k: number;
      if (act.mode === 'scl') k = Math.hypot(e.clientX - cx, e.clientY - cy) / act.d0;
      else {
        const [a, b] = [...ptrs.values()];
        k = Math.hypot(b.x - a.x, b.y - a.y) / act.d0;
        it.rot = Math.round(act.rot0 + ((Math.atan2(b.y - a.y, b.x - a.x) - act.a0) * 180) / Math.PI);
      }
      if (it.type === 'text') it.fs = Math.round(Math.min(96, Math.max(10, act.fs0 * k)));
      else it.w = Math.round(Math.min(560, Math.max(16, act.w0 * k)));
      refresh(it);
      H.renderToolbar();
      return;
    }
    place(elOf(it.id), it);
  });
  const end = (e: PointerEvent) => {
    ptrs.delete(e.pointerId);
    if (!act) return;
    const a = act;
    act = null;
    if (a.mode === 'ink') {
      if (a.s.p.length >= 6 || true) {
        spread().ink.push(a.s);
        renderInk();
        saveSpread();
        SFX.pen();
      }
      H.renderToolbar();
      return;
    }
    if (a.mode === 'erase') {
      if (!a.hit) dropLastCommitIfUnchanged();
      saveSpread();
      H.renderToolbar();
      return;
    }
    if (a.mode === 'lay') {
      if (a.it.w < 14) {
        a.it.w = 150;
        a.it.rot = Math.round((Math.random() - 0.5) * 10);
      }
      refresh(a.it);
      const el = elOf(a.it.id);
      if (el) {
        el.classList.add('torn');
        setTimeout(() => el.classList.remove('torn'), 400);
      }
      SFX.tear();
      saveSpread();
      H.renderToolbar();
      return;
    }
    if (a.mode === 'move' && a.moved) {
      const el = elOf(a.it.id);
      if (el) {
        el.classList.remove('lifting');
        el.classList.add('settle');
        setTimeout(() => el.classList.remove('settle'), 320);
      }
      SFX.press();
    }
    dropLastCommitIfUnchanged();
    saveSpread();
    H.renderToolbar();
  };
  pages.addEventListener('pointerup', end);
  pages.addEventListener('pointercancel', end);
}
function eraseAt(x: number, y: number) {
  const sp = spread(),
    R2 = 14 * 14;
  const before = sp.ink.length;
  sp.ink = sp.ink.filter((s) => {
    for (let i = 0; i < s.p.length; i += 3) {
      const dx = s.p[i] - x,
        dy = s.p[i + 1] - y;
      if (dx * dx + dy * dy < R2) return false;
    }
    return true;
  });
  if (sp.ink.length !== before) {
    if (act) act.hit = true;
    renderInk();
  }
}
