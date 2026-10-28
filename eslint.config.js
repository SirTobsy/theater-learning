import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelteParser from 'svelte-eslint-parser';

export default tseslint.config(
	{ ignores: ['dist', '.svelte-kit', 'build', 'android', 'ios'] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.browser
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser
			}
		}
	}
);
