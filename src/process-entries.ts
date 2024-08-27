import { readFile } from 'fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'path'
import {
	type AppleScriptNote,
	parseAppleScriptOutput,
} from './parse-apple-script-output'
import { prisma } from './utils/db.server'
import { runAppleScript } from './utils/run-apple-script'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..') // Get the directory name

export async function processEntries() {
	try {
		const appleScriptPath = join(__dirname, 'get-journal-entries.applescript')
		const appleScript = await readFile(appleScriptPath, 'utf8')

		const output = await runAppleScript(appleScript)

		// Parse the AppleScript output
		const entries = parseAppleScriptOutput(output)

		// Insert notes into the database using Prisma
		await prisma.entry.createMany({
			data: entries.map((entry: AppleScriptNote) => {
				return {
					title: entry.title,
					content: entry.content,
				}
			}),
		})

		console.log('Entries have been inserted into the database successfully.')

		// Close the Prisma client connection after all operations are done
		await prisma.$disconnect()
	} catch (error) {
		await prisma.$disconnect()
		console.error('An error occurred:', error)
		throw error
	}
}
