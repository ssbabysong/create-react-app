// Page layouts. Every writable spot is a real field stored in the spread's `f` map.
import { ST, esc, svg } from './data/art';
import { MONTH_EN, MONTH_SHORT, WD_CN, WD_EN, addDays, dayOfYear, daysInMonth, isoWeek, pad, sameDay, startOfWeek, today, wdIndex } from './dates';
import type { Spread, View } from './state';

interface Ctx {
  d: Date;
  f: Record<string, any>;
  p: string;
}
const K = (c: Ctx, n: string) => c.p + n;
const val = (c: Ctx, n: string) => c.f[K(c, n)];
const inp = (c: Ctx, n: string, ph = '', cls = '', mode = '') =>
  `<input class="fi ${cls}" data-f="${K(c, n)}" value="${esc(val(c, n) || '')}" placeholder="${esc(ph)}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"${mode ? ` inputmode="${mode}"` : ''}>`;
const area = (c: Ctx, n: string, ph = '', cls = '') =>
  `<textarea class="fa ${cls}" data-f="${K(c, n)}" placeholder="${esc(ph)}" spellcheck="false">${esc(val(c, n) || '')}</textarea>`;
const chk = (c: Ctx, n: string) => {
  const on = !!val(c, n);
  return `<button type="button" class="box ${on ? 'done' : ''}" data-t="${K(c, n)}" aria-pressed="${on}" aria-label="勾选"></button>`;
};
const pick = (c: Ctx, n: string, v: number, inner: string, cls = '', label = '') => {
  const on = val(c, n) === v;
  return `<button type="button" class="pk-v ${cls} ${on ? 'on' : ''}" data-v="${K(c, n)}" data-val="${v}" aria-pressed="${on}"${label ? ` aria-label="${label}"` : ''}>${inner}</button>`;
};
const cyc = (c: Ctx, n: string, cls = '', inner = '', tag = 'button') => {
  const v = val(c, n) || 0;
  return `<${tag} ${tag === 'button' ? 'type="button" ' : ''}class="cyc ${cls} m${v}" data-c="${K(c, n)}" data-n="5">${inner}</${tag}>`;
};
const lbl = (t: string, small = '') => `<div class="lbl">${t}${small ? `<small>${small}</small>` : ''}</div>`;
const face = (m: number) => {
  const mouths = ['M34 66Q50 54 66 66', 'M36 64Q50 60 64 64', 'M36 62H64', 'M34 58Q50 70 66 58', 'M30 56Q50 78 70 56'];
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="3.5"/><circle cx="37" cy="44" r="4" fill="currentColor"/><circle cx="63" cy="44" r="4" fill="currentColor"/><path d="${mouths[m]}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`;
};
const MOODS = ['很好', '不错', '平静', '有点累', '低落'];
const legend = () => `<div class="legend">${MOODS.map((m, i) => `<span><i class="m${i + 1}"></i>${m}</span>`).join('')}</div>`;

function dayHead(c: Ctx) {
  const d = c.d;
  const wx = ['sun', 'cloud', 'rain', 'snow'].map((w, i) => pick(c, 'wx', i + 1, svg(ST[w]('currentColor')), 'wxb', ['晴', '多云', '雨', '雪'][i])).join('');
  return `<div class="dh"><div class="dnum">${pad(d.getDate())}</div><div class="dmeta"><b>星期${WD_CN[wdIndex(d)]}</b><span>${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()} · DAY ${dayOfYear(d)}</span></div><div class="wx">${wx}</div></div>`;
}

export const DAY_TPL: Record<string, { n: string; d: string; h: (c: Ctx) => string }> = {
  plan: {
    n: '计划+时间轴',
    d: '时间块、待办、喝水',
    h: (c) => {
      let tl = '';
      for (let h = 6; h <= 22; h++) {
        const tc = val(c, 'tc.' + h) || 0;
        tl += `<div class="tlr c${tc % 4}"><button type="button" class="hr" data-c="${K(c, 'tc.' + h)}" data-n="3" aria-label="${h} 点标记颜色">${pad(h)}</button>${inp(c, 'tl.' + h, '', 'tli')}</div>`;
      }
      const water = val(c, 'water') || 0;
      const cups = Array.from({ length: 8 }, (_, i) => `<button type="button" class="cup ${i < water ? 'f' : ''}" data-v="${K(c, 'water')}" data-val="${i + 1}" aria-label="第 ${i + 1} 杯"></button>`).join('');
      const todos = Array.from({ length: 6 }, (_, i) => `<div class="todo ${val(c, 'td.' + i + '.x') ? 'dn' : ''}">${chk(c, 'td.' + i + '.x')}${inp(c, 'td.' + i, i ? '' : '写下要做的事')}</div>`).join('');
      return `${dayHead(c)}<div class="plan"><div class="tl">${tl}</div><div class="col">
        ${lbl('To do')}${todos}
        ${lbl('Water', `${water} / 8 杯`)}<div class="cups">${cups}</div>
        ${lbl('Focus')}${area(c, 'focus', '今天最重要的一件事', 'focus')}
        ${lbl('Note')}${area(c, 'note', '', 'lines grow')}</div></div>`;
    },
  },
  diary: {
    n: '日记+拍立得',
    d: '一张照片 + 横线',
    h: (c) =>
      `${lbl(`${WD_EN[wdIndex(c.d)]}, a little diary`, `${pad(c.d.getMonth() + 1)} / ${pad(c.d.getDate())}`).replace('class="lbl"', 'class="lbl big"')}
      <div class="pola"><div>从抽屉里拖一张<br>照片或贴纸放这里</div>${inp(c, 'cap', '写一句照片说明', 'pcapt')}</div>
      ${area(c, 'diary', '今天发生了什么……', 'lined grow')}`,
  },
  mood: {
    n: '心情+感恩',
    d: '五档心情、三件小事、睡眠',
    h: (c) => {
      const sleep = val(c, 'sleep') || 0;
      return `${lbl('Mood', '今天的心情').replace('class="lbl"', 'class="lbl big"')}<div class="moods">${[0, 1, 2, 3, 4].map((i) => pick(c, 'mood', i + 1, face(i), 'mface', MOODS[4 - i])).join('')}</div>
        ${lbl('感恩三件事')}<div class="grat">${[0, 1, 2].map((i) => `<div><b>${i + 1}</b>${inp(c, 'g.' + i)}</div>`).join('')}</div>
        ${lbl('Sleep', `${sleep} 小时`)}<div class="sleep">${Array.from({ length: 12 }, (_, i) => `<button type="button" class="sl ${i < sleep ? 'f' : ''}" data-v="${K(c, 'sleep')}" data-val="${i + 1}" aria-label="${i + 1} 小时"></button>`).join('')}</div>
        ${lbl('今日一句')}${inp(c, 'quote', '写一句话给今天', 'quote')}
        ${area(c, 'note', '', 'lines grow')}`;
    },
  },
  money: {
    n: '记账小本',
    d: '收支流水和当日合计',
    h: (c) => {
      const rows = Array.from({ length: 9 }, (_, i) => `<div class="mr">${inp(c, 'mc.' + i, i ? '' : '早餐', 'mc')}${inp(c, 'md.' + i, i ? '' : '写明细', 'md')}${inp(c, 'ma.' + i, i ? '' : '-12', 'ma', 'decimal')}</div>`).join('');
      const t = moneyTotals(c.f, c.p);
      return `${lbl('Spending', `${pad(c.d.getMonth() + 1)} / ${pad(c.d.getDate())} · 收入写 +`).replace('class="lbl"', 'class="lbl big"')}<div class="money">${rows}</div>
        <div class="tot" data-sum="${c.p}"><span>支出</span><b>¥ ${t.out.toFixed(2)}</b><span>收入 ¥ ${t.inc.toFixed(2)}</span></div>${area(c, 'note', '', 'lines grow')}`;
    },
  },
  free: { n: '自由拼贴', d: '只有点阵', h: (c) => `${lbl(`${MONTH_SHORT[c.d.getMonth()]} ${pad(c.d.getDate())}`, WD_EN[wdIndex(c.d)].toUpperCase()).replace('class="lbl"', 'class="lbl big"')}<div class="free"></div>` },
};
export function moneyTotals(f: Record<string, any>, p: string) {
  let out = 0,
    inc = 0;
  for (let i = 0; i < 9; i++) {
    const raw = String(f[p + 'ma.' + i] || '').trim();
    const n = parseFloat(raw.replace(/[^0-9.+-]/g, ''));
    if (!raw || isNaN(n)) continue;
    if (raw.startsWith('+')) inc += Math.abs(n);
    else out += Math.abs(n);
  }
  return { out, inc };
}
export function updateSums(root: HTMLElement, f: Record<string, any>) {
  root.querySelectorAll<HTMLElement>('[data-sum]').forEach((el) => {
    const t = moneyTotals(f, el.dataset.sum!);
    el.innerHTML = `<span>支出</span><b>¥ ${t.out.toFixed(2)}</b><span>收入 ¥ ${t.inc.toFixed(2)}</span>`;
  });
}

function weekDay(c: Ctx, i: number, mon: Date) {
  const d = addDays(mon, i),
    t = sameDay(d, today());
  return `<div class="wday ${t ? 'today' : ''}"><div class="d">${pad(d.getDate())}<small>周${WD_CN[i]}</small></div>${area(c, 'wd.' + i, '', 'wdt')}</div>`;
}
function weekL(c: Ctx) {
  const mon = startOfWeek(c.d),
    sun = addDays(mon, 6),
    w = isoWeek(c.d);
  return `<div class="wh"><div class="big">Week ${w.week}</div><span>${pad(mon.getMonth() + 1)}.${pad(mon.getDate())} — ${pad(sun.getMonth() + 1)}.${pad(sun.getDate())}</span></div>
    ${[0, 1, 2].map((i) => weekDay(c, i, mon)).join('')}
    ${lbl('本周待办')}${[0, 1, 2].map((i) => `<div class="todo ${val(c, 'wt.' + i + '.x') ? 'dn' : ''}">${chk(c, 'wt.' + i + '.x')}${inp(c, 'wt.' + i)}</div>`).join('')}`;
}
function weekR(c: Ctx) {
  const mon = startOfWeek(c.d),
    names = ['早起', '运动', '阅读'];
  return `${[3, 4, 5, 6].map((i) => weekDay(c, i, mon)).join('')}
    ${lbl('习惯')}<div class="habits"><div class="habit"><span></span>${WD_CN.map((x) => `<span class="hd">${x}</span>`).join('')}</div>
    ${names.map((n, j) => `<div class="habit">${inp(c, 'hn.' + j, n, 'hn')}${Array.from({ length: 7 }, (_, i) => `<button type="button" class="hb ${val(c, `hb.${j}.${i}`) ? 'f' : ''}" data-t="${K(c, `hb.${j}.${i}`)}" aria-label="${n} 周${WD_CN[i]}"></button>`).join('')}</div>`).join('')}</div>`;
}
function monthL(c: Ctx) {
  const y = c.d.getFullYear(),
    m = c.d.getMonth(),
    first = wdIndex(new Date(y, m, 1)),
    days = daysInMonth(y, m),
    td = today();
  let g = WD_CN.map((d) => `<div class="wd">${d}</div>`).join('');
  for (let i = 0; i < first; i++) g += '<div class="cc ce"></div>';
  for (let d = 1; d <= days; d++) {
    const wd = (first + d - 1) % 7,
      isT = td.getFullYear() === y && td.getMonth() === m && td.getDate() === d;
    g += `<div class="cc ${wd > 4 ? 'we' : ''} ${isT ? 'today' : ''}"><span class="n">${d}</span>${inp(c, 'ev.' + d, '', 'ev')}</div>`;
  }
  return `<div class="mh"><span class="big">${pad(m + 1)}</span><span class="en">${MONTH_EN[m]}</span><span class="yr">${y}</span></div><div class="cal">${g}</div>`;
}
function monthR(c: Ctx) {
  const y = c.d.getFullYear(),
    m = c.d.getMonth(),
    days = daysInMonth(y, m),
    names = ['早起', '运动', '阅读', '早睡'];
  return `${lbl('Goals', '本月目标').replace('class="lbl"', 'class="lbl big"')}${[0, 1, 2].map((i) => `<div class="goal ${val(c, 'go.' + i + '.x') ? 'dn' : ''}">${chk(c, 'go.' + i + '.x')}${inp(c, 'go.' + i, i ? '' : '这个月想完成的事')}</div>`).join('')}
    ${lbl('Mood', '点一下换颜色')}<div class="dots">${Array.from({ length: days }, (_, i) => cyc(c, 'md.' + (i + 1), 'dot', `<i>${i + 1}</i>`)).join('')}</div>${legend()}
    ${lbl('Habits', `${days} 天`)}<div class="hgrid-w">${names.map((n, j) => `<div class="hgrid" style="--days:${days}">${inp(c, 'mhn.' + j, n, 'hn')}${Array.from({ length: days }, (_, i) => `<button type="button" class="hg ${val(c, `mh.${j}.${i + 1}`) ? 'f' : ''}" data-t="${K(c, `mh.${j}.${i + 1}`)}" aria-label="${n} ${i + 1} 日"></button>`).join('')}</div>`).join('')}</div>
    ${lbl('Memo')}${area(c, 'memo', '', 'lines grow')}`;
}
function yearL(c: Ctx) {
  const y = c.d.getFullYear();
  let g = '<span></span>' + Array.from({ length: 12 }, (_, i) => `<span>${i + 1}</span>`).join('');
  for (let d = 1; d <= 31; d++) {
    g += `<span>${d}</span>`;
    for (let m = 0; m < 12; m++) g += d > daysInMonth(y, m) ? '<i class="x"></i>' : cyc(c, `px.${m + 1}.${d}`, 'px', '', 'i');
  }
  return `<div class="yh"><span class="big">${y}</span><span>Year in pixels · 每天点一格</span></div><div class="pix">${g}</div>${legend()}`;
}
function yearR(c: Ctx) {
  return `${lbl(`${c.d.getFullYear()} Goals`, '年度目标').replace('class="lbl"', 'class="lbl big"')}${[0, 1, 2, 3, 4].map((i) => `<div class="goal ${val(c, 'yg.' + i + '.x') ? 'dn' : ''}">${chk(c, 'yg.' + i + '.x')}${inp(c, 'yg.' + i, i ? '' : '今年想做到的事')}</div>`).join('')}
    ${lbl('每月关键词')}<div class="kw">${[0, 1, 2, 3, 4, 5].map((r) => [r, r + 6].map((i) => `<span>${pad(i + 1)}</span>${inp(c, 'kw.' + i, '', 'kwi')}`).join('')).join('')}</div>
    ${lbl('Memo')}${area(c, 'memo', '', 'lines grow')}`;
}

export const DEFAULT_TPL = { L: 'plan', R: 'diary' };
export function pageHTML(view: View, d: Date, side: 'L' | 'R', sp: Spread) {
  const c: Ctx = { d, f: sp.f, p: side + '.' };
  if (view === 'day') return DAY_TPL[(sp.tpl || DEFAULT_TPL)[side]].h(c);
  if (view === 'week') return side === 'L' ? weekL(c) : weekR(c);
  if (view === 'month') return side === 'L' ? monthL(c) : monthR(c);
  return side === 'L' ? yearL(c) : yearR(c);
}
export const VIEW_NAME: Record<View, string> = { year: '年度页', month: '月页', week: '周页', day: '日页' };
