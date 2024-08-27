/* c8 ignore start */
import 'dotenv/config'
import { processEntries } from './process-entries'

await (async () => {
	await processEntries()
})()
