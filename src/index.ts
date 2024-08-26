import 'dotenv/config'
import { processNotes } from './processNotes'

await (async () => {
	await (async () => {
		await processNotes()
	})()
})()
