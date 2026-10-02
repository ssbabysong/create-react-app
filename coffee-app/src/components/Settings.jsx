import { useRef, useState } from 'react';
import { downloadJSON, today } from '../store.js';
import { getPhoto, putPhoto } from '../photos.js';
import ApiKeyField from './ApiKeyField.jsx';
import { IconClose } from './Line.jsx';

export default function Settings({ beans, setBeans, doses, setDoses, onClose }) {
  const fileRef = useRef();
  const [msg, setMsg] = useState('');

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
      if (confirm(`导入 ${list.length} 支豆子？`)) {
        setBeans((cur) => {
          const ids = new Set(list.map((b) => b.id));
          return [...list, ...cur.filter((b) => !ids.has(b.id))];
        });
        if (data.doses) setDoses(data.doses);
        if (data.photos) await Promise.all(Object.entries(data.photos).map(([id, url]) => putPhoto(id, url)));
        setMsg(`已导入 ${list.length} 支`);
      }
    } catch {
      setMsg('文件格式不对');
    }
  };

  return (
    <div className="form">
      <header className="sheet-head">
        <h2>设置</h2>
        <button className="icon-btn" onClick={onClose} aria-label="关闭"><IconClose /></button>
      </header>
      <div className="grid-2">
        {Object.keys(doses).map((m) => (
          <label key={m} className="field">
            <span>{m}粉量 g</span>
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
      <ApiKeyField />
      <div className="row gap wrap">
        <button className="btn" onClick={exportAll}>导出备份</button>
        <button className="btn" onClick={() => fileRef.current.click()}>导入备份</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importFile} />
      </div>
      {msg && <p className="small">{msg}</p>}
      <p className="muted small">数据只存在这台设备上。</p>
    </div>
  );
}
