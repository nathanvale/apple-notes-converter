import { readFile } from 'fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'path'
import Database from 'better-sqlite3'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..') // Get the directory name

export interface AppleScriptNote {
	id: string
	title: string
	content: string
}

export const parseAppleScriptOutput = (output: string): AppleScriptNote[] => {
	try {
		return output
			.split('__________')
			.filter(Boolean)
			.map((noteStr) => {
				if (!noteStr.includes('----------')) {
					console.error(noteStr)
					throw new Error('Invalid note format')
				}
				const [id, title, content] = noteStr.split('----------')
				const appleScriptNote: AppleScriptNote = {
					id: id?.trim() || '',
					title: title?.trim() || '',
					content: content?.trim() || '',
				}
				return appleScriptNote
			})
	} catch (error) {
		console.error(error)
		throw new Error('Failed to parse AppleScript output')
	}
}
await (async () => {
	if (!process.env.DATABASE_PATH) {
		console.error('DATABASE_PATH environment variable is not set.')
		return
	}
	// Resolve the DATABASE_PATH relative to the root directory
	const dbPath = join(process.cwd(), process.env.DATABASE_PATH)

	console.log('Database path:', dbPath)

	const db = new Database(dbPath)

	try {
		// Ensure the table exists before processing AppleScript output

		const appleScriptPath = join(__dirname, 'get-journal-entries.applescript')
		console.log(appleScriptPath)
		const appleScript = await readFile(appleScriptPath, 'utf8')

		const process = spawn('osascript', ['-e', appleScript])

		db.prepare(
			'CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT, content TEXT)',
		).run()

		let output = ''

		process.stdout.on('data', (data) => {
			output += data.toString()
		})

		process.stderr.on('data', (data) => {
			console.error(`Error: ${data}`)
		})

		process.on('close', (code) => {
			if (code !== 0) {
				console.error(`Process exited with code: ${code}`)
				return
			}

			const notes = parseAppleScriptOutput(output)

			const insert = db.prepare(
				'INSERT INTO notes (title, content) VALUES (?, ?)',
			)
			const insertMany = db.transaction((notes: AppleScriptNote[]) => {
				for (const note of notes) {
					insert.run(note.title, note.content)
				}
			})

			insertMany(notes)

			console.log('Notes have been inserted into the database successfully.')

			// Close the database after all operations are done
			db.close()
		})
	} catch (error) {
		console.error('An error occurred:', error)
		db.close() // Ensure the database is closed in case of error
	}
})()
