// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
/** @type {import("eslint").Linter.Config} */
const config = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true,
	},
	plugins: ['@typescript-eslint'],
	extends: [
		'next/core-web-vitals',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		// These opinionated rules are enabled in stylistic-type-checked above.
		// Feel free to reconfigure them to your own preference.
		'@typescript-eslint/array-type': 'off',
		'@typescript-eslint/consistent-type-definitions': 'off',
		'@typescript-eslint/consistent-type-imports': [
			'warn',
			{
				prefer: 'type-imports',
				fixStyle: 'inline-type-imports',
			},
		],
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'indent': ['error', 'tab', { 'SwitchCase': 1 }],
		'quotes': ['warn', 'single'],
		'semi': ['error', 'always'],
		'prefer-destructuring': ['error', { 'object': true, 'array': false }],
		'curly': ['error'],
		'@next/next/no-html-link-for-pages': [2, path.join(__dirname, 'packages/referrals-app/src/pages')]
	},
};

module.exports = config;
