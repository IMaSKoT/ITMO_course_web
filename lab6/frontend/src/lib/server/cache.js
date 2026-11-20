const CACHE_TTL = 20000;

const cache = new Map();
let version = 0;

function isFresh(entry) {
    return Date.now() - entry.time < CACHE_TTL;
}

export async function cached(key, loadData) {
    const entry = cache.get(key);
    if (entry && isFresh(entry)) {
        return entry.data;
    }
    const currentVersion = version;
    const data = await loadData();
    for (const [oldKey, oldEntry] of cache) {
        if (!isFresh(oldEntry)) {
            cache.delete(oldKey);
        }
    }
    if (currentVersion === version) {
        cache.set(key, {data, time: Date.now()});
    }
    return data;
}

export function clearCache() {
    version++;
    cache.clear();
}
