class DeepCloner {
  constructor() {
    this.cache = []
  }
  clone(source) {
    if (source instanceof Object) {
      let cacheDist = this.findCache(source)
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
        this.cache.push([source, dist]) //先把 dist 放到里面
        for (let key in source) {
          if (source.hasOwnProperty(key)) {
            dist[key] = this.clone(source[key])
          }
        }
        return dist
      }
    }
    return source
  }
  findCache(source) {
    for (let i = 0; i < this.cache.length; i++) {
      if (this.cache[i][0] === source) { //对比 source return dist
        return this.cache[i][1]
      }
    }
    return undefined
  }
}

module.exports = DeepCloner
