import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	server: {
		host: '::',
		port: 8080
	},
	plugins: [tailwindcss(), sveltekit()],
	worker: {
		format: 'es'
	},
	optimizeDeps: {
		exclude: ['@huggingface/transformers']
	},
	// Vitest doesn't apply Vite's client-build resolve conditions, so without this
	// Svelte components resolve to their server-side build and `mount()` throws.
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest-setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
