import './styles/app.css';
import { ic } from './data/art';
import { installPetDefs } from './data/pet';
import { buildBook, closePop, fit, popover, renderSpread } from './book';
import { renderDrawer, setDrawer, wireDrawer } from './drawer';
import { renderInk, renderItems, wirePages } from './items';
import { wirePhoto } from './photo';
import { newNotebook, openNotebook, showShelf, wireShelf } from './shelf';
import { SFX } from './sound';
import * as db from './store';
import { H, type Mine, type Notebook, type Spread, S, keyOf, nextId, savePrefs } from './state';
import { renderToolbar, setTool, wireToolbar } from './toolbar';
import { today } from './dates';
import { exportImage } from './export';
import { isNative } from './native';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;

document.getElementById('app')!.innerHTML = `
  <header class="topbar">
    <div class="tb-l"><button class="ib" type="button" id="shelfBtn" aria-label="书架">${ic('shelf')}</button><button class="ib" type="button" id="drawerBtn" aria-label="贴纸抽屉" aria-pressed="true">${ic('sticker')}</button>
      <div class="crumb"><b id="nbName"></b><span id="crumbDate"></span></div></div>
    <div class="vseg" id="vseg" role="group" aria-label="视图"></div>
    <div class="tb-r"><button class="ib" type="button" id="todayBtn" aria-label="回到今天"></button><button class="ib" type="button" id="undoBtn" aria-label="撤销"></button><button class="ib" type="button" id="redoBtn" aria-label="重做"></button><button class="ib" type="button" id="exportBtn" data-popbtn="1" aria-label="导出图片">${ic('share')}</button><button class="ib" type="button" id="moreBtn" data-popbtn="1" aria-label="更多">${ic('more')}</button></div>
  </header>
  <div class="mainarea">
    <aside class="drawer" id="drawer" aria-label="贴纸抽屉"></aside>
    <section class="stage" id="stage">
      <div id="bookRoot"></div>
      <button class="turn tprev" type="button" id="prevBtn" aria-label="上一页">‹</button>
      <button class="turn tnext" type="button" id="nextBtn" aria-label="下一页">›</button>
      <div class="toolbar" id="toolbar"></div>
    </section>
  </div>
  <div class="scrim" id="scrim"></div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <input type="file" id="fileIn" accept="image/*" hidden>`;

H.render = renderSpread;
H.renderItems = renderItems;
H.renderInk = renderInk;
H.renderToolbar = renderToolbar;
H.renderDrawer = renderDrawer;
H.fit = fit;
let toastT = 0;
H.toast = (m) => {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = window.setTimeout(() => t.classList.remove('on'), 2200);
};

installPetDefs();
buildBook();
wirePages();
wireToolbar();
wireDrawer();
wirePhoto();
wireShelf();

$('#shelfBtn').addEventListener('click', showShelf);
$('#drawerBtn').addEventListener('click', () => {
  setDrawer(!S.drawerOpen);
  if (S.drawerOpen) renderDrawer();
});
$('#scrim').addEventListener('click', () => setDrawer(false));
$('#moreBtn').addEventListener('click', (e) => {
  if (document.querySelector('.pop')) return closePop();
  popover(
    e.currentTarget as HTMLElement,
    `<button type="button" data-pick="sound"><span class="mini-ic">${S.prefs.sound ? '开' : '关'}</span><span>纸张音效<small>翻页、揭贴纸、撕胶带的声音</small></span></button>
     <button type="button" data-pick="export"><span class="mini-ic">${ic('image')}</span><span>导出图片<small>存到相册或分享</small></span></button>
     <button type="button" data-pick="eraser"><span class="mini-ic">${ic('eraser')}</span><span>橡皮<small>擦掉用笔写的字</small></span></button>
     <button type="button" data-pick="shelf"><span class="mini-ic">${ic('shelf')}</span><span>书架和设置<small>换本子、新建本子</small></span></button>`,
    (b) => {
      if (b.dataset.pick === 'sound') {
        S.prefs.sound = !S.prefs.sound;
        savePrefs();
        SFX.tick();
        H.toast(S.prefs.sound ? '音效已打开' : '音效已关闭');
      }
      if (b.dataset.pick === 'eraser') setTool('eraser');
      if (b.dataset.pick === 'export') setTimeout(() => exportMenu($('#moreBtn')), 0);
      if (b.dataset.pick === 'shelf') showShelf();
    },
    'below'
  );
});
function exportMenu(anchor: HTMLElement) {
  const opts = S.single
    ? [['spread', '整张跨页', '左右两页拼在一起'], [S.page ? 'R' : 'L', '当前这一页', '只导出正在看的这页']]
    : [['spread', '整张跨页', '左右两页拼在一起'], ['L', '左页', '只导出左边这页'], ['R', '右页', '只导出右边这页']];
  popover(
    anchor,
    `<div class="pt">导出成图片</div>` + opts.map(([k, n, d]) => `<button type="button" data-pick="${k}"><span class="mini-ic">${ic('image')}</span><span>${n}<small>${d}</small></span></button>`).join(''),
    (b) => exportImage(b.dataset.pick as any),
    'below'
  );
}
$('#exportBtn').addEventListener('click', (e) => {
  if (document.querySelector('.pop')) return closePop();
  exportMenu(e.currentTarget as HTMLElement);
});
let rt = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(rt);
  rt = requestAnimationFrame(() => {
    const was = S.compact || S.overlay;
    fit(true);
    if (was !== (S.compact || S.overlay)) {
      setDrawer(!(S.compact || S.overlay));
      renderDrawer();
    }
  });
});

async function boot() {
  const prefs = await db.get('prefs');
  if (prefs) Object.assign(S.prefs, prefs);
  S.notebooks = (await db.get<Notebook[]>('notebooks')) || [];
  S.mine = (await db.get<Mine[]>('mine')) || [
    { id: 's1', cat: '咖啡馆', key: 'croissant' },
    { id: 's2', cat: '咖啡馆', key: 'latte' },
    { id: 's3', cat: '咖啡馆', key: 'coffee' },
    { id: 's4', cat: '植物', key: 'pot' },
    { id: 's5', cat: '植物', key: 'ginkgo' },
    { id: 's6', cat: '票根收据', key: 'ticket' },
    { id: 's7', cat: '猫猫', key: 'cat' },
  ];
  await Promise.all(
    S.mine
      .filter((m) => m.img)
      .map(async (m) => {
        const b = await db.get<Blob>('img:' + m.img);
        if (b) S.imgs.set(m.img!, URL.createObjectURL(b));
      })
  );
  let first = false;
  if (!S.notebooks.length) {
    newNotebook(today().getFullYear(), '日常碎片本', '#6e8f69');
    first = true;
  }
  fit(true);
  setDrawer(!(S.compact || S.overlay));
  renderDrawer();
  const nb = S.notebooks.find((n) => n.id === S.prefs.lastNb) || S.notebooks.find((n) => n.year === today().getFullYear()) || S.notebooks[0];
  if (first) await seedWelcome(nb);
  await openNotebook(nb);
  if (document.fonts?.ready) document.fonts.ready.then(() => fit(true));
}
async function seedWelcome(nb: Notebook) {
  const t = today(),
    k = `sp:${nb.id}:${keyOf('day', t)}`;
  const sp: Spread = {
    f: {},
    ink: [],
    items: [
      { id: nextId(), type: 'tape', pat: 'grid', color: '#9cc5a1', h: 26, x: 0.24, y: 0.012, w: 150, rot: -2, z: 1 },
      { id: nextId(), type: 'sticker', key: 'date', color: '#e2675e', x: 0.41, y: 0.2, w: 66, rot: 12, z: 2 },
      { id: nextId(), type: 'collage', roll: 'letters', idx: 3, x: 0.71, y: 0.33, w: 150, rot: -4, z: 3 },
      { id: nextId(), type: 'text', text: '欢迎来到贴贴本', font: "'Long Cang',cursive", color: '#c9776a', fs: 26, x: 0.72, y: 0.66, rot: -3, z: 4 },
      { id: nextId(), type: 'text', text: '按住右下角的页角，往左拖着翻页', font: "'Long Cang',cursive", color: '#6e8f69', fs: 17, x: 0.75, y: 0.88, rot: 0, z: 5 },
    ],
  };
  await db.set(k, sp);
}
boot();

if (import.meta.env.PROD && !isNative && 'serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
