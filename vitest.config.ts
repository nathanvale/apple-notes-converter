/// <reference types="vitest" />

import { defineConfig } from 'vite'

export default defineConfig({
	css: { postcss: { plugins: [] } },
	test: {
		include: ['./src/**/*.test.{ts,tsx}'],
		setupFiles: ['./tests/setup/setup-test-env.ts'],
		globalSetup: ['./tests/setup/global-setup.ts'],
		restoreMocks: true,
		coverage: {
			include: ['src/**/*.{ts,tsx}'],
			all: true,
			thresholds: {
				statements: 28,
				branches: 66,
				functions: 75,
				lines: 28,
			}
		},
	},
})
