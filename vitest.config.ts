/// <reference types="vitest" />

import { defineConfig } from 'vite'

export default defineConfig({
	css: { postcss: { plugins: [] } },
	test: {
		include: ['./src/**/*.test.{ts,tsx}', './app/**/*.test.{ts,tsx}'],
		setupFiles: ['./tests/setup/setup-test-env.ts'],
		globalSetup: ['./tests/setup/global-setup.ts'],
		restoreMocks: true,
		environment: 'jsdom',
		globals: true,
		coverage: {
			include: ['src/**/*.{ts,tsx}', './app/**/*.test.{ts,tsx}'],
			all: true,
			thresholds: {
				statements: 95,
				branches: 95,
				functions: 95,
				lines: 95,
			},
		},
	},
})
