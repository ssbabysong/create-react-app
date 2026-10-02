// 扁平剪纸风插画：无描边、无文字，色块 + 细微纸纹
import { useId } from 'react';

const COFFEE = '#3b2418';
const PAPER = '#fbf3e4';
const GREEN = '#3e7d5a';

export const PALETTES = [
  { bg: '#f2d5c4', sun: '#e8a87c', table: '#c96f4a', vessel: '#2f4b8a', leaf: GREEN },
  { bg: '#d9e3d0', sun: '#f2c36b', table: '#7fa087', vessel: '#e2553e', leaf: '#2f6b4c' },
  { bg: '#cfe0ec', sun: '#f6e3b4', table: '#5e86b8', vessel: '#f2b33d', leaf: GREEN },
  { bg: '#f6e7b8', sun: '#f4a28c', table: '#d9a441', vessel: '#3e7d5a', leaf: '#2f6b4c' },
  { bg: '#e3daf0', sun: '#f6c6c7', table: '#9a87c4', vessel: '#2f4b8a', leaf: GREEN },
  { bg: '#cdebdf', sun: PAPER, table: '#4e9a84', vessel: '#e2553e', leaf: '#2f6b4c' },
  { bg: '#f7d9dd', sun: '#fbefd9', table: '#d9828e', vessel: '#3e5c9a', leaf: GREEN },
  { bg: '#e9e1d3', sun: '#e2553e', table: '#2f4b8a', vessel: '#f2b33d', leaf: GREEN },
];

export function hash(str = '') {
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

export const paletteFor = (bean) => PALETTES[Math.floor(rng(hash(`${bean.id}${bean.name}`))() * PALETTES.length)];

/* ---------- 风味图案（以 0,0 为中心，约 60px） ---------- */

const petals = (r, fill) =>
  [0, 72, 144, 216, 288].map((a) => (
    <ellipse key={a} cx="0" cy={-r * 0.6} rx={r * 0.46} ry={r * 0.6} fill={fill} transform={`rotate(${a})`} />
  ));

export const MOTIFS = {
  peach: () => (
    <>
      <path d="M2 -22 C10 -36 26 -36 31 -30 C23 -22 12 -20 2 -22 Z" fill={GREEN} />
      <circle r="24" fill="#f4a28c" />
      <circle cx="7" cy="-5" r="15" fill="#f7b9a3" />
      <path d="M-2 -22 C-9 -6 -7 10 2 23" stroke="#e07b67" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  ),
  lychee: () => (
    <>
      <circle cx="-8" r="20" fill="#d8434e" />
      {[[-18, -8], [-8, -14], [2, -8], [-14, 4], [-4, 2], [-10, 12], [0, 10]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="2.2" fill="#b32f3b" />
      ))}
      <circle cx="18" cy="8" r="15" fill="#fbf7ee" />
      <circle cx="21" cy="10" r="5" fill="#ece2d0" />
    </>
  ),
  citrus: () => (
    <>
      <circle cx="-14" cy="-6" r="18" fill="#f2b33d" />
      <g transform="translate(10 12)">
        <path d="M-26 0 A26 26 0 0 1 26 0 Z" fill="#f2b33d" />
        <path d="M-21 0 A21 21 0 0 1 21 0 Z" fill="#fbd872" />
        {[30, 60, 90, 120, 150].map((a) => (
          <line key={a} x1="0" y1="0" x2={-20 * Math.cos((a * Math.PI) / 180)} y2={-20 * Math.sin((a * Math.PI) / 180)} stroke="#fff6d6" strokeWidth="2.4" />
        ))}
      </g>
    </>
  ),
  berry: () => (
    <>
      <path d="M0 26 C-20 12 -24 -6 -18 -14 C-12 -22 12 -22 18 -14 C24 -6 20 12 0 26 Z" fill="#e2553e" />
      {[[-9, -8], [3, -12], [12, -4], [-12, 4], [0, 2], [8, 10], [-4, 14]].map(([x, y]) => (
        <ellipse key={`${x}${y}`} cx={x} cy={y} rx="1.4" ry="2.2" fill="#fbe3a0" />
      ))}
      <path d="M-14 -16 L-4 -19 L0 -27 L4 -19 L14 -16 L4 -13 L0 -16 L-4 -13 Z" fill={GREEN} />
      <circle cx="24" cy="18" r="7.5" fill="#2f4b8a" />
      <circle cx="33" cy="7" r="6" fill="#3e5c9a" />
    </>
  ),
  grape: () => (
    <>
      <path d="M2 -26 C10 -38 26 -38 30 -32 C22 -24 12 -22 2 -26 Z" fill={GREEN} />
      {[[-15, -16], [0, -18], [15, -16], [-8, -3], [8, -3], [-15, 10], [0, 10], [15, 10], [-7, 23], [8, 23], [0, 34]].map(([x, y], i) => (
        <circle key={`${x}${y}`} cx={x * 0.85} cy={y * 0.85} r="7" fill={i % 3 ? '#6b4c9a' : '#80609f'} />
      ))}
    </>
  ),
  flower: () => (
    <>
      <path d="M0 6 C-2 18 -4 26 -2 34 M-18 18 C-14 24 -8 30 -2 34 M16 18 C12 24 6 30 -2 34" stroke={GREEN} strokeWidth="2.2" fill="none" />
      <g transform="translate(0 -6)">{petals(15, '#fbf7ee')}<circle r="4.5" fill="#f2b33d" /></g>
      <g transform="translate(-19 12)">{petals(11, '#fbf7ee')}<circle r="3.5" fill="#f2b33d" /></g>
      <g transform="translate(17 13)">{petals(10, '#fbf7ee')}<circle r="3" fill="#f2b33d" /></g>
    </>
  ),
  tropical: () => (
    <>
      <path d="M10 -24 C18 -38 32 -38 36 -32 C28 -24 18 -22 10 -24 Z" fill={GREEN} />
      <path d="M-22 8 C-30 -16 -6 -30 12 -26 C32 -20 34 2 22 18 C10 32 -14 30 -22 8 Z" fill="#f2b33d" />
      <path d="M-22 8 C-14 30 10 32 22 18 C10 23 -10 21 -22 8 Z" fill="#ee8a3c" />
    </>
  ),
  tea: () => (
    <>
      <path d="M0 24 C2 8 6 -6 14 -18" stroke={GREEN} strokeWidth="2.2" fill="none" />
      <path d="M2 4 C-22 0 -28 -18 -20 -28 C-8 -24 2 -12 2 4 Z" fill="#5e9b5e" />
      <path d="M6 -4 C26 -10 32 -26 26 -34 C14 -32 6 -20 6 -4 Z" fill={GREEN} />
      <path d="M4 14 C22 14 30 2 28 -6 C16 -6 8 2 4 14 Z" fill="#7fb07a" />
    </>
  ),
  honey: () => (
    <>
      <path d="M-20 -12 C-22 10 -18 26 0 26 C18 26 22 10 20 -12 Z" fill="#e9a23b" />
      <rect x="-22" y="-22" width="44" height="11" rx="3" fill="#c96f4a" />
      <circle cx="0" cy="8" r="9" fill={PAPER} />
    </>
  ),
  caramel: () => {
    const cube = (x, y) => (
      <g key={`${x}${y}`} transform={`translate(${x} ${y})`}>
        <path d="M0 -14 L15 -7 L0 0 L-15 -7 Z" fill="#f6d9a0" />
        <path d="M-15 -7 L0 0 L0 17 L-15 10 Z" fill="#e7b26b" />
        <path d="M15 -7 L0 0 L0 17 L15 10 Z" fill="#d49a4e" />
      </g>
    );
    return <>{[cube(0, -14), cube(-16, 10), cube(16, 10)]}</>;
  },
  nuts: () => (
    <>
      {[[-16, 4, -30], [6, -12, 20], [14, 16, 70]].map(([x, y, r]) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 -16 C11 -9 12 8 0 16 C-12 8 -11 -9 0 -16 Z" fill="#b9773f" />
          <path d="M-3 -9 C-4 0 -4 6 -2 11" stroke="#d39a63" strokeWidth="2" fill="none" />
        </g>
      ))}
    </>
  ),
  choc: () => (
    <g transform="rotate(-14)">
      <rect x="-28" y="-20" width="56" height="40" rx="2" fill="#5a3221" />
      {[-17, 0, 17].map((x) => [-9, 9].map((y) => (
        <rect key={`${x}${y}`} x={x - 7} y={y - 7} width="14" height="14" rx="1.5" fill="#6e3e29" />
      )))}
      <path d="M-31 -23 L-2 -23 L-6 -14 L0 -6 L-6 2 L0 10 L-4 23 L-31 23 Z" fill="#e2553e" />
    </g>
  ),
  cherry: () => (
    <>
      <path d="M-10 6 C-8 -12 0 -24 10 -30 M12 8 C10 -8 10 -20 10 -30" stroke={GREEN} strokeWidth="2.2" fill="none" />
      <path d="M10 -30 C20 -38 32 -34 34 -28 C24 -24 16 -26 10 -30 Z" fill={GREEN} />
      <circle cx="-11" cy="14" r="11" fill="#9e2b3a" />
      <circle cx="13" cy="16" r="11" fill="#b8384a" />
    </>
  ),
  spice: () => (
    <>
      {[-10, 0, 10].map((y, i) => (
        <g key={y} transform={`rotate(${-24 + i * 6}) translate(0 ${y})`}>
          <rect x="-30" y="-5" width="60" height="10" rx="5" fill={i === 1 ? '#a9643a' : '#9c5a2e'} />
          <ellipse cx="-29" cy="0" rx="3" ry="5" fill="#c68955" />
        </g>
      ))}
    </>
  ),
  milk: () => (
    <>
      <path d="M-18 -10 C-32 -10 -32 12 -18 10" stroke={PAPER} strokeWidth="6" fill="none" />
      <path d="M-18 -22 L16 -22 L26 -28 L19 -16 C22 6 20 26 0 26 C-20 26 -22 6 -18 -22 Z" fill={PAPER} />
      <ellipse cx="0" cy="-21" rx="17" ry="3.5" fill="#ffffff" />
    </>
  ),
  bean: () => (
    <g transform="rotate(-30)">
      <ellipse rx="16" ry="22" fill="#6b3a1f" />
      <path d="M2 -20 C-8 -6 8 6 -2 20" stroke="#3b2418" strokeWidth="3" fill="none" />
    </g>
  ),
  star: () => (
    <path d="M0 -26 L7 -8 L26 -8 L11 4 L17 23 L0 12 L-17 23 L-11 4 L-26 -8 L-7 -8 Z" fill="#f2b33d" />
  ),
  sun: () => <circle r="24" fill="#e2553e" />,
};

const KEYWORDS = [
  ['lychee', ['荔枝', '龙眼']],
  ['peach', ['桃', '核果', '杏', '李']],
  ['citrus', ['柑', '橘', '橙', '柠檬', '柚', '佛手']],
  ['berry', ['莓']],
  ['cherry', ['樱桃', '酒', '朗姆', '威士忌']],
  ['grape', ['葡萄', '提子', '黑醋栗', '发酵']],
  ['tropical', ['热带', '芒果', '菠萝', '百香果', '凤梨', '木瓜']],
  ['spice', ['香料', '肉桂', '丁香', '胡椒']],
  ['flower', ['花', '茉莉', '玫瑰']],
  ['tea', ['茶']],
  ['honey', ['蜂蜜', '蜜']],
  ['caramel', ['焦糖', '糖', '太妃']],
  ['nuts', ['坚果', '杏仁', '榛', '核桃', '花生']],
  ['choc', ['巧克力', '可可']],
  ['milk', ['奶', '乳']],
];

export function motifsFor(flavors = []) {
  const keys = [];
  for (const f of flavors) {
    const k = KEYWORDS.find(([, words]) => words.some((w) => f.includes(w)))?.[0];
    if (k && !keys.includes(k)) keys.push(k);
  }
  return keys.slice(0, 3);
}

/* ---------- 器具 ---------- */

function PourOver({ c }) {
  return (
    <>
      <ellipse cx="100" cy="213" rx="50" ry="6" fill="rgba(0,0,0,0.13)" />
      <path d="M131 160 C153 160 155 193 133 197" stroke="#e8eff0" strokeWidth="7" fill="none" strokeLinecap="round" />
      <rect x="79" y="142" width="42" height="12" rx="3" fill="#e8eff0" />
      <path d="M71 150 C58 168 60 204 84 212 L116 212 C140 204 142 168 129 150 Z" fill="#e8eff0" />
      <path d="M62 182 C62 200 70 210 84 212 L116 212 C130 210 138 200 138 182 Z" fill={COFFEE} />
      <path d="M76 160 C70 170 69 182 71 192" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M58 108 C38 108 38 132 63 130" stroke={c.vessel} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M56 104 L86 142 L114 142 L144 104 Z" fill={c.vessel} />
      <path d="M100 104 L114 142 L86 142 Z" fill="rgba(255,255,255,0.12)" />
      <rect x="51" y="97" width="98" height="9" rx="4" fill={c.vessel} />
      <rect x="74" y="140" width="52" height="6" rx="3" fill={c.vessel} />
      <path d="M100 150 C97.5 155 98 158 100 158 C102 158 102.5 155 100 150 Z" fill={COFFEE} />
    </>
  );
}

function Espresso({ c }) {
  return (
    <>
      <ellipse cx="100" cy="206" rx="64" ry="13" fill="rgba(0,0,0,0.12)" />
      <ellipse cx="100" cy="200" rx="64" ry="14" fill={PAPER} />
      <path d="M134 160 C158 158 158 186 130 186" stroke={c.vessel} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M62 150 L138 150 C138 182 124 200 100 200 C76 200 62 182 62 150 Z" fill={c.vessel} />
      <ellipse cx="100" cy="150" rx="38" ry="9" fill={c.vessel} />
      <ellipse cx="100" cy="151" rx="33" ry="6.5" fill="#b7773f" />
      <path d="M100 156 C92 151 92 146 96 146 C98 146 100 148 100 149 C100 148 102 146 104 146 C108 146 108 151 100 156 Z" fill={PAPER} />
      <path d="M90 136 C84 126 96 120 90 108 M110 136 C104 126 116 120 110 108" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
    </>
  );
}

const Leaf = ({ x, y, r, s, fill }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M0 0 C18 -26 58 -28 80 0 C58 28 18 26 0 0 Z" fill={fill} />
    <path d="M4 0 C28 -2 52 -2 74 0" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" />
  </g>
);

const SLOTS = [
  [44, 204, 0.95],
  [160, 208, 0.85],
  [178, 184, 0.6],
];

export default function BeanArt({ bean, className = '' }) {
  const id = 'f' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const c = paletteFor(bean);
  const r = rng(hash(`${bean.id}${bean.name}`) + 7);
  r();
  const keys = motifsFor(bean.flavors);
  const sunX = 70 + r() * 60;
  const arch = r() > 0.55;
  const leaves = r() > 0.4;
  const leafSide = r() > 0.5;

  return (
    <svg viewBox="0 0 200 250" className={`art ${className}`} role="img" aria-label={bean.name || '咖啡'} preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.16 0" />
        </filter>
      </defs>
      <rect width="200" height="250" fill={c.bg} />
      {arch ? (
        <path d={`M${sunX - 48} 212 V100 A48 48 0 0 1 ${sunX + 48} 100 V212 Z`} fill={c.sun} />
      ) : (
        <circle cx={sunX} cy="96" r="58" fill={c.sun} />
      )}
      {leaves && (
        <>
          <Leaf x={leafSide ? 150 : 50} y={170} r={leafSide ? -130 : -50} s={1.15} fill={c.leaf} />
          <Leaf x={leafSide ? 156 : 44} y={186} r={leafSide ? -100 : -80} s={0.85} fill={c.leaf} />
        </>
      )}
      <rect y="212" width="200" height="38" fill={c.table} />
      {bean.usage === '意式' ? <Espresso c={c} /> : <PourOver c={c} />}
      {keys.map((k, i) => [k, i]).reverse().map(([k, i]) => {
        const [x, y, s] = SLOTS[i];
        return (
          <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
            {MOTIFS[k]()}
          </g>
        );
      })}
      <rect width="200" height="250" filter={`url(#${id})`} />
    </svg>
  );
}

/* 圆形小贴纸（图鉴、成就用） */
export function Sticker({ motif, color, className = '' }) {
  return (
    <svg viewBox="-40 -40 80 80" className={`sticker ${className}`} aria-hidden="true">
      <circle r="38" fill={color} />
      <g transform="scale(0.85)">{MOTIFS[motif]?.()}</g>
    </svg>
  );
}

/* Logo：彩色手冲滤杯 */
export function LogoMark({ className = '' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#f2d5c4" />
      <path d="M12.5 17 C7 17 7 25 14 24.5" stroke="#e2553e" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M11 15 L20.5 29 H27.5 L37 15 Z" fill="#e2553e" />
      <rect x="9.5" y="12.5" width="29" height="4" rx="2" fill="#e2553e" />
      <rect x="17" y="28.5" width="14" height="2.6" rx="1.3" fill="#2f4b8a" />
      <path d="M24 33 C22.6 35.5 22.9 37.3 24 37.3 C25.1 37.3 25.4 35.5 24 33 Z" fill={COFFEE} />
    </svg>
  );
}
