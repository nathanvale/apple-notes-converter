import 'dotenv/config'
import './db-setup.ts'
// we need these to be imported first 👆

import { beforeEach, vi, type MockInstance } from 'vitest'
import './custom-matchers.ts'

export let consoleError: MockInstance<(typeof console)['error']>

beforeEach(() => {
	const originalConsoleError = console.error
	consoleError = vi.spyOn(console, 'error')
	consoleError.mockImplementation(
		(...args: Parameters<typeof console.error>) => {
			originalConsoleError(...args)
			throw new Error(
				'Console error was called. Call consoleError.mockImplementation(() => {}) if this is expected.',
			)
		},
	)
})
