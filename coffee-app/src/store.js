import { useEffect, useState } from 'react';
import { FRESHNESS } from './data.js';
import { deletePhoto, putPhoto } from './photos.js';

const KEY = 'bean-vault:v1';
const DAY = 24 * 60 * 60 * 1000;

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const today = () => new Date().toISOString().slice(0, 10);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useBeans() {
  const [beans, setBeans] = useState(load);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(beans));
      setSaveError('');
    } catch {
      setSaveError('本地存储已满，请导出备份后清理一些已喝完的豆子。');
    }
  }, [beans]);

  const upsert = (bean) =>
    setBeans((list) =>
      list.some((b) => b.id === bean.id)
        ? list.map((b) => (b.id === bean.id ? bean : b))
        : [bean, ...list],
    );

  // 旧版本把照片存在豆子数据里，挪到 IndexedDB
  useEffect(() => {
    const legacy = beans.filter((b) => b.photo);
    if (!legacy.length) return;
    Promise.all(legacy.map((b) => putPhoto(b.id, b.photo))).then(() =>
      setBeans((list) => list.map(({ photo, ...b }) => (photo ? { ...b, hasPhoto: true } : b))),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = (id) => {
    deletePhoto(id);
    setBeans((list) => list.filter((b) => b.id !== id));
  };

  // 称出一份豆子：扣减余量并记录
  const use = (id, grams, method) =>
    setBeans((list) =>
      list.map((b) => {
        if (b.id !== id) return b;
        const remaining = Math.max(0, +(b.remaining - grams).toFixed(1));
        return {
          ...b,
          remaining,
          finished: remaining === 0 ? true : b.finished,
          log: [{ date: new Date().toISOString(), grams, method }, ...(b.log || [])],
        };
      }),
    );

  return { beans, setBeans, upsert, remove, use, saveError };
}

export function daysSince(date) {
  if (!date) return null;
  const start = new Date(date + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((now - start) / DAY);
}

// 根据烘焙天数和用途给出新鲜度状态
export function freshness(bean) {
  if (bean.finished) return { key: 'done', label: '已喝完', pct: 1 };
  const d = daysSince(bean.roastDate);
  if (d === null) return { key: 'unknown', label: '未填烘焙日', pct: 0 };
  const { rest, peak } = FRESHNESS[bean.usage] || FRESHNESS['两用'];
  const pct = Math.min(1, Math.max(0, d / (peak + 30)));
  if (d < rest) return { key: 'resting', label: `养豆中 · 还差 ${rest - d} 天`, pct, d };
  if (d <= peak) return { key: 'peak', label: `最佳赏味 · 第 ${d} 天`, pct, d };
  if (d <= peak + 30) return { key: 'soon', label: `尽快喝完 · 第 ${d} 天`, pct, d };
  return { key: 'stale', label: `风味衰退 · 第 ${d} 天`, pct, d };
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
