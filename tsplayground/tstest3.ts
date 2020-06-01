// logic.actions.submit == 'something real!'
interface Chainable {
  execute: () => Promise<void>
}

interface Chain1 extends Chainable {
  chain1?: <T extends Chain1>(this: T) => Omit<T, 'chain1'>
}

interface Chain2 extends Chainable {
  chain2?: <T extends Chain2>(this: T) => Omit<T, 'chain2'>
}

const cchain: Chain1 & Chain2 = {
  execute: () => null,
  chain1: function () {
    delete this.chain1
    return this
  },
  chain2: function () {
    delete this.chain2
    return this
  },
}

cchain.chain1().chain2().execute() // Using the function chain
cchain.chain1().chain2().chain1().execute() // error
