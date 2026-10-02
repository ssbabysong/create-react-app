import { useState } from 'react';
import { freshness, today, uid } from '../store.js';
import { usePhoto } from '../photos.js';
import BeanArt from './Art.jsx';
import { IconClose, IconCup, IconDrip, IconEdit, IconTrash } from './Line.jsx';
import { Stars } from './BeanCard.jsx';

const fmt = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function BeanDetail({ bean, doses, onClose, onEdit, onDelete, onUse, onSave }) {
  const [grams, setGrams] = useState(doses[bean.usage === '意式' ? '意式' : '手冲']);
  const g = Number(grams) || 0;
  const photo = usePhoto(bean.id, Boolean(bean.hasPhoto));
  const f = freshness(bean);
  const pct = bean.weight ? Math.min(100, (bean.remaining / bean.weight) * 100) : 0;

  const rows = [
    ['烘焙商', bean.roaster],
    ['产地', [bean.country, bean.region].filter(Boolean).join(' · ')],
    ['庄园', bean.farm],
    ['品种', bean.variety],
    ['处理法', bean.process],
    ['烘焙度', bean.roast],
    ['烘焙日', bean.roastDate],
    ['价格', bean.price ? `¥${bean.price}` : ''],
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
      hasPhoto: false,
    });

  const step = (d) => setGrams((v) => Math.max(1, (Number(v) || 0) + d));

  return (
    <div className="detail">
      <div className="detail-bar">
        <button className="icon-btn" onClick={onEdit} aria-label="编辑"><IconEdit /></button>
        <button
          className="icon-btn"
          aria-label="删除"
          onClick={() => confirm(`删除「${bean.name}」？`) && onDelete(bean.id)}
        >
          <IconTrash />
        </button>
        <button className="icon-btn" onClick={onClose} aria-label="关闭"><IconClose /></button>
      </div>

      <div className="detail-art"><BeanArt bean={bean} /></div>

      <div className="detail-info">
        <h1 className="detail-title">{bean.name}</h1>
        <div className="row gap wrap">
          <span className="status"><i className={`dot dot-${f.key}`} />{f.label}</span>
          {bean.rating > 0 && <Stars value={bean.rating} />}
        </div>

        {bean.flavors?.length > 0 && (
          <div className="pills">
            {bean.flavors.map((x) => <span key={x} className="pill">{x}</span>)}
          </div>
        )}

        <div className="stock" aria-label={`余量 ${bean.remaining} / ${bean.weight} 克`}>
          <div className="stock-track"><div className="stock-fill" style={{ width: `${pct}%` }} /></div>
          <span>{bean.remaining}g</span>
        </div>

        {!bean.finished ? (
          <div className="brew">
            <div className="qty">
              <button type="button" onClick={() => step(-1)} aria-label="减少">−</button>
              <input type="number" inputMode="decimal" min="1" value={grams} onChange={(e) => setGrams(e.target.value)} aria-label="克数" />
              <button type="button" onClick={() => step(1)} aria-label="增加">+</button>
            </div>
            <button className="brew-btn" onClick={() => onUse(bean.id, g, '手冲')}><IconDrip /><span>手冲</span></button>
            <button className="brew-btn" onClick={() => onUse(bean.id, g, '意式')}><IconCup /><span>意式</span></button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={rebuy}>再来一包</button>
        )}

        {bean.comment && <p className="note">{bean.comment}</p>}

        <details className="more">
          <summary>详情</summary>
          {photo && <img className="detail-photo" src={photo} alt="豆袋照片" />}
          <dl className="specs">
            {rows.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          {bean.log?.length > 0 && (
            <ul className="log">
              {bean.log.slice(0, 30).map((l, i) => (
                <li key={l.date + i}><span>{fmt(l.date)}</span><span>{l.method}</span><span>−{l.grams}g</span></li>
              ))}
            </ul>
          )}
          {!bean.finished && (
            <button className="link" onClick={() => onSave({ ...bean, remaining: 0, finished: true })}>标记喝完</button>
          )}
        </details>
      </div>
    </div>
  );
}
