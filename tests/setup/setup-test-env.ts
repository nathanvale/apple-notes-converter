import '@testing-library/jest-dom'
import 'dotenv/config'
import './db-setup.ts'
import './global-mocks.ts'

// Set the timezone for the tests so that created sqllite3 dates are consistent
// in CI and local
process.env.TZ = 'Australia/Melbourne'

// we need these to be imported first 👆

import { beforeEach, type MockInstance } from 'vitest'
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
