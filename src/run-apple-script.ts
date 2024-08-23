import applescript from 'applescript'

export function runAppleScript(script: string): Promise<string> {
	return new Promise((resolve, reject) => {
		applescript.execString(script, (error, result) => {
			if (error) {
				reject(`Error: ${error}`)
			} else {
				resolve(result)
			}
		})
	})
}
