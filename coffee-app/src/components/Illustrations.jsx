// 手绘风咖啡插画：所有图形都是手写 SVG 路径，再用位移滤镜做出手抖的线条
import { useId } from 'react';

export const INK = '#2b1f17';
export const C = {
  brown: '#6f4e37',
  crema: '#b9824f',
  caramel: '#c8874a',
  milk: '#fbf1e1',
  cream: '#f3d9b8',
  paper: '#fffaf1',
  leaf: '#8aa86e',
  cherry: '#c4523f',
  cherryRipe: '#9e3b2f',
  cherryRaw: '#d9a441',
  water: '#9cc3d5',
  glass: '#e6eff0',
  copper: '#c98a52',
};

export const BAG_COLORS = ['#c8874a', '#8b5e3c', '#8aa86e', '#c4523f', '#6a8caf', '#d9a441', '#9b6b8f', '#5f8f8a'];

function Sketch({ viewBox, children, className = '', title, wobble = 2.2, seed = 3, stroke = INK, width = 2.6 }) {
  const id = 'sk' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      viewBox={viewBox}
      className={`illo ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale={wobble} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${id})`} stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {children}
      </g>
    </svg>
  );
}

// 带填色的形状 + 一道错位的淡铅笔线，模拟反复描线
function P({ d, fill = 'none', w, ghost = true }) {
  return (
    <>
      <path d={d} fill={fill} strokeWidth={w} />
      {ghost && <path d={d} strokeWidth={(w || 2.6) * 0.45} opacity="0.45" transform="translate(1.3 -1)" />}
    </>
  );
}

function E({ cx, cy, rx, ry = rx, fill = 'none', w, ghost = true }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} strokeWidth={w} />
      {ghost && (
        <ellipse cx={cx + 1.3} cy={cy - 1} rx={rx} ry={ry} strokeWidth={(w || 2.6) * 0.45} opacity="0.45" />
      )}
    </>
  );
}

// 无描边的色块（阴影、高光）
const Fill = ({ d, fill, opacity }) => <path d={d} fill={fill} stroke="none" opacity={opacity} />;

function heart(cx, cy, s) {
  return `M${cx} ${cy + s * 0.9} C${cx - s * 1.35} ${cy + s * 0.15} ${cx - s * 1.05} ${cy - s * 0.95} ${cx} ${cy - s * 0.4}
    C${cx + s * 1.05} ${cy - s * 0.95} ${cx + s * 1.35} ${cy + s * 0.15} ${cx} ${cy + s * 0.9} Z`;
}

function Sparkle({ x, y, s = 1 }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10 Z"
      fill={C.cream}
      strokeWidth="1.6"
    />
  );
}

function BeanShape({ x, y, r = 0, s = 1, fill = C.brown }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <E cx={0} cy={0} rx={9} ry={12.5} fill={fill} w={2.2} />
      <path d="M1 -11 C-5 -4 5 3 -1 11" strokeWidth="1.8" />
    </g>
  );
}

/* ---------- 大插画 ---------- */

export function PourOver({ className }) {
  return (
    <Sketch viewBox="0 0 240 230" className={className} title="手冲咖啡">
      <Fill d="M40 208 C80 200 170 200 205 208 C170 216 80 216 40 208 Z" fill={C.cream} />

      {/* 分享壶 */}
      <P d="M182 142 C204 140 206 180 178 186" w={4} ghost={false} />
      <P d="M80 124 L76 134 C60 154 62 194 90 204 L150 204 C178 194 180 154 164 134 L160 124 Z" fill={C.glass} />
      <P d="M64 168 C64 190 74 200 90 204 L150 204 C166 200 176 190 176 168 C150 175 90 175 64 168 Z" fill={C.brown} w={2.2} />
      <path d="M84 180 C96 183 112 184 126 182" stroke={C.cream} strokeWidth="2.2" />
      <path d="M86 140 C78 152 76 162 78 170" stroke="#fff" strokeWidth="4" />

      {/* 滤杯 */}
      <E cx={120} cy={124} rx={50} ry={7} fill={C.cream} />
      <P d="M62 70 C50 70 46 92 74 92" w={3} ghost={false} />
      <P d="M66 62 L72 54 L80 60 L88 52 L96 58 L104 51 L112 57 L120 50 L128 57 L136 51 L144 58 L152 52 L160 60 L168 54 L174 62 Z" fill="#fffdf6" w={1.8} />
      <P d="M62 68 L106 120 L134 120 L178 68 Z" fill={C.paper} />
      <path d="M86 78 L110 114 M102 76 L116 114 M138 76 L124 114 M154 78 L130 114" strokeWidth="1.4" opacity="0.55" />
      <E cx={120} cy={68} rx={58} ry={9} fill={C.crema} />
      <circle cx="104" cy="67" r="2.5" fill={C.cream} strokeWidth="1" />
      <circle cx="132" cy="69" r="3" fill={C.cream} strokeWidth="1" />
      <circle cx="118" cy="71" r="1.8" fill={C.cream} strokeWidth="1" />

      {/* 滴落 */}
      <P d="M120 130 C116 136 116 141 120 141 C124 141 124 136 120 130 Z" fill={C.brown} w={1.6} ghost={false} />

      {/* 手冲壶细嘴 + 水流 */}
      <path d="M244 6 C206 8 186 20 168 34 L158 41" strokeWidth="10" />
      <path d="M244 6 C206 8 186 20 168 34 L158 41" stroke={C.copper} strokeWidth="5" />
      <path d="M156 44 C148 52 140 58 128 66" stroke={C.water} strokeWidth="3.4" />
      <circle cx="142" cy="66" r="2" fill={C.water} strokeWidth="1" />

      <Sparkle x={34} y={42} />
      <Sparkle x={214} y={98} s={0.7} />
      <BeanShape x={30} y={196} r={25} />
      <BeanShape x={50} y={206} r={-35} s={0.9} />
      <BeanShape x={210} y={200} r={60} s={0.85} />
    </Sketch>
  );
}

export function LatteCup({ className, art = 'heart' }) {
  const cx = 105;
  const cy = 100;
  return (
    <Sketch viewBox="0 0 220 200" className={className} title="拉花拿铁" seed={7}>
      <E cx={cx} cy={cy + 4} rx={88} ry={86} fill={C.cream} />
      <circle cx={cx} cy={cy + 4} r="68" strokeWidth="1.4" opacity="0.5" />

      {/* 勺子 */}
      <g transform="translate(176 156) rotate(-42)">
        <path d="M0 10 L0 46" strokeWidth="7" />
        <path d="M0 10 L0 46" stroke="#d9d7d0" strokeWidth="3" />
        <E cx={0} cy={0} rx={8} ry={12} fill="#e4e2dc" w={2.2} />
      </g>

      {/* 杯把 + 杯身 */}
      <P d="M156 88 C178 82 192 92 190 103 C188 114 174 120 156 113 Z" fill={C.paper} />
      <E cx={cx} cy={cy} rx={60} ry={60} fill={C.paper} />
      <circle cx={cx} cy={cy} r="49" fill={C.crema} strokeWidth="2.2" />
      <circle cx={cx} cy={cy} r="46" stroke={C.brown} strokeWidth="5" opacity="0.45" />

      {art === 'heart' ? (
        <>
          <path d={heart(cx, cy + 2, 34)} fill={C.milk} strokeWidth="2" />
          <path d={heart(cx, cy + 6, 22)} fill={C.crema} stroke="none" />
          <path d={heart(cx, cy + 8, 12)} fill={C.milk} stroke="none" />
        </>
      ) : (
        // 郁金香：两层月牙 + 顶上一颗圆
        <>
          {[[cy + 30, 32], [cy + 12, 25]].map(([b, w]) => (
            <path
              key={b}
              d={`M${cx - w} ${b} C${cx - w} ${b - 22} ${cx + w} ${b - 22} ${cx + w} ${b} C${cx + w * 0.5} ${b - 9} ${cx - w * 0.5} ${b - 9} ${cx - w} ${b} Z`}
              fill={C.milk}
              strokeWidth="1.6"
            />
          ))}
          <ellipse cx={cx} cy={cy - 16} rx="14" ry="12" fill={C.milk} strokeWidth="1.6" />
          <path d={`M${cx} ${cy - 20} L${cx} ${cy + 36}`} stroke={C.milk} strokeWidth="2.6" />
        </>
      )}
      <path d={`M${cx - 44} ${cy - 30} C${cx - 36} ${cy - 46} ${cx - 20} ${cy - 54} ${cx - 6} ${cy - 56}`} stroke="#fff" strokeWidth="3.5" />
      <Sparkle x={24} y={26} s={0.8} />
    </Sketch>
  );
}

export function BeanBag({ className, color = C.caramel, title = '咖啡豆袋' }) {
  return (
    <Sketch viewBox="0 0 120 140" className={className} title={title} seed={5}>
      <Fill d="M18 134 C40 130 80 130 104 134 C80 138 40 138 18 134 Z" fill={INK} opacity="0.1" />
      <P d="M24 34 C22 70 18 110 16 130 L104 130 C102 110 98 70 96 34 Z" fill={color} />
      <path d="M31 40 C29 80 27 108 25 124 M89 40 C91 80 93 108 95 124" strokeWidth="1.4" opacity="0.35" />
      <P d="M22 14 L98 14 L96 34 L24 34 Z" fill={color} w={2.4} />
      <path d="M27 20 L93 20 M27 26 L93 26" strokeWidth="1.2" opacity="0.55" />
      <circle cx="60" cy="44" r="4" fill={C.paper} strokeWidth="1.6" />
      <P d="M33 56 C46 53 74 53 87 56 L85 104 C72 107 48 107 35 104 Z" fill={C.paper} w={2} />
      <BeanShape x={60} y={72} r={20} s={0.75} />
      <path d="M43 91 C48 89 53 93 58 91 C63 89 68 93 77 91" strokeWidth="1.6" />
      <path d="M47 98 L73 98" strokeWidth="1.2" opacity="0.7" />
    </Sketch>
  );
}

export function CoffeeBranch({ className }) {
  const leaf = (x, y, r, s = 1) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <P d="M0 0 C10 -15 34 -15 46 0 C34 15 10 15 0 0 Z" fill={C.leaf} w={2.2} />
      <path d="M3 0 C16 -2 30 -2 42 0" strokeWidth="1.2" />
    </g>
  );
  const cherry = (x, y, fill) => (
    <g>
      <circle cx={x} cy={y} r="7.5" fill={fill} strokeWidth="2" />
      <path d={`M${x - 3} ${y - 3} C${x - 2} ${y - 4.5} ${x} ${y - 5} ${x + 1} ${y - 5}`} stroke="#fff" strokeWidth="1.6" opacity="0.8" />
    </g>
  );
  return (
    <Sketch viewBox="0 -6 220 140" className={className} title="咖啡树枝" seed={9}>
      <path d="M8 112 C60 96 120 72 212 22" strokeWidth="3.4" />
      {leaf(36, 103, -70)}
      {leaf(40, 102, 28, 0.9)}
      {leaf(104, 78, -80, 1.05)}
      {leaf(108, 76, 18)}
      {leaf(166, 48, -66, 0.9)}
      {leaf(170, 46, 32, 0.85)}
      {leaf(206, 25, -20, 0.6)}
      {cherry(66, 100, C.cherry)}
      {cherry(78, 98, C.cherryRipe)}
      {cherry(72, 110, C.cherryRaw)}
      {cherry(136, 72, C.cherry)}
      {cherry(146, 64, C.cherry)}
      {cherry(146, 78, C.cherryRipe)}
    </Sketch>
  );
}

export function Bean({ className, title = '咖啡豆' }) {
  return (
    <Sketch viewBox="0 0 40 40" className={className} title={title} wobble={1.2}>
      <BeanShape x={20} y={20} r={-28} s={1.25} />
    </Sketch>
  );
}

/* ---------- 小图标（线条随文字颜色变化） ---------- */

const Icon = ({ children, className = '' }) => (
  <Sketch viewBox="0 0 24 24" className={`icon ${className}`} wobble={0.9} stroke="currentColor" width={1.8}>
    {children}
  </Sketch>
);

export const IconBag = (p) => (
  <Icon {...p}>
    <path d="M6 8 L5 21 L19 21 L18 8 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M6 8 L6 3.5 L18 3.5 L18 8 M7 5.8 L17 5.8" />
    <circle cx="12" cy="11" r="1.2" />
    <path d="M9 15 C10.5 14 13.5 16 15 15" />
  </Icon>
);

export const IconMap = (p) => (
  <Icon {...p}>
    <path d="M3 6 L9 4 L15 6 L21 4 L21 18 L15 20 L9 18 L3 20 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M9 4 L9 18 M15 6 L15 20" opacity="0.6" />
    <path d="M12 14 C10 11.5 10 9 12 9 C14 9 14 11.5 12 14 Z" />
  </Icon>
);

export const IconDrip = (p) => (
  <Icon {...p}>
    <path d="M4 7 L10 15 L14 15 L20 7 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M3 7 L21 7 M8 17 L16 17" />
    <path d="M12 19 C10.8 20.6 11.2 22 12 22 C12.8 22 13.2 20.6 12 19 Z" />
  </Icon>
);

export const IconCup = (p) => (
  <Icon {...p}>
    <path d="M4.5 10 L6 19 C6.4 20.3 7.4 21 8.6 21 L13.4 21 C14.6 21 15.6 20.3 16 19 L17.5 10 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M17.2 12 C21 11.5 21 17 16.3 16.5" />
    <path d="M9 3 C8 4.5 10 5.5 9 7.5 M13 3 C12 4.5 14 5.5 13 7.5" />
  </Icon>
);
