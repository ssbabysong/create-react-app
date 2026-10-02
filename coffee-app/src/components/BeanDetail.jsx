import { useState } from 'react';
import { today, uid } from '../store.js';
import BeanArt, { IconClose } from './Art.jsx';
import { Stars, Status, flagOf } from './BeanCard.jsx';

const fmt = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function BeanDetail({ bean, doses, onClose, onEdit, onDelete, onUse, onSave }) {
  const [grams, setGrams] = useState(doses[bean.usage === '意式' ? '意式' : '手冲']);
  const g = Number(grams) || 0;
  const rows = [
    ['产地', bean.country && `${flagOf(bean.country)} ${bean.country}`],
    ['产区', bean.region],
    ['庄园 / 处理站', bean.farm],
    ['品种', bean.variety],
    ['处理法', bean.process],
    ['烘焙度', bean.roast],
    ['烘焙商', bean.roaster],
    ['用途', bean.usage],
    ['烘焙日', bean.roastDate],
    ['余量', `${bean.remaining} / ${bean.weight} g`],
    ['价格', bean.price !== '' && bean.price != null ? `¥${bean.price}` : ''],
    ['每杯成本', bean.price && bean.weight ? `¥${((bean.price / bean.weight) * doses['手冲']).toFixed(1)}（${doses['手冲']}g）` : ''],
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

  const step = (d) => setGrams((v) => Math.max(1, (Number(v) || 0) + d));

  return (
    <div className="detail">
      <button className="icon-btn close" onClick={onClose} aria-label="关闭"><IconClose /></button>

      <div className="detail-media">
        <BeanArt bean={bean} />
        {bean.photo && <img className="detail-photo" src={bean.photo} alt="豆袋照片" />}
      </div>

      <div className="detail-info">
        <p className="eyebrow">{bean.roaster || '咖啡豆'}</p>
        <h1 className="detail-title">{bean.name}</h1>
        <p className="muted">{[bean.variety, bean.process, bean.roast && `${bean.roast}烘`].filter(Boolean).join(' · ')}</p>
        <div className="row gap wrap">
          <Status bean={bean} />
          {bean.rating > 0 && <Stars value={bean.rating} />}
        </div>

        {bean.flavors?.length > 0 && (
          <div className="pills">
            {bean.flavors.map((f) => <span key={f} className="pill">{f}</span>)}
          </div>
        )}

        {!bean.finished ? (
          <div className="buy">
            <label className="field-label" htmlFor="grams">称豆（克）</label>
            <div className="qty">
              <button type="button" onClick={() => step(-1)} aria-label="减少">−</button>
              <input id="grams" type="number" inputMode="decimal" min="1" value={grams} onChange={(e) => setGrams(e.target.value)} />
              <button type="button" onClick={() => step(1)} aria-label="增加">+</button>
            </div>
            <button className="btn btn-primary block" onClick={() => onUse(bean.id, g, '手冲')}>手冲 · 称 {g}g</button>
            <button className="btn block" onClick={() => onUse(bean.id, g, '意式')}>意式 · 称 {g}g</button>
            <button className="link" onClick={() => onSave({ ...bean, remaining: 0, finished: true })}>标记为已喝完</button>
          </div>
        ) : (
          <div className="buy">
            <button className="btn btn-primary block" onClick={rebuy}>回购一包</button>
          </div>
        )}

        {bean.comment && <p className="note">{bean.comment}</p>}

        <dl className="specs">
          {rows.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>

        {bean.log?.length > 0 && (
          <details className="accordion" open={bean.log.length <= 5}>
            <summary>使用记录（{bean.log.length} 次）</summary>
            <ul className="log">
              {bean.log.slice(0, 30).map((l, i) => (
                <li key={l.date + i}>
                  <span>{fmt(l.date)}</span>
                  <span>{l.method}</span>
                  <span>−{l.grams}g</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="row gap">
          <button className="link" onClick={onEdit}>编辑</button>
          <button
            className="link danger"
            onClick={() => confirm(`确定从豆仓删除「${bean.name}」？图鉴记录也会一起移除。`) && onDelete(bean.id)}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
