import { originOf, BLEND } from '../data.js';
import { freshness } from '../store.js';
import BeanArt from './Art.jsx';

export function flagOf(country) {
  if (!country) return '';
  return country === BLEND ? '🫘' : originOf(country)?.flag || '📍';
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

const BADGE = { resting: '养豆中', soon: '尽快喝', stale: '风味衰退', done: '已喝完' };

export function Status({ bean }) {
  const f = freshness(bean);
  return (
    <span className="status">
      <i className={`dot dot-${f.key}`} />
      {f.label}
    </span>
  );
}

export default function BeanTile({ bean, doses, onOpen, onUse }) {
  const f = freshness(bean);
  const method = bean.usage === '意式' ? '意式' : '手冲';
  const where = [bean.country && `${flagOf(bean.country)} ${bean.country}`, bean.farm || bean.region].filter(Boolean).join(' · ');

  return (
    <article className={`tile ${bean.finished ? 'is-finished' : ''}`}>
      <button className="tile-art" onClick={onOpen} aria-label={`查看 ${bean.name}`}>
        <BeanArt bean={bean} />
        {BADGE[f.key] && <span className={`badge badge-${f.key}`}>{BADGE[f.key]}</span>}
      </button>
      <div className="tile-body">
        <button className="tile-title" onClick={onOpen}>{bean.name}</button>
        {(bean.variety || bean.process) && <p>{[bean.variety, bean.process].filter(Boolean).join(' ')}</p>}
        {where && <p>{where}</p>}
        <p className="tile-meta">
          {bean.finished ? (
            <>{bean.rating > 0 ? <Stars value={bean.rating} /> : '已喝完'}</>
          ) : (
            <>
              余 {bean.remaining}g{f.d != null && <span className="muted"> · 第 {f.d} 天</span>}
            </>
          )}
        </p>
        {!bean.finished && (
          <button className="link" onClick={() => onUse(bean.id, doses[method], method)}>
            冲一杯 −{doses[method]}g
          </button>
        )}
      </div>
    </article>
  );
}
