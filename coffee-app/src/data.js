// 静态字典：产地、处理法、品种、风味、成就

export const CONTINENTS = ['非洲', '中南美洲', '亚洲及太平洋'];

export const ORIGINS = [
  { name: '埃塞俄比亚', flag: '🇪🇹', continent: '非洲' },
  { name: '肯尼亚', flag: '🇰🇪', continent: '非洲' },
  { name: '卢旺达', flag: '🇷🇼', continent: '非洲' },
  { name: '布隆迪', flag: '🇧🇮', continent: '非洲' },
  { name: '乌干达', flag: '🇺🇬', continent: '非洲' },
  { name: '坦桑尼亚', flag: '🇹🇿', continent: '非洲' },
  { name: '哥伦比亚', flag: '🇨🇴', continent: '中南美洲' },
  { name: '巴西', flag: '🇧🇷', continent: '中南美洲' },
  { name: '巴拿马', flag: '🇵🇦', continent: '中南美洲' },
  { name: '哥斯达黎加', flag: '🇨🇷', continent: '中南美洲' },
  { name: '危地马拉', flag: '🇬🇹', continent: '中南美洲' },
  { name: '洪都拉斯', flag: '🇭🇳', continent: '中南美洲' },
  { name: '萨尔瓦多', flag: '🇸🇻', continent: '中南美洲' },
  { name: '尼加拉瓜', flag: '🇳🇮', continent: '中南美洲' },
  { name: '秘鲁', flag: '🇵🇪', continent: '中南美洲' },
  { name: '厄瓜多尔', flag: '🇪🇨', continent: '中南美洲' },
  { name: '玻利维亚', flag: '🇧🇴', continent: '中南美洲' },
  { name: '墨西哥', flag: '🇲🇽', continent: '中南美洲' },
  { name: '牙买加', flag: '🇯🇲', continent: '中南美洲' },
  { name: '中国云南', flag: '🇨🇳', continent: '亚洲及太平洋' },
  { name: '印度尼西亚', flag: '🇮🇩', continent: '亚洲及太平洋' },
  { name: '也门', flag: '🇾🇪', continent: '亚洲及太平洋' },
  { name: '印度', flag: '🇮🇳', continent: '亚洲及太平洋' },
  { name: '越南', flag: '🇻🇳', continent: '亚洲及太平洋' },
  { name: '泰国', flag: '🇹🇭', continent: '亚洲及太平洋' },
  { name: '巴布亚新几内亚', flag: '🇵🇬', continent: '亚洲及太平洋' },
];

export const BLEND = '拼配';

export const PROCESSES = ['水洗', '日晒', '蜜处理', '厌氧', '湿刨法', '特殊发酵'];

export const VARIETIES = [
  '瑰夏', '埃塞原生种', 'SL28', 'SL34', '波旁', '粉红波旁', '铁皮卡',
  '卡杜拉', '卡杜艾', '帕卡马拉', '卡蒂姆', '卡斯蒂略', '象豆', '尤金尼奥', '西达摩',
];

export const ROASTS = ['极浅', '浅', '中浅', '中', '中深', '深'];

export const USAGES = ['手冲', '意式', '两用'];

export const FLAVORS = [
  '花香', '茉莉', '玫瑰', '柑橘', '柠檬', '莓果', '草莓', '葡萄', '蜜桃', '荔枝',
  '热带水果', '芒果', '茶感', '蜂蜜', '焦糖', '坚果', '巧克力', '酒香', '香料', '奶油',
];

// 养豆期 / 最佳赏味期（天，从烘焙日算起）
export const FRESHNESS = {
  手冲: { rest: 5, peak: 35 },
  意式: { rest: 10, peak: 45 },
  两用: { rest: 7, peak: 40 },
};

export const originOf = (name) => ORIGINS.find((o) => o.name === name);

// 成就：每个 test 接收全部豆子（含已喝完）
export const ACHIEVEMENTS = [
  { id: 'first', icon: '☕', title: '入坑', desc: '收藏第一支豆子', test: (b) => b.length >= 1 },
  { id: 'ten', icon: '📦', title: '小小豆仓', desc: '累计收藏 10 支豆子', test: (b) => b.length >= 10 },
  { id: 'thirty', icon: '🏛️', title: '豆子博物馆', desc: '累计收藏 30 支豆子', test: (b) => b.length >= 30 },
  { id: 'geisha', icon: '🌸', title: '瑰夏初体验', desc: '收藏一支瑰夏', test: (b) => b.some((x) => x.variety === '瑰夏') },
  {
    id: 'africa', icon: '🦁', title: '非洲三杰', desc: '集齐埃塞俄比亚、肯尼亚、卢旺达',
    test: (b) => ['埃塞俄比亚', '肯尼亚', '卢旺达'].every((c) => b.some((x) => x.country === c)),
  },
  {
    id: 'continents', icon: '🌏', title: '环游咖啡带', desc: '三大产区各收藏至少一支',
    test: (b) => CONTINENTS.every((ct) => b.some((x) => originOf(x.country)?.continent === ct)),
  },
  {
    id: 'process', icon: '🧪', title: '处理法大师', desc: '尝试 4 种处理法',
    test: (b) => new Set(b.map((x) => x.process).filter(Boolean)).size >= 4,
  },
  { id: 'anaerobic', icon: '🍷', title: '厌氧探险家', desc: '收藏一支厌氧/特殊发酵豆', test: (b) => b.some((x) => ['厌氧', '特殊发酵'].includes(x.process)) },
  {
    id: 'countries', icon: '🗺️', title: '十国护照', desc: '收集 10 个产地',
    test: (b) => new Set(b.map((x) => x.country).filter((c) => c && c !== BLEND)).size >= 10,
  },
  { id: 'espresso', icon: '🥛', title: '拉花练习生', desc: '收藏一支意式豆', test: (b) => b.some((x) => x.usage === '意式') },
  { id: 'finish', icon: '✅', title: '光盘行动', desc: '喝完一整包豆子', test: (b) => b.some((x) => x.finished) },
  { id: 'five', icon: '⭐', title: '本命豆', desc: '给一支豆子打满 5 星', test: (b) => b.some((x) => x.rating === 5) },
];

export const SAMPLE_BEANS = [
  {
    name: '耶加雪菲 孔加 G1', roaster: '示例烘焙商', country: '埃塞俄比亚', region: '耶加雪菲',
    farm: '孔加合作社', variety: '埃塞原生种', process: '水洗', roast: '浅', usage: '手冲',
    weight: 200, remaining: 140, price: 98, flavors: ['茉莉', '柠檬', '茶感'], rating: 4,
    daysAgo: 12, comment: '茉莉花香很明显，92℃ 1:15 最好喝。',
  },
  {
    name: '翡翠庄园 瑰夏 红标', roaster: '示例烘焙商', country: '巴拿马', region: '波奎特',
    farm: '翡翠庄园', variety: '瑰夏', process: '日晒', roast: '极浅', usage: '手冲',
    weight: 100, remaining: 100, price: 268, flavors: ['蜜桃', '花香', '蜂蜜'], rating: 0,
    daysAgo: 3, comment: '还在养豆，周末开。',
  },
  {
    name: '大师拼配', roaster: '示例烘焙商', country: BLEND, region: '巴西 + 哥伦比亚',
    farm: '', variety: '', process: '日晒', roast: '中深', usage: '意式',
    weight: 500, remaining: 210, price: 88, flavors: ['巧克力', '坚果', '焦糖'], rating: 4,
    daysAgo: 24, comment: '18g 进 36g 出 28s，打奶拉花油脂很稳。',
  },
  {
    name: '荔枝厌氧 卡斯蒂略', roaster: '示例烘焙商', country: '哥伦比亚', region: '考卡',
    farm: '天堂庄园', variety: '卡斯蒂略', process: '厌氧', roast: '浅', usage: '手冲',
    weight: 100, remaining: 0, price: 128, flavors: ['荔枝', '玫瑰', '酒香'], rating: 5,
    daysAgo: 40, comment: '荔枝味炸裂，90℃ 1:16。',
  },
];
