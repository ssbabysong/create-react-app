import { originOf, BLEND } from '../data.js';
import { freshness } from '../store.js';

export function OriginBadge({ country }) {
  if (!country) return null;
  const flag = country === BLEND ? '🫘' : originOf(country)?.flag || '📍';
  return (
    <span className="origin">
      {flag} {country}
    </span>
  );
}

export function Stars({ value = 0, onChange, size = 'sm' }) {
  return (
    <span className={`stars stars-${size}`} role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? 'on' : ''}
          disabled={!onChange}
          aria-label={`${n} 星`}
          onClick={() => onChange?.(n === value ? 0 : n)}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export function FreshBar({ bean }) {
  const f = freshness(bean);
  return (
    <div className={`fresh fresh-${f.key}`}>
      <div className="fresh-track">
        <div className="fresh-fill" style={{ width: `${Math.max(4, f.pct * 100)}%` }} />
      </div>
      <span className="fresh-label">{f.label}</span>
    </div>
  );
}

export default function BeanCard({ bean, doses, onOpen, onUse }) {
  const pct = bean.weight ? Math.min(100, (bean.remaining / bean.weight) * 100) : 0;
  const methods = bean.usage === '两用' ? ['手冲', '意式'] : [bean.usage || '手冲'];

  return (
    <article className={`card bean-card ${bean.finished ? 'is-finished' : ''}`}>
      <button className="bean-main" onClick={onOpen}>
        <div className="thumb">
          {bean.photo ? <img src={bean.photo} alt="" /> : <span>{originOf(bean.country)?.flag || '🫘'}</span>}
        </div>
        <div className="bean-info">
          <h3>{bean.name}</h3>
          <p className="muted small">
            {[bean.roaster, bean.process, bean.roast && `${bean.roast}烘`].filter(Boolean).join(' · ')}
          </p>
          <div className="row gap-s wrap">
            <OriginBadge country={bean.country} />
            {bean.variety && <span className="tag">{bean.variety}</span>}
            {bean.rating > 0 && <Stars value={bean.rating} />}
          </div>
        </div>
      </button>

      <FreshBar bean={bean} />

      <div className="stock">
        <div className="stock-track">
          <div className="stock-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="small">
          <b>{bean.remaining}</b>/{bean.weight}g
        </span>
      </div>

      {!bean.finished && (
        <div className="row gap-s">
          {methods.map((m) => (
            <button key={m} className="btn btn-soft grow" onClick={() => onUse(bean.id, doses[m], m)}>
              {m === '意式' ? '☕' : '💧'} {m} −{doses[m]}g
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
