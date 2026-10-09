// Sticker drawer: PET collage rolls, sticker rolls, washi rolls, the user's collection and text.
import { DEF, FONTS, LABEL_KEYS, NAMES, PATN, PATS, ROLLS, ST, TAPEC, TEXTS, dateStamp, esc, ic, svg, tape } from './data/art';
import { MONTH_SHORT, pad, today } from './dates';
import { PET, PET_COUNT, motif } from './data/pet';
import { RM } from './book';
import { art, defaultSpot, pushItem } from './items';
import { SFX } from './sound';
import { H, type Item, PH, S, SPW, savePrefs } from './state';
import { setTool } from './toolbar';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
export const CATS = ['咖啡馆', '植物', '票根收据', '猫猫', '未分类'];
const DTABS: [string, string][] = [
  ['pet', '拼贴胶带'],
  ['roll', '贴纸卷'],
  ['tape', '和纸'],
  ['mine', '收集'],
  ['text', '文字'],
];
let dreg: Partial<Item>[] = [];
const reg = (o: Partial<Item>) => (dreg.push(o), dreg.length - 1);
const stArt = (k: string) => {
  const t = today();
  return svg(k === 'date' ? dateStamp(DEF.date, MONTH_SHORT[t.getMonth()], pad(t.getDate()), String(t.getFullYear())) : ST[k](DEF[k]));
};
const pk = (o: Partial<Item>, a: string, label: string) =>
  `<button class="dr-pk" type="button" data-add="${reg(o)}" aria-label="${esc(label)}"><span class="dr-imp">${a}</span><span class="dr-stk">${a}</span></button>`;
const PCELL_DY = 112,
  PSTRIP_H = 12 + (PET_COUNT - 1) * PCELL_DY + 196;
const SCIS = '<svg viewBox="0 0 24 24" fill="none" stroke="#2b2520" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.6 7.6L20 18M8.6 16.4L20 6"/></svg>';

function rollHTML(r: (typeof ROLLS)[number]) {
  const open = S.prefs.roll === r.id;
  const mini = [...r.keys, ...r.keys].map((k) => `<span>${stArt(k)}</span>`).join('');
  return `<div class="roll ${open ? 'open' : ''}" data-roll="${r.id}">
    <div class="rmeta"><b>${r.name}</b><span>${r.keys.length} 张 · ${r.sub}</span></div>
    <button class="reel" type="button" data-reel="${r.id}" aria-expanded="${open}" aria-label="${r.name}，${open ? '卷起' : '展开'}"><span class="cyl"><span class="cyl-pat">${mini}</span></span><span class="cap"></span></button>
    <div class="dr-stripwrap"><div class="dr-strip">${r.keys
      .map((k) => `<div class="dr-slot">${pk({ type: 'sticker', key: k, color: DEF[k], w: k === 'arrow' ? 80 : LABEL_KEYS.includes(k) ? 74 : 64 }, stArt(k), NAMES[k])}</div>`)
      .join('')}<div class="dr-end"></div></div></div></div>`;
}
function petHTML(t: (typeof PET)[number]) {
  const open = S.prefs.pet === t.id;
  const cells = Array.from(
    { length: PET_COUNT },
    (_, i) =>
      `<div class="pet-cell" style="left:${i % 2 ? 128 : 4}px;top:${12 + i * PCELL_DY}px"><button class="pet-pk" type="button" data-add="${reg({ type: 'collage', roll: t.id, idx: i, w: 150 })}" aria-label="剪下${t.name}第 ${i + 1} 款"><span class="pet-art">${motif(t.id, i)}</span><span class="pet-cut"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="0" y="0" width="100" height="100" rx="2" pathLength="100"/></svg><span class="scis">${SCIS}</span></span></button></div>`
  ).join('');
  return `<div class="proll ${open ? 'open' : ''}" data-proll="${t.id}">
    <div class="rmeta"><b>${t.name}</b><span>${PET_COUNT} 款 · ${t.sub}</span></div>
    <button class="preel" type="button" data-preel="${t.id}" aria-expanded="${open}" aria-label="${t.name}，${open ? '卷起' : '展开'}"><span class="pcyl"><span class="pcyl-pat">${[0, 1, 2, 3, 4, 5, 0, 1, 2].map((i) => `<span>${motif(t.id, i)}</span>`).join('')}</span></span><span class="pcap"><i>PET · 6cm</i></span></button>
    <div class="pet-stripwrap" style="height:${open ? PSTRIP_H : 0}px"><div class="pet-strip" style="height:${PSTRIP_H}px">${cells}<div class="pet-end"></div></div></div></div>`;
}

export function renderDrawer() {
  const dr = $('#drawer');
  if (!dr) return;
  dreg = [];
  const t = S.prefs.dtab;
  let body = '';
  if (t === 'pet') body = `<p class="dr-tip">透明的 PET 拼贴胶带。点一卷展开，按住喜欢的那一款，剪刀会沿边剪下来，拖到本子上。</p><div class="pet-desk">${PET.map(petHTML).join('')}</div>`;
  else if (t === 'roll') body = ROLLS.map(rollHTML).join('');
  else if (t === 'tape')
    body = `<p class="dr-tip">点一卷，在本子上按住拖出一段，松手撕断；也可以把整卷拖到本子上。</p><div class="wgrid">${PATS.map(
      (p) =>
        `<button class="wroll" type="button" data-wroll="${p}" aria-pressed="${S.tool === 'tape' && S.tape.pat === p}"><span class="wdonut" style="--c:${TAPEC[p]}"><span class="tape tp-${p}" style="--c:${TAPEC[p]}"></span><span class="wtail tape tp-${p}" style="--c:${TAPEC[p]}"></span></span><span>${PATN[p]}</span></button>`
    ).join('')}</div>`;
  else if (t === 'mine') {
    const l = S.mine.filter((m) => S.prefs.mcat === '全部' || m.cat === S.prefs.mcat);
    body = `<button class="cam-cta" type="button" data-cam="1"><span class="i">${ic('camera')}</span><span><b>拍照收集</b><small>拍下或选一张图，抠成贴纸存进这里</small></span></button>
      <div class="fchips">${['全部', ...CATS].map((c) => `<button type="button" data-mc="${c}" aria-pressed="${c === S.prefs.mcat}">${c}</button>`).join('')}</div>
      <div class="dr-sheet">${l
        .map((m) => (m.img ? pk({ type: 'photo', img: m.img, w: 120 }, S.imgs.has(m.img) ? `<img src="${S.imgs.get(m.img)}" alt="" draggable="false">` : '', m.cat) : pk({ type: 'sticker', key: m.key, color: DEF[m.key!], w: 80 }, stArt(m.key!), m.cat)))
        .join('')}${l.length ? '' : '<div class="empty">这个分类还没有贴纸。拍一张试试。</div>'}</div>`;
  } else
    body = `<p class="dr-tip">拖到本子上，选中后可以改字、换字体和颜色。</p><div class="dsec">${TEXTS.map(
      ([s, f, c]) => `<button class="dtext" type="button" data-add="${reg({ type: 'text', text: s, font: f, color: c, fs: 28 })}" style="font-family:${f};color:${c}">${s}<small>${FONTS.find((x) => x[1] === f)![0]}</small></button>`
    ).join('')}</div>`;
  dr.innerHTML = `<div class="dr-grab" data-close="1" aria-hidden="true"></div><div class="dr-head"><div class="dr-title"><b>贴纸抽屉</b><button class="ib" type="button" data-close="1" aria-label="收起抽屉">${ic('close')}</button></div>
    <div class="dtabs">${DTABS.map(([k, n]) => `<button type="button" data-dt="${k}" aria-pressed="${k === t}">${n}</button>`).join('')}</div></div><div class="dr-body">${body}</div>`;
  if (t === 'roll') {
    const o = dr.querySelector<HTMLElement>('.roll.open .dr-stripwrap');
    if (o) o.style.height = 'auto';
  }
  const wide = t === 'pet' && !S.compact && !S.overlay;
  if (dr.classList.contains('wide') !== wide) {
    dr.classList.toggle('wide', wide);
    fitDuring(480);
  }
}
export function fitDuring(ms: number) {
  if (RM) return H.fit(true);
  const t0 = performance.now();
  const st = (n: number) => {
    H.fit(true);
    if (n - t0 < ms) requestAnimationFrame(st);
  };
  requestAnimationFrame(st);
}
export function setDrawer(open: boolean) {
  S.drawerOpen = open;
  document.body.classList.toggle('drawer-open', open);
  $('#drawerBtn')?.setAttribute('aria-pressed', String(open));
  fitDuring(420);
}

function toggleStrip(id: string, kind: 'roll' | 'pet') {
  const dr = $('#drawer');
  const prefKey = kind === 'roll' ? 'roll' : 'pet';
  const prev = S.prefs[prefKey];
  S.prefs[prefKey] = prev === id ? '' : id;
  savePrefs();
  SFX.roll();
  const sel = kind === 'roll' ? '.roll' : '.proll',
    wsel = kind === 'roll' ? '.dr-stripwrap' : '.pet-stripwrap',
    attr = kind === 'roll' ? 'roll' : 'proll';
  dr.querySelectorAll<HTMLElement>(sel).forEach((r) => {
    const open = r.dataset[attr] === S.prefs[prefKey],
      was = r.classList.contains('open'),
      w = r.querySelector<HTMLElement>(wsel)!;
    if (open === was) return;
    r.querySelector('[aria-expanded]')!.setAttribute('aria-expanded', String(open));
    const full = kind === 'pet' ? PSTRIP_H : (w.firstElementChild as HTMLElement).offsetHeight;
    const dur = RM ? 0 : kind === 'pet' ? 920 : 820;
    if (open) {
      w.style.height = '0px';
      r.classList.add('open', 'moving');
      void w.offsetHeight;
      w.style.height = full + 'px';
      const body = dr.querySelector<HTMLElement>('.dr-body')!;
      setTimeout(() => body.scrollTo({ top: r.offsetTop - 4, behavior: RM ? 'auto' : 'smooth' }), prev && prev !== id ? 400 : 0);
      setTimeout(() => {
        r.classList.remove('moving');
        if (kind === 'roll' && r.classList.contains('open')) w.style.height = 'auto';
      }, dur);
    } else {
      w.style.height = full + 'px';
      r.classList.add('moving');
      void w.offsetHeight;
      r.classList.remove('open');
      w.style.height = '0px';
      setTimeout(() => r.classList.remove('moving'), dur);
    }
  });
}

/* ---------- carrying a sticker: peel / cut, follow the finger, drop ---------- */
function halfPlane(W: number, H: number, K: number, below: boolean) {
  const R = [
      [0, 0],
      [W, 0],
      [W, H],
      [0, H],
    ],
    ins = (p: number[]) => (below ? p[0] + p[1] <= K : p[0] + p[1] >= K),
    o: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const a = R[i],
      b = R[(i + 1) % 4],
      ia = ins(a),
      ib = ins(b);
    if (ia) o.push(a);
    if (ia !== ib) {
      const t = (K - a[0] - a[1]) / (b[0] + b[1] - (a[0] + a[1]));
      o.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return 'polygon(' + o.map((p) => p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px').join(',') + ')';
}
interface Ghost {
  g: HTMLElement;
  W: number;
  H: number;
  x: number;
  y: number;
  rot: number;
  s: number;
  K: number;
  setK(K: number): void;
  pos(): void;
  tweenK(to: number, dur: number): void;
}
function makeGhost(html: string, W: number, H: number, peelable: boolean): Ghost {
  const g = document.createElement('div');
  g.className = 'pghost';
  g.style.width = W + 'px';
  g.style.height = H + 'px';
  g.innerHTML = `<div class="pmain">${html}</div>${peelable ? `<div class="pflap">${html}</div>` : ''}`;
  document.body.appendChild(g);
  const main = g.firstElementChild as HTMLElement,
    flap = g.querySelector<HTMLElement>('.pflap');
  const o: Ghost = {
    g, W, H, x: 0, y: 0, rot: 0, s: 1, K: W + H,
    setK(K) {
      o.K = K;
      if (!flap) return;
      if (K >= W + H - 0.5) {
        main.style.clipPath = 'none';
        flap.style.display = 'none';
        return;
      }
      flap.style.display = 'block';
      main.style.clipPath = halfPlane(W, H, K, true);
      flap.style.clipPath = halfPlane(W, H, K, false);
      flap.style.transform = `matrix(0,-1,-1,0,${K},${K})`;
    },
    pos() {
      g.style.transform = `translate(${o.x - W / 2}px,${o.y - H / 2}px) rotate(${o.rot}deg) scale(${o.s})`;
    },
    tweenK(to, dur) {
      const from = o.K,
        t0 = performance.now();
      const st = (n: number) => {
        const k = Math.min(1, (n - t0) / dur);
        o.setK(from + (to - from) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(st);
      };
      requestAnimationFrame(st);
    },
  };
  return o;
}
function cutAnim(b: HTMLElement, done: () => void) {
  const cut = b.querySelector<HTMLElement>('.pet-cut')!,
    sc = b.querySelector<HTMLElement>('.scis')!;
  b.classList.add('cutting');
  SFX.snip();
  const W = cut.offsetWidth,
    H = cut.offsetHeight;
  if (!RM && sc.animate)
    sc.animate(
      [
        { left: '0px', top: '0px', opacity: 1, transform: 'rotate(0deg)' },
        { left: W + 'px', top: '0px', opacity: 1, transform: 'rotate(0deg)' },
        { left: W + 'px', top: H + 'px', opacity: 1, transform: 'rotate(90deg)' },
        { left: '0px', top: H + 'px', opacity: 1, transform: 'rotate(180deg)' },
        { left: '0px', top: '0px', opacity: 0, transform: 'rotate(270deg)' },
      ],
      { duration: 340, easing: 'linear' }
    );
  setTimeout(() => {
    b.classList.remove('cutting');
    done();
  }, RM ? 0 : 340);
}
const pagesRect = () => $('#pages').getBoundingClientRect();
const targetScale = (o: Partial<Item>, gh: Ghost) => {
  const k = pagesRect().width / SPW;
  return o.type === 'text' ? k : ((o.w || 80) * k) / gh.W;
};
function finishDrop(o: Partial<Item>, gh: Ghost, fx: number, fy: number) {
  const r = pagesRect(),
    rot = Math.round(gh.rot * 0.4 + (Math.random() - 0.5) * 10);
  gh.g.style.transition = RM ? 'none' : 'transform .38s cubic-bezier(.3,.7,.2,1)';
  gh.x = r.left + fx * r.width;
  gh.y = r.top + fy * r.height;
  gh.s = targetScale(o, gh);
  gh.rot = rot;
  gh.pos();
  setTimeout(() => {
    gh.g.remove();
    pushItem({ ...JSON.parse(JSON.stringify(o)), rot }, fx, fy);
  }, RM ? 0 : 380);
}
let dd: any = null;
export function wireDrawer() {
  const dr = $('#drawer');
  dr.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button,[data-close]');
    if (!b) return;
    if (b.dataset.close) return setDrawer(false);
    if (b.dataset.dt) {
      S.prefs.dtab = b.dataset.dt;
      savePrefs();
      renderDrawer();
      SFX.tick();
      return;
    }
    if (b.dataset.mc) {
      S.prefs.mcat = b.dataset.mc;
      savePrefs();
      renderDrawer();
      return;
    }
    if (b.dataset.reel) return toggleStrip(b.dataset.reel, 'roll');
    if (b.dataset.preel) return toggleStrip(b.dataset.preel, 'pet');
    if (b.dataset.cam) $<HTMLInputElement>('#fileIn').click();
  });
  dr.addEventListener('pointerdown', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-add],[data-wroll]');
    if (!b || S.flipping) return;
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    if (b.dataset.wroll) {
      dd = { kind: 'roll', b, pat: b.dataset.wroll, x0: e.clientX, y0: e.clientY };
      return;
    }
    const o = dreg[+b.dataset.add!];
    const artEl = b.querySelector<HTMLElement>('.dr-stk') || b.querySelector<HTMLElement>('.pet-art') || b;
    const rr = artEl.getBoundingClientRect();
    const peelable = o.type === 'sticker' || o.type === 'photo';
    const html = o.type === 'text' ? `<div class="txt" style="font-family:${o.font};color:${o.color};font-size:${o.fs}px">${esc(o.text)}</div>` : art(o);
    const gh = makeGhost(html, rr.width, rr.height, peelable);
    gh.x = rr.left + rr.width / 2;
    gh.y = rr.top + rr.height / 2;
    gh.pos();
    dd = { kind: 'item', b, o, gh, x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, carry: false, offX: gh.x - e.clientX, offY: gh.y - e.clientY };
    if (o.type === 'collage') {
      gh.g.style.opacity = '0';
      cutAnim(b, () => {
        gh.g.style.opacity = '';
        b.classList.add('taken');
      });
    } else b.classList.add('taken');
    if (peelable && !RM) {
      SFX.peel();
      gh.tweenK((rr.width + rr.height) * 0.62, 170);
    }
  });
  dr.addEventListener('pointermove', (e) => {
    if (!dd) return;
    if (dd.kind === 'roll') {
      if (!dd.gh && Math.hypot(e.clientX - dd.x0, e.clientY - dd.y0) > 6) {
        const k = pagesRect().width / SPW;
        dd.gh = makeGhost(tape(dd.pat, TAPEC[dd.pat], 150 * k, 24 * k), 150 * k, 24 * k, false);
        dd.gh.g.classList.add('carry');
        if (S.compact) document.body.classList.add('drawer-peek');
      }
      if (dd.gh) {
        dd.gh.x = e.clientX;
        dd.gh.y = e.clientY;
        dd.gh.rot = -6;
        dd.gh.pos();
      }
      return;
    }
    const gh: Ghost = dd.gh;
    if (!dd.carry && Math.hypot(e.clientX - dd.x0, e.clientY - dd.y0) > 6) {
      dd.carry = true;
      gh.g.classList.add('carry');
      if (S.compact) document.body.classList.add('drawer-peek');
      if (gh.K < gh.W + gh.H) gh.tweenK(gh.W + gh.H, 260);
      const s1 = targetScale(dd.o, gh) * 1.06,
        s0 = gh.s,
        t0 = performance.now();
      const grow = (n: number) => {
        const k = Math.min(1, (n - t0) / 220);
        gh.s = s0 + (s1 - s0) * k;
        if (dd && dd.gh === gh) {
          dd.offX *= 0.8;
          dd.offY *= 0.8;
          gh.x = dd.lx + dd.offX;
          gh.y = dd.ly + dd.offY;
        }
        gh.pos();
        if (k < 1 && dd && dd.gh === gh) requestAnimationFrame(grow);
      };
      requestAnimationFrame(grow);
    }
    const vx = e.clientX - dd.lx;
    dd.lx = e.clientX;
    dd.ly = e.clientY;
    gh.rot += (Math.max(-16, Math.min(16, vx * 1.4)) - gh.rot) * 0.25;
    gh.x = e.clientX + dd.offX;
    gh.y = e.clientY + dd.offY;
    gh.pos();
  });
  const up = (e: PointerEvent) => {
    if (!dd) return;
    const d = dd;
    dd = null;
    document.body.classList.remove('drawer-peek');
    const r = pagesRect(),
      v = $('#bookview').getBoundingClientRect(),
      inside = e.clientX > Math.max(r.left, v.left) && e.clientX < Math.min(r.right, v.right) && e.clientY > r.top && e.clientY < r.bottom;
    const fx = (e.clientX - r.left) / r.width,
      fy = (e.clientY - r.top) / r.height;
    if (d.kind === 'roll') {
      if (!d.gh) {
        if (S.tool === 'tape' && S.tape.pat === d.pat) setTool('hand');
        else {
          S.tape.pat = d.pat;
          S.tape.color = TAPEC[d.pat];
          setTool('tape');
          if (S.compact) setDrawer(false);
        }
        SFX.tick();
        return;
      }
      d.gh.g.remove();
      if (inside) {
        pushItem({ type: 'tape', pat: d.pat, color: TAPEC[d.pat], w: 150, h: 24, rot: Math.round((Math.random() - 0.5) * 14) }, fx, fy);
        SFX.tear();
      }
      return;
    }
    const { gh, o, b } = d;
    const refill = () => {
      b.classList.remove('taken');
      b.classList.add('refill');
      setTimeout(() => b.classList.remove('refill'), 500);
    };
    const go = (x: number, y: number) => {
      finishDrop(o, gh, x, y);
      setTimeout(refill, 450);
      if (S.compact || S.overlay) setDrawer(false);
    };
    if (!d.carry) {
      const [x, y] = defaultSpot();
      gh.g.classList.add('carry');
      gh.tweenK(gh.W + gh.H, 240);
      setTimeout(() => go(x, y), o.type === 'collage' && !RM ? 340 : 0);
      return;
    }
    if (inside && e.type === 'pointerup') return go(fx, fy);
    const ra = b.querySelector('.dr-stk') || b.querySelector('.pet-art') || b,
      br = ra.getBoundingClientRect();
    gh.g.style.transition = 'transform .32s cubic-bezier(.3,.7,.2,1)';
    gh.x = br.left + br.width / 2;
    gh.y = br.top + br.height / 2;
    gh.s = 1;
    gh.rot = 0;
    gh.pos();
    setTimeout(() => {
      gh.g.remove();
      b.classList.remove('taken');
    }, 330);
  };
  dr.addEventListener('pointerup', up);
  dr.addEventListener('pointercancel', up);
}
export { PH };
