import React, { useRef } from 'react'
import { ulid } from 'ulid'
import {
	OpenAiDictationButton,
	useOpenAiDictation,
} from '#app/routes/resources+/open-ai-dictation'

export function DictationInput() {
	// Generate a unique fetcher key once per component mount
	const fetcherKeyRef = useRef<string>(ulid())
	const fetcherKey = fetcherKeyRef.current
	const { error, isProcessing, transcription, setTranscription } =
		useOpenAiDictation({ fetcherKey })
	return (
		<div>
			<input
				type="text"
				value={transcription || ''}
				onChange={(e) => setTranscription(e.target.value)}
				placeholder="Dictated text will appear here"
			/>
			<OpenAiDictationButton fetcherKey={fetcherKey} />
			{isProcessing && <p>Processing...</p>}
			{error && <p className="error">{error}</p>}
		</div>
	)
}
