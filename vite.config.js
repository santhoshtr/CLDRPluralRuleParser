import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(import.meta.dirname, 'src/CLDRPluralRuleParser.js'),
			name: 'cldrpluralruleparser',
			formats: ['es', 'cjs'],
			fileName: (format) =>
				format === 'es'
					? 'esm/cldrpluralruleparser.js'
					: 'cjs/cldrpluralruleparser.js',
		},
		outDir: 'dist',
		sourcemap: true,
	},
});
