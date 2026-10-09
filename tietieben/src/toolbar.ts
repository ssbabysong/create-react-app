// The floating toolbar under the notebook: tools when nothing is selected, properties when something is.
import { FONTS, PATN, PATS, PEN_COLORS, SWATCHES, esc, ic, tape } from './data/art';
import { updateNavState } from './book';
import { defaultSpot, elOf, get, peelAway, place, pushItem, refresh, renderInk, renderItems, select } from './items';
import { SFX } from './sound';
import { H, S, type Tool, commit, redo, saveSpread, spread, undo } from './state';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;

export function setTool(t: Tool) {
  S.tool = t;
  if (t !== 'hand') select(null);
  document.body.dataset.tool = t;
  renderToolbar();
  H.renderDrawer();
}
const btn = (attr: string, icon: string, label: string, cls = '') => `<button class="tbtn ${cls}" type="button" ${attr}>${ic(icon)}<span>${label}</span></button>`;

export function renderToolbar() {
  const tb = $('#toolbar');
  if (!tb) return;
  updateNavState();
  const it = S.sel != null ? get(S.sel) : null;
  if (S.tool === 'pen') {
    tb.innerHTML = `<div class="trow"><span class="tlabel">${ic('pen')}书写</span><div class="sw">${PEN_COLORS.map((c) => `<button type="button" data-pc="${c}" style="background:${c}" aria-label="笔的颜色" aria-pressed="${c === S.pen.c}"></button>`).join('')}</div><span class="tsep"></span>
      <div class="sizes">${[2, 3, 5].map((s) => `<button type="button" data-ps="${s}" aria-pressed="${s === S.pen.s}" aria-label="粗细 ${s}"><i style="width:${s * 2 + 2}px;height:${s * 2 + 2}px"></i></button>`).join('')}</div><span class="tsep"></span>
      ${btn('data-tool="eraser"', 'eraser', '橡皮')}<button class="tbtn pri" type="button" data-tool="hand">完成</button></div>`;
    return;
  }
  if (S.tool === 'eraser') {
    tb.innerHTML = `<div class="trow"><span class="tlabel">${ic('eraser')}橡皮</span><span class="hint">划过笔迹就会擦掉整笔</span>${btn('data-tool="pen"', 'pen', '回到笔')}<button class="tbtn pri" type="button" data-tool="hand">完成</button></div>`;
    return;
  }
  if (S.tool === 'tape') {
    tb.innerHTML = `<div class="trow"><span class="tmode">${tape(S.tape.pat, S.tape.color, 64, 18, 'display:inline-block;vertical-align:middle')}</span><span class="hint"><b>胶带</b> · 在本子上按住拖出一段，松手撕断</span><label class="rng">宽度<input type="range" id="rTapeH" min="12" max="44" value="${S.tape.h}"><output id="oTapeH">${S.tape.h}</output></label><button class="tbtn pri" type="button" data-tool="hand">完成</button></div>`;
    return;
  }
  if (!it) {
    tb.innerHTML = `<div class="trow">${btn('data-t="drawer"', 'sticker', '贴纸', 'only-compact')}${btn('data-t="text"', 'text', '文字')}${btn('data-tool="pen"', 'pen', '笔')}${btn('data-t="photo"', 'camera', '拍贴纸')}<span class="tsep wide-only"></span><span class="hint wide-only">拖动页角翻页 · 从抽屉里揭下贴纸</span></div>`;
    return;
  }
  const size =
    it.type === 'text'
      ? `<label class="rng">字号<input type="range" id="rSize" min="10" max="96" value="${it.fs}"><output id="oSize">${it.fs}</output></label>`
      : `<label class="rng">${it.type === 'tape' ? '长度' : '大小'}<input type="range" id="rSize" min="16" max="560" value="${it.w}"><output id="oSize">${it.w}</output></label>`;
  const extra =
    it.type === 'text'
      ? `<div class="trow"><input class="tin" id="tText" type="text" value="${esc(it.text)}" aria-label="文字内容" enterkeyhint="done"><div class="fonts">${FONTS.map(([n, f]) => `<button type="button" data-f="${f}" style="font-family:${f}" aria-pressed="${f === it.font}">${n}</button>`).join('')}</div></div>`
      : it.type === 'tape'
        ? `<div class="trow"><span class="hint">花纹</span><div class="pats">${PATS.map((p) => `<button type="button" data-pat="${p}" aria-pressed="${p === it.pat}" aria-label="${PATN[p]}">${tape(p, it.color!, 44, 16)}</button>`).join('')}</div></div>`
        : '';
  const color =
    it.type === 'photo' || it.type === 'collage'
      ? ''
      : `<span class="tsep"></span><div class="sw">${SWATCHES.map((c) => `<button type="button" data-c="${c}" style="background:${c}" aria-label="颜色" aria-pressed="${c === it.color}"></button>`).join('')}</div>`;
  tb.innerHTML = `${extra}<div class="trow"><label class="rng">角度<input type="range" id="rRot" min="-180" max="180" value="${it.rot}"><output id="oRot">${it.rot}°</output></label>${size}${color}<span class="tsep"></span>
    <button class="tbtn icon" type="button" data-a="up" aria-label="上移一层">${ic('up')}</button><button class="tbtn icon" type="button" data-a="down" aria-label="下移一层">${ic('down')}</button><button class="tbtn icon" type="button" data-a="dup" aria-label="复制">${ic('dup')}</button><button class="tbtn icon del" type="button" data-a="del" aria-label="揭掉">${ic('trash')}</button><button class="tbtn pri" type="button" data-a="done">完成</button></div>`;
}

export function wireToolbar() {
  const tb = $('#toolbar');
  tb.addEventListener('pointerdown', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.type === 'range' && t.id !== 'rTapeH') commit();
  });
  tb.addEventListener('focusin', (e) => {
    if ((e.target as HTMLElement).id === 'tText') commit();
  });
  tb.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).id === 'tText') (e.target as HTMLElement).blur();
  });
  tb.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button');
    if (!b) return;
    const it = S.sel != null ? get(S.sel) : null;
    if (b.dataset.tool) {
      setTool(b.dataset.tool as Tool);
      SFX.tick();
      return;
    }
    if (b.dataset.pc) {
      S.pen.c = b.dataset.pc;
      renderToolbar();
      return;
    }
    if (b.dataset.ps) {
      S.pen.s = +b.dataset.ps;
      renderToolbar();
      return;
    }
    if (b.dataset.t === 'drawer') {
      H.renderDrawer();
      document.body.classList.add('drawer-open');
      S.drawerOpen = true;
      return;
    }
    if (b.dataset.t === 'text') {
      const [fx, fy] = defaultSpot();
      pushItem({ type: 'text', text: '写点什么', font: FONTS[0][1], color: '#3a3127', fs: 26, rot: -3 }, fx, fy);
      setTimeout(() => {
        const t = $<HTMLInputElement>('#tText');
        if (t) {
          t.focus();
          t.select();
        }
      }, 30);
      return;
    }
    if (b.dataset.t === 'photo') {
      $<HTMLInputElement>('#fileIn').click();
      return;
    }
    if (!it) return;
    if (b.dataset.c) {
      commit();
      it.color = b.dataset.c;
      refresh(it);
      renderToolbar();
      saveSpread();
      return;
    }
    if (b.dataset.pat) {
      commit();
      it.pat = b.dataset.pat;
      refresh(it);
      renderToolbar();
      saveSpread();
      return;
    }
    if (b.dataset.f) {
      commit();
      it.font = b.dataset.f;
      refresh(it);
      renderToolbar();
      saveSpread();
      return;
    }
    const a = b.dataset.a,
      sp = spread();
    if (a === 'up') {
      commit();
      it.z = Math.max(...sp.items.map((i) => i.z)) + 1;
      place(elOf(it.id), it);
    }
    if (a === 'down') {
      commit();
      it.z = Math.min(...sp.items.map((i) => i.z)) - 1;
      place(elOf(it.id), it);
    }
    if (a === 'dup') {
      const c = { ...it } as any;
      delete c.id;
      delete c.z;
      pushItem(c, Math.min(0.97, it.x + 0.03), Math.min(0.97, it.y + 0.04));
      return;
    }
    if (a === 'del') {
      commit();
      const id = it.id;
      S.sel = null;
      renderToolbar();
      SFX.peel();
      peelAway([elOf(id)], () => {
        sp.items = sp.items.filter((i) => i.id !== id);
        renderItems();
        saveSpread();
        renderToolbar();
      });
      return;
    }
    if (a === 'done') select(null);
    saveSpread();
    renderToolbar();
  });
  tb.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.id === 'rTapeH') {
      S.tape.h = +t.value;
      $('#oTapeH').textContent = t.value;
      return;
    }
    const it = S.sel != null ? get(S.sel) : null;
    if (!it) return;
    if (t.id === 'rRot') {
      it.rot = +t.value;
      $('#oRot').textContent = it.rot + '°';
      place(elOf(it.id), it);
    }
    if (t.id === 'rSize') {
      const v = +t.value;
      if (it.type === 'text') it.fs = v;
      else it.w = v;
      $('#oSize').textContent = String(v);
      refresh(it);
    }
    if (t.id === 'tText') {
      it.text = t.value || ' ';
      refresh(it);
    }
    saveSpread();
  });
  $('#undoBtn').addEventListener('click', () => {
    if (undo()) {
      S.sel = null;
      renderItems();
      renderInk();
      renderToolbar();
      SFX.tick();
    }
  });
  $('#redoBtn').addEventListener('click', () => {
    if (redo()) {
      S.sel = null;
      renderItems();
      renderInk();
      renderToolbar();
      SFX.tick();
    }
  });
  $('#undoBtn').innerHTML = ic('undo');
  $('#redoBtn').innerHTML = ic('redo');
}
