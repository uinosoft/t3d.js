import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import html from 'eslint-plugin-html';
import globals from 'globals';

export default [
	js.configs.recommended,
	{
		ignores: [
			'build/**',
			'node_modules/**',
			'examples/libs/**'
		]
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			},
			ecmaVersion: 2018,
			sourceType: 'module'
		},
		plugins: {
			import: importPlugin
		},
		rules: {
			/* Override eslint:recommended */

			// modified: sometimes use while(true) and break inside
			'no-constant-condition': ['error', {
				checkLoops: false
			}],

			// modified: set allowEmptyCase to true to allow empty cases
			'no-fallthrough': ['error', {
				allowEmptyCase: true
			}],

			// modified: sometimes use function inside function
			'no-inner-declarations': 'off',

			'no-irregular-whitespace': ['error', {
				skipStrings: true,
				skipComments: false,
				skipRegExps: true,
				skipTemplates: true
			}],

			// modified: sometimes use object.hasOwnProperty
			'no-prototype-builtins': 'off',

			// modified: ignore in some cases
			'no-unused-vars': ['error', {
				vars: 'all',
				args: 'none',
				caughtErrors: 'none',
				ignoreRestSiblings: true
			}],

			// modified: set allowEmptyCatch to true to allow empty catch blocks
			'no-empty': ['error', { allowEmptyCatch: true }],

			/* Possible Problems */

			'array-callback-return': 'error',
			'no-template-curly-in-string': 'error',

			/* Suggestions */

			'curly': ['warn', 'multi-line', 'consistent'],
			'comma-dangle': ['warn', 'never'],
			'arrow-parens': ['warn', 'as-needed'],

			'func-name-matching': ['warn', 'always', {
				includeCommonJSModuleExports: false
			}],

			'no-var': 'warn',

			'prefer-const': ['warn', {
				destructuring: 'all',
				ignoreReadBeforeAssign: false
			}],

			'new-cap': ['warn', {
				newIsCap: true,
				capIsNew: false,
				properties: true
			}],

			'max-depth': ['warn', 5],
			'max-nested-callbacks': ['warn', 3],

			/* Layout & Formatting */

			'array-bracket-spacing': ['warn', 'never'],
			'block-spacing': ['warn', 'always'],

			'brace-style': ['warn', '1tbs', {
				allowSingleLine: true
			}],

			'comma-spacing': ['warn', {
				before: false,
				after: true
			}],

			'comma-style': ['warn', 'last'],
			'computed-property-spacing': ['warn', 'never'],
			'func-call-spacing': ['warn', 'never'],

			'indent': ['warn', 'tab', {
				SwitchCase: 1
			}],

			'key-spacing': ['warn', {
				beforeColon: false,
				afterColon: true,
				mode: 'strict'
			}],

			'new-parens': 'warn',
			'no-trailing-spaces': 'warn',
			'no-whitespace-before-property': 'warn',
			'object-curly-spacing': ['warn', 'always'],

			'padded-blocks': ['warn', {
				blocks: 'never',
				classes: 'always',
				switches: 'never'
			}],

			'semi': ['warn', 'always', {
				omitLastInOneLineBlock: true
			}],

			'semi-spacing': ['warn', {
				before: false,
				after: true
			}],

			'space-before-blocks': ['warn', 'always'],

			'space-before-function-paren': ['warn', {
				anonymous: 'never',
				named: 'never',
				asyncArrow: 'ignore'
			}],

			'space-in-parens': ['warn', 'never'],
			'space-infix-ops': 'warn',

			'space-unary-ops': ['warn', {
				words: true,
				nonwords: false
			}],

			'keyword-spacing': ['warn', {
				before: true,
				after: true
			}],

			'spaced-comment': ['warn', 'always', {
				block: {
					exceptions: ['*'],
					balanced: true
				}
			}],

			'switch-colon-spacing': ['warn', {
				after: true,
				before: false
			}],

			'template-tag-spacing': ['warn', 'never'],

			'arrow-spacing': ['warn', {
				before: true,
				after: true
			}],

			'generator-star-spacing': ['warn', {
				before: false,
				after: true
			}],

			'rest-spread-spacing': ['warn', 'never'],
			'template-curly-spacing': ['warn', 'never'],
			'yield-star-spacing': ['warn', 'after'],
			'no-multi-spaces': 'warn',
			'quotes': ['warn', 'single'],
			'semi-style': ['warn', 'last'],

			'no-multiple-empty-lines': ['warn', {
				max: 3,
				maxEOF: 1,
				maxBOF: 1
			}],

			// "eol-last": ["warn", "always"],

			/* Import(plugin) */

			'import/extensions': ['warn', 'always']
		}
	},
	{
		files: ['src/**/*.js', 'examples/jsm/**/*.js'],
		...jsdoc.configs['flat/recommended']
	},
	{
		files: ['src/**/*.js', 'examples/jsm/**/*.js'],
		settings: {
			jsdoc: {
				tagNamePreference: {
					augments: 'extends'
				}
			}
		},
		rules: {
			/* JSDoc(plugin) */

			'jsdoc/no-defaults': 0,
			'jsdoc/no-undefined-types': 0,
			'jsdoc/require-jsdoc': 0,
			'jsdoc/require-param-description': 0,
			'jsdoc/require-property-description': 0,
			'jsdoc/require-returns-check': 0,
			'jsdoc/require-returns-description': 0
		}
	},
	{
		files: ['examples/**/*.html', 'tests/**/*.html'],
		plugins: { html }
	},
	{
		files: ['examples/**/*.html'],
		languageOptions: {
			globals: {
				Nanobar: 'readonly',
				SimplexNoise: 'readonly'
			}
		}
	},
	{
		files: ['tests/**/*.js'],
		languageOptions: {
			globals: {
				QUnit: 'readonly'
			}
		}
	}
];