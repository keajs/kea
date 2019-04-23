import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default [
  {
    input: './src/index.js',
    output: { file: 'lib/index.js', format: 'cjs' },
    external: ['prop-types', 'react', 'redux', 'react-redux', 'reselect'],
    plugins: [babel(), resolve()]
  }
]
