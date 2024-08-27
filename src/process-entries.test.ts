import { readFile } from 'fs/promises'
import { describe, it, expect, vi, vitest } from 'vitest'
import { readFixture } from '#tests/mocks/utils.js'
import { consoleError } from '#tests/setup/setup-test-env.js'
import { processEntries } from './process-entries'
import { prisma } from './utils/db.server' // Using the actual implementation
import { runAppleScript } from './utils/run-apple-script'
// Mock the required modules except for db.server
vi.mock('fs/promises', () => ({
	readFile: vi.fn(),
}))

vi.mock('./utils/run-apple-script', () => ({
	runAppleScript: vi.fn(),
}))

console.log = vitest.fn()

describe('processEntries', () => {
	it('should process and insert journal entries into the database', async () => {
		const mockAppleScript = 'mock AppleScript content'
		const mockOutput = await readFixture('entries', '1').then(
			(data) => data.output,
		)
		const mockEntries = [
			{
				id: 1,
				title: '2024/08/24 Title 3',
				content:
					'2024/08/24 Title 3\n## Key Events\n- Had lots of energy despite a big night\n- Spent meaningful time with Melanie\n\n## Action Items\n- Prioritize good sleep to recover from the weekend\n- Continue nurturing the growing bond between Melanie and Levi\n\n## Journal Entry\n\nToday, I was surprised by how much energy I had, despite the big night before.\n\n## Psychological Assessment\n\nToday was a day of balancing energy and emotions.',
			},
			{
				id: 2,
				title: '2024/08/25 Title 2',
				content:
					'2024/08/25 Title 2\n\n## Key Events\n\t•\tWorked on parsing journal entries for database import\n\t•\tSpent quality time with Levi at a scout event and Queen Vic Market\n\n## Action Items\n\n\t•\tContinue refining the journal entry parsing process to ensure seamless database integration.\n\t•\tPlan more structured activities with Levi to help manage the challenges of extended time together.\n\n\n## Journal Entry\n\nToday, I achieved a significant milestone by figuring out how to parse all my journal entries so they could be imported into a database. \n\n## Psychological Assessment\n\nToday was a day of positive progress and personal reflection.',
			},
			{
				id: 3,
				title: '2024/08/26 Title 1',
				content:
					'202 4/08/26 Title 1\n\n## Key Events\n- Got on top of personal tasks, including work-related and Scout-related responsibilities.\n- Felt proud of completing various tasks and clearing backlog.\n\n## Action Items\n- Continue to prioritize time for personal space and self-care.\n- Maintain intentionality in time spent with Melanie.\n\n## Journal Entry\n\nToday was a significant day in terms of productivity and personal growth.\n\n\n## Psychological Assessment\n\nToday was marked by a strong sense of accomplishment and self-awareness.',
			},
		]

		// Mock readFile to return mock AppleScript content
		vi.mocked(readFile).mockResolvedValue(mockAppleScript)

		// Mock runAppleScript to return mock AppleScript output
		vi.mocked(runAppleScript).mockResolvedValue(mockOutput)

		// Run the function
		await processEntries()

		// Verify that the entries were inserted into the database
		const entriesInDb = await prisma.entry.findMany()
		expect(entriesInDb).toHaveLength(mockEntries.length)
		expect(entriesInDb).toMatchSnapshot()
	})

	it('should handle errors from read file and close the Prisma client connection', async () => {
		consoleError.mockImplementation(() => {})
		const mockError = new Error('Mock error')

		vi.mocked(readFile).mockRejectedValue(mockError)

		const disconnectSpy = vi.spyOn(prisma, '$disconnect')

		await expect(processEntries()).rejects.toThrow('Mock error')
		expect(disconnectSpy).toHaveBeenCalled()
	})

	it('should handle errors from runAppleScript and close the Prisma client connection', async () => {
		consoleError.mockImplementation(() => {})
		const mockAppleScript = 'mock AppleScript content'
		const mockError = new Error('Mock error')

		vi.mocked(readFile).mockResolvedValue(mockAppleScript)
		vi.mocked(runAppleScript).mockRejectedValue(mockError)

		const disconnectSpy = vi.spyOn(prisma, '$disconnect')

		await expect(processEntries()).rejects.toThrow('Mock error')
		expect(disconnectSpy).toHaveBeenCalled()
	})

	it('should close the Prisma client connection after successful operation', async () => {
		const mockAppleScript = 'mock AppleScript content'
		const mockOutput = await readFixture('entries', '1').then(
			(data) => data.output,
		)

		vi.mocked(readFile).mockResolvedValue(mockAppleScript)
		vi.mocked(runAppleScript).mockResolvedValue(mockOutput)

		const disconnectSpy = vi.spyOn(prisma, '$disconnect')

		await processEntries()

		expect(disconnectSpy).toHaveBeenCalled()
	})
})
