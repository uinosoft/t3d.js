import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const babelrc = {
	presets: [
		[
			'@babel/preset-env',
			{
				modules: false,
				targets: '>0.3%, not dead',
				loose: true,
				bugfixes: true,
			},
		],
	]
};

function glsl() {
	return {
		transform(code, id) {
			if (/\.glsl$/.test(id) === false) return;

			var transformedCode = 'export default ' + JSON.stringify(
				code
					.trim()
					.replace(/\r/g, '')
					.replace(/[ \t]*\/\/.*\n/g, '') // remove //
					.replace(/[ \t]*\/\*[\s\S]*?\*\//g, '') // remove /* */
					.replace(/\n{2,}/g, '\n') // # \n+ to \n
			) + ';';
			return {
				code: transformedCode,
				map: { mappings: '' }
			};
		}
	};
}

function babelCleanup() {
	const doubleSpaces = / {2}/g;
	return {
		transform(code) {
			code = code.replace(doubleSpaces, '\t');
			return {
				code: code,
				map: null
			};
		}
	};
}

function header() {
	return {
		renderChunk(code) {
			return '// t3d\n\n' + code;
		}
	};
}

export default [
	{
		input: 'src/main.js',
		plugins: [
			glsl(),
			babel({
				babelHelpers: 'bundled',
				compact: false,
				babelrc: false,
				...babelrc
			}),
			babelCleanup(),
			header()
		],
		output: [
			{
				format: 'umd',
				name: 't3d',
				file: 'build/t3d.js',
				indent: '\t'
			}
		]
	},
	{
		input: 'src/main.js',
		plugins: [
			glsl(),
			babel({
				babelHelpers: 'bundled',
				babelrc: false,
				...babelrc
			}),
			babelCleanup(),
			terser(),
			header()
		],
		output: [
			{
				format: 'umd',
				name: 't3d',
				file: 'build/t3d.min.js'
			}
		]
	},
	{
		input: 'src/main.js',
		plugins: [
			glsl(),
			header()
		],
		output: [
			{
				format: 'esm',
				file: 'build/t3d.module.js'
			}
		]
	}
];