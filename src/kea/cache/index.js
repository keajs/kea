// keep track of what path has been mounted, what is in redux, which saga has been started, etc

let cache = {}

export function getCache (path, variable) {
  const joinedPath = Array.isArray(path) ? path.join('.') : path

  let cachePart = cache[joinedPath] || {}

  if (variable) {
    return cachePart[variable]
  } else {
    return cachePart
  }
}

export function setCache (path, object) {
  const joinedPath = Array.isArray(path) ? path.join('.') : path
  cache[joinedPath] = Object.assign(cache[joinedPath] || {}, object)

  return cache[joinedPath]
}

export function resetCache () {
  cache = {}
}
