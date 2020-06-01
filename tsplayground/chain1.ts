// import { chain } from './chain.js'
const v = chain([1,2,3]).filter(x => x % 2 === 0).map(x => '' + x).value()