import { useRef, useState } from 'react';
import {
  ACHIEVEMENTS, BLEND, CONTINENTS, FLAVORS, ORIGINS, PROCESSES, VARIETIES,
} from '../data.js';
import { downloadJSON, today } from '../store.js';
import { getPhoto, putPhoto } from '../photos.js';
import ApiKeyField from './ApiKeyField.jsx';

function countBy(beans, key) {
  const m = new Map();
  beans.forEach((b) => {
    const vals = Array.isArray(b[key]) ? b[key] : [b[key]];
    vals.filter(Boolean).forEach((v) => m.set(v, (m.get(v) || 0) + 1));
  });
  return m;
}

function Section({ title, sub, children }) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      {sub && <p className="section-sub">{sub}</p>}
      {children}
    </section>
  );
}

function Dex({ title, items, counts }) {
  // 字典外的条目（自定义品种/风味）也展示出来
  const all = [...items, ...[...counts.keys()].filter((k) => !items.includes(k))];
  const have = all.filter((i) => counts.has(i)).length;
  return (
    <Section title={title} sub={`已收集 ${have} / ${all.length}`}>
      <div className="pills">
        {all.map((i) => (
          <span key={i} className={`pill ${counts.has(i) ? 'on' : 'locked'}`}>
            {i}
            {counts.get(i) > 1 && <em>×{counts.get(i)}</em>}
          </span>
        ))}
      </div>
    </Section>
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

  const exportAll = async () => {
    const photos = {};
    for (const b of beans.filter((x) => x.hasPhoto)) photos[b.id] = await getPhoto(b.id);
    downloadJSON({ beans, doses, photos }, `豆仓备份-${today()}.json`);
  };

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
        if (data.photos) await Promise.all(Object.entries(data.photos).map(([id, url]) => putPhoto(id, url)));
        setMsg(`已导入 ${list.length} 支豆子`);
      }
    } catch {
      setMsg('文件格式不正确');
    }
  };

  return (
    <>
      <section className="intro">
        <h1 className="headline">咖啡图鉴</h1>
        <p className="muted">每收藏一支豆子，就点亮一个产地、处理法和风味</p>
      </section>

      <div className="stats">
        <div><b>{beans.length}</b><span>累计收藏</span></div>
        <div><b>{knownCountries}</b><span>产地</span></div>
        <div><b>{(grams / 1000).toFixed(1)}<small>kg</small></b><span>已喝掉</span></div>
        <div><b><small>¥</small>{Math.round(spent)}</b><span>投入</span></div>
      </div>

      <Section title="产地" sub={`已点亮 ${knownCountries} / ${ORIGINS.length}${countries.has(BLEND) ? `，另有 ${countries.get(BLEND)} 支拼配` : ''}`}>
        {CONTINENTS.map((ct) => (
          <div key={ct}>
            <h3 className="sub-title">{ct}</h3>
            <div className="origin-grid">
              {ORIGINS.filter((o) => o.continent === ct).map((o) => {
                const n = countries.get(o.name) || 0;
                return (
                  <span key={o.name} className={`origin-cell ${n ? 'on' : 'locked'}`}>
                    {o.name}
                    {n > 0 && <sup>{n}</sup>}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </Section>

      <Dex title="处理法" items={PROCESSES} counts={countBy(beans, 'process')} />
      <Dex title="品种" items={VARIETIES} counts={countBy(beans, 'variety')} />
      <Dex title="风味" items={FLAVORS} counts={countBy(beans, 'flavors')} />

      <Section title="成就" sub={`已解锁 ${unlocked.length} / ${ACHIEVEMENTS.length}`}>
        <ol className="ach-list">
          {ACHIEVEMENTS.map((a, i) => {
            const on = unlocked.includes(a);
            return (
              <li key={a.id} className={on ? 'on' : 'locked'}>
                <span className="ach-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="ach-text">
                  <b>{a.title}</b>
                  <span className="muted">{a.desc}</span>
                </span>
                <span className="ach-state">{on ? '已解锁' : '未解锁'}</span>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section title="设置与备份" sub="数据只保存在这台设备的浏览器里，换手机或清缓存前记得导出备份（含照片）">
        <div className="narrow"><ApiKeyField /></div>
        <div className="grid-2 narrow">
          {Object.keys(doses).map((m) => (
            <label key={m} className="field">
              <span>{m}默认粉量（g）</span>
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
        <div className="actions left">
          <button className="btn" onClick={exportAll}>导出备份</button>
          <button className="btn" onClick={() => fileRef.current.click()}>导入备份</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importFile} />
        </div>
        {msg && <p className="small">{msg}</p>}
      </Section>
    </>
  );
}
