// The shelf: one notebook per year, plus settings.
import { esc, ic } from './data/art';
import * as db from './store';
import { SFX } from './sound';
import { H, type Notebook, S, keyOf, loadSpread, nextId, savePrefs, saveNotebooks } from './state';
import { today } from './dates';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const COVERS = ['#6e8f69', '#c9776a', '#d6a240', '#7f97a6', '#8b6f5a', '#3f4a3c'];

export async function openNotebook(nb: Notebook) {
  S.nb = nb;
  S.spreads.clear();
  S.prefs.lastNb = nb.id;
  savePrefs();
  const t = today();
  S.view = 'day';
  S.date = t.getFullYear() === nb.year ? t : new Date(nb.year, 0, 1);
  S.page = 0;
  await loadSpread(keyOf());
  $('#nbName').textContent = nb.name;
  hideShelf();
  H.render();
}
export function newNotebook(year: number, name: string, cover: string): Notebook {
  const nb = { id: 'nb' + nextId(), year, name, cover, created: Date.now() };
  S.notebooks.push(nb);
  saveNotebooks();
  return nb;
}
export function hideShelf() {
  $('#shelf').hidden = true;
}
export function showShelf() {
  renderShelf();
  $('#shelf').hidden = false;
  SFX.tick();
}
let editing: string | null = null;
function renderShelf() {
  const list = [...S.notebooks].sort((a, b) => b.year - a.year);
  const years = new Set(list.map((n) => n.year));
  const sugg = years.has(today().getFullYear()) ? Math.max(...years) + 1 : today().getFullYear();
  const form = (nb?: Notebook) => {
    const y = nb ? nb.year : sugg,
      c = nb ? nb.cover : COVERS[list.length % COVERS.length];
    return `<form class="nbform" data-id="${nb ? nb.id : ''}">
      <label>年份<span class="stepper"><button type="button" data-y="-1" ${nb ? 'disabled' : ''} aria-label="减一年">−</button><output id="nbYear">${y}</output><button type="button" data-y="1" ${nb ? 'disabled' : ''} aria-label="加一年">+</button></span></label>
      <label>名字<input id="nbName2" value="${esc(nb ? nb.name : '日常碎片本')}" maxlength="16" autocomplete="off"></label>
      <div class="covers">${COVERS.map((x) => `<button type="button" data-cv="${x}" style="background:${x}" aria-label="封面颜色" aria-pressed="${x === c}"></button>`).join('')}</div>
      <div class="facts">${nb ? `<button type="button" class="btn ghost danger" data-del="${nb.id}">删除这本</button>` : ''}<button type="button" class="btn ghost" data-cancel="1">取消</button><button type="submit" class="btn">${nb ? '保存' : '新建'}</button></div></form>`;
  };
  $('#shelf').innerHTML = `<div class="shelf-in">
    <header class="sh-top"><div><div class="sh-eyebrow">贴贴本</div><h1>书架</h1></div><button class="btn ghost" type="button" data-back="1" ${S.nb ? '' : 'hidden'}>回到本子</button></header>
    <div class="sh-row">${list
      .map(
        (nb) => `<div class="cover-w"><button class="cover" type="button" data-open="${nb.id}" style="--cv:${nb.cover}"><span class="cv-tape"></span><span class="yr">${nb.year}</span><span class="nm">${esc(nb.name)}</span><span class="meta">${nb.id === S.nb?.id ? '正在写' : '一年一本'}</span></button><button class="edit" type="button" data-edit="${nb.id}" aria-label="编辑">编辑</button></div>`
      )
      .join('')}
      <button class="newbook" type="button" data-new="1">${ic('plus')}<span>新本子</span></button></div>
    <div class="sh-shelfline"></div>
    ${editing ? `<div class="sh-form">${form(S.notebooks.find((n) => n.id === editing))}</div>` : ''}
    <section class="sh-set">
      <h2>设置</h2>
      <label class="sw-row"><input type="checkbox" id="sndT" ${S.prefs.sound ? 'checked' : ''}> 纸张音效</label>
      <p>添加到主屏幕：在 Safari 里点「分享」，再选「添加到主屏幕」，就能像 App 一样全屏打开，没网也能用。</p>
      <p>所有内容只存在这台设备的浏览器里。清除 Safari 网站数据会把它们一起删掉。</p>
      <button type="button" class="btn ghost danger" data-wipe="1">清空所有数据</button>
    </section></div>`;
}
export function wireShelf() {
  const sh = $('#shelf');
  sh.addEventListener('click', async (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button');
    if (!b) return;
    if (b.dataset.open) {
      const nb = S.notebooks.find((n) => n.id === b.dataset.open)!;
      editing = null;
      return openNotebook(nb);
    }
    if (b.dataset.back) return hideShelf();
    if (b.dataset.new) {
      editing = 'new';
      renderShelf();
      return;
    }
    if (b.dataset.edit) {
      editing = b.dataset.edit;
      renderShelf();
      return;
    }
    if (b.dataset.cancel) {
      editing = null;
      renderShelf();
      return;
    }
    if (b.dataset.y) {
      const o = sh.querySelector('#nbYear')!;
      o.textContent = String(+o.textContent! + +b.dataset.y);
      return;
    }
    if (b.dataset.cv) {
      sh.querySelectorAll('[data-cv]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      return;
    }
    if (b.dataset.del) {
      if (b.dataset.sure) {
        const id = b.dataset.del;
        S.notebooks = S.notebooks.filter((n) => n.id !== id);
        saveNotebooks();
        (await db.keys(`sp:${id}:`)).forEach((k) => db.del(k));
        editing = null;
        if (S.nb?.id === id) S.nb = null;
        if (!S.notebooks.length) newNotebook(today().getFullYear(), '日常碎片本', COVERS[0]);
        renderShelf();
      } else {
        b.dataset.sure = '1';
        b.textContent = '再点一次确认删除';
      }
      return;
    }
    if (b.dataset.wipe) {
      if (b.dataset.sure) {
        await db.clearAll();
        location.reload();
      } else {
        b.dataset.sure = '1';
        b.textContent = '再点一次，清空全部本子和贴纸';
      }
    }
  });
  sh.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    const year = +sh.querySelector('#nbYear')!.textContent!,
      name = (sh.querySelector('#nbName2') as HTMLInputElement).value.trim() || `${year} 手帐`,
      cover = (sh.querySelector('[data-cv][aria-pressed="true"]') as HTMLElement)?.dataset.cv || COVERS[0];
    if (f.dataset.id) {
      const nb = S.notebooks.find((n) => n.id === f.dataset.id)!;
      nb.name = name;
      nb.cover = cover;
      saveNotebooks();
      if (S.nb?.id === nb.id) $('#nbName').textContent = name;
    } else newNotebook(year, name, cover);
    editing = null;
    renderShelf();
  });
  sh.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.id === 'sndT') {
      S.prefs.sound = t.checked;
      savePrefs();
      SFX.tick();
    }
  });
}
