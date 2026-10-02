// 豆袋照片存在 IndexedDB（localStorage 只有约 5MB，放不下多张照片）
import { useEffect, useState } from 'react';

const DB = 'bean-vault';
const STORE = 'photos';
const cache = new Map();
const listeners = new Set();

let dbPromise;
function db() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function tx(mode, fn) {
  return db().then(
    (d) =>
      new Promise((resolve, reject) => {
        const t = d.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(req?.result);
        t.onerror = () => reject(t.error);
      }),
  );
}

export async function getPhoto(id) {
  if (cache.has(id)) return cache.get(id);
  try {
    const url = (await tx('readonly', (s) => s.get(id))) || '';
    cache.set(id, url);
    return url;
  } catch {
    return '';
  }
}

export async function putPhoto(id, url) {
  cache.set(id, url);
  listeners.forEach((fn) => fn(id));
  await tx('readwrite', (s) => s.put(url, id));
}

export async function deletePhoto(id) {
  cache.delete(id);
  listeners.forEach((fn) => fn(id));
  try {
    await tx('readwrite', (s) => s.delete(id));
  } catch {
    /* 忽略 */
  }
}

export function usePhoto(id, enabled = true) {
  const [url, setUrl] = useState(() => (enabled ? cache.get(id) || '' : ''));
  useEffect(() => {
    if (!enabled || !id) {
      setUrl('');
      return undefined;
    }
    let alive = true;
    const load = () => getPhoto(id).then((u) => alive && setUrl(u));
    load();
    const onChange = (changed) => changed === id && load();
    listeners.add(onChange);
    return () => {
      alive = false;
      listeners.delete(onChange);
    };
  }, [id, enabled]);
  return url;
}

// 把图片缩放成 JPEG dataURL
export function resizeImage(file, max, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error('无法读取图片'));
    };
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(src);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = src;
  });
}
