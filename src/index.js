let cache = []
function deepClone(source) {
  if (source instanceof Object) {
    let cacheDist = findCache(source)
    if (cacheDist) { //有缓存
      return cacheDist
    } else { //没缓存
      let dist
      if (source instanceof Array) {
        dist = new Array()
      } else if (source instanceof Function) {
        dist = function () {
          return source.apply(this, arguments)
        }
      } else if (source instanceof RegExp) {
        dist = new RegExp(source.source, source.flags)
      } else if (source instanceof Date) {
        dist = new Date(source) //拷贝后的也会有 getTime 方法，可以进行比较了
      } else {
        dist = new Object()
      }
      cache.push([source, dist]) //先把 dist 放到里面
      for (let key in source) {
        if (source.hasOwnProperty(key)) {
          dist[key] = deepClone(source[key])
        }
      }
      return dist
    }
  }
  return source
}

function findCache(source) {
  for (let i = 0; i < cache.length; i++) {
    if (cache[i][0] === source) { //对比 source return dist
      return cache[i][1]
    }
  }
  return undefined
}

module.exports = deepClone
