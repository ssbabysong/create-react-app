import { useMemo, useState } from 'react';
import { freshness } from '../store.js';
import BeanCard from './BeanCard.jsx';
import { LatteCup, PourOver } from './Illustrations.jsx';

const FILTERS = [
  { key: 'stock', label: '在仓' },
  { key: 'resting', label: '养豆中' },
  { key: 'peak', label: '赏味期' },
  { key: 'soon', label: '尽快喝' },
  { key: 'done', label: '已喝完' },
];

const SORTS = {
  fresh: { label: '按烘焙日', fn: (a, b) => (b.roastDate || '').localeCompare(a.roastDate || '') },
  added: { label: '按入仓', fn: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') },
  rating: { label: '按评分', fn: (a, b) => (b.rating || 0) - (a.rating || 0) },
  left: { label: '按余量', fn: (a, b) => a.remaining - b.remaining },
};

export default function Inventory({ beans, doses, onOpen, onUse, onAdd, onSample }) {
  const [filter, setFilter] = useState('stock');
  const [sort, setSort] = useState('fresh');
  const [q, setQ] = useState('');

  const inStock = beans.filter((b) => !b.finished);
  const totalLeft = inStock.reduce((s, b) => s + (Number(b.remaining) || 0), 0);
  const counts = useMemo(() => {
    const c = { stock: inStock.length };
    beans.forEach((b) => {
      const k = freshness(b).key === 'stale' ? 'soon' : freshness(b).key;
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [beans]);

  const list = beans
    .filter((b) => {
      const k = freshness(b).key;
      if (filter === 'stock') return !b.finished;
      if (filter === 'soon') return k === 'soon' || k === 'stale';
      return k === filter;
    })
    .filter((b) => {
      if (!q.trim()) return true;
      const hay = [b.name, b.roaster, b.country, b.region, b.farm, b.variety, b.process, ...(b.flavors || [])].join(' ');
      return hay.toLowerCase().includes(q.trim().toLowerCase());
    })
    .sort(SORTS[sort].fn);

  if (beans.length === 0) {
    return (
      <div className="empty">
        <PourOver />
        <h2><span className="mark">豆仓还是空的</span></h2>
        <p className="muted">把你手上的咖啡豆一支支收进来，解锁产地图鉴和成就。</p>
        <button className="btn btn-primary" onClick={onAdd}>＋ 收藏第一支豆子</button>
        <button className="btn btn-ghost" onClick={onSample}>先看看示例数据</button>
      </div>
    );
  }

  return (
    <>
      <section className="hero card">
        <div className="stat">
          <span>在仓</span>
          <b>{inStock.length}</b>
          <span>支</span>
        </div>
        <div className="stat">
          <span>余量</span>
          <b>{totalLeft >= 1000 ? (totalLeft / 1000).toFixed(2) : Math.round(totalLeft)}</b>
          <span>{totalLeft >= 1000 ? 'kg' : 'g'}</span>
        </div>
        <div className="stat">
          <span>约可冲</span>
          <b>{Math.floor(totalLeft / doses['手冲'])}</b>
          <span>杯</span>
        </div>
        <LatteCup />
      </section>

      <input className="search" type="search" placeholder="搜索名称、产地、风味…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="filters">
        {FILTERS.map((f) => (
          <button key={f.key} className={`chip ${filter === f.key ? 'on' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
            {counts[f.key] ? <em>{counts[f.key]}</em> : null}
          </button>
        ))}
        <select className="sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="排序">
          {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <p className="muted center pad">这里暂时没有豆子</p>
      ) : (
        <div className="list">
          {list.map((b) => (
            <BeanCard key={b.id} bean={b} doses={doses} onOpen={() => onOpen(b.id)} onUse={onUse} />
          ))}
        </div>
      )}
    </>
  );
}
