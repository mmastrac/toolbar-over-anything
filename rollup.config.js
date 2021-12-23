import typescript from 'rollup-plugin-typescript2'
import external from 'rollup-plugin-peer-deps-external'
import resolve from 'rollup-plugin-node-resolve'
import { eslint } from 'rollup-plugin-eslint'
import json from 'rollup-plugin-json'
import serve from 'rollup-plugin-serve'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      name: 'toa',
      file: `dist/${pkg.main}`,
      format: 'iife',
      exports: 'named',
      sourcemap: false,
      extend: true,
    },
  ],
  plugins: [
    eslint({
      throwOnError: true,
      fix: true,
    }),
    external(),
    resolve(),
    json(),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true,
      tsconfig: './tsconfig.json',
    }),
    serve('examples'),
  ],
}
