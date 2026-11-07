const CACHE_TTL = 20000;

const cache = new Map();

function isFresh(entry) {
    return Date.now() - entry.time < CACHE_TTL;
}

export async function cached(key, loadData) {
    const entry = cache.get(key);
    if (entry && isFresh(entry)) {
        return entry.data;
    }
    const data = await loadData();
    for (const [oldKey, oldEntry] of cache) {
        if (!isFresh(oldEntry)) {
            cache.delete(oldKey);
        }
    }
    cache.set(key, {data, time: Date.now()});
    return data;
}

export function clearCache() {
    cache.clear();
}
