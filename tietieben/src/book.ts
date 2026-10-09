// The notebook: layout, spread rendering, navigation and the page-turn engine.
import { ic } from './data/art';
import { MONTH_EN, WD_CN, dayOfYear, isoWeek, today, wdIndex } from './dates';
import { SFX } from './sound';
import { H, PH, PW, S, SPW, type View, canRedo, canUndo, curKey, direction, inYear, keyOf, loadSpread, savePrefs, saveSpread, spread, stepDate } from './state';
import { DAY_TPL, DEFAULT_TPL, VIEW_NAME, pageHTML, updateSums } from './templates';
import { inkSVG, staticItemsHTML } from './items';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
export { RM };
const RINGY = [96, 136, 176, 432, 472, 512];
const holes = (side: string) => RINGY.map((y) => `<span class="hole" style="top:${y - 5}px;${side === 'L' ? 'right:12px' : 'left:12px'}"></span>`).join('');

export function buildBook() {
  $('#bookRoot').innerHTML = `<div class="bookview" id="bookview"><div class="book" id="book"><div class="tabs" id="tabs"></div><div class="pages" id="pages">
    <div class="page L" id="pageL"><div class="gut"></div>${holes('L')}<div class="pg" id="pgL"></div></div>
    <div class="page R" id="pageR"><div class="gut"></div>${holes('R')}<div class="pg" id="pgR"></div></div>
    <svg class="ink" id="ink" viewBox="0 0 ${SPW} ${PH}" preserveAspectRatio="none"></svg>
    <div class="rings">${RINGY.map((y) => `<div class="ring" style="top:${y - 7}px"></div>`).join('')}</div>
    <div class="items" id="items"></div>
    <div class="foot L" id="footL"></div><div class="foot R" id="footR"></div>
    <div class="corner cL" id="cornerL" title="按住页角往回翻"></div><div class="corner cR" id="cornerR" title="按住页角往后翻"></div>
  </div></div></div>`;
  wire();
}

/* ---------- layout ---------- */
export function fit(instant = false) {
  const stage = $('#stage'),
    book = $('#book'),
    view = $('#bookview');
  if (!stage || !book) return;
  S.compact = window.innerWidth < 760 || window.innerHeight < 520;
  document.body.classList.toggle('compact', S.compact);
  S.overlay = !S.compact && window.innerWidth < 1000 && window.innerHeight > window.innerWidth;
  document.body.classList.toggle('overlay', S.overlay);
  const tbSpace = S.compact ? 74 : 92;
  const sw = stage.clientWidth - (S.compact ? 16 : 40),
    sh = stage.clientHeight - tbSpace - (S.compact ? 6 : 16);
  const kS = Math.min(sw / 892, sh / 612),
    k1 = Math.min(sw / 458, sh / 612);
  const wasSingle = S.single;
  S.single = !(kS >= k1 * 0.7);
  if (!S.single) S.page = 0;
  const k = Math.max(0.2, Math.min(S.single ? k1 : kS, 1.6));
  if (instant) book.style.transition = 'none';
  if (!S.single) {
    view.style.width = 892 * k + 'px';
    view.style.height = 612 * k + 'px';
    book.style.transform = `scale(${k})`;
  } else {
    view.style.width = 458 * k + 'px';
    view.style.height = 612 * k + 'px';
    book.style.transform = `scale(${k}) translateX(${S.page ? -432 : 0}px)`;
  }
  view.style.marginBottom = tbSpace - (S.compact ? 10 : 30) + 'px';
  if (instant) {
    void book.offsetWidth;
    book.style.transition = '';
  }
  document.body.classList.toggle('single', S.single);
  const cL = $('#cornerL'),
    cR = $('#cornerR');
  if (S.single) {
    cL.style.left = S.page * PW + 'px';
    cR.style.left = S.page * PW + PW - 70 + 'px';
  } else {
    cL.style.left = '0px';
    cR.style.left = SPW - 70 + 'px';
  }
  if (wasSingle !== S.single) updateNavState();
}

/* ---------- rendering ---------- */
export function crumb() {
  const d = S.date;
  if (S.view === 'day') return `${d.getMonth() + 1}月${d.getDate()}日 周${WD_CN[wdIndex(d)]}`;
  if (S.view === 'week') return `第 ${isoWeek(d).week} 周`;
  if (S.view === 'month') return `${d.getMonth() + 1} 月 · ${MONTH_EN[d.getMonth()]}`;
  return `${d.getFullYear()} 年`;
}
function pageNo(side: 'L' | 'R') {
  const d = S.date,
    base = S.view === 'year' ? 0 : S.view === 'month' ? 2 + d.getMonth() * 2 : S.view === 'week' ? 26 + isoWeek(d).week * 2 : 132 + dayOfYear(d) * 2;
  return base + (side === 'L' ? 1 : 2);
}
export function renderSpread() {
  const sp = spread(),
    v = S.view;
  $('#pgL').innerHTML = pageHTML(v, S.date, 'L', sp);
  $('#pgR').innerHTML = pageHTML(v, S.date, 'R', sp);
  const lab = (s: 'L' | 'R') =>
    v === 'day' ? `<button type="button" data-tplside="${s}">${DAY_TPL[(sp.tpl || DEFAULT_TPL)[s]].n} ▾</button>` : `<span class="fixed">${VIEW_NAME[v]}</span>`;
  $('#footL').innerHTML = `<span>p.${pageNo('L')}</span>${lab('L')}`;
  $('#footR').innerHTML = `<span>p.${pageNo('R')}</span>${lab('R')}`;
  $('#vseg').innerHTML = (
    [
      ['year', '年'],
      ['month', '月'],
      ['week', '周'],
      ['day', '日'],
    ] as [View, string][]
  )
    .map(([k, n]) => `<button type="button" data-v="${k}" aria-pressed="${k === v}">${n}</button>`)
    .join('');
  $('#tabs').innerHTML =
    `<button type="button" data-tab="y" aria-pressed="${v === 'year'}" aria-label="年度页">Y</button>` +
    Array.from({ length: 12 }, (_, i) => `<button type="button" data-tab="${i}" aria-pressed="${v === 'month' && S.date.getMonth() === i}" aria-label="${i + 1} 月">${i + 1}</button>`).join('');
  $('#crumbDate').textContent = crumb();
  S.sel = null;
  H.renderItems();
  H.renderInk();
  H.renderToolbar();
  updateNavState();
  fit(true);
  preloadNeighbors();
}
export function updateNavState() {
  const u = $('#undoBtn') as HTMLButtonElement,
    r = $('#redoBtn') as HTMLButtonElement;
  if (u) u.disabled = !canUndo();
  if (r) r.disabled = !canRedo();
  const p = $('#prevBtn') as HTMLButtonElement,
    n = $('#nextBtn') as HTMLButtonElement;
  if (p) p.disabled = !dest(-1);
  if (n) n.disabled = !dest(1);
  const cL = $('#cornerL'),
    cR = $('#cornerR');
  if (cL) cL.hidden = !dest(-1);
  if (cR) cR.hidden = !dest(1);
}
function rerenderSide(side: string) {
  const el = $('#pg' + side);
  el.innerHTML = pageHTML(S.view, S.date, side as 'L' | 'R', spread());
}

/* ---------- navigation ---------- */
interface Dest {
  view: View;
  date: Date;
  page: number;
}
function dest(dir: number): Dest | null {
  if (S.single && dir > 0 && S.page === 0) return { view: S.view, date: S.date, page: 1 };
  if (S.single && dir < 0 && S.page === 1) return { view: S.view, date: S.date, page: 0 };
  const d = stepDate(S.view, S.date, dir);
  return d ? { view: S.view, date: d, page: dir > 0 ? 0 : 1 } : null;
}
function preloadNeighbors() {
  [-1, 1].forEach((dir) => {
    const d = dest(dir);
    if (d) loadSpread(keyOf(d.view, d.date));
  });
}
const snapHTML = (v: View, d: Date) => {
  const sp = spread(keyOf(v, d));
  return `<div class="snap"><div class="page L"><div class="gut"></div>${holes('L')}<div class="pg">${pageHTML(v, d, 'L', sp)}</div></div><div class="page R"><div class="gut"></div>${holes('R')}<div class="pg">${pageHTML(v, d, 'R', sp)}</div></div>${inkSVG(sp.ink, 'ink')}<div class="items">${staticItemsHTML(sp.items, d)}</div></div>`;
};
const BLANK = `<div class="snap"><div class="page L back"></div><div class="page R back"></div></div>`;

const NS = 10,
  SWD = PW / NS;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
interface LeafCfg {
  side: 'L' | 'R';
  hinge: number;
  front: string;
  frontBase: number;
  back: string;
  backBase: number;
  cover?: { html: string; x: number; base: number };
  reverse?: boolean;
}
interface Leaf {
  p: number;
  set(p: number): void;
  animateTo(target: number, dur: number, cb?: () => void): void;
  remove(): void;
  done?: () => void;
  cancel?: () => void;
  cfg: LeafCfg;
}
function leafEngine(c: LeafCfg): Leaf {
  const pages = $('#pages');
  const layer = document.createElement('div');
  layer.className = 'fliplayer';
  layer.style.perspectiveOrigin = `${c.hinge}px 50%`;
  let html = '';
  if (c.cover) html += `<div class="fcover" style="left:${c.cover.x}px"><div class="fc" style="left:${-c.cover.base}px">${c.cover.html}</div></div>`;
  const restL = c.side === 'R' ? c.hinge : c.hinge - PW,
    landL = c.side === 'R' ? c.hinge - PW : c.hinge;
  html += `<div class="fshadow" data-s="rest" style="left:${restL}px"></div><div class="fshadow" data-s="land" style="left:${landL}px"></div>`;
  layer.innerHTML = html;
  let parent: HTMLElement = layer;
  const strips: HTMLElement[] = [];
  for (let i = 0; i < NS; i++) {
    const s = document.createElement('div');
    s.className = 'strip';
    s.style.left = (i === 0 ? (c.side === 'R' ? c.hinge : c.hinge - SWD) : c.side === 'R' ? SWD : -SWD) + 'px';
    s.style.transformOrigin = c.side === 'R' ? 'left center' : 'right center';
    const fr = c.side === 'R' ? i * SWD : PW - (i + 1) * SWD,
      br = c.side === 'R' ? PW - (i + 1) * SWD : i * SWD;
    s.innerHTML = `<div class="face f"><div class="fc" style="left:${-(c.frontBase + fr)}px">${c.front}</div><i class="sh"></i></div><div class="face b"><div class="fc" style="left:${-(c.backBase + br)}px">${c.back}</div><i class="sh"></i></div>`;
    parent.appendChild(s);
    strips.push(s);
    parent = s;
  }
  pages.appendChild(layer);
  const shR = layer.querySelector<HTMLElement>('[data-s="rest"]')!,
    shL = layer.querySelector<HTMLElement>('[data-s="land"]')!;
  const dirTo = (which: string) => ((c.side === 'R') === (which === 'rest') ? 'to right' : 'to left');
  const sign = c.side === 'R' ? -1 : 1;
  const shade = (a: number) => 0.36 * Math.sin((Math.min(180, a) * Math.PI) / 180);
  const gd = (d: string, a: number, b: number) => `linear-gradient(${d},rgba(26,18,10,${a.toFixed(3)}),rgba(26,18,10,${b.toFixed(3)}))`;
  const api: Leaf = {
    p: 0,
    cfg: c,
    set(p) {
      api.p = p;
      const t = c.reverse ? 1 - p : p,
        th = 180 * t;
      let cu = 26 * Math.sin(Math.PI * t);
      cu = Math.max(0, Math.min(cu, (180 - th) / (NS - 1)));
      strips.forEach((s, i) => {
        s.style.transform = `rotateY(${sign * (i ? cu : th)}deg)`;
        const oi = shade(th + i * cu),
          oo = shade(th + (i + 1) * cu);
        (s.children[0].lastChild as HTMLElement).style.background = gd(c.side === 'R' ? 'to right' : 'to left', oi, oo);
        (s.children[1].lastChild as HTMLElement).style.background = gd(c.side === 'R' ? 'to left' : 'to right', oi * 0.8, oo * 0.8);
      });
      const cs = Math.cos((th * Math.PI) / 180),
        sn = Math.sin((th * Math.PI) / 180),
        ext = PW * Math.abs(cs),
        al = 0.3 * sn;
      const g = (dir: string) => `linear-gradient(${dir},rgba(20,12,4,${al.toFixed(3)}) 0px,rgba(20,12,4,${(al * 0.55).toFixed(3)}) ${ext}px,rgba(20,12,4,0) ${ext + 70 * sn + 10}px)`;
      shR.style.background = th <= 90 ? g(dirTo('rest')) : 'none';
      shL.style.background = th > 90 ? g(dirTo('land')) : 'none';
    },
    animateTo(target, dur, cb) {
      const from = api.p,
        t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        api.set(from + (target - from) * ease(k));
        if (k < 1) requestAnimationFrame(step);
        else cb && cb();
      };
      requestAnimationFrame(step);
    },
    remove() {
      layer.remove();
    },
  };
  api.set(0);
  return api;
}

/** Switch to `to` behind a turning leaf. Returns null when motion is reduced or the target spread isn't loaded. */
function beginFlip(to: Dest, dir: number): Leaf | null {
  const nk = keyOf(to.view, to.date);
  if (RM || !S.spreads.has(nk)) return null;
  const ov = S.view,
    od = S.date,
    op = S.page,
    oldHTML = snapHTML(ov, od);
  (document.activeElement as HTMLElement)?.blur?.();
  S.flipping = true;
  S.view = to.view;
  S.date = to.date;
  if (S.single) S.page = to.page;
  renderSpread();
  const newHTML = snapHTML(to.view, to.date);
  let cfg: LeafCfg;
  if (!S.single)
    cfg =
      dir > 0
        ? { side: 'R', hinge: PW, front: oldHTML, frontBase: PW, back: newHTML, backBase: 0, cover: { html: oldHTML, x: 0, base: 0 } }
        : { side: 'L', hinge: PW, front: oldHTML, frontBase: 0, back: newHTML, backBase: PW, cover: { html: oldHTML, x: PW, base: PW } };
  else {
    const vx = S.page * PW;
    cfg =
      dir > 0
        ? { side: 'R', hinge: vx, front: oldHTML, frontBase: op * PW, back: BLANK, backBase: 0 }
        : { side: 'R', hinge: vx, front: newHTML, frontBase: vx, back: BLANK, backBase: 0, cover: { html: oldHTML, x: vx, base: op * PW }, reverse: true };
  }
  const eng = leafEngine(cfg);
  eng.done = () => {
    eng.remove();
    S.flipping = false;
    savePrefs();
  };
  eng.cancel = () => {
    eng.remove();
    S.view = ov;
    S.date = od;
    S.page = op;
    renderSpread();
    S.flipping = false;
  };
  return eng;
}
export async function go(view: View, date: Date, page?: number, dirHint?: number) {
  if (S.flipping) return;
  if (!inYear(view, date)) {
    H.toast(`这本是 ${S.nb!.year} 年的本子`);
    return;
  }
  const nk = keyOf(view, date);
  const samePlace = nk === curKey() && (page == null || page === S.page);
  if (samePlace) return;
  await loadSpread(nk);
  const dir = dirHint || (nk === curKey() ? (page! > S.page ? 1 : -1) : direction(S.view, S.date, view, date));
  const to: Dest = { view, date, page: page ?? (S.single ? (dir > 0 ? 0 : 0) : 0) };
  const eng = beginFlip(to, dir);
  if (!eng) {
    S.view = view;
    S.date = date;
    S.page = to.page;
    renderSpread();
    return;
  }
  SFX.flip();
  eng.animateTo(1, 880, eng.done);
}
export function turn(dir: number) {
  const d = dest(dir);
  if (!d || S.flipping) return;
  go(d.view, d.date, d.page, dir);
}

/* ---------- page corner drag ---------- */
function cornerDrag(e: PointerEvent, dir: number) {
  if (S.flipping) return;
  const d = dest(dir);
  if (!d) return;
  e.preventDefault();
  e.stopPropagation();
  const r = $('#pages').getBoundingClientRect(),
    kx = r.width / SPW;
  const eng = beginFlip(d, dir);
  if (!eng) {
    turn(dir);
    return;
  }
  SFX.flip();
  const c = eng.cfg;
  const pOf = (ev: PointerEvent) => {
    const px = (ev.clientX - r.left) / kx;
    const rel = c.side === 'R' ? (px - c.hinge) / PW : (c.hinge - px) / PW;
    const t = Math.acos(Math.max(-1, Math.min(1, rel))) / Math.PI;
    return c.reverse ? 1 - t : t;
  };
  eng.set(Math.max(0.03, pOf(e)));
  const mv = (ev: PointerEvent) => eng.set(Math.max(0.02, pOf(ev)));
  const up = () => {
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    if (eng.p > 0.3) eng.animateTo(1, 200 + 420 * (1 - eng.p), eng.done);
    else eng.animateTo(0, 260, eng.cancel);
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}

/* ---------- popovers ---------- */
export function closePop() {
  document.querySelectorAll('.pop').forEach((p) => p.remove());
}
export function popover(anchor: HTMLElement, html: string, onPick: (el: HTMLElement) => void, place: 'above' | 'below' = 'above') {
  closePop();
  const p = document.createElement('div');
  p.className = 'pop';
  p.innerHTML = html;
  document.body.appendChild(p);
  const r = anchor.getBoundingClientRect(),
    pw = p.offsetWidth,
    ph = p.offsetHeight;
  const left = Math.max(8, Math.min(window.innerWidth - pw - 8, r.left + r.width / 2 - pw / 2));
  const top = place === 'above' ? Math.max(8, r.top - ph - 8) : Math.min(window.innerHeight - ph - 8, r.bottom + 8);
  p.style.left = left + 'px';
  p.style.top = top + 'px';
  p.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-pick]');
    if (b) {
      onPick(b);
      closePop();
    }
  });
}

/* ---------- wiring ---------- */
function wire() {
  const pages = $('#pages');
  $('#cornerR').addEventListener('pointerdown', (e) => cornerDrag(e, 1));
  $('#cornerL').addEventListener('pointerdown', (e) => cornerDrag(e, -1));
  $('#prevBtn').addEventListener('click', () => turn(-1));
  $('#nextBtn').addEventListener('click', () => turn(1));
  $('#vseg').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-v]');
    if (b) go(b.dataset.v as View, S.date);
  });
  $('#tabs').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-tab]');
    if (!b) return;
    if (b.dataset.tab === 'y') go('year', S.date);
    else go('month', new Date(S.nb!.year, +b.dataset.tab!, 1));
  });
  $('#todayBtn').addEventListener('click', () => go('day', today()));

  // template fields
  pages.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    const k = el.dataset.f;
    if (!k) return;
    const sp = spread();
    sp.f[k] = el.value;
    saveSpread();
    if (/\.m[a]\.\d+$/.test(k)) updateSums(pages, sp.f);
  });
  pages.addEventListener('keydown', (e) => {
    const el = e.target as HTMLElement;
    if (e.key === 'Enter' && el.tagName === 'INPUT') {
      e.preventDefault();
      el.blur();
    }
  });
  pages.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const sp = spread();
    const tb = t.closest<HTMLElement>('[data-t],[data-v],[data-c]');
    if (tb && !S.flipping && S.tool === 'hand') {
      const side = tb.closest('#pgL') ? 'L' : 'R';
      if (tb.dataset.t) sp.f[tb.dataset.t] = !sp.f[tb.dataset.t];
      else if (tb.dataset.v) {
        const v = +tb.dataset.val!;
        sp.f[tb.dataset.v] = sp.f[tb.dataset.v] === v ? (tb.classList.contains('cup') || tb.classList.contains('sl') ? v - 1 : 0) : v;
      } else if (tb.dataset.c) {
        const n = +tb.dataset.n!;
        const v = ((sp.f[tb.dataset.c] || 0) + 1) % (n + 1);
        sp.f[tb.dataset.c] = v;
        tb.className = tb.className.replace(/\bm\d\b/, 'm' + v).replace(/\bc\d\b/, 'c' + (v % 4));
        const row = tb.closest('.tlr');
        if (row) row.className = row.className.replace(/\bc\d\b/, 'c' + (v % 4));
        saveSpread();
        SFX.tick();
        return;
      }
      saveSpread();
      SFX.tick();
      rerenderSide(side);
      return;
    }
    const lb = t.closest<HTMLElement>('[data-tplside]');
    if (lb) {
      const side = lb.dataset.tplside as 'L' | 'R';
      const cur = (sp.tpl || DEFAULT_TPL)[side];
      popover(
        lb,
        `<div class="pt">${side === 'L' ? '左页' : '右页'}版式</div>` +
          Object.entries(DAY_TPL)
            .map(([k, v]) => `<button type="button" data-pick="${k}" aria-pressed="${cur === k}"><span class="mini mini-${k}"><i></i><i></i><i></i><i></i></span><span>${v.n}<small>${v.d}</small></span></button>`)
            .join(''),
        (b) => {
          sp.tpl = Object.assign({}, sp.tpl || DEFAULT_TPL, { [side]: b.dataset.pick });
          saveSpread();
          rerenderSide(side);
          $('#foot' + side).querySelector('button')!.textContent = DAY_TPL[b.dataset.pick!].n + ' ▾';
          const pg = $('#pg' + side);
          if (!RM) pg.animate([{ opacity: 0, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 320, easing: 'ease-out' });
          SFX.tick();
        }
      );
    }
  });
  document.addEventListener('pointerdown', (e) => {
    const t = e.target as HTMLElement;
    if (!t.closest('.pop') && !t.closest('[data-tplside]') && !t.closest('[data-popbtn]')) closePop();
  });
  window.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
  });
  $('#todayBtn').innerHTML = ic('today');
}
