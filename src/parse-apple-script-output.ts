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
		throw error
	}
}
