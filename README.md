# 手写一个深拷贝

## 什么是深拷贝

b 是 a 的一份拷贝，b 中没有对 a 中对象的引用

## 写之前先考虑

- 数据类型：基本类型还是引用类型
- 数据规模：比如对象有多少属性，对象嵌套对象
- 性能要求：对时间，速度的要求，比如在 xx 复杂度内完成，在 xx 内存里完成
- 运行环境：在 IE6 还是 Chrome 里运行
- 其他...

## 具体实现

### JSON 序列化-反序列化

```
var a = {
  b: 1,
  c: [1,2,3],
  d: {d1: 'ddd1', d2: 'dddd2'}
}

var a2 = JSON.parse(JSON.stringify(a))

a2.b = 2
console.log(a.b) //1
a2.c[1] = 222
console.log(a.c[1]) //2
a2.d.d2 = 'ccc'
console.log(a.d.d2) //dddd2
```

此方案的缺点是

- 不支持函数，会直接忽略

```
var a = {
  f: function() {},
  name: 'a'
}

var a2 = JSON.parse(JSON.stringify(a))
console.log(a2) //{name: "a"}
```

- 不支持`JSON 不支持的所有类型`，例如`undefined`

```
var a = {
  u: undefined,
  name: 'a'
}

var a2 = JSON.parse(JSON.stringify(a))
console.log(a2) //{name: "a"}
```

- 不支持引用类型

```
var a = {
  name: 'a'
}
a.selt = a //互相引用

var a2 = JSON.parse(JSON.stringify(a))
console.log(a2) //报错
```

- 不支持 Date

```
var a = {
  name: 'a',
  time: new Date()
}

var a2 = JSON.parse(JSON.stringify(a))
console.log(a2) //new Date() 的字符串形式(ISO8601格式的)
```

- 不支持正则

```
var a = {
  name: 'a',
  regex: /hi/
}

var a2 = JSON.parse(JSON.stringify(a))
console.log(a2) //空的
```

如果数据类型包含了：Date ，引用，undefined，函数呢，如何深拷贝呢

### 递归

1. 首先判断节点的类型： Number, String, Bool, Undefined, Null, Symbol，Object（Object 的子类型：Array, Function，Date, Regexp） 
2. 如果是基本类型（非 Object），直接拷贝
3. 如果是 Object , 并且每个子类型都要单独处理

**Object**

- 普通 object - for in?
- 数组 array - Array 初始化？
- 函数 function - 怎么拷贝，闭包要不要拷贝？
- 日期 Date - 怎么拷贝

实现

1. 创建目录

```
.
├── src
│   └── index.js
└── test
    └── index.js
```

2. 测试驱动开发：测试失败 -> 改代码 -> 测试成功 -> 加测试 -> ...

引入 chai 和 sinon （测试框架）

运行`yarn init -y`创建`package.json`

```
{
  "name": "DEEP-CLONE",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "test": "mocha test/**/*.js"
  },
  "devDependencies": {
    "chai": "^4.2.0",
    "mocha": "^6.2.0",
    "sinon": "^7.4.1",
    "sinon-chai": "^3.3.0"
  }
}
```
运行 yarn install

测试: 编写测试用例

```
src/index.js
function deepClone() {}
module.exports = deepClone

test/index.js
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const assert = chai.assert;

const deepClone = require('../src/index')
describe('deepClone', () => {
  it('是一个函数', () => { 
    assert.isFunction(deepClone)
  })
})
```

运行`yarn test`，测试通过

![测试函数](https://github.com/pppcode/Deep-clone/blob/master/images/测试函数.png)

3. 开发

**基本类型的拷贝**

编写测试用例

```
it('能够复制基本类型', () => {
    const n = 123;
    const n2 = deepClone(n);
    assert(n === n2)
    const s = '123456'
    const s2 = deepClone(s)
    assert(s === s2)
    const b = true
    const b2 = deepClone(b)
    assert(b === b2)
    const u = undefined
    const u2 = deepClone(u)
    assert(u === u2)
    const e = null
    const e2 = deepClone(e)
    assert(e === e2)
    const sym = Symbol()
    const sym2 = deepClone(sym)
    assert(sym === sym2)
  })
```

调用`deepClone`传递参数时，进行了一份复制，所以`deepClone`直接`return`出来就行

```
function deepClone(source) {
  return source
}
module.exports = deepClone

```

运行`yarn test`

![测试复制基本类型](https://github.com/pppcode/Deep-clone/blob/master/images/测试复制基本类型.jpg)

**引用类型的拷贝**

**普通对象**

编写测试用例：断言引用类型时，是不相等的，基本类型是相等的

```
  describe('对象', () => {
    it('能够复制普通对象', () => {
      const a = {name: 'zhangsan', child: {name: 'xiaozhangsan'}}
      const a2 = deepClone(a)
      assert(a !== a2)
      assert(a.name === a2.name)
      assert(a.child !== a2.child)
      assert(a.child.name === a2.child.name)
    })
  })
```

实现`deepClone`

如果是对象，遍历每一个属性，进行 clone

```
function deepClone(source) {
  if(source instanceof Object) {
    const dist = new Object()
    for (let key in source) {
      dist[key] = deepClone(source[key])
    }
    return dist
  }
  return source
}
module.exports = deepClone
```

测试通过

![测试普通对象](https://github.com/pppcode/Deep-clone/blob/master/images/测试普通对象.jpg)

**数组**

测试用例：断言数组不相等，普通类型相等

```
    it('能够复制数组对象', () => {
      const a = [[11,12], [21,22], [31,32]]
      const a2 = deepClone(a)
      assert(a !== a2)
      assert(a[0] !== a2[0])
      assert(a[1] !== a2[1])
      assert(a[2] !== a2[2])
      assert.deepEqual(a, a2) //a 里面的每一项对比 a2 里面的每一项，不对比引用，只对比里面的值
    })
```

实现`deepClone`

虽然数组也是对象，但若不单独处理，就会报错

```
function deepClone(source) {
  if (source instanceof Object) {
    if (source instanceof Array) {
      const dist = new Array()
      for (let key in source) {
        dist[key] = deepClone(source[key])
      }
      return dist
    } else {
      //...
    }
  }
  return source
}
```

测试通过

![复制数组](https://github.com/pppcode/Deep-clone/blob/master/images/复制数组.jpg)

**函数**

测试用例：断言 a 和 a2 有相同的功能,属性

```
    it('能够复制函数', () => {
      const a = function(x, y) {
        return x + y
      }
      a.xxx = {yyy: {zzz: 1}}
      const a2 = deepClone(a) 
      assert(a !== a2) //断言属性
      assert(a.xxx.yyy.zzz === a2.xxx.yyy.zzz)
      assert(a.xxx.yyy !== a2.xxx.yyy)
      assert(a.xxx !== a2.xxx)
      assert(a(1, 2) === a2(1, 2)) //断言功能，执行结果相同
    })
```

实现`deepClone`，难点怎么拷贝函数的参数和函数体呢

```
else if (source instanceof Function) {
      const dist = function () { //拷贝参数和函数体
        return source.apply(this, arguments)
      }
      for (let key in source) { //拷贝属性
        dist[key] = deepClone(source[key])
      }
      return dist
    }
```

测试通过

![复制函数](https://github.com/pppcode/Deep-clone/blob/master/images/复制函数.jpg)

**以上拷贝有一些缺点**

用到了递归，递归必须有一个结束的条件，这些对象的拷贝，但是并没有报错，因为以上拷贝的对象都是有结尾的,递归到末尾时自动停止了，但若是对象有个环呢

![环引用](https://github.com/pppcode/Deep-clone/blob/master/images/环引用.jpg)

`window`就是这么个对象，`window.self === window //true`,`window.self.self === window //true`

若深拷贝这个对象，`self`会一直递归下去

举个🌰

测试用例

```
    it('环也能复制', () => {
      const a = {name: 'zhangsan'}
      a.self = a //构造环引用：先解析到之后，再赋值，所以不能 {name: 'zhangsan', self:a} 这样写，否则解析时是 undefined
      const a2 = deepClone(a)
      assert(a !== a2)
      assert(a.name === a2.name)
      assert(a.self !== a2.self)
    })
```

测试失败

![测试环引用](https://github.com/pppcode/Deep-clone/blob/master/images/测试环引用.jpg)

调用了一万多次`deepClone`，`deepClone`会一直去找所有的属性，而其中的`self`属性会一直往下找到同一个对象,反复调用`deepClone`

如何解决呢

如果第一次出现过，第二次再出现时不克隆,通过缓存实现

```
let cache = []
function deepClone(source) {
  if(source instanceof Object) {
    let cacheDist = findCache(source)
    if(cacheDist) { //有缓存
      return cacheDist
    }else { //没缓存
      let dist 
      if(source instanceof Array) {
        dist = new Array()
      }else if(source instanceof Function) {
        dist = function() {
          return source.apply(this, arguments)
        }
      }else {
        dist = new Object()
      }
      cache.push([source, dist]) //先把 dist 放到里面
      for(let key in source) {
        dist[key] = deepClone(source[key])
      }
      return dist
    }
  }
  return source
}

function findCache(source) { 
  for(let i=0; i<cache.length; i++) {
    if(cache[i][0] === source) { //对比 source return dist
      return cache[i][1]
    }
  }
  return undefined
}

module.exports = deepClone
```

测试成功

![测试环引用成功](https://github.com/pppcode/Deep-clone/blob/master/images/测试环引用成功.jpg)

假设对象的层级很深呢，通过检测环是不行的(递归xx次，递归会调用栈，若是栈的长度低于xx，就会爆栈,chrome堆栈大概是12000左右)

测试用例：创造'有两万个属性的对象'

```
    it('不会爆栈', () => {
      const a = {child: null}
      const b = a
      for(let i=0; i<20000; i++) {
        b.child = {
          child: null
        }
        b = b.child
      }
      const a2 = deepClone(a)
      assert(a !== a2)
      assert(a.child !== a2.child)
    })
```

**可能会爆栈，对它的结构进行一个改造，用循环的方式放到一个数组里**

**RegExp**

测试用例

```
    it('可以复制正则表达式', () => {
      const a = new RegExp('h1\\d+', 'gi')
      a.xxx = {yyy: {zzz: 1}}
      const a2 = deepClone(a)
      assert(a.source === a2.source) //获取 'h1\\d+'
      assert(a.flags === a2.flags) //获取 'gi'
      assert(a !== a2)
      assert(a.xxx.yyy.zzz === a2.xxx.yyy.zzz)
      assert(a.xxx.yyy !== a2.xxx.yyy)
      assert(a.xxx !== a2.xxx) 
    })
```

实现`deepClone`

```
else if(source instanceof RegExp) {
        dist = new RegExp(source.source, source.flags)
      }
```

测试成功

![测试正则表达式](https://github.com/pppcode/Deep-clone/blob/master/images/测试正则表达式.jpg)

**Date**

测试用例

```
    it('可以复制日期', () => {
      const a = new Date()
      a.xxx = {yyy: {zzz: 1}}
      const a2 = deepClone(a)
      assert(a.getTime() === a2.getTime()) //通过 getTime 判断拷贝后的值相等
      assert(a.xxx.yyy.zzz === a2.xxx.yyy.zzz)
      assert(a.xxx.yyy !== a2.xxx.yyy)
      assert(a.xxx !== a2.xxx) 
    })
```

实现`deepClone`

```
else if(source instanceof Date) {
        dist = new Date(source) //拷贝后的也会有 getTime 方法，可以进行比较了
      }
```

测试成功

![测试日期](https://github.com/pppcode/Deep-clone/blob/master/images/测试日期.jpg)

通过以上代码可以看出，每个类型的构造方法都不太一样，所以需要写不同的逻辑

要不要拷贝原型上的属性呢

一般来说，不拷贝原型属性，若拷贝的话，内存占用太多了

测试用例

```
it('自动跳过原型属性', () => {
      const a = Object.create({name: 'a'}) //原型上的属性
      a.xxx = {yyy: {zzz: 1}}
      const a2 = deepClone(a)
      assert(a !== a2)
      assert.isFalse('name' in a2) //a2 上没有 name 属性
      assert(a.xxx.yyy.zzz === a2.xxx.yyy.zzz)
      assert(a.xxx.yyy !== a2.xxx.yyy)
      assert(a.xxx !== a2.xxx) 
    })
```

实现`deepClone`，`for in`默认遍历原型上的属性，所以

```
      for(let key in source) {
        if(source.hasOwnProperty(key)) {
          dist[key] = deepClone(source[key])
        }
      }
```

测试成功

![跳过原型属性](https://github.com/pppcode/Deep-clone/blob/master/images/跳过原型属性.jpg)

以上代码中存在一个问题：`chche`会被全局共享，造成互相污染

`cache`没有清空，下次`deepClone`时会和上一次的互相影响，所以每次`deepClone`时只用一个`cache`（重新生成）,可以利用面向对象，`new`克隆对象时（自己有独立的`cache`），每次深拷贝时，先声明一个对象，再用这个对象的拷贝方法

完整代码

https://github.com/pppcode/Deep-clone/blob/master/src/index.js

测试成功

![cache问题](https://github.com/pppcode/Deep-clone/blob/master/images/cache问题.jpg)

以上用原生 JS 实现了一个深拷贝，但和`Lodash.cloneDeep`第三方库相比的缺点是：4个类型之外的对象就拷贝不了了，比如`map`,`set`等类型的对象，每一种类型的判断都需要单独处理














