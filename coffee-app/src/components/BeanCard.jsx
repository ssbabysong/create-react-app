import { freshness } from '../store.js';
import { usePhoto } from '../photos.js';
import { Placeholder } from './Line.jsx';

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

export function Status({ bean }) {
  const f = freshness(bean);
  return (
    <span className="status">
      <i className={`dot dot-${f.key}`} />
      {f.label}
    </span>
  );
}

export function Cover({ bean }) {
  const url = usePhoto(bean.id, Boolean(bean.hasPhoto));
  return url ? <img className="cover-img" src={url} alt={`${bean.name} 豆袋照片`} /> : <Placeholder bean={bean} />;
}

export default function BeanTile({ bean, doses, onOpen, onUse }) {
  const f = freshness(bean);
  const method = bean.usage === '意式' ? '意式' : '手冲';
  const meta = [bean.country, bean.process].filter(Boolean).join(' · ');

  return (
    <article className={`tile ${bean.finished ? 'is-finished' : ''}`}>
      <button className="tile-cover" onClick={onOpen} aria-label={`查看 ${bean.name}`}>
        <Cover bean={bean} />
      </button>
      <div className="tile-body">
        {bean.roaster && <p className="eyebrow">{bean.roaster}</p>}
        <button className="tile-title" onClick={onOpen}>{bean.name}</button>
        {meta && <p className="muted">{meta}</p>}
        {bean.flavors?.length > 0 && <p className="muted">{bean.flavors.slice(0, 3).join(' / ')}</p>}
        <p className="tile-meta">
          {bean.finished ? (
            bean.rating > 0 ? <Stars value={bean.rating} /> : '已喝完'
          ) : (
            <>
              {bean.remaining}g{f.d != null && <span className="muted"> · 第 {f.d} 天</span>}
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
