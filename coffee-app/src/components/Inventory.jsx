import { freshness } from '../store.js';
import BeanTile from './BeanCard.jsx';
import BeanArt from './Art.jsx';
import { IconCamera } from './Line.jsx';

const SECTIONS = [
  { key: 'peak', title: '赏味期' },
  { key: 'resting', title: '养豆中' },
  { key: 'soon', title: '尽快喝', also: ['stale'] },
  { key: 'unknown', title: '未填烘焙日' },
  { key: 'done', title: '喝完了' },
];

const byRoast = (a, b) => (b.roastDate || '').localeCompare(a.roastDate || '');

const HERO = [
  { id: 'hero-a', name: 'a', flavors: ['蜜桃', '茉莉'], usage: '手冲' },
  { id: 'hero-b', name: 'b', flavors: ['巧克力', '焦糖'], usage: '意式' },
  { id: 'hero-c', name: 'c', flavors: ['柑橘', '茶感'], usage: '手冲' },
];

export default function Inventory({ beans, doses, q, onOpen, onUse, onAdd, onSample }) {
  if (beans.length === 0) {
    return (
      <section className="empty">
        <div className="hero-stack">
          {HERO.map((b) => (
            <div key={b.id} className="hero-card"><BeanArt bean={b} /></div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          <IconCamera /> 拍豆袋
        </button>
        <button className="link" onClick={onSample}>看看示例</button>
      </section>
    );
  }

  const query = q.trim().toLowerCase();
  const visible = beans.filter((b) => {
    if (!query) return true;
    const hay = [b.name, b.roaster, b.country, b.region, b.farm, b.variety, b.process, ...(b.flavors || [])].join(' ');
    return hay.toLowerCase().includes(query);
  });

  return (
    <>
      {visible.length === 0 && <p className="muted center pad">没有找到</p>}
      {SECTIONS.map((s) => {
        const list = visible.filter((b) => [s.key, ...(s.also || [])].includes(freshness(b).key)).sort(byRoast);
        if (list.length === 0) return null;
        return (
          <section key={s.key} className="section">
            <h2 className="section-title">
              {s.title} <span>{list.length}</span>
            </h2>
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
