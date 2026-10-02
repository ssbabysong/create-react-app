import { useState } from 'react';
import {
  CONTINENTS, ORIGINS, BLEND, PROCESSES, VARIETIES, ROASTS, USAGES, FLAVORS,
} from '../data.js';
import { compressImage, today, uid } from '../store.js';
import { Stars, bagColor } from './BeanCard.jsx';
import { BeanBag } from './Illustrations.jsx';

const EMPTY = {
  name: '', roaster: '', country: '', region: '', farm: '', variety: '', process: '',
  roast: '浅', usage: '手冲', roastDate: today(), weight: 200, remaining: 200, price: '',
  flavors: [], rating: 0, comment: '', photo: '', finished: false, log: [],
};

function Chips({ options, value, onChange, multi }) {
  const isOn = (o) => (multi ? value.includes(o) : value === o);
  const toggle = (o) => {
    if (multi) onChange(isOn(o) ? value.filter((v) => v !== o) : [...value, o]);
    else onChange(isOn(o) ? '' : o);
  };
  return (
    <div className="chips">
      {options.map((o) => (
        <button type="button" key={o} className={`chip ${isOn(o) ? 'on' : ''}`} onClick={() => toggle(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

export default function BeanForm({ initial, onSave, onCancel }) {
  const [b, setB] = useState(() => ({ ...EMPTY, ...initial }));
  const [customFlavor, setCustomFlavor] = useState('');
  const isEdit = Boolean(initial?.id);
  const set = (k) => (v) => setB((prev) => ({ ...prev, [k]: v?.target ? v.target.value : v }));

  const knownCountry = !b.country || b.country === BLEND || ORIGINS.some((o) => o.name === b.country);
  const [otherCountry, setOtherCountry] = useState(!knownCountry);

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (file) set('photo')(await compressImage(file));
  };

  const addFlavor = () => {
    const f = customFlavor.trim();
    if (f && !b.flavors.includes(f)) set('flavors')([...b.flavors, f]);
    setCustomFlavor('');
  };

  const submit = (e) => {
    e.preventDefault();
    const weight = Number(b.weight) || 0;
    const remaining = isEdit ? Math.min(Number(b.remaining) || 0, weight) : weight;
    onSave({
      ...b,
      id: b.id || uid(),
      createdAt: b.createdAt || new Date().toISOString(),
      weight,
      remaining,
      price: b.price === '' ? '' : Number(b.price),
      finished: remaining === 0,
    });
  };

  return (
    <form className="form" onSubmit={submit}>
      <header className="sheet-head">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>取消</button>
        <h2>{isEdit ? '编辑豆子' : '新豆入仓'}</h2>
        <button type="submit" className="btn btn-primary" disabled={!b.name.trim()}>保存</button>
      </header>

      <label className="photo-pick">
        {b.photo ? (
          <img src={b.photo} alt="豆袋照片" />
        ) : (
          <>
            <BeanBag color={bagColor(b)} />
            <span>拍一张豆袋（可选）</span>
          </>
        )}
        <input type="file" accept="image/*" onChange={onPhoto} hidden />
      </label>
      {b.photo && (
        <button type="button" className="btn btn-ghost small" onClick={() => set('photo')('')}>移除照片</button>
      )}

      <div className="field">
        <span>名称 *</span>
        <input value={b.name} onChange={set('name')} placeholder="如：耶加雪菲 孔加 G1" required />
      </div>
      <div className="grid-2">
        <div className="field">
          <span>烘焙商</span>
          <input value={b.roaster} onChange={set('roaster')} placeholder="烘焙商 / 店铺" />
        </div>
        <div className="field">
          <span>产地</span>
          <select
            value={otherCountry ? '__other' : b.country}
            onChange={(e) => {
              const v = e.target.value;
              setOtherCountry(v === '__other');
              set('country')(v === '__other' ? '' : v);
            }}
          >
            <option value="">未知</option>
            {CONTINENTS.map((ct) => (
              <optgroup key={ct} label={ct}>
                {ORIGINS.filter((o) => o.continent === ct).map((o) => (
                  <option key={o.name} value={o.name}>{o.flag} {o.name}</option>
                ))}
              </optgroup>
            ))}
            <option value={BLEND}>🫘 拼配</option>
            <option value="__other">其他…</option>
          </select>
        </div>
      </div>
      {otherCountry && (
        <div className="field">
          <span>其他产地</span>
          <input value={b.country} onChange={set('country')} placeholder="输入国家/地区" />
        </div>
      )}
      <div className="grid-2">
        <div className="field">
          <span>产区</span>
          <input value={b.region} onChange={set('region')} placeholder="如：耶加雪菲" />
        </div>
        <div className="field">
          <span>庄园 / 处理站</span>
          <input value={b.farm} onChange={set('farm')} />
        </div>
      </div>
      <div className="field">
        <span>品种</span>
        <input value={b.variety} onChange={set('variety')} list="varieties" placeholder="如：瑰夏" />
        <datalist id="varieties">
          {VARIETIES.map((v) => <option key={v} value={v} />)}
        </datalist>
      </div>

      <div className="field">
        <span>处理法</span>
        <Chips options={PROCESSES} value={b.process} onChange={set('process')} />
      </div>
      <div className="field">
        <span>烘焙度</span>
        <Chips options={ROASTS} value={b.roast} onChange={set('roast')} />
      </div>
      <div className="field">
        <span>用途</span>
        <Chips options={USAGES} value={b.usage} onChange={(v) => set('usage')(v || '手冲')} />
      </div>

      <div className="grid-3">
        <div className="field">
          <span>烘焙日期</span>
          <input type="date" value={b.roastDate} onChange={set('roastDate')} max={today()} />
        </div>
        <div className="field">
          <span>净重 g</span>
          <input type="number" inputMode="decimal" min="0" value={b.weight} onChange={set('weight')} />
        </div>
        <div className="field">
          <span>价格 ¥</span>
          <input type="number" inputMode="decimal" min="0" value={b.price} onChange={set('price')} />
        </div>
      </div>
      {isEdit && (
        <div className="field">
          <span>剩余 g</span>
          <input type="number" inputMode="decimal" min="0" value={b.remaining} onChange={set('remaining')} />
        </div>
      )}

      <div className="field">
        <span>风味</span>
        <Chips options={[...new Set([...FLAVORS, ...b.flavors])]} value={b.flavors} onChange={set('flavors')} multi />
        <div className="row gap-s">
          <input
            value={customFlavor}
            onChange={(e) => setCustomFlavor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
            placeholder="自定义风味，如：荔枝"
          />
          <button type="button" className="btn btn-soft" onClick={addFlavor}>添加</button>
        </div>
      </div>

      <div className="field">
        <span>评分</span>
        <Stars value={b.rating} onChange={set('rating')} size="lg" />
      </div>
      <div className="field">
        <span>笔记</span>
        <textarea rows="3" value={b.comment} onChange={set('comment')} placeholder="冲煮参数、口感印象…" />
      </div>
    </form>
  );
}
