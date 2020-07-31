import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import pkg from './package.json'
import typescript from 'rollup-plugin-typescript2'
import dts from 'rollup-plugin-dts'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

const external = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {}))

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      },
    ],
    external,
    plugins: [
      // Allows node_modules resolution
      resolve({ extensions }),
      // Allow bundling cjs modules. Rollup doesn't understand cjs
      commonjs({
        exclude: 'src/**',
      }),
      // Compile TypeScript/JavaScript files
      typescript({
        include: [ "*.(t|j)s+(|x)", "**/*.(t|j)s+(|x)" ]
      }),
      babel({ extensions, include: ['src/**/*'] }),
    ],
  },
  {
    input: './lib/index.d.ts',
    output: [{ file: 'lib/kea.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]
