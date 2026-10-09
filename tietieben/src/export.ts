// Export a spread or a single page as a PNG: clone the live pages into an SVG foreignObject with the
// app CSS and only the web-font subsets the page actually uses, rasterise on a canvas, then share or save.
import { ymd } from './dates';
import { H, PH, PW, S, SPW } from './state';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const PAD = 40,
  SCALE = 3;
const fontCache = new Map<string, string>();
let fontFaces: { block: string; ranges: [number, number][]; url: string }[] | null = null;

const toDataURL = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(b);
  });

async function loadFontFaces() {
  if (fontFaces) return fontFaces;
  const link = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].find((l) => l.href.includes('fonts.googleapis.com'));
  fontFaces = [];
  if (!link) return fontFaces;
  try {
    const css = await (await fetch(link.href)).text();
    for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
      const url = (block.match(/url\(([^)]+)\)/) || [])[1];
      if (!url) continue;
      const ur = (block.match(/unicode-range:\s*([^;]+);/) || [])[1];
      const ranges: [number, number][] = ur
        ? ur.split(',').map((p) => {
            const [a, b] = p.trim().replace(/^U\+/i, '').split('-');
            const lo = parseInt(a.replace(/\?/g, '0'), 16),
              hi = b ? parseInt(b, 16) : parseInt(a.replace(/\?/g, 'f'), 16);
            return [lo, hi] as [number, number];
          })
        : [[0, 0x10ffff]];
      fontFaces.push({ block, ranges, url: url.replace(/['"]/g, '') });
    }
  } catch {
    /* offline: export falls back to system fonts */
  }
  return fontFaces;
}
async function fontCSS(text: string) {
  const faces = await loadFontFaces();
  const cps = new Set<number>();
  for (const ch of text) cps.add(ch.codePointAt(0)!);
  for (let c = 0x20; c < 0x7f; c++) cps.add(c);
  const used = faces.filter((f) => f.ranges.some(([lo, hi]) => [...cps].some((c) => c >= lo && c <= hi)));
  const parts = await Promise.all(
    used.map(async (f) => {
      try {
        if (!fontCache.has(f.url)) fontCache.set(f.url, await toDataURL(await (await fetch(f.url)).blob()));
        return f.block.replace(/url\([^)]+\)/, `url(${fontCache.get(f.url)})`);
      } catch {
        return '';
      }
    })
  );
  return parts.join('\n');
}
function appCSS() {
  let css = '';
  for (const sh of [...document.styleSheets]) {
    try {
      for (const r of [...sh.cssRules]) css += r.cssText + '\n';
    } catch {
      /* cross-origin sheet (fonts) is handled separately */
    }
  }
  return css;
}

/** Clone #pages into static markup: form fields become plain text boxes, editing chrome is removed. */
async function cloneSpread() {
  const src = $('#pages');
  const clone = src.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.querySelectorAll('.corner,.hdl,.fliplayer,.pulse,.foot button').forEach((e) => e.remove());
  clone.querySelectorAll('.sel').forEach((e) => e.classList.remove('sel'));
  const sf = src.querySelectorAll<HTMLElement>('input,textarea,button'),
    cf = clone.querySelectorAll<HTMLElement>('input,textarea,button');
  sf.forEach((s, i) => {
    const c = cf[i];
    if (!c) return;
    const cs = getComputedStyle(s);
    const el = document.createElement(s.tagName === 'TEXTAREA' ? 'div' : 'span');
    el.className = c.className;
    el.setAttribute('style', c.getAttribute('style') || '');
    if (s.tagName === 'BUTTON') {
      el.innerHTML = c.innerHTML;
      el.style.display = cs.display === 'inline' ? 'inline-block' : cs.display;
    } else {
      el.textContent = (s as HTMLInputElement).value;
      el.style.display = 'block';
      el.style.width = s.offsetWidth + 'px';
      el.style.height = s.offsetHeight + 'px';
      el.style.overflow = 'hidden';
      el.style.whiteSpace = s.tagName === 'TEXTAREA' ? 'pre-wrap' : 'pre';
      if (s.tagName === 'INPUT') {
        el.style.lineHeight = s.offsetHeight + 'px';
        el.style.textAlign = cs.textAlign;
      }
    }
    c.replaceWith(el);
  });
  await Promise.all(
    [...clone.querySelectorAll('img')].map(async (img) => {
      if (img.src.startsWith('data:')) return;
      try {
        img.src = await toDataURL(await (await fetch(img.src)).blob());
      } catch {
        img.remove();
      }
    })
  );
  return clone;
}

export async function exportImage(part: 'spread' | 'L' | 'R') {
  H.toast('正在生成图片……');
  const clone = await cloneSpread();
  if (part !== 'spread') clone.querySelector(part === 'L' ? '.page.R' : '.page.L')?.remove();
  const ox = part === 'R' ? PW : 0,
    w = part === 'spread' ? SPW : PW;
  const W = w + PAD * 2,
    Hh = PH + PAD * 2 + 24;
  const defs = (document.querySelector('#pgrain')?.closest('svg') as SVGElement | null)?.innerHTML || '';
  const fonts = await fontCSS(clone.textContent || '');
  const css = `${fonts}\n${appCSS()}\n*{animation:none!important;transition:none!important}
    .xroot{position:relative;width:${SPW + PAD * 2}px;height:${Hh}px;background:var(--desk);background-image:var(--desk-pat);background-size:6px 6px;font-family:var(--f-ui);color:var(--ink);font-size:14px;line-height:1.45}
    .xroot .pages{left:${PAD}px;top:${PAD}px}
    .xmark{position:absolute;right:${PAD + (part === 'L' ? PW : 0)}px;bottom:14px;font:12px var(--f-num);font-style:italic;color:rgba(58,49,39,.45);letter-spacing:.04em}`;
  const html = new XMLSerializer().serializeToString(clone);
  const date = ymd(S.date).replace(/-/g, '.');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${Hh * SCALE}" viewBox="${ox} 0 ${W} ${Hh}"><defs>${defs}</defs><style><![CDATA[${css}]]></style><foreignObject x="0" y="0" width="${SPW + PAD * 2}" height="${Hh}"><div xmlns="http://www.w3.org/1999/xhtml" class="xroot">${html}<div class="xmark">贴贴本 · ${date}</div></div></foreignObject></svg>`;
  // A data: URL (not blob:) keeps the canvas untainted in Chrome and Safari.
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const cv = document.createElement('canvas');
    cv.width = W * SCALE;
    cv.height = Hh * SCALE;
    const cx = cv.getContext('2d')!;
    // Safari sometimes paints web fonts only on the second draw of an SVG image.
    cx.drawImage(img, 0, 0);
    await new Promise((r) => setTimeout(r, 180));
    cx.clearRect(0, 0, cv.width, cv.height);
    cx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, 'image/png'));
    if (!blob) throw new Error('empty');
    showResult(blob, `tietieben-${ymd(S.date)}${part === 'spread' ? '' : '-' + part}.png`);
  } catch (err) {
    console.error('export', err);
    H.toast('图片生成失败，请再试一次');
  }
}

function showResult(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const file = new File([blob], name, { type: 'image/png' });
  const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  const ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = `<div class="modal export" role="dialog" aria-label="导出图片">
    <div class="mhead"><b>图片做好了</b><span>${canShare ? '点「分享」可以存到相册或发给朋友。' : '点「下载」保存图片。'}在手机上也可以长按图片保存。</span></div>
    <div class="ex-prev"><img src="${url}" alt="导出的手帐页面"></div>
    <div class="macts"><button class="btn ghost" type="button" data-x="close">关闭</button>${canShare ? '<button class="btn ghost" type="button" data-x="dl">下载</button><button class="btn" type="button" data-x="share">分享</button>' : '<button class="btn" type="button" data-x="dl">下载</button>'}</div></div>`;
  document.body.appendChild(ov);
  const close = () => {
    ov.remove();
    URL.revokeObjectURL(url);
  };
  ov.addEventListener('click', async (e) => {
    if (e.target === ov) return close();
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-x]');
    if (!b) return;
    if (b.dataset.x === 'close') return close();
    if (b.dataset.x === 'share') {
      try {
        await navigator.share({ files: [file], title: '贴贴本' });
      } catch {
        /* user cancelled */
      }
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}
