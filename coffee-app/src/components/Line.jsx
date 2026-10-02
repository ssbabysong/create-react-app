// 极简单线插画：细线、留白、单色（颜色跟随 currentColor）

const Svg = ({ viewBox, className = '', title, children, width = 1.1 }) => (
  <svg
    viewBox={viewBox}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    role={title ? 'img' : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : true}
  >
    {children}
  </svg>
);

/* 手冲：细嘴壶注水 → 滤杯 → 分享壶 */
export function PourOverLine({ className }) {
  return (
    <Svg viewBox="0 0 120 120" className={className} title="手冲">
      <path d="M120 13 C97 13 86 21 77 31" />
      <path d="M120 19 C99 19 89 26 80 35" />
      <path d="M77 31 L80 35" />
      <path d="M78 37 C73 42 67 45 62 49" strokeDasharray="0.1 2.6" strokeWidth="1.3" />
      <path d="M36 49 H84" />
      <path d="M38 49 L53 69 H67 L82 49" />
      <path d="M47 52 L56 66 M73 52 L64 66" opacity="0.45" />
      <path d="M37 51 C29 51 29 61 40 60" />
      <path d="M47 72 H73" />
      <path d="M51 73 C42 81 42 100 53 105 H67 C78 100 78 81 69 73" />
      <path d="M45 93 C54 95.5 66 95.5 75 93" opacity="0.6" />
      <path d="M74 81 C84 81 84 97 74 98" />
      <path d="M60 76 C59 77.6 59.2 79 60 79 C60.8 79 61 77.6 60 76 Z" />
    </Svg>
  );
}

/* 意式：浓缩杯 + 碟 + 热气 */
export function EspressoLine({ className }) {
  return (
    <Svg viewBox="0 0 120 120" className={className} title="意式">
      <path d="M54 58 C50 52 58 48 54 41 M64 58 C60 52 68 48 64 41" opacity="0.55" />
      <ellipse cx="60" cy="66" rx="18" ry="3" />
      <path d="M42 66 C42 82 48 92 60 92 C72 92 78 82 78 66" />
      <path d="M77 71 C88 71 88 84 75 84" />
      <path d="M28 93 C40 99 80 99 92 93" />
      <path d="M36 93 H84" opacity="0.5" />
    </Svg>
  );
}

/* Logo：手冲滤杯 + 一滴咖啡 */
export function LogoMark({ className }) {
  return (
    <Svg viewBox="0 0 48 48" className={className} width={1.6}>
      <path d="M7 13 H41" />
      <path d="M9 13 L20 28 H28 L39 13" />
      <path d="M16.5 16 L22 26 M31.5 16 L26 26" opacity="0.45" />
      <path d="M8 14.5 C2.5 14.5 2.5 22 10 21.5" />
      <path d="M15 31 H33" />
      <path d="M24 34.5 C22.4 37.2 22.7 39.2 24 39.2 C25.3 39.2 25.6 37.2 24 34.5 Z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark className="logo-mark" />
      <span className="logo-text">
        <span className="logo-cn">豆仓</span>
        <span className="logo-en">Bean Vault</span>
      </span>
    </span>
  );
}

/* 没有照片时的封面 */
export function Placeholder({ bean }) {
  const Drawing = bean.usage === '意式' ? EspressoLine : PourOverLine;
  return (
    <div className="placeholder">
      <Drawing className="placeholder-art" />
      {bean.country && <span className="placeholder-label">{bean.country}</span>}
    </div>
  );
}

/* 细线图标 */
const Icon = ({ children }) => (
  <Svg viewBox="0 0 24 24" className="icon" width={1.4}>
    {children}
  </Svg>
);

export const IconSearch = () => (
  <Icon>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 L21 21" />
  </Icon>
);

export const IconPlus = () => (
  <Icon>
    <path d="M12 4 V20 M4 12 H20" />
  </Icon>
);

export const IconClose = () => (
  <Icon>
    <path d="M5 5 L19 19 M19 5 L5 19" />
  </Icon>
);

export const IconCamera = () => (
  <Icon>
    <path d="M3 8 H7 L9 5 H15 L17 8 H21 V19 H3 Z" />
    <circle cx="12" cy="13" r="3.6" />
  </Icon>
);
