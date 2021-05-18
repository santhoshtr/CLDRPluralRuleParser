import pkg from './package.json'
import esbuild from 'rollup-plugin-esbuild'

export default [
  {
    input: 'src/CLDRPluralRuleParser.js',
    output: {
      name: 'pluralRuleParser',
      file: pkg.main,
      format: 'umd'
    },
    plugins: [
      esbuild()
    ]
  }
]
