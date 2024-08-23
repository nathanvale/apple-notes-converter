import { runAppleScript } from './run-apple-script'

// Function to loop through all notes in the "GJB" folder
async function processNotesInFolder(folderName: string) {
	try {
		// Get the list of notes in the folder
		const listNotesScript = `
      tell application "Notes"
        set theFolder to folder "${folderName}"
        set noteTitles to name of notes in theFolder
        return noteTitles
      end tell
    `

		const notesList = await runAppleScript(listNotesScript)

		for (const noteTitle of notesList) {
			const script = `
      tell application "Notes"
          -- Find and activate the note
		  set theFolder to folder "${folderName}"
          set theNote to first note whose name is "${noteTitle}"
          activate
          show theNote
          
          -- Ensure the note body is focused
          tell application "System Events"
            tell process "Notes"
              repeat until frontmost is true
                set frontmost to true
              end repeat
              delay 0.5
              
              -- Click on the note body to focus it
              tell window 1
                click at {100, 200} -- Adjust these coordinates if necessary
              end tell
            end tell
            
            -- Select all text in the note
            keystroke "a" using {command down}
            delay 0.5
            keystroke "e" using {option down, command down} -- Copy the selected text
          end tell
        end tell
      `

			console.log(`Processing note: ${noteTitle}`)
			await runAppleScript(script)
		}

		console.log(`All notes in the folder "${folderName}" have been processed.`)
	} catch (error) {
		console.error(error)
	}
}

await (async () => {
	console.log('Removing formatting from notes...')
	await processNotesInFolder('GJB').catch((err) => {
		console.error('An error occurred:', err)
	})
})()
