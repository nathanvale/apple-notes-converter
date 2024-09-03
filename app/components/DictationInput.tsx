import React from 'react'
import {
	OpenAiDictationButton,
	useOpenAiDictation,
} from '#app/routes/resources+/open-ai-dictation'

export function DictationInput({ buttonId }: { buttonId: string }) {
	const { error, isProcessing, transcription, setTranscription } =
		useOpenAiDictation({ buttonId })
	return (
		<div>
			<input
				type="text"
				value={transcription || ''}
				onChange={(e) => setTranscription(e.target.value)}
				placeholder="Dictated text will appear here"
			/>
			<OpenAiDictationButton buttonId={buttonId} />
			{isProcessing && <p>Processing...</p>}
			{error && <p className="error">{error}</p>}
		</div>
	)
}
