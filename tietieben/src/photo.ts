// Turning a photo into a sticker: auto background removal, eraser / restore brush, category, save.
import * as db from './store';
import { CATS } from './drawer';
import { defaultSpot, pushItem } from './items';
import { SFX } from './sound';
import { H, S, nextId, saveMine } from './state';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;

export function wirePhoto() {
  const fi = $<HTMLInputElement>('#fileIn');
  fi.addEventListener('change', () => {
    const f = fi.files && fi.files[0];
    fi.value = '';
    if (f) openFile(f);
  });
  document.addEventListener('paste', (e) => {
    const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith('image/'));
    if (f) {
      e.preventDefault();
      openFile(f);
    }
  });
  const pages = $('#pages');
  pages.addEventListener('dragover', (e) => {
    if ([...(e.dataTransfer?.items || [])].some((i) => i.type.startsWith('image/'))) {
      e.preventDefault();
      pages.classList.add('dropping');
    }
  });
  pages.addEventListener('dragleave', () => pages.classList.remove('dropping'));
  pages.addEventListener('drop', (e) => {
    pages.classList.remove('dropping');
    const f = [...(e.dataTransfer?.files || [])].find((x) => x.type.startsWith('image/'));
    if (!f) return;
    e.preventDefault();
    const r = pages.getBoundingClientRect();
    openFile(f, [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]);
  });
}

function openFile(f: File, at?: [number, number]) {
  const url = URL.createObjectURL(f),
    img = new Image();
  img.onload = () => {
    editor(img, at);
    URL.revokeObjectURL(url);
  };
  img.onerror = () => H.toast('这张图片打不开，换一张试试');
  img.src = url;
}

function editor(img: HTMLImageElement, at?: [number, number]) {
  const max = 900,
    s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * s)),
    h = Math.max(1, Math.round(img.naturalHeight * s));
  const src = document.createElement('canvas');
  src.width = w;
  src.height = h;
  const sx = src.getContext('2d', { willReadFrequently: true })!;
  sx.drawImage(img, 0, 0, w, h);
  const orig = sx.getImageData(0, 0, w, h);
  const mask = new Uint8ClampedArray(w * h).fill(255);
  // Already transparent (e.g. a subject copied from Photos) → skip auto removal by default.
  let transparent = false;
  for (let i = 3; i < orig.data.length; i += 4 * 97) if (orig.data[i] < 200) { transparent = true; break; }
  let auto = !transparent,
    tol = 46,
    brush: 'erase' | 'restore' = 'erase',
    bsize = 26,
    cat = S.prefs.mcat !== '全部' ? S.prefs.mcat : CATS[0];

  const ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = `<div class="modal" role="dialog" aria-label="把照片做成贴纸">
    <div class="mhead"><b>做成贴纸</b><span>抹掉不要的部分，留下的会加上白边</span></div>
    <div class="mbody"><div class="cv-wrap"><canvas id="cv"></canvas></div>
      <div class="mopts">
        <label class="sw-row"><input type="checkbox" id="autoBg" ${auto ? 'checked' : ''}> 自动去掉背景</label>
        <label class="rng">灵敏度<input type="range" id="tol" min="10" max="110" value="${tol}"></label>
        <div class="seg2" role="group" aria-label="画笔"><button type="button" data-b="erase" aria-pressed="true">擦除</button><button type="button" data-b="restore" aria-pressed="false">恢复</button></div>
        <label class="rng">笔刷<input type="range" id="bsize" min="6" max="80" value="${bsize}"></label>
        <div class="mlabel">放进分类</div><div class="fchips" id="cats"></div>
        <p class="mnote">背景是纯色时自动去除效果最好。iPhone 和 iPad 上也可以在「照片」里长按主体拷贝，再到这里粘贴。</p>
      </div></div>
    <div class="macts"><button class="btn ghost" type="button" data-x="cancel">取消</button><button class="btn ghost" type="button" data-x="save">存进贴纸库</button><button class="btn" type="button" data-x="use">贴到本子上</button></div></div>`;
  document.body.appendChild(ov);
  const cv = ov.querySelector<HTMLCanvasElement>('#cv')!;
  cv.width = w;
  cv.height = h;
  const cx = cv.getContext('2d')!;
  const out = cx.createImageData(w, h);
  const drawCats = () =>
    (ov.querySelector('#cats')!.innerHTML = CATS.map((c) => `<button type="button" data-cat="${c}" aria-pressed="${c === cat}">${c}</button>`).join(''));
  drawCats();

  function autoMask() {
    mask.fill(255);
    if (!auto) return;
    const p = orig.data;
    let br = 0, bg = 0, bb = 0, n = 0;
    const sm = (i: number) => { br += p[i]; bg += p[i + 1]; bb += p[i + 2]; n++; };
    for (let i = 0; i < w; i++) { sm(i * 4); sm(((h - 1) * w + i) * 4); }
    for (let j = 0; j < h; j++) { sm(j * w * 4); sm((j * w + w - 1) * 4); }
    br /= n; bg /= n; bb /= n;
    const t2 = tol * tol, seen = new Uint8Array(w * h), q: number[] = [];
    const near = (k: number) => { const i = k * 4, a = p[i] - br, b = p[i + 1] - bg, c = p[i + 2] - bb; return a * a + b * b + c * c < t2; };
    for (let i = 0; i < w; i++) q.push(i, (h - 1) * w + i);
    for (let j = 0; j < h; j++) q.push(j * w, j * w + w - 1);
    while (q.length) {
      const k = q.pop()!;
      if (seen[k]) continue;
      seen[k] = 1;
      if (!near(k)) continue;
      mask[k] = 0;
      const x = k % w, y = (k / w) | 0;
      if (x > 0) q.push(k - 1);
      if (x < w - 1) q.push(k + 1);
      if (y > 0) q.push(k - w);
      if (y < h - 1) q.push(k + w);
    }
  }
  let raf = 0;
  function draw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const a = orig.data, o = out.data;
      for (let k = 0, i = 0; k < mask.length; k++, i += 4) {
        o[i] = a[i]; o[i + 1] = a[i + 1]; o[i + 2] = a[i + 2];
        o[i + 3] = (a[i + 3] * mask[k]) / 255;
      }
      cx.putImageData(out, 0, 0);
    });
  }
  autoMask();
  draw();

  // brush
  let painting = false;
  const paint = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect(),
      x = ((e.clientX - r.left) / r.width) * w,
      y = ((e.clientY - r.top) / r.height) * h,
      rad = (bsize / r.width) * w,
      v = brush === 'erase' ? 0 : 255;
    for (let yy = Math.max(0, (y - rad) | 0); yy < Math.min(h, y + rad); yy++)
      for (let xx = Math.max(0, (x - rad) | 0); xx < Math.min(w, x + rad); xx++) if ((xx - x) ** 2 + (yy - y) ** 2 <= rad * rad) mask[yy * w + xx] = v;
    draw();
  };
  cv.addEventListener('pointerdown', (e) => { painting = true; cv.setPointerCapture(e.pointerId); paint(e); });
  cv.addEventListener('pointermove', (e) => painting && paint(e));
  cv.addEventListener('pointerup', () => (painting = false));
  cv.addEventListener('pointercancel', () => (painting = false));

  ov.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.id === 'tol') { tol = +t.value; if (auto) { autoMask(); draw(); } }
    if (t.id === 'bsize') bsize = +t.value;
  });
  ov.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.id === 'autoBg') { auto = t.checked; autoMask(); draw(); }
  });
  ov.addEventListener('click', async (e) => {
    if (e.target === ov) return ov.remove();
    const b = (e.target as HTMLElement).closest<HTMLElement>('button');
    if (!b) return;
    if (b.dataset.b) {
      brush = b.dataset.b as any;
      ov.querySelectorAll('[data-b]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      return;
    }
    if (b.dataset.cat) { cat = b.dataset.cat; drawCats(); return; }
    if (!b.dataset.x) return;
    if (b.dataset.x === 'cancel') return ov.remove();
    const res = await finalize();
    ov.remove();
    if (!res) return H.toast('没有留下内容，换一张试试');
    const id = 'i' + nextId();
    await db.set('img:' + id, res.blob);
    S.imgs.set(id, URL.createObjectURL(res.blob));
    S.mine.unshift({ id, cat, img: id });
    saveMine();
    S.prefs.mcat = cat;
    H.renderDrawer();
    SFX.peel();
    if (b.dataset.x === 'use') {
      const [fx, fy] = at || defaultSpot();
      pushItem({ type: 'photo', img: id, w: Math.round(Math.min(200, 140 * Math.max(0.6, res.aspect))), rot: -3 }, fx, fy);
    } else H.toast(`已存进「${cat}」`);
  });

  function finalize(): Promise<{ blob: Blob; aspect: number } | null> {
    const a = orig.data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const k = y * w + x;
        if (mask[k] > 8 && a[k * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
    if (x1 < 0) return Promise.resolve(null);
    const c = document.createElement('canvas');
    c.width = x1 - x0 + 1;
    c.height = y1 - y0 + 1;
    c.getContext('2d')!.drawImage(cv, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
    return new Promise((res) => c.toBlob((blob) => res(blob ? { blob, aspect: c.width / c.height } : null), 'image/png'));
  }
}
