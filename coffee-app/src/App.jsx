import { useEffect, useState } from 'react';
import { SAMPLE_BEANS } from './data.js';
import { uid, useBeans } from './store.js';
import Inventory from './components/Inventory.jsx';
import Collection from './components/Collection.jsx';
import BeanForm from './components/BeanForm.jsx';
import BeanDetail from './components/BeanDetail.jsx';

const PREFS_KEY = 'bean-vault:doses';
const DEFAULT_DOSES = { 手冲: 15, 意式: 18 };

function loadDoses() {
  try {
    return { ...DEFAULT_DOSES, ...JSON.parse(localStorage.getItem(PREFS_KEY)) };
  } catch {
    return DEFAULT_DOSES;
  }
}

export default function App() {
  const { beans, setBeans, upsert, remove, use, saveError } = useBeans();
  const [tab, setTab] = useState('vault');
  // sheet: null | { mode: 'add' } | { mode: 'edit', id } | { mode: 'view', id }
  const [sheet, setSheet] = useState(null);
  const [doses, setDoses] = useState(loadDoses);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(doses));
    } catch {
      /* 忽略 */
    }
  }, [doses]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = sheet ? 'hidden' : '';
  }, [sheet]);

  const current = sheet?.id && beans.find((b) => b.id === sheet.id);

  const handleUse = (id, grams, method) => {
    const bean = beans.find((b) => b.id === id);
    if (!bean || grams <= 0) return;
    use(id, grams, method);
    const left = Math.max(0, bean.remaining - grams);
    setToast(left === 0 ? `「${bean.name}」喝完啦 🎉` : `${method} −${grams}g · 还剩 ${+left.toFixed(1)}g`);
  };

  const loadSamples = () => {
    const now = Date.now();
    setBeans(
      SAMPLE_BEANS.map(({ daysAgo, ...b }, i) => ({
        ...b,
        id: uid(),
        roastDate: new Date(now - daysAgo * 864e5).toISOString().slice(0, 10),
        createdAt: new Date(now - i * 1000).toISOString(),
        finished: false,
        photo: '',
        log: [],
      })),
    );
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>
          <span className="logo">🫘</span> {tab === 'vault' ? '豆仓' : '图鉴'}
        </h1>
        {tab === 'vault' && (
          <button className="btn btn-primary" onClick={() => setSheet({ mode: 'add' })}>＋ 入仓</button>
        )}
      </header>

      {saveError && <div className="alert">{saveError}</div>}

      <main>
        {tab === 'vault' ? (
          <Inventory
            beans={beans}
            doses={doses}
            onOpen={(id) => setSheet({ mode: 'view', id })}
            onUse={handleUse}
            onAdd={() => setSheet({ mode: 'add' })}
            onSample={loadSamples}
          />
        ) : (
          <Collection beans={beans} setBeans={setBeans} doses={doses} setDoses={setDoses} />
        )}
      </main>

      <nav className="tabbar">
        <button className={tab === 'vault' ? 'on' : ''} onClick={() => setTab('vault')}>
          <span>📦</span>豆仓
        </button>
        <button className={tab === 'dex' ? 'on' : ''} onClick={() => setTab('dex')}>
          <span>🗺️</span>图鉴
        </button>
      </nav>

      {toast && <div className="toast">{toast}</div>}

      {sheet && (
        <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && setSheet(null)}>
          <div className="sheet" role="dialog" aria-modal="true">
            {sheet.mode === 'add' && (
              <BeanForm
                onCancel={() => setSheet(null)}
                onSave={(b) => {
                  upsert(b);
                  setSheet(null);
                  setToast(`「${b.name}」已入仓`);
                }}
              />
            )}
            {sheet.mode === 'edit' && current && (
              <BeanForm
                initial={current}
                onCancel={() => setSheet({ mode: 'view', id: current.id })}
                onSave={(b) => {
                  upsert(b);
                  setSheet({ mode: 'view', id: b.id });
                }}
              />
            )}
            {sheet.mode === 'view' && current && (
              <BeanDetail
                bean={current}
                onClose={() => setSheet(null)}
                onEdit={() => setSheet({ mode: 'edit', id: current.id })}
                onDelete={(id) => {
                  remove(id);
                  setSheet(null);
                }}
                onUse={handleUse}
                onSave={(b) => {
                  upsert(b);
                  setSheet({ mode: 'view', id: b.id });
                  if (b.id !== current.id) setToast('已回购，新的一包已入仓');
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
