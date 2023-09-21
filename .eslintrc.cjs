module.exports = {
	'root': true,
	'env': {
		'browser': true,
		'node': true,
		'es2018': true
	},
	'parserOptions': {
		'ecmaVersion': 2018,
		'sourceType': 'module'
	},
	'plugins': [
		'html',
		'import'
	],
	'globals': {
		'Nanobar': 'readonly',
		'Ammo': 'readonly',
		'CANNON': 'readonly',
		'SimplexNoise': 'readonly'
	},
	'rules': {
		/* Styles */

		'array-bracket-spacing': ['warn', 'never'],
		'block-spacing': ['warn', 'always'],
		'brace-style': ['warn', '1tbs', { 'allowSingleLine': true }],
		'comma-spacing': ['warn', { 'before': false, 'after': true }],
		'comma-style': ['warn', 'last'],
		'computed-property-spacing': ['warn', 'never'],
		'func-call-spacing': ['warn', 'never'],
		'indent': ['warn', 'tab', { 'SwitchCase': 1 }],
		'key-spacing': ['warn', { 'beforeColon': false, 'afterColon': true, 'mode': 'strict' }],

		'new-parens': 'warn',
		'no-trailing-spaces': 'warn',
		'no-whitespace-before-property': 'warn',

		'object-curly-spacing': ['warn', 'always'],

		'padded-blocks': ['warn', {
			'blocks': 'never',
			'classes': 'always',
			'switches': 'never'
		}],

		'semi': ['warn', 'always', { 'omitLastInOneLineBlock': true }],
		'semi-spacing': ['warn', { 'before': false, 'after': true }],
		'space-before-blocks': ['warn', 'always'],
		'space-before-function-paren': ['warn', { 'anonymous': 'never', 'named': 'never', 'asyncArrow': 'ignore' }],
		'space-in-parens': ['warn', 'never'],
		'space-infix-ops': 'warn',
		'space-unary-ops': ['warn', { 'words': true, 'nonwords': false }],

		'keyword-spacing': ['warn', { 'before': true, 'after': true }],

		'spaced-comment': ['warn', 'always', {
			'block': {
				'exceptions': ['*'],
				'balanced': true
			}
		}],
		'switch-colon-spacing': ['warn', { 'after': true, 'before': false }],
		'template-tag-spacing': ['warn', 'never'],
		'arrow-spacing': ['warn', { 'before': true, 'after': true }],
		'generator-star-spacing': ['warn', { 'before': false, 'after': true }],
		'rest-spread-spacing': ['warn', 'never'],
		'template-curly-spacing': ['warn', 'never'],
		'yield-star-spacing': ['warn', 'after'],

		'curly': ['warn', 'multi-line', 'consistent'],
		'no-mixed-spaces-and-tabs': 'warn',

		'comma-dangle': ['warn', 'never'],
		'arrow-parens': ['warn', 'as-needed'],

		// 'eol-last': ['warn', 'always'],
		// 'no-var': 'warn',

		/* Best Practices */

		'no-multi-spaces': 'warn',

		'no-unreachable': 'warn',
		'no-empty': ['warn', { 'allowEmptyCatch': true }],

		'max-depth': ['warn', 5],
		'max-nested-callbacks': ['warn', 3],

		/* Variables */

		'no-undef': 'warn',
		'no-unused-vars': ['warn', { 'vars': 'all', 'args': 'none', 'caughtErrors': 'none', 'ignoreRestSiblings': true }],

		/* Others */

		'no-extra-semi': 'warn',
		'quotes': ['warn', 'single'],
		'prefer-const': ['warn', { 'destructuring': 'all', 'ignoreReadBeforeAssign': false }],

		'new-cap': ['warn', { 'newIsCap': true, 'capIsNew': false, 'properties': true }],
		'semi-style': ['warn', 'last'],

		'no-multiple-empty-lines': ['warn', { 'max': 3, 'maxEOF': 1, 'maxBOF': 1 }],
		'no-irregular-whitespace': ['warn', { 'skipStrings': true, 'skipComments': false, 'skipRegExps': true, 'skipTemplates': true }],

		/* Errors */

		'no-sparse-arrays': 'error',
		'no-unsafe-finally': 'error',
		'valid-typeof': 'error',
		'array-callback-return': 'error',
		'no-template-curly-in-string': 'error',
		'use-isnan': 'error',
		'no-unsafe-negation': 'error',

		'func-name-matching': ['error', 'always', { 'includeCommonJSModuleExports': false }],

		/* Import */

		'import/extensions': [
			'warn',
			'always'
		]
	}
};