import { runAppleScript } from './run-apple-script'

// Function to loop through all notes in the "GJB" folder
export async function formatEntries(folderName: string) {
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

			await runAppleScript(script)
		}
	} catch (error) {
		console.error(error)
		throw error // Rethrow the error to allow it to be caught by tests
	}
}

// await (async () => {
// 	console.log('Removing formatting from notes...')
// 	await processNotesInFolder('GJB').catch((err) => {
// 		console.error('An error occurred:', err)
// 	})
// })()
