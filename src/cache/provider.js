
let cache

export function getCache () {
  return cache
}

export function setCache (newCache) {
  cache = newCache
}

export function getReduxStore () {
  return cache.store
}

export function attachStore (storeReference) {
  if (cache.store) {
    console.error('[KEA] Already attached to a store! Replacing old store! Be aware: this might lead to memory leaks in SSR and elsewhere!')
  }
  cache.store = storeReference
}