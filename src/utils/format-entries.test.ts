import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest'
import { consoleError } from '#tests/setup/setup-test-env.ts'
import { formatEntries } from './format-entries'
import { runAppleScript } from './run-apple-script'
// Mock the runAppleScript function
vi.mock('./run-apple-script', () => ({
	runAppleScript: vi.fn(),
}))

describe('processNotesInFolder', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should process all notes in the folder', async () => {
		// Arrange
		const folderName = 'GJB'
		const notesList = ['Note 1', 'Note 2', 'Note 3']

		// Type assertion to use mock methods like mockResolvedValueOnce
		const mockRunAppleScript = runAppleScript as Mock

		// Mock the return value of runAppleScript for listing notes
		mockRunAppleScript.mockResolvedValueOnce(notesList)

		// Mock the return value of runAppleScript for processing each note
		mockRunAppleScript.mockResolvedValue(undefined) // For each note processing

		// Act
		await formatEntries(folderName)

		// Assert
		expect(mockRunAppleScript).toHaveBeenCalledTimes(notesList.length + 1)

		// The first call is for listing the notes
		expect(mockRunAppleScript).toHaveBeenNthCalledWith(
			1,
			expect.stringContaining(`set theFolder to folder "${folderName}"`),
		)

		// The subsequent calls are for processing each note
		notesList.forEach((noteTitle, index) => {
			expect(mockRunAppleScript).toHaveBeenNthCalledWith(
				index + 2,
				expect.stringContaining(
					`set theNote to first note whose name is "${noteTitle}"`,
				),
			)
		})
	})

	it('should handle errors gracefully', async () => {
		consoleError.mockImplementation(() => {})
		// Arrange
		const folderName = 'GJB'
		const errorMessage = 'An error occurred'

		// Type assertion to use mock methods like mockRejectedValueOnce
		const mockRunAppleScript = runAppleScript as Mock

		// Mock the runAppleScript to throw an error
		mockRunAppleScript.mockRejectedValueOnce(new Error(errorMessage))

		// Act & Assert
		await expect(formatEntries(folderName)).rejects.toThrow(errorMessage)
	})
})
