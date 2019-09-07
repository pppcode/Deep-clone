const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const assert = chai.assert;

const DeepCloner = require('../src/index')
describe('new DeepCloner().clone', () => {
  it('是一个类', () => {
    assert.isFunction(DeepCloner)
  });
  it('能够复制基本类型', () => {
    const n = 123;
    const n2 = new DeepCloner().clone(n); //new 出的实例上都有一个独立的 cache 然后再调用 clone
    assert(n === n2)
    const s = '123456'
    const s2 = new DeepCloner().clone(s)
    assert(s === s2)
    const b = true
    const b2 = new DeepCloner().clone(b)
    assert(b === b2)
    const u = undefined
    const u2 = new DeepCloner().clone(u)
    assert(u === u2)
    const e = null
    const e2 = new DeepCloner().clone(e)
    assert(e === e2)
    const sym = Symbol()
    const sym2 = new DeepCloner().clone(sym)
    assert(sym === sym2)
  })
  describe('对象', () => {
    it('能够复制普通对象', () => {
      const a = { name: 'zhangsan', child: { name: 'xiaozhangsan' } }
      const a2 = new DeepCloner().clone(a)
      assert(a !== a2)
      assert(a.name === a2.name)
      assert(a.child !== a2.child)
      assert(a.child.name === a2.child.name)
    })
    it('能够复制数组对象', () => {
      const a = [[11, 12], [21, 22], [31, 32]]
      const a2 = new DeepCloner().clone(a)
      assert(a !== a2)
      assert(a[0] !== a2[0])
      assert(a[1] !== a2[1])
      assert(a[2] !== a2[2])
      assert.deepEqual(a, a2) //a 里面的每一项对比 a2 里面的每一项，不对比引用，只对比里面的值
    })
    it('能够复制函数', () => {
      const a = function (x, y) {
        return x + y
      }
      a.xxx = { yyy: { zzz: 1 } }
      const a2 = new DeepCloner().clone(a)
      assert(a !== a2) //断言属性
      assert(a.xxx.yyy.zzz === a2.xxx.yyy.zzz)
      assert(a.xxx.yyy !== a2.xxx.yyy)
      assert(a.xxx !== a2.xxx)
      assert(a(1, 2) === a2(1, 2)) //断言功能，执行结果相同
    })
    it('环也能复制', () => {
      const a = { name: 'zhangsan' }
      a.self = a //构造环引用：先解析到之后，再赋值，所以不能 {name: 'zhangsan', self:a} 这样写，否则解析时是 undefined
      const a2 = new DeepCloner().clone(a)
      assert(a !== a2)
      assert(a.name === a2.name)
      assert(a.self !== a2.self)
    })
    xit('不会爆栈', () => {
      const a = { child: null }
      const b = a
      for (let i = 0; i < 20000; i++) {
        b.child = {
          child: null
        }
        b = b.child
      }
      const a2 = new DeepCloner().clone(a)
      assert(a !== a2)
      assert(a.child !== a2.child)
    })
    it('可以复制正则表达式', () => {
      const a = new RegExp('h1\\d+', 'gi')
      a.xxx = { yyy: { zzz: 1 } }
      const a2 = new DeepCloner().clone(a)
      assert(a.source === a2.source) //获取 'h1\\d+'
      assert(a.flags === a2.flags) //获取 'gi'
      assert(a !== a2)
      assert(a.xxx.yyy.zzz === a2.xxx.yyy.zzz)
      assert(a.xxx.yyy !== a2.xxx.yyy)
      assert(a.xxx !== a2.xxx)
    })
    it('可以复制日期', () => {
      const a = new Date()
      a.xxx = { yyy: { zzz: 1 } }
      const a2 = new DeepCloner().clone(a)
      assert(a.getTime() === a2.getTime()) //通过 getTime 判断拷贝后的值相等
      assert(a.xxx.yyy.zzz === a2.xxx.yyy.zzz)
      assert(a.xxx.yyy !== a2.xxx.yyy)
      assert(a.xxx !== a2.xxx)
    })
    it('自动跳过原型属性', () => {
      const a = Object.create({ name: 'a' }) //原型上的属性
      a.xxx = { yyy: { zzz: 1 } }
      const a2 = new DeepCloner().clone(a)
      assert(a !== a2)
      assert.isFalse('name' in a2) //a2 上没有 name 属性
      assert(a.xxx.yyy.zzz === a2.xxx.yyy.zzz)
      assert(a.xxx.yyy !== a2.xxx.yyy)
      assert(a.xxx !== a2.xxx)
    })
  })
})