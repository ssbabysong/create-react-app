// Tiny key-value store on IndexedDB, falling back to memory when IndexedDB is unavailable.
const mem = new Map<string, unknown>();
let dbp: Promise<IDBDatabase | null> | null = null;

function db() {
  if (!dbp)
    dbp = new Promise((res) => {
      try {
        const r = indexedDB.open('tietieben', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => res(r.result);
        r.onerror = () => res(null);
      } catch {
        res(null);
      }
    });
  return dbp;
}

function req<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((res, rej) => {
        if (!d) return rej(new Error('no-idb'));
        const r = fn(d.transaction('kv', mode).objectStore('kv'));
        r.onsuccess = () => res(r.result as T);
        r.onerror = () => rej(r.error);
      })
  );
}

export async function get<T = any>(k: string): Promise<T | undefined> {
  try {
    return await req<T>('readonly', (s) => s.get(k));
  } catch {
    return mem.get(k) as T;
  }
}
export async function set(k: string, v: unknown) {
  try {
    await req('readwrite', (s) => s.put(v, k));
  } catch {
    mem.set(k, v);
  }
}
export async function del(k: string) {
  try {
    await req('readwrite', (s) => s.delete(k));
  } catch {
    mem.delete(k);
  }
}
export async function keys(prefix: string): Promise<string[]> {
  try {
    const all = await req<IDBValidKey[]>('readonly', (s) => s.getAllKeys());
    return all.map(String).filter((k) => k.startsWith(prefix));
  } catch {
    return [...mem.keys()].filter((k) => k.startsWith(prefix));
  }
}
export async function clearAll() {
  try {
    await req('readwrite', (s) => s.clear());
  } catch {
    mem.clear();
  }
}
