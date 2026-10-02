import { useEffect, useRef, useState } from 'react';
import {
  CONTINENTS, ORIGINS, BLEND, PROCESSES, VARIETIES, ROASTS, USAGES, FLAVORS,
} from '../data.js';
import { today, uid } from '../store.js';
import { getPhoto, resizeImage } from '../photos.js';
import { extractBean, getApiKey } from '../extract.js';
import { Stars } from './BeanCard.jsx';
import { IconCamera } from './Line.jsx';
import ApiKeyField from './ApiKeyField.jsx';
import BeanArt from './Art.jsx';

const EMPTY = {
  name: '', roaster: '', country: '', region: '', farm: '', variety: '', process: '',
  roast: '浅', usage: '手冲', roastDate: today(), weight: 200, remaining: 200, price: '',
  flavors: [], rating: 0, comment: '', finished: false, log: [],
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

const isKnownCountry = (c) => !c || c === BLEND || ORIGINS.some((o) => o.name === c);

export default function BeanForm({ initial, onSave, onCancel }) {
  const [b, setB] = useState(() => ({ ...EMPTY, ...initial, id: initial?.id || uid() }));
  const [customFlavor, setCustomFlavor] = useState('');
  const isEdit = Boolean(initial?.id);
  const touched = useRef(new Set());
  const latest = useRef(b);
  latest.current = b;
  const set = (k) => (v) => {
    touched.current.add(k);
    setB((prev) => ({ ...prev, [k]: v?.target ? v.target.value : v }));
  };

  const [otherCountry, setOtherCountry] = useState(!isKnownCountry(b.country));

  // 封面照片（dataURL）；photoChanged 标记本次是否改过
  const [photo, setPhoto] = useState('');
  const [photoChanged, setPhotoChanged] = useState(false);
  const [shots, setShots] = useState([]); // 发给识别的照片
  const [scan, setScan] = useState({ state: 'idle', msg: '' });
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(() => Boolean(getApiKey()));

  useEffect(() => {
    if (initial?.hasPhoto) getPhoto(initial.id).then((u) => setPhoto((p) => p || u));
  }, [initial]);

  const runScan = async (images) => {
    setScan({ state: 'loading', msg: '识别中…' });
    try {
      const data = await extractBean(images);
      const prev = latest.current;
      const next = { ...prev };
      let count = 0;
      const fill = (k, v) => {
        if (touched.current.has(k) || v === '' || v == null || v === 0) return;
        next[k] = v;
        count += 1;
      };
      ['name', 'roaster', 'country', 'region', 'farm', 'variety', 'process', 'roast', 'usage', 'roastDate'].forEach((k) => fill(k, data[k]));
      if (data.weight > 0) fill('weight', data.weight);
      if (data.price > 0) fill('price', data.price);
      if (data.notes && !prev.comment) fill('comment', data.notes);
      if (!touched.current.has('flavors') && data.flavors?.length) {
        next.flavors = [...new Set([...prev.flavors, ...data.flavors])];
        count += 1;
      }
      setB(next);
      if (data.country) setOtherCountry(!isKnownCountry(data.country));
      setScan({ state: 'done', msg: count ? `识别出 ${count} 项，核对一下` : '没读到信息' });
    } catch (err) {
      setScan({ state: 'error', msg: err.message });
    }
  };

  const onPhotos = async (e) => {
    const files = [...(e.target.files || [])].slice(0, 3);
    e.target.value = '';
    if (!files.length) return;
    try {
      setPhoto(await resizeImage(files[0], 1080));
      setPhotoChanged(true);
      const images = await Promise.all(files.map((f) => resizeImage(f, 1568, 0.85)));
      setShots(images);
      if (hasKey) runScan(images);
    } catch (err) {
      setScan({ state: 'error', msg: err.message });
    }
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
    // 第二个参数：照片没改动时为 undefined，移除时为 ''，新照片为 dataURL
    onSave(
      {
        ...b,
        createdAt: b.createdAt || new Date().toISOString(),
        weight,
        remaining,
        price: b.price === '' ? '' : Number(b.price),
        finished: remaining === 0,
      },
      photoChanged ? photo : undefined,
    );
  };

  return (
    <form className="form" onSubmit={submit}>
      <header className="sheet-head">
        <button type="button" className="link" onClick={onCancel}>取消</button>
        <h2>{isEdit ? '编辑' : '入仓'}</h2>
        <button type="submit" className="btn btn-primary" disabled={!b.name.trim()}>保存</button>
      </header>

      <div className="capture">
        <div className="capture-art"><BeanArt bean={b} /></div>
        <div className="capture-side">
          <label className="btn btn-primary">
            <IconCamera /> {photo ? '重拍' : '拍豆袋'}
            <input type="file" accept="image/*" multiple hidden onChange={onPhotos} />
          </label>
          {photo && (
            <div className="row gap-s">
              <img className="capture-thumb" src={photo} alt="豆袋照片" />
              {hasKey && shots.length > 0 && scan.state !== 'loading' && (
                <button type="button" className="link" onClick={() => runScan(shots)}>重新识别</button>
              )}
              <button type="button" className="link" onClick={() => { setPhoto(''); setPhotoChanged(true); setShots([]); }}>移除</button>
            </div>
          )}
          {scan.msg && <p className={`scan scan-${scan.state}`}>{scan.msg}</p>}
          {!hasKey && !showKey && (
            <button type="button" className="link" onClick={() => setShowKey(true)}>开启自动识别</button>
          )}
        </div>
      </div>

      {showKey && (
        <ApiKeyField
          onSaved={(key) => {
            setHasKey(Boolean(key));
            if (key) {
              setShowKey(false);
              if (shots.length) runScan(shots);
            }
          }}
        />
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
                  <option key={o.name} value={o.name}>{o.name}</option>
                ))}
              </optgroup>
            ))}
            <option value={BLEND}>拼配</option>
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
          <button type="button" className="btn" onClick={addFlavor}>添加</button>
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
