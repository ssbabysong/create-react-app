import { useState } from 'react';
import { today, uid } from '../store.js';
import { FreshBar, OriginBadge, Stars } from './BeanCard.jsx';

const fmt = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function BeanDetail({ bean, onClose, onEdit, onDelete, onUse, onSave }) {
  const [grams, setGrams] = useState(15);
  const rows = [
    ['烘焙商', bean.roaster],
    ['产区', bean.region],
    ['庄园', bean.farm],
    ['品种', bean.variety],
    ['处理法', bean.process],
    ['烘焙度', bean.roast],
    ['用途', bean.usage],
    ['烘焙日', bean.roastDate],
    ['价格', bean.price !== '' && bean.price != null ? `¥${bean.price}` : ''],
    ['单价', bean.price && bean.weight ? `¥${(bean.price / bean.weight * 15).toFixed(1)} / 15g` : ''],
  ].filter(([, v]) => v);

  const rebuy = () =>
    onSave({
      ...bean,
      id: uid(),
      createdAt: new Date().toISOString(),
      roastDate: today(),
      remaining: bean.weight,
      finished: false,
      log: [],
      rating: 0,
    });

  return (
    <div className="detail">
      <header className="sheet-head">
        <button className="btn btn-ghost" onClick={onClose}>关闭</button>
        <h2>豆子档案</h2>
        <button className="btn btn-ghost" onClick={onEdit}>编辑</button>
      </header>

      {bean.photo && <img className="detail-photo" src={bean.photo} alt="豆袋照片" />}
      <h1 className="detail-title">{bean.name}</h1>
      <div className="row gap-s wrap">
        <OriginBadge country={bean.country} />
        {bean.rating > 0 && <Stars value={bean.rating} />}
      </div>
      <FreshBar bean={bean} />

      {bean.flavors?.length > 0 && (
        <div className="chips">
          {bean.flavors.map((f) => <span key={f} className="chip on static">{f}</span>)}
        </div>
      )}

      <dl className="kv">
        {rows.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
        <div><dt>余量</dt><dd>{bean.remaining} / {bean.weight} g</dd></div>
      </dl>

      {bean.comment && <p className="note">{bean.comment}</p>}

      {!bean.finished ? (
        <div className="card">
          <h3>称一份豆</h3>
          <div className="row gap-s">
            <input type="number" inputMode="decimal" min="0" value={grams} onChange={(e) => setGrams(e.target.value)} />
            <span>g</span>
            <button className="btn btn-soft" onClick={() => onUse(bean.id, Number(grams) || 0, '手冲')}>💧 手冲</button>
            <button className="btn btn-soft" onClick={() => onUse(bean.id, Number(grams) || 0, '意式')}>☕ 意式</button>
          </div>
          <button className="btn btn-ghost small" onClick={() => onSave({ ...bean, remaining: 0, finished: true })}>
            标记为已喝完
          </button>
        </div>
      ) : (
        <button className="btn btn-primary block" onClick={rebuy}>🔁 回购一包（新烘焙日）</button>
      )}

      {bean.log?.length > 0 && (
        <div className="card">
          <h3>使用记录（{bean.log.length} 次）</h3>
          <ul className="log">
            {bean.log.slice(0, 30).map((l, i) => (
              <li key={l.date + i}>
                <span>{fmt(l.date)}</span>
                <span>{l.method}</span>
                <b>−{l.grams}g</b>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="btn btn-danger block"
        onClick={() => confirm(`确定从豆仓删除「${bean.name}」？图鉴记录也会一起移除。`) && onDelete(bean.id)}
      >
        删除
      </button>
    </div>
  );
}
