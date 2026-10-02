import { useEffect, useState } from 'react';
import { SAMPLE_BEANS } from './data.js';
import { uid, useBeans } from './store.js';
import Inventory from './components/Inventory.jsx';
import Collection from './components/Collection.jsx';
import BeanForm from './components/BeanForm.jsx';
import BeanDetail from './components/BeanDetail.jsx';
import { IconClose, IconPlus, IconSearch, Logo } from './components/Art.jsx';

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
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');

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
        finished: b.remaining === 0,
        photo: '',
        log: [],
      })),
    );
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <button className="logo-btn" onClick={() => setTab('vault')} aria-label="回到豆仓">
            <Logo />
          </button>
          <nav className="nav">
            <button className={tab === 'vault' ? 'on' : ''} onClick={() => setTab('vault')}>豆仓</button>
            <button className={tab === 'dex' ? 'on' : ''} onClick={() => setTab('dex')}>图鉴</button>
          </nav>
          <div className="header-icons">
            {tab === 'vault' && beans.length > 0 && (
              <button className="icon-btn" onClick={() => setSearching((v) => !v)} aria-label="搜索"><IconSearch /></button>
            )}
            <button className="icon-btn" onClick={() => setSheet({ mode: 'add' })} aria-label="添加豆子"><IconPlus /></button>
          </div>
        </div>
        {searching && tab === 'vault' && (
          <div className="search-bar">
            <input
              autoFocus
              type="search"
              placeholder="搜索名称、产地、品种、风味…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="icon-btn" onClick={() => { setSearching(false); setQ(''); }} aria-label="关闭搜索"><IconClose /></button>
          </div>
        )}
      </header>

      {saveError && <div className="alert">{saveError}</div>}

      <main className="page">
        {tab === 'vault' ? (
          <Inventory
            beans={beans}
            doses={doses}
            q={q}
            onOpen={(id) => setSheet({ mode: 'view', id })}
            onUse={handleUse}
            onAdd={() => setSheet({ mode: 'add' })}
            onSample={loadSamples}
          />
        ) : (
          <Collection beans={beans} setBeans={setBeans} doses={doses} setDoses={setDoses} />
        )}
      </main>

      <footer className="site-footer">豆仓 Bean Vault · 数据保存在本机</footer>

      {toast && <div className="toast">{toast}</div>}

      {sheet && (
        <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && setSheet(null)}>
          <div className={`sheet sheet-${sheet.mode}`} role="dialog" aria-modal="true">
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
                doses={doses}
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
