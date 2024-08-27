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
		throw error
	}
}
