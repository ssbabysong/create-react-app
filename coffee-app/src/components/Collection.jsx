import { useRef, useState } from 'react';
import {
  ACHIEVEMENTS, BLEND, CONTINENTS, FLAVORS, ORIGINS, PROCESSES, VARIETIES,
} from '../data.js';
import { downloadJSON, today } from '../store.js';

function countBy(beans, key) {
  const m = new Map();
  beans.forEach((b) => {
    const vals = Array.isArray(b[key]) ? b[key] : [b[key]];
    vals.filter(Boolean).forEach((v) => m.set(v, (m.get(v) || 0) + 1));
  });
  return m;
}

function Progress({ have, total }) {
  return (
    <span className="dex-progress">
      <span className="dex-bar"><span style={{ width: `${(have / total) * 100}%` }} /></span>
      {have}/{total}
    </span>
  );
}

function Dex({ title, items, counts }) {
  // 字典外的条目（自定义品种/风味）也展示出来
  const extras = [...counts.keys()].filter((k) => !items.includes(k));
  const all = [...items, ...extras];
  const have = all.filter((i) => counts.has(i)).length;
  return (
    <section className="card">
      <div className="row between">
        <h3>{title}</h3>
        <Progress have={have} total={all.length} />
      </div>
      <div className="chips">
        {all.map((i) => (
          <span key={i} className={`chip static ${counts.has(i) ? 'on' : 'locked'}`}>
            {i}
            {counts.get(i) > 1 && <em>×{counts.get(i)}</em>}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function Collection({ beans, setBeans, doses, setDoses }) {
  const fileRef = useRef();
  const [msg, setMsg] = useState('');
  const countries = countBy(beans, 'country');
  const spent = beans.reduce((s, b) => s + (Number(b.price) || 0), 0);
  const grams = beans.reduce((s, b) => s + (Number(b.weight) - Number(b.remaining) || 0), 0);
  const unlocked = ACHIEVEMENTS.filter((a) => a.test(beans));
  const knownCountries = ORIGINS.filter((o) => countries.has(o.name)).length;

  const importFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const list = Array.isArray(data) ? data : data.beans;
      if (!Array.isArray(list)) throw new Error();
      if (confirm(`导入 ${list.length} 支豆子？将与现有数据合并（同 ID 覆盖）。`)) {
        setBeans((cur) => {
          const ids = new Set(list.map((b) => b.id));
          return [...list, ...cur.filter((b) => !ids.has(b.id))];
        });
        if (data.doses) setDoses(data.doses);
        setMsg(`已导入 ${list.length} 支豆子`);
      }
    } catch {
      setMsg('文件格式不正确');
    }
  };

  return (
    <>
      <section className="stats card">
        <div><b>{beans.length}</b><span>累计收藏</span></div>
        <div><b>{knownCountries}</b><span>产地</span></div>
        <div><b>{(grams / 1000).toFixed(1)}<small>kg</small></b><span>已喝掉</span></div>
        <div><b><small>¥</small>{Math.round(spent)}</b><span>投入</span></div>
      </section>

      <section className="card">
        <div className="row between">
          <h3>🌍 产地图鉴</h3>
          <Progress have={knownCountries} total={ORIGINS.length} />
        </div>
        {CONTINENTS.map((ct) => (
          <div key={ct} className="continent">
            <h4>{ct}</h4>
            <div className="origin-grid">
              {ORIGINS.filter((o) => o.continent === ct).map((o) => {
                const n = countries.get(o.name) || 0;
                return (
                  <div key={o.name} className={`origin-cell ${n ? 'on' : 'locked'}`} title={o.name}>
                    <span className="flag">{o.flag}</span>
                    <span className="name">{o.name}</span>
                    {n > 0 && <em>{n}</em>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {countries.has(BLEND) && <p className="muted small">另有 {countries.get(BLEND)} 支拼配豆 🫘</p>}
      </section>

      <Dex title="🧪 处理法" items={PROCESSES} counts={countBy(beans, 'process')} />
      <Dex title="🌱 品种" items={VARIETIES} counts={countBy(beans, 'variety')} />
      <Dex title="👅 风味" items={FLAVORS} counts={countBy(beans, 'flavors')} />

      <section className="card">
        <div className="row between">
          <h3>🏅 成就</h3>
          <Progress have={unlocked.length} total={ACHIEVEMENTS.length} />
        </div>
        <div className="badges">
          {ACHIEVEMENTS.map((a) => {
            const on = unlocked.includes(a);
            return (
              <div key={a.id} className={`badge ${on ? 'on' : 'locked'}`}>
                <span className="badge-icon">{on ? a.icon : '🔒'}</span>
                <b>{a.title}</b>
                <span className="small muted">{a.desc}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h3>⚙️ 设置与备份</h3>
        <div className="grid-2">
          {Object.keys(doses).map((m) => (
            <label key={m} className="field">
              <span>{m}默认粉量 g</span>
              <input
                type="number"
                inputMode="decimal"
                min="1"
                value={doses[m]}
                onChange={(e) => setDoses({ ...doses, [m]: Number(e.target.value) || 1 })}
              />
            </label>
          ))}
        </div>
        <p className="muted small">数据只保存在这台设备的浏览器里，换手机或清缓存前记得导出备份。</p>
        <div className="row gap-s wrap">
          <button className="btn btn-soft" onClick={() => downloadJSON({ beans, doses }, `豆仓备份-${today()}.json`)}>
            ⬇️ 导出备份
          </button>
          <button className="btn btn-soft" onClick={() => fileRef.current.click()}>⬆️ 导入备份</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importFile} />
        </div>
        {msg && <p className="small">{msg}</p>}
      </section>
    </>
  );
}
