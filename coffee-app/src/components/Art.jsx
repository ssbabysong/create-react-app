// 每支豆子的专属封面：按风味挑选水果/杯子等图案，饱和色底 + 水粉颗粒 + 错位的彩色描线
import { useId } from 'react';

/* ---------- 工具 ---------- */

function hash(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
}

function rng(seed) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 先铺色块，再错位描一道彩色线，像手工套色没对准
function Sh({ d, fill, line, w = 2.4, off = [-2, -1.5] }) {
  return (
    <>
      <path d={d} fill={fill} stroke="none" />
      {line && <path d={d} fill="none" stroke={line} strokeWidth={w} transform={`translate(${off[0]} ${off[1]})`} />}
    </>
  );
}

function Circ({ cx, cy, r, fill, line, w = 2.2 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke="none" />
      {line && <circle cx={cx - 1.6} cy={cy - 1.2} r={r} fill="none" stroke={line} strokeWidth={w} />}
    </>
  );
}

function Flower({ x, y, r = 6, petal = '#fffdf0', center = '#ffcf33', line }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.62} rx={r * 0.48} ry={r * 0.62} fill={petal} transform={`rotate(${a})`} />
      ))}
      {line && <circle r={r * 0.95} fill="none" stroke={line} strokeWidth="1" opacity="0.5" />}
      <circle r={r * 0.28} fill={center} />
    </g>
  );
}

const W = '#ffffff';

/* ---------- 图案（以 0,0 为中心，约 100×100） ---------- */

const MOTIFS = {
  peach: {
    bg: ['mint', 'sky', 'aqua'],
    draw: (g) => (
      <>
        <Sh d="M2 -40 C10 -58 30 -60 40 -52 C30 -42 14 -38 2 -40 Z" fill="#43b05c" line="#1d6b3a" />
        <Sh d="M0 -40 C28 -44 46 -20 44 6 C42 32 22 46 0 44 C-22 46 -42 32 -44 6 C-46 -20 -28 -44 0 -40 Z" fill={`url(#${g}-peach)`} line="#3d5bd0" />
        <path d="M-2 -36 C-10 -12 -10 16 0 40" stroke="#e86f7c" strokeWidth="2.4" fill="none" />
        <path d="M-30 -14 C-34 -4 -34 6 -30 14" stroke={W} strokeWidth="5" fill="none" opacity="0.6" strokeLinecap="round" />
      </>
    ),
  },
  lychee: {
    bg: ['sky', 'mint', 'lavender'],
    draw: () => (
      <>
        <Circ cx={-16} cy={-6} r={30} fill="#ec3f4f" line="#2f3fae" />
        <circle cx={-16} cy={-6} r={24} fill="none" stroke="#b81f35" strokeWidth="4" strokeDasharray="2 5" />
        <Sh d="M4 30 C0 4 20 -14 40 -4 C52 4 54 30 40 40 C26 50 8 44 4 30 Z" fill="#c5263a" line="#2f3fae" />
        <Sh d="M12 26 C10 8 24 -2 38 4 C48 10 48 28 38 34 C28 40 14 38 12 26 Z" fill="#fbfaf0" line="#9fb2e6" w={1.6} />
        <path d="M20 12 C24 6 30 4 36 8" stroke="#dfe7ff" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  citrus: {
    bg: ['sky', 'lavender', 'coral'],
    draw: () => (
      <>
        <Sh d="M-52 -18 C-50 -38 -20 -48 -4 -34 C8 -24 0 -2 -20 4 C-38 8 -54 2 -52 -18 Z" fill="#ffcf1f" line="#c77800" />
        <Circ cx={10} cy={12} r={34} fill="#ffd23f" line="#d07a00" />
        <circle cx={10} cy={12} r={29} fill="#fff3a6" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="10" y1="12" x2={10 + 27 * Math.cos((a * Math.PI) / 180)} y2={12 + 27 * Math.sin((a * Math.PI) / 180)} stroke="#ffc928" strokeWidth="3" />
        ))}
        <circle cx="10" cy="12" r="4" fill="#fff8d0" />
      </>
    ),
  },
  berry: {
    bg: ['mint', 'aqua', 'lemon'],
    draw: () => (
      <>
        <Sh d="M0 40 C-30 20 -38 -6 -30 -20 C-22 -32 22 -32 30 -20 C38 -6 30 20 0 40 Z" fill="#ef3b4f" line="#8e1430" />
        {[[-14, -8], [0, -14], [14, -8], [-18, 8], [-4, 4], [10, 6], [20, 4], [-8, 20], [6, 22]].map(([x, y]) => (
          <ellipse key={`${x}${y}`} cx={x} cy={y} rx="1.6" ry="2.4" fill="#ffe27a" />
        ))}
        <Sh d="M-22 -24 L-8 -28 L0 -40 L8 -28 L22 -24 L8 -20 L0 -24 L-8 -20 Z" fill="#3fae4f" line="#1e6b3a" w={1.8} />
        <Circ cx={34} cy={28} r={9} fill="#4b5fc9" line="#1d2a7a" w={1.8} />
        <Circ cx={44} cy={14} r={8} fill="#5a6fd6" line="#1d2a7a" w={1.8} />
      </>
    ),
  },
  grape: {
    bg: ['lemon', 'sage', 'mint'],
    draw: () => (
      <>
        <Sh d="M4 -34 C14 -50 34 -50 42 -40 C32 -32 18 -30 4 -34 Z" fill="#55b85f" line="#1d6b3a" />
        <path d="M0 -34 L2 -44" stroke="#6b4a2a" strokeWidth="3" />
        {[[-24, -20], [-8, -22], [8, -22], [24, -20], [-16, -4], [0, -6], [16, -4], [-8, 12], [8, 12], [0, 28]].map(([x, y]) => (
          <g key={`${x}${y}`}>
            <Circ cx={x} cy={y} r={9.5} fill="#8e5bd6" line="#3a2588" w={1.8} />
            <circle cx={x - 3} cy={y - 3} r="2.4" fill={W} opacity="0.6" />
          </g>
        ))}
      </>
    ),
  },
  flower: {
    bg: ['coral', 'sky', 'lavender'],
    draw: () => (
      <>
        {[[-22, -22], [14, -30], [26, 2], [-12, 8], [0, -8]].map(([x, y]) => (
          <path key={`s${x}`} d={`M${x} ${y} C${x / 2} ${y / 2 + 20} 0 30 0 46`} stroke="#3c9a4a" strokeWidth="1.8" fill="none" />
        ))}
        <Sh d="M0 46 C-10 30 -24 26 -32 30 C-24 40 -12 44 0 46 Z" fill="#4cae55" line="#1d6b3a" w={1.6} />
        <Flower x={-22} y={-22} r={15} line="#c79b1f" />
        <Flower x={14} y={-30} r={13} line="#c79b1f" />
        <Flower x={26} y={2} r={14} line="#c79b1f" />
        <Flower x={-12} y={8} r={13} line="#c79b1f" />
        <Flower x={0} y={-8} r={11} line="#c79b1f" />
      </>
    ),
  },
  tropical: {
    bg: ['sky', 'lavender', 'mint'],
    draw: (g) => (
      <>
        <Sh d="M14 -36 C20 -52 38 -54 46 -46 C36 -38 24 -34 14 -36 Z" fill="#43b05c" line="#1d6b3a" />
        <Sh d="M-30 10 C-40 -20 -10 -42 16 -36 C42 -30 46 0 30 22 C14 42 -20 40 -30 10 Z" fill={`url(#${g}-mango)`} line="#c4501f" />
        <path d="M-16 -18 C-22 -8 -22 2 -18 10" stroke={W} strokeWidth="5" fill="none" opacity="0.5" strokeLinecap="round" />
      </>
    ),
  },
  tea: {
    bg: ['sage', 'coral', 'aqua'],
    draw: () => (
      <>
        <Sh d="M-46 24 C-46 16 46 16 46 24 C46 34 -46 34 -46 24 Z" fill="#f6c45e" line="#3d5bd0" />
        <path d="M30 -2 C48 -6 50 16 30 16" stroke="#ff9d2e" strokeWidth="6" fill="none" />
        <Sh d="M-34 -8 C-34 18 -18 30 0 30 C18 30 34 18 34 -8 Z" fill="#ff9d2e" line="#3d5bd0" />
        <ellipse cx="0" cy="-8" rx="34" ry="9" fill="#ffb64d" />
        <ellipse cx="0" cy="-7" rx="28" ry="6.5" fill="#d9822b" />
        <path d="M-6 -8 C-2 -12 6 -12 10 -7 C4 -4 -2 -4 -6 -8 Z" fill="#5fb85a" />
        <path d="M-24 4 C-22 12 -16 18 -8 22" stroke={W} strokeWidth="3.5" fill="none" opacity="0.6" strokeLinecap="round" />
      </>
    ),
  },
  honey: {
    bg: ['sky', 'lavender', 'mint'],
    draw: (g) => (
      <>
        <Sh d="M-28 -18 C-30 10 -26 32 0 32 C26 32 30 10 28 -18 Z" fill={`url(#${g}-honey)`} line="#9a4a14" />
        <Sh d="M-31 -32 L31 -32 L29 -18 L-29 -18 Z" fill="#ef6f5c" line="#9a2a1a" />
        <Sh d="M-10 -18 C-10 -4 -2 -4 -2 -12 L-2 -18 Z" fill="#ffb627" />
        <ellipse cx="0" cy="8" rx="15" ry="10" fill="#fffbea" />
        <path d="M-8 8 L8 8 M-5 13 L5 13" stroke="#e0a030" strokeWidth="2" />
      </>
    ),
  },
  caramel: {
    bg: ['coral', 'mint', 'lavender'],
    draw: () => {
      const cube = (x, y, s = 1) => (
        <g key={`${x}${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <Sh d="M0 -18 L20 -8 L0 2 L-20 -8 Z" fill="#fff0c4" line="#b06d1c" w={1.8} />
          <Sh d="M-20 -8 L0 2 L0 24 L-20 14 Z" fill="#f6c76a" line="#b06d1c" w={1.8} />
          <Sh d="M20 -8 L0 2 L0 24 L20 14 Z" fill="#e7a240" line="#b06d1c" w={1.8} />
        </g>
      );
      return <>{[cube(0, -22), cube(-22, 10), cube(22, 10)]}</>;
    },
  },
  nuts: {
    bg: ['mint', 'aqua', 'sky'],
    draw: () => (
      <>
        {[[-22, 4, -30], [10, -14, 20], [16, 22, 70]].map(([x, y, r]) => (
          <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
            <Sh d="M0 -22 C15 -13 17 11 0 22 C-17 11 -15 -13 0 -22 Z" fill="#c98a55" line="#6e3d1a" />
            <path d="M-4 -12 C-6 0 -6 8 -3 14 M4 -10 C6 0 6 6 4 12" stroke="#a96a38" strokeWidth="1.6" fill="none" />
          </g>
        ))}
      </>
    ),
  },
  choc: {
    bg: ['pink', 'aqua', 'lemon'],
    draw: () => (
      <g transform="rotate(-14)">
        <Sh d="M-36 -26 L36 -26 L36 26 L-36 26 Z" fill="#6b3a22" line="#2a1208" />
        {[-24, 0, 24].map((x) => [-13, 13].map((y) => (
          <rect key={`${x}${y}`} x={x - 9} y={y - 9} width="18" height="18" rx="2" fill="#86492b" />
        )))}
        <Sh d="M-40 -30 L-4 -30 L-8 -22 L-2 -14 L-8 -6 L-2 2 L-8 10 L-2 18 L-6 30 L-40 30 Z" fill="#ec4f74" line="#8e1430" />
        <path d="M-32 -18 L-14 -18 M-32 -10 L-18 -10" stroke="#ffd1dc" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    ),
  },
  wine: {
    bg: ['lemon', 'aqua', 'sage'],
    draw: () => (
      <>
        <path d="M0 8 L0 34" stroke="#6a3a8a" strokeWidth="3" />
        <Sh d="M-18 36 C-18 32 18 32 18 36 C18 40 -18 40 -18 36 Z" fill="#f2ecff" line="#6a3a8a" w={1.8} />
        <Sh d="M-23 -18 L23 -18 C22 -2 12 8 0 8 C-12 8 -22 -2 -23 -18 Z" fill="#a8234a" />
        <Sh d="M-22 -40 L22 -40 C24 -10 14 8 0 8 C-14 8 -24 -10 -22 -40 Z" fill="rgba(255,255,255,0.35)" line="#6a3a8a" />
        <path d="M-14 -34 C-16 -24 -15 -16 -12 -10" stroke={W} strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
      </>
    ),
  },
  spice: {
    bg: ['aqua', 'mint', 'lemon'],
    draw: () => (
      <>
        {[[-6, -30], [2, 0], [10, 30]].map(([r, y]) => (
          <g key={y} transform={`rotate(${-28 + r}) translate(0 ${y / 3})`}>
            <Sh d="M-40 -6 L36 -6 C40 -6 40 6 36 6 L-40 6 C-44 6 -44 -6 -40 -6 Z" fill="#a0522d" line="#4e220c" w={1.8} />
            <path d="M-40 -2 C-36 -6 -36 4 -40 2" stroke="#e7a073" strokeWidth="1.6" fill="none" />
          </g>
        ))}
        <g transform="translate(26 28)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <ellipse key={a} cx="0" cy="-9" rx="4" ry="9" fill="#7a3b1a" transform={`rotate(${a})`} />
          ))}
          <circle r="4" fill="#c8874a" />
        </g>
      </>
    ),
  },
  milk: {
    bg: ['coral', 'sky', 'mint'],
    draw: () => (
      <>
        <path d="M-24 -20 C-46 -20 -46 14 -24 12" stroke="#ffd93d" strokeWidth="7" fill="none" />
        <Sh d="M-26 -32 L22 -32 L36 -40 L26 -26 C30 0 28 30 0 32 C-28 30 -30 0 -26 -32 Z" fill="#ffe36e" line="#3d5bd0" />
        <ellipse cx="-2" cy="-31" rx="23" ry="5" fill="#fffbe8" />
        <path d="M-16 -16 C-18 -4 -18 8 -14 18" stroke={W} strokeWidth="4" fill="none" opacity="0.6" strokeLinecap="round" />
      </>
    ),
  },
  mug: {
    bg: ['coral', 'lemon', 'peach'],
    draw: () => (
      <>
        <path d="M28 -16 C50 -18 50 18 26 16" stroke="#2741c9" strokeWidth="8" fill="none" />
        <Sh d="M-30 -30 L30 -30 L26 30 C24 36 -24 36 -26 30 Z" fill="#2741c9" line="#0b1666" />
        <ellipse cx="0" cy="-30" rx="30" ry="9" fill="#46d6a0" />
        <ellipse cx="0" cy="-29" rx="25" ry="6.5" fill="#5a2a12" />
        <path d="M-14 -31 C-6 -34 6 -34 12 -31" stroke="#a9673f" strokeWidth="2" fill="none" />
        <path d="M-20 -16 C-21 -2 -20 10 -17 20" stroke="#8fa4ff" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    ),
  },
};

// 走路的咖啡豆小人（吉祥物）
function BeanBuddy({ x, y, s = 1, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-5 14 L-9 26 L-13 26 M5 14 L8 26 L12 26" stroke="#2b1408" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M-12 -2 L-20 6 M12 -2 L19 -8" stroke="#2b1408" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="0" rx="13" ry="17" fill="#7a3e1d" />
      <ellipse cx="-1.4" cy="-1.2" rx="13" ry="17" fill="none" stroke="#2b1408" strokeWidth="1.8" />
      <path d="M2 -16 C-4 -6 6 4 0 16" stroke="#2b1408" strokeWidth="1.6" fill="none" />
      <circle cx="-6" cy="-4" r="2.6" fill={W} />
      <circle cx="-5.5" cy="-3.6" r="1.3" fill="#111" />
      <circle cx="6" cy="-4" r="2.6" fill={W} />
      <circle cx="6.5" cy="-3.6" r="1.3" fill="#111" />
      <ellipse cx="-8" cy="2" rx="2.4" ry="1.4" fill="#ff8fa0" opacity="0.8" />
      <ellipse cx="8" cy="2" rx="2.4" ry="1.4" fill="#ff8fa0" opacity="0.8" />
    </g>
  );
}

export const BG = {
  sage: '#c8dc9a',
  coral: '#ff8f7e',
  mint: '#74f2c4',
  sky: '#86cbe6',
  aqua: '#d2faf6',
  pink: '#ffd6e0',
  lemon: '#fff0a0',
  lavender: '#cdbfff',
  peach: '#ffc9a8',
};

const LIGHT = ['aqua', 'lemon', 'pink'];

const KEYWORDS = [
  ['lychee', ['荔枝', '龙眼']],
  ['peach', ['桃', '核果', '杏', '李']],
  ['citrus', ['柑', '橘', '橙', '柠檬', '柚', '佛手']],
  ['berry', ['莓', '樱桃']],
  ['grape', ['葡萄', '提子', '黑醋栗']],
  ['tropical', ['热带', '芒果', '菠萝', '百香果', '凤梨', '木瓜']],
  ['flower', ['花', '茉莉', '玫瑰']],
  ['tea', ['茶']],
  ['honey', ['蜂蜜', '蜜']],
  ['caramel', ['焦糖', '糖', '太妃']],
  ['nuts', ['坚果', '杏仁', '榛', '核桃', '花生']],
  ['choc', ['巧克力', '可可']],
  ['wine', ['酒', '朗姆', '威士忌', '发酵']],
  ['spice', ['香料', '肉桂', '丁香', '胡椒']],
  ['milk', ['奶', '乳']],
];

export function motifFor(flavor = '') {
  return KEYWORDS.find(([, keys]) => keys.some((k) => flavor.includes(k)))?.[0];
}

function plan(bean) {
  const seed = hash(`${bean.id || ''}${bean.name || ''}`);
  const r = rng(seed);
  const keys = [];
  const labels = [];
  for (const f of bean.flavors || []) {
    const m = motifFor(f);
    if (m && !keys.includes(m)) {
      keys.push(m);
      labels.push(f);
    }
  }
  if (keys.length === 0) keys.push(bean.usage === '意式' ? 'milk' : 'mug');
  const main = keys[0];
  const bgList = MOTIFS[main].bg;
  const bgName = bgList[Math.floor(r() * bgList.length)];
  return { r, keys: keys.slice(0, 3), label: labels[0], bg: BG[bgName], light: LIGHT.includes(bgName) };
}

const SLOTS = {
  1: [[100, 104, 1.35]],
  2: [[88, 116, 1.1], [148, 58, 0.72]],
  3: [[92, 120, 1.05], [150, 56, 0.66], [50, 58, 0.6]],
};

export default function BeanArt({ bean, className = '', label = true }) {
  const g = 'a' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const { r, keys, label: text, bg, light } = plan(bean);
  const slots = SLOTS[keys.length];
  const flowers = Array.from({ length: 5 }, () => [r() * 200, r() * 200, 4 + r() * 4]);
  const clouds = Array.from({ length: 3 }, () => [r() * 200, r() * 200, 24 + r() * 26]);
  const buddyLeft = r() > 0.5;
  const tilt = Math.round(r() * 16 - 8);

  return (
    <svg viewBox="0 0 200 200" className={`art ${className}`} role="img" aria-label={`${bean.name || '咖啡豆'} 封面插画`}>
      <defs>
        <radialGradient id={`${g}-peach`} cx="0.4" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#ffe3d6" />
          <stop offset="1" stopColor="#f6939a" />
        </radialGradient>
        <radialGradient id={`${g}-mango`} cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#ffe066" />
          <stop offset="1" stopColor="#ff7a3d" />
        </radialGradient>
        <linearGradient id={`${g}-honey`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd25e" />
          <stop offset="1" stopColor="#f29a1f" />
        </linearGradient>
        <filter id={`${g}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${g}-wobble`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed={keys.length} />
          <feDisplacementMap in="SourceGraphic" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${g}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.22 0" />
        </filter>
      </defs>

      <rect width="200" height="200" fill={bg} />
      <g filter={`url(#${g}-blur)`} opacity="0.55">
        {clouds.map(([x, y, s]) => (
          <ellipse key={`${x}`} cx={x} cy={y} rx={s} ry={s * 0.7} fill={W} />
        ))}
      </g>

      {label && text && (
        <text
          x="16"
          y="44"
          transform={`rotate(${tilt - 10} 16 44)`}
          fontSize="30"
          fontWeight="700"
          fill={light ? 'rgba(70,90,200,0.16)' : 'rgba(255,255,255,0.5)'}
          stroke={light ? 'rgba(70,90,200,0.35)' : 'rgba(255,255,255,0.85)'}
          strokeWidth="1"
          letterSpacing="2"
        >
          {text}
        </text>
      )}

      {flowers.map(([x, y, s]) => (
        <Flower key={`${x}${y}`} x={x} y={y} r={s} petal="#fffbe6" center="#ffd84a" />
      ))}

      <g filter={`url(#${g}-wobble)`} strokeLinejoin="round">
        {keys.map((k, i) => {
          const [x, y, s] = slots[i];
          return (
            <g key={k} transform={`translate(${x} ${y}) rotate(${i === 0 ? tilt : -tilt}) scale(${s})`}>
              {MOTIFS[k].draw(g)}
            </g>
          );
        })}
        <BeanBuddy x={buddyLeft ? 34 : 168} y={160} s={0.95} flip={!buddyLeft} />
      </g>

      <rect width="200" height="200" filter={`url(#${g}-grain)`} />
    </svg>
  );
}

/* ---------- Logo：粉色方块 + 草书 + 绣球花 ---------- */

function Hydrangea({ x, y, s = 1 }) {
  const dots = [[0, 0], [-7, -4], [7, -4], [-5, 6], [6, 6], [0, -10], [-11, 4], [11, 3], [0, 10]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {dots.map(([dx, dy], i) => (
        <g key={i} transform={`translate(${dx} ${dy}) rotate(${i * 20})`}>
          {[0, 90, 180, 270].map((a) => (
            <ellipse key={a} cx="0" cy="-2.6" rx="2" ry="2.6" fill="none" stroke={i % 2 ? '#a9a3e8' : '#c79be0'} strokeWidth="0.9" transform={`rotate(${a})`} />
          ))}
        </g>
      ))}
    </g>
  );
}

export function Logo({ className = '' }) {
  return (
    <svg viewBox="0 0 150 100" className={`logo ${className}`} role="img" aria-label="Bean Vault 豆仓">
      <rect width="150" height="100" fill="#fde4e8" />
      <Hydrangea x={20} y={22} s={0.9} />
      <Hydrangea x={132} y={22} s={0.8} />
      <Hydrangea x={22} y={82} s={0.6} />
      <g fontFamily="Sacramento, cursive" fontSize="40">
        <text x="31" y="49" fill="#a9b9f5">Bean</text>
        <text x="29" y="47" fill="none" stroke="#ef7f9b" strokeWidth="1.1">Bean</text>
        <text x="54" y="81" fill="#a9b9f5">Vault</text>
        <text x="52" y="79" fill="none" stroke="#ef7f9b" strokeWidth="1.1">Vault</text>
      </g>
      <path d="M100 40 C112 30 126 36 120 46 C116 52 106 48 112 42" fill="none" stroke="#8fa4ef" strokeWidth="1" />
    </svg>
  );
}

/* ---------- 细线图标（Dawn 风格） ---------- */

const Line = ({ children }) => (
  <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const IconSearch = () => (
  <Line>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 L21 21" />
  </Line>
);

export const IconPlus = () => (
  <Line>
    <path d="M12 4 V20 M4 12 H20" />
  </Line>
);

export const IconClose = () => (
  <Line>
    <path d="M5 5 L19 19 M19 5 L5 19" />
  </Line>
);
