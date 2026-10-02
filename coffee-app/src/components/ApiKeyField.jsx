import { useState } from 'react';
import { getApiKey, setApiKey } from '../extract.js';

export default function ApiKeyField({ onSaved }) {
  const [value, setValue] = useState(getApiKey);
  const [saved, setSaved] = useState(false);
  const save = () => {
    setApiKey(value);
    setSaved(true);
    onSaved?.(value.trim());
    setTimeout(() => setSaved(false), 1600);
  };
  return (
    <div className="field">
      <span>Anthropic API Key</span>
      <div className="row gap-s">
        <input
          type="password"
          autoComplete="off"
          placeholder="sk-ant-…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="button" className="btn" onClick={save}>{saved ? '已保存' : '保存'}</button>
      </div>
      <p className="muted small">Key 只存在这台设备上，每次识别约 2～4 毛钱。</p>
    </div>
  );
}
