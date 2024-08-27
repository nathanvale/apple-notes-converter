import applescript from 'applescript'
import { describe, it, expect, vi } from 'vitest'
import { runAppleScript } from './run-apple-script'

vi.mock('applescript')

describe('runAppleScript', () => {
	it('should resolve with the result when no error occurs', async () => {
		const mockScript =
			'tell application "Finder" to get the name of every file in the folder "Documents"'
		const mockResult = 'Test Result'

		// Mock the execString function
		vi.spyOn(applescript, 'execString').mockImplementation(
			(script, callback) => {
				callback(null, mockResult)
			},
		)

		const result = await runAppleScript(mockScript)

		expect(result).toBe(mockResult)
	})

	it('should reject with an error message when an error occurs', async () => {
		const mockScript =
			'tell application "Finder" to get the name of every file in the folder "Documents"'
		const mockError = new Error('Test Error')

		// Mock the execString function
		vi.spyOn(applescript, 'execString').mockImplementation(
			(script, callback) => {
				callback(mockError, null)
			},
		)

		try {
			await runAppleScript(mockScript)
		} catch (error) {
			expect(error).toBe(`Error: ${mockError}`)
		}
	})
})
