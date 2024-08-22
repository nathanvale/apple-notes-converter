set itemDelimiter to "__________" & return

tell application "Notes"
	set filteredNotes to ""
	try
		set noteList to notes of folder "Gratitude Journal"
		set noteCount to count of noteList
		
		repeat with i from 1 to noteCount
			set n to item i of noteList
			set noteId to id of n
			set noteTitle to name of n
			set noteContent to body of n
			set noteText to noteId & "----------" & noteTitle & "----------" & noteContent
			
			if i is not noteCount then
				set noteText to noteText & itemDelimiter
			end if
			
			set filteredNotes to filteredNotes & noteText
		end repeat
		
	on error errMsg number errNum
		display dialog "An error occurred: " & errMsg & " (" & errNum & ")"
	end try
	
	return filteredNotes
end tell
