import pkg from './package.json' assert { type: 'json' }
import json from '@rollup/plugin-json'
import esbuild from 'rollup-plugin-esbuild'

export default [
  {
    input: 'src/CLDRPluralRuleParser.js',
    output: [
      {
        name: pkg.name,
        file: pkg.module,
        format: 'esm',
        sourcemap: true
      },
      {
        name: pkg.name,
        file: pkg.main,
        format: 'umd',
        sourcemap: true
      }
    ],
    plugins: [
      json(),
      esbuild({
        sourceMap: true,
        minify: false
      })
    ]
  }
]
