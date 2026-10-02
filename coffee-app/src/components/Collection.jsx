import { ACHIEVEMENTS, CONTINENTS, FLAVORS, ORIGINS, PROCESSES } from '../data.js';
import { motifsFor, PALETTES, Sticker } from './Art.jsx';
import { IconGear } from './Line.jsx';

const CONTINENT_COLOR = { 非洲: '#f4a28c', 中南美洲: '#8fc4a8', 亚洲及太平洋: '#8fb3dc' };
const ACH_MOTIF = {
  first: 'bean', ten: 'caramel', thirty: 'choc', geisha: 'flower', africa: 'peach', continents: 'citrus',
  process: 'grape', anaerobic: 'cherry', countries: 'tropical', espresso: 'milk', finish: 'honey', five: 'star',
};

function countBy(beans, key) {
  const m = new Map();
  beans.forEach((b) => {
    const vals = Array.isArray(b[key]) ? b[key] : [b[key]];
    vals.filter(Boolean).forEach((v) => m.set(v, (m.get(v) || 0) + 1));
  });
  return m;
}

export default function Collection({ beans, onSettings }) {
  const countries = countBy(beans, 'country');
  const processes = countBy(beans, 'process');
  const flavors = countBy(beans, 'flavors');
  const grams = beans.reduce((s, b) => s + (Number(b.weight) - Number(b.remaining) || 0), 0);
  const unlocked = new Set(ACHIEVEMENTS.filter((a) => a.test(beans)).map((a) => a.id));
  const known = ORIGINS.filter((o) => countries.has(o.name)).length;
  const flavorList = [...FLAVORS, ...[...flavors.keys()].filter((k) => !FLAVORS.includes(k))];

  return (
    <>
      <div className="dex-top">
        <div className="stats">
          <div><b>{beans.length}</b><span>支</span></div>
          <div><b>{known}</b><span>产地</span></div>
          <div><b>{(grams / 1000).toFixed(1)}</b><span>kg</span></div>
        </div>
        <button className="icon-btn" onClick={onSettings} aria-label="设置"><IconGear /></button>
      </div>

      <section className="section">
        <h2 className="section-title">产地 <span>{known}/{ORIGINS.length}</span></h2>
        {CONTINENTS.map((ct) => (
          <div key={ct} className="origin-grid">
            {ORIGINS.filter((o) => o.continent === ct).map((o) => {
              const n = countries.get(o.name) || 0;
              return (
                <div key={o.name} className={`origin ${n ? 'on' : ''}`} title={o.name}>
                  <span className="origin-dot" style={n ? { background: CONTINENT_COLOR[ct] } : undefined}>
                    {n > 1 ? n : ''}
                  </span>
                  <span className="origin-name">{o.name}</span>
                </div>
              );
            })}
          </div>
        ))}
      </section>

      <section className="section">
        <h2 className="section-title">风味 <span>{flavorList.filter((f) => flavors.has(f)).length}/{flavorList.length}</span></h2>
        <div className="sticker-grid">
          {flavorList.map((f, i) => (
            <div key={f} className={`sticker-cell ${flavors.has(f) ? 'on' : ''}`} title={f}>
              <Sticker motif={motifsFor([f])[0] || 'bean'} color={PALETTES[i % PALETTES.length].bg} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">处理法 <span>{PROCESSES.filter((p) => processes.has(p)).length}/{PROCESSES.length}</span></h2>
        <div className="pills">
          {PROCESSES.map((p) => <span key={p} className={`pill ${processes.has(p) ? 'on' : 'off'}`}>{p}</span>)}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">成就 <span>{unlocked.size}/{ACHIEVEMENTS.length}</span></h2>
        <div className="sticker-grid">
          {ACHIEVEMENTS.map((a, i) => (
            <div key={a.id} className={`sticker-cell ${unlocked.has(a.id) ? 'on' : ''}`} title={a.desc}>
              <Sticker motif={ACH_MOTIF[a.id] || 'star'} color={PALETTES[(i + 3) % PALETTES.length].sun} />
              <span>{a.title}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
