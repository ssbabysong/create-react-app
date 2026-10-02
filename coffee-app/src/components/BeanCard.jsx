import { freshness } from '../store.js';
import BeanArt from './Art.jsx';
import { IconCup, IconDrip } from './Line.jsx';

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

export default function BeanTile({ bean, doses, onOpen, onUse }) {
  const f = freshness(bean);
  const method = bean.usage === '意式' ? '意式' : '手冲';

  return (
    <article className={`tile ${bean.finished ? 'is-finished' : ''}`}>
      <div className="tile-art">
        <button className="tile-open" onClick={onOpen} aria-label={`查看 ${bean.name}`}>
          <BeanArt bean={bean} />
        </button>
        {!bean.finished && (
          <button
            className="quick"
            onClick={() => onUse(bean.id, doses[method], method)}
            aria-label={`${method}一杯，扣 ${doses[method]} 克`}
            title={`冲一杯 −${doses[method]}g`}
          >
            {method === '意式' ? <IconCup /> : <IconDrip />}
          </button>
        )}
      </div>
      <button className="tile-title" onClick={onOpen}>{bean.name}</button>
      <p className="tile-meta">
        <i className={`dot dot-${f.key}`} />
        {bean.finished ? (bean.rating > 0 ? <Stars value={bean.rating} /> : '喝完了') : `${bean.remaining}g`}
      </p>
    </article>
  );
}
