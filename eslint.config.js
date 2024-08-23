import defaultConfig from '@epic-web/config/eslint'
import eslintPlugin from '@typescript-eslint/eslint-plugin'
import eslintParser from '@typescript-eslint/parser'

/** @type {ESLint.FlatConfig[]} */
export default [
	{
		// Global settings that apply to all files
		ignores: ['**/coverage/**'],
	},
	...defaultConfig,
	{
		plugins: {
			'@typescript-eslint': eslintPlugin,
		},
		languageOptions: {
			parser: eslintParser,
		},
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					args: 'after-used',
					argsIgnorePattern: '^_',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^ignored',
					destructuredArrayIgnorePattern: '^_',
				},
			],
		},
	},
]
