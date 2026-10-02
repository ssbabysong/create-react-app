import { freshness } from '../store.js';
import BeanTile from './BeanCard.jsx';
import { PourOverLine } from './Line.jsx';

const SECTIONS = [
  { key: 'peak', title: '最佳赏味', sub: '现在冲，正好喝' },
  { key: 'resting', title: '养豆中', sub: '再等几天，让风味安定下来' },
  { key: 'soon', title: '尽快喝完', sub: '风味开始走下坡路了', also: ['stale'] },
  { key: 'unknown', title: '未填烘焙日', sub: '补上烘焙日期，就能追踪赏味期' },
  { key: 'done', title: '已喝完', sub: '喝过的每一支都留在这里，随时可以回购' },
];

const byRoast = (a, b) => (b.roastDate || '').localeCompare(a.roastDate || '');

export default function Inventory({ beans, doses, q, onOpen, onUse, onAdd, onSample }) {
  if (beans.length === 0) {
    return (
      <section className="empty">
        <PourOverLine className="empty-art" />
        <h1 className="headline">收藏每一支喝过的咖啡豆</h1>
        <p className="muted">拍下豆袋，信息自动识别入仓。慢慢攒满产地、处理法与风味。</p>
        <div className="actions">
          <button className="btn btn-primary" onClick={onAdd}>拍照录入第一支豆子</button>
          <button className="btn" onClick={onSample}>先看看示例数据</button>
        </div>
      </section>
    );
  }

  const inStock = beans.filter((b) => !b.finished);
  const totalLeft = inStock.reduce((s, b) => s + (Number(b.remaining) || 0), 0);
  const query = q.trim().toLowerCase();
  const visible = beans.filter((b) => {
    if (!query) return true;
    const hay = [b.name, b.roaster, b.country, b.region, b.farm, b.variety, b.process, ...(b.flavors || [])].join(' ');
    return hay.toLowerCase().includes(query);
  });

  return (
    <>
      <section className="intro">
        <h1 className="headline">收藏每一支喝过的咖啡豆</h1>
        <p className="muted">
          在仓 {inStock.length} 支 · 余 {totalLeft >= 1000 ? `${(totalLeft / 1000).toFixed(2)}kg` : `${Math.round(totalLeft)}g`} ·
          约可冲 {Math.floor(totalLeft / doses['手冲'])} 杯
        </p>
      </section>

      {visible.length === 0 && <p className="muted center pad">没有找到「{q}」相关的豆子</p>}

      {SECTIONS.map((s) => {
        const list = visible.filter((b) => [s.key, ...(s.also || [])].includes(freshness(b).key)).sort(byRoast);
        if (list.length === 0) return null;
        return (
          <section key={s.key} className="section">
            <h2 className="section-title">{s.title}</h2>
            <p className="section-sub">{s.sub}</p>
            <div className="grid">
              {list.map((b) => (
                <BeanTile key={b.id} bean={b} doses={doses} onOpen={() => onOpen(b.id)} onUse={onUse} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
