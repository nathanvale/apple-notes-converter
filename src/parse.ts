// Function to parse the journal entry into JSON
export function parseJournal(entry: string) {
	const sections = entry.split(/##\s+/).map((s) => {
		return s.trim()
	})
	const [dateTitle, ...rest] = sections

	// Use regex to match the date pattern and capture the title
	const regex = /^(\d{4}\/\d{2}\/\d{2})\s*[-\s]\s*(.*)$/
	const match = dateTitle
		? dateTitle.match(regex) /* c8 ignore start */
		: null /* c8 ignore stop */

	let date = ''
	let title = ''

	if (match) {
		date = match[1]?.trim() /* c8 ignore start */ || '' /* c8 ignore stop */
		title = match[2]?.trim() /* c8 ignore start */ || '' /* c8 ignore stop */
	} else {
		throw new Error('The string does not match the expected pattern.')
	}

	const parseList = (text: string) =>
		text
			.split('\n')
			.filter((line) => line.trim().length > 0)
			.map((line) => line.replace(/^\s*[-•*]\s*/, '').trim())
			.slice(1) // Skip the first item

	const parseBody = (text: string) => {
		const [_first, ...body] = text.split('\n')
		return body.join('\n').trim()
	}

	const jsonOutput = {
		date,
		title,
		keyEvents: parseList(rest[0] || ''),
		actionItems: parseList(rest[1] || ''),
		journalEntry: parseBody(rest[2] || ''),
		assessment: parseBody(rest[3] || ''),
	}

	return jsonOutput
}
