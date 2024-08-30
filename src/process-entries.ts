import { readFile } from 'fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'path'
import { type ActionItem, type Entry, type KeyEvent } from '@prisma/client'
import { prisma } from './utils/db.server'
import { parseAppleScriptOutput } from './utils/parse-apple-script-output'
import { parseJournal, type ParsedJournal } from './utils/parse-journal'
import { runAppleScript } from './utils/run-apple-script'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..') // Get the directory name

async function convertJsonToPrismaModels(jsonOutput: ParsedJournal) {
	const {
		date,
		title,
		journalEntry,
		assessment,
		keyEvents,
		actionItems,
		notes,
	} = jsonOutput

	// Create the Entry first
	const entry: Entry = await prisma.entry.create({
		data: {
			title,
			content: journalEntry,
			date: new Date(date),
			assessment: assessment,
			notes: notes, // Assuming no notes are provided in this case
		},
	})

	// Create the KeyEvents
	const keyEventPromises = keyEvents.map((event: string) =>
		prisma.keyEvent.create({
			data: {
				event,
				entryId: entry.id, // Link to the created Entry
			},
		}),
	)

	const createdKeyEvents: KeyEvent[] = []
	for (const keyEventPromise of keyEventPromises) {
		const createdKeyEvent = await keyEventPromise
		createdKeyEvents.push(createdKeyEvent)
	}

	// Create the ActionItems
	const actionItemPromises = actionItems.map((action: string) =>
		prisma.actionItem.create({
			data: {
				action,
				entryId: entry.id, // Link to the created Entry
			},
		}),
	)

	const createdActionItems: ActionItem[] = []
	for (const actionItemPromise of actionItemPromises) {
		const createdActionItem = await actionItemPromise
		createdActionItems.push(createdActionItem)
	}

	return {
		entry,
		keyEvents: createdKeyEvents,
		actionItems: createdActionItems,
	}
}

export async function processEntries() {
	try {
		const appleScriptPath = join(__dirname, 'get-journal-entries.applescript')
		const appleScript = await readFile(appleScriptPath, 'utf8')

		const output = await runAppleScript(appleScript)

		// Parse the AppleScript output
		const entries = parseAppleScriptOutput(output)

		// Process each entry sequentially
		for (const entry of entries) {
			// Parse the journal entry
			const parsedJournal = parseJournal(entry.content)

			// Convert the parsed journal entry to Prisma models and insert into database
			await convertJsonToPrismaModels(parsedJournal)
		}

		console.log('Entries have been inserted into the database successfully.')

		// Close the Prisma client connection after all operations are done
		await prisma.$disconnect()
	} catch (error) {
		await prisma.$disconnect()
		console.error('An error occurred:', error)
		throw error
	}
}
