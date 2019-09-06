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

运行`yarn test`输出

![测试函数](https://github.com/pppcode/React/blob/master/images/测试函数.jpg)

测试成功！

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

deepClone()

```
function deepClone(source) {
  return source
}
module.exports = deepClone

```

运行`yarn test`

![测试复制基本类型](https://github.com/pppcode/React/blob/master/images/测试复制基本类型.jpg)















