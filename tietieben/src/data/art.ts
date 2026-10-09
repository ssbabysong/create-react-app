// Built-in sticker artwork (viewBox 0 0 100 100) and washi tape patterns.
export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export const svg = (inner: string) => `<svg viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;

type Art = (c: string) => string;
export const ST: Record<string, Art> = {
  star: (c) => `<path style="fill:${c}" d="M50 6l12.9 28.2 30.8 3.4-23 20.8 6.5 30.3L50 73.3 22.8 88.7l6.5-30.3-23-20.8 30.8-3.4z"/><path d="M50 18l8 18" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>`,
  heart: (c) => `<path style="fill:${c}" d="M50 88C50 88 8 62 8 34a21 21 0 0 1 42-6 21 21 0 0 1 42 6c0 28-42 54-42 54z"/><path d="M22 30a10 10 0 0 1 12-8" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".5"/>`,
  flower: (c) => [0, 72, 144, 216, 288].map((a) => `<ellipse cx="50" cy="27" rx="15" ry="22" transform="rotate(${a} 50 50)" style="fill:${c}"/>`).join('') + `<circle cx="50" cy="50" r="12" fill="#f6d26b"/><circle cx="46" cy="46" r="3" fill="#fff" opacity=".6"/>`,
  sparkle: (c) => `<path style="fill:${c}" d="M50 4Q56 44 96 50Q56 56 50 96Q44 56 4 50Q44 44 50 4z"/>`,
  cloud: (c) => `<path style="fill:${c}" d="M26 74a16 16 0 0 1-2-32 22 22 0 0 1 42-8 18 18 0 0 1 12 40z"/><path d="M30 50a10 10 0 0 1 10-8" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".55"/>`,
  sun: (c) => `<g style="stroke:${c}" stroke-width="7" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="50" y1="6" x2="50" y2="17" transform="rotate(${a} 50 50)"/>`).join('')}</g><circle cx="50" cy="50" r="22" style="fill:${c}"/>`,
  rain: (c) => `<path style="fill:${c}" d="M26 60a16 16 0 0 1-2-32 22 22 0 0 1 42-8 18 18 0 0 1 12 40z"/><g style="stroke:${c}" stroke-width="5" stroke-linecap="round"><line x1="34" y1="72" x2="30" y2="84"/><line x1="52" y1="72" x2="48" y2="84"/><line x1="70" y1="72" x2="66" y2="84"/></g>`,
  snow: (c) => `<g style="stroke:${c}" stroke-width="6" stroke-linecap="round">${[0, 60, 120].map((a) => `<line x1="50" y1="12" x2="50" y2="88" transform="rotate(${a} 50 50)"/>`).join('')}</g>`,
  cat: (c) => `<path style="fill:${c}" d="M18 34L22 10L40 26Q50 23 60 26L78 10L82 34Q90 48 86 62Q78 88 50 88Q22 88 14 62Q10 48 18 34z"/><circle cx="37" cy="54" r="5" fill="#2b2b2b"/><circle cx="63" cy="54" r="5" fill="#2b2b2b"/><path d="M45 66Q50 71 55 66" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="27" cy="66" rx="6" ry="3.5" fill="#ff9fb0" opacity=".8"/><ellipse cx="73" cy="66" rx="6" ry="3.5" fill="#ff9fb0" opacity=".8"/>`,
  coffee: (c) => `<path d="M36 30c-4-6 4-8 0-16M52 30c-4-6 4-8 0-16" fill="none" style="stroke:${c}" stroke-width="4" stroke-linecap="round" opacity=".55"/><path d="M70 46h6a10 10 0 0 1 0 20h-7" fill="none" style="stroke:${c}" stroke-width="6"/><path d="M20 38h52v24a22 22 0 0 1-22 22h-8a22 22 0 0 1-22-22z" style="fill:${c}"/><rect x="14" y="84" width="66" height="6" rx="3" style="fill:${c}" opacity=".55"/><path d="M30 50h32" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>`,
  leaf: (c) => `<path d="M50 96V10" style="stroke:${c}" stroke-width="4" stroke-linecap="round"/>` + [[24, -40], [42, 40], [58, -40], [74, 40]].map(([y, a]) => `<ellipse cx="50" cy="${y}" rx="9" ry="18" transform="rotate(${a} 50 ${y + 14}) translate(0 -4)" style="fill:${c}"/>`).join(''),
  ginkgo: (c) => `<path d="M50 58L50 94" style="stroke:${c}" stroke-width="4" stroke-linecap="round"/><path style="fill:${c}" d="M50 62C28 60 10 44 8 22C24 12 40 12 48 24L50 30L52 24C60 12 76 12 92 22C90 44 72 60 50 62z"/><g stroke="#fff" stroke-width="1.5" opacity=".35"><line x1="50" y1="58" x2="24" y2="22"/><line x1="50" y1="58" x2="38" y2="18"/><line x1="50" y1="58" x2="62" y2="18"/><line x1="50" y1="58" x2="76" y2="22"/></g>`,
  persimmon: (c) => `<circle cx="50" cy="58" r="32" style="fill:${c}"/><ellipse cx="38" cy="50" rx="6" ry="9" fill="#fff" opacity=".3"/><path d="M50 30L36 22L44 34L30 37L46 40L50 32L54 40L70 37L56 34L64 22z" fill="#5c7a3a"/><rect x="47" y="12" width="6" height="16" rx="2" fill="#5c7a3a"/>`,
  maple: (c) => `<path style="fill:${c}" d="M50 6L58 28L72 20L68 40L90 36L78 52L92 60L70 64L74 80L54 70L52 94H48L46 70L26 80L30 64L8 60L22 52L10 36L32 40L28 20L42 28z"/>`,
  croissant: (c) => `<path style="fill:${c}" d="M10 64C14 40 30 28 50 28S86 40 90 64C80 70 70 62 66 56C62 66 56 70 50 70S38 66 34 56C30 62 20 70 10 64z"/><path d="M34 56C36 44 42 36 50 34M66 56C64 44 58 36 50 34" fill="none" stroke="#8a5a2b" stroke-width="2.5" opacity=".5"/><path d="M40 38Q50 32 60 38" stroke="#fff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>`,
  pot: (c) => `<path d="M50 52C40 40 26 38 20 26C34 24 46 32 50 44C54 30 64 20 80 20C76 36 62 42 50 52z" fill="#6f9a5b"/><path d="M50 52V40" stroke="#4d7a3d" stroke-width="3"/><path style="fill:${c}" d="M28 54h44l-6 36H34z"/><rect x="24" y="50" width="52" height="10" rx="3" style="fill:${c}"/>`,
  latte: (c) => `<path style="fill:${c}" d="M22 20h56l-6 70H28z"/><rect x="18" y="14" width="64" height="10" rx="3" fill="#f4efe6"/><rect x="27" y="44" width="46" height="18" fill="#f4efe6" opacity=".9"/><text x="50" y="57" text-anchor="middle" font-size="10" font-family="Caveat,cursive" fill="#6b4a33">latte</text>`,
  stamp: (c) => `<rect x="10" y="6" width="80" height="88" fill="#fffdf8" stroke="#d6cfc1" stroke-width="5" stroke-dasharray="0.1 7" stroke-linecap="round"/><rect x="18" y="14" width="64" height="62" style="fill:${c}"/><circle cx="64" cy="32" r="8" fill="#fff6d8"/><path d="M18 76L40 44L54 62L64 52L82 76z" fill="#fff" opacity=".55"/><text x="50" y="89" text-anchor="middle" font-size="11" font-family="Caveat,cursive" fill="#6b6256">80 · POST</text>`,
  ticket: (c) => `<path style="fill:${c}" d="M6 26h88v16a8 8 0 0 0 0 16v16H6V58a8 8 0 0 0 0-16z"/><line x1="70" y1="30" x2="70" y2="70" stroke="#fff" stroke-width="2" stroke-dasharray="3 4"/><text x="38" y="48" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Caveat,cursive">ADMIT</text><text x="38" y="62" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Caveat,cursive">ONE</text>`,
  tag: (c) => `<path style="fill:${c}" d="M30 24h62v52H30L8 50z"/><circle cx="25" cy="50" r="5" fill="#fff"/><text x="61" y="58" text-anchor="middle" font-size="22" fill="#fff" font-family="Caveat,cursive" font-weight="700">TODAY</text>`,
  note: (c) => `<path style="fill:${c}" d="M10 10h80v58L68 90H10z"/><path d="M68 90V68h22z" fill="#000" opacity=".12"/><g stroke="#000" opacity=".12" stroke-width="2"><line x1="20" y1="34" x2="80" y2="34"/><line x1="20" y1="48" x2="80" y2="48"/><line x1="20" y1="62" x2="58" y2="62"/></g>`,
  polaroid: (c) => `<rect x="12" y="6" width="76" height="88" rx="2" fill="#fffdf9" stroke="#e2dccf"/><rect x="18" y="12" width="64" height="60" style="fill:${c}" opacity=".45"/><path d="M18 72L40 48L56 64L66 56L82 72z" style="fill:${c}"/><circle cx="66" cy="28" r="6" fill="#fff" opacity=".85"/>`,
  bubble: (c) => `<path style="fill:${c}" d="M14 18h72a8 8 0 0 1 8 8v36a8 8 0 0 1-8 8H42L26 86V70H14a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z"/><text x="50" y="53" text-anchor="middle" font-size="24" fill="#fff" font-family="Caveat,cursive" font-weight="700">yay!</text>`,
  check: (c) => `<rect x="14" y="14" width="72" height="72" rx="12" fill="#fff" style="stroke:${c}" stroke-width="6"/><path d="M30 50L45 65L72 34" fill="none" style="stroke:${c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
  arrow: (c) => `<path d="M10 70C30 30 60 30 84 44" fill="none" style="stroke:${c}" stroke-width="5" stroke-linecap="round"/><path d="M70 30L86 45L67 52" fill="none" style="stroke:${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
};
/** Date stamp sticker that always shows the date of the page it is placed on. */
export const dateStamp = (c: string, mon: string, day: string, year: string) =>
  `<g style="stroke:${c}" fill="none" stroke-width="3"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="34" stroke-width="1.5"/></g><text x="50" y="52" text-anchor="middle" font-size="21" font-weight="700" style="fill:${c}" font-family="Caveat,cursive">${mon} ${day}</text><text x="50" y="69" text-anchor="middle" font-size="12" style="fill:${c}" font-family="Caveat,cursive" letter-spacing="2">${year}</text>`;

export const NAMES: Record<string, string> = { star: '星星', heart: '爱心', flower: '小花', sparkle: '闪光', cloud: '云朵', sun: '太阳', rain: '下雨', snow: '下雪', cat: '猫猫', coffee: '咖啡', leaf: '枝叶', ginkgo: '银杏', persimmon: '柿子', maple: '枫叶', croissant: '可颂', pot: '盆栽', latte: '拿铁', stamp: '邮票', ticket: '票根', tag: '吊牌', date: '日期章', note: '便利贴', polaroid: '拍立得', bubble: '气泡', check: '勾选', arrow: '箭头' };
export const DEF: Record<string, string> = { star: '#f2c14e', heart: '#ef7a8a', flower: '#f2a7b8', sparkle: '#f2c14e', cloud: '#9cc8e8', sun: '#f5b942', rain: '#8fb3d6', snow: '#9cc8e8', cat: '#e9a46a', coffee: '#a0714f', leaf: '#7fb069', ginkgo: '#e9b832', persimmon: '#ec8a3c', maple: '#d9573f', croissant: '#d9a05b', pot: '#c97b5a', latte: '#b98a62', stamp: '#7fa7c9', ticket: '#e2675e', tag: '#6e8f69', date: '#e2675e', note: '#f7e08a', polaroid: '#9cc8e8', bubble: '#ff7aa8', check: '#5b9bd5', arrow: '#6b6256' };
export const LABEL_KEYS = ['tag', 'date', 'stamp', 'ticket', 'note', 'polaroid', 'bubble'];

export const ROLLS = [
  { id: 'daily', name: '日常小物', sub: '咖啡、面包、植物和猫', keys: ['coffee', 'croissant', 'star', 'pot', 'heart', 'cat', 'flower', 'leaf', 'sparkle'] },
  { id: 'autumn', name: '秋日限定', sub: '银杏、枫叶、柿子和热饮', keys: ['ginkgo', 'maple', 'persimmon', 'latte', 'ginkgo', 'leaf'] },
  { id: 'weather', name: '天气心情', sub: '放在日页页眉', keys: ['sun', 'cloud', 'rain', 'snow', 'sparkle', 'heart', 'star'] },
  { id: 'labels', name: '标签印章', sub: '吊牌、日期章、邮票、票根', keys: ['tag', 'date', 'stamp', 'ticket', 'note', 'polaroid', 'bubble', 'check', 'arrow'] },
];

export const PATS = ['grid', 'dot', 'stripe', 'check', 'kraft', 'petal', 'lace', 'vellum', 'gold'];
export const PATN: Record<string, string> = { grid: '格纹', dot: '波点', stripe: '斜条', check: '方格布', kraft: '牛皮纸', petal: '碎花', lace: '蕾丝', vellum: '描图纸', gold: '烫金细纹' };
export const TAPEC: Record<string, string> = { grid: '#9cc5a1', dot: '#f2a7b8', stripe: '#8fbbe0', check: '#e88a7d', kraft: '#c8a27a', petal: '#b7a6dc', lace: '#f0c977', vellum: '#c9d6dd', gold: '#d8b46a' };
export const tape = (p: string, c: string, w: number | string, h: number, st = '') =>
  `<span class="tape tp-${p}" style="--c:${c};width:${typeof w === 'number' ? w + 'px' : w};height:${h}px;${st}"></span>`;

export const FONTS: [string, string][] = [
  ['龙藏', "'Long Cang',cursive"],
  ['马善政', "'Ma Shan Zheng',cursive"],
  ['快乐体', "'ZCOOL KuaiLe',cursive"],
  ['志莽行', "'Zhi Mang Xing',cursive"],
  ['Caveat', "'Caveat',cursive"],
  ['打字机', "'Special Elite','Courier New',monospace"],
];
export const SWATCHES = ['#3a3127', '#6e8f69', '#d6a240', '#c9776a', '#e2675e', '#f2a7b8', '#5b9bd5', '#8e7cc3', '#a0714f', '#ffffff'];
export const PEN_COLORS = ['#3a3127', '#5d4a36', '#c9776a', '#6e8f69', '#4f6f8f', '#d6a240'];
export const TEXTS: [string, string, string][] = [
  ['TODAY', "'Caveat',cursive", '#c9776a'],
  ['今天也很好', "'Long Cang',cursive", '#3a3127'],
  ['好好吃饭', "'ZCOOL KuaiLe',cursive", '#e2675e'],
  ['周末快乐', "'Ma Shan Zheng',cursive", '#6e8f69'],
  ['慢慢来', "'Zhi Mang Xing',cursive", '#3a3127'],
  ['to do list', "'Caveat',cursive", '#6e8f69'],
  ['memo / 备忘', "'Special Elite','Courier New',monospace", '#5d4a36'],
];

const ICO: Record<string, string> = {
  sidebar: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
  shelf: '<path d="M4 4v16M8 4v16M12 5l4 15M17 4v16M3 20h18"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  pen: '<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>',
  eraser: '<path d="M8 20h12M5 15l8-8 6 6-5 5H8z"/><path d="M10 10l6 6"/>',
  hand: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-3l-2-3.5a1.5 1.5 0 0 1 2.5-1.6L8 14"/>',
  sticker: '<path d="M5 4h14v9l-6 7H5z"/><path d="M13 20v-4a3 3 0 0 1 3-3h3"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  dup: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  today: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><circle cx="12" cy="15" r="1.6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  tape: '<path d="M4 9l14-5 2 6-14 5z"/><path d="M6 15l2 5"/>',
  share: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
};
export const ic = (k: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k]}</svg>`;
