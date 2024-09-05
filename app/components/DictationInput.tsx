import React, { useRef } from 'react'
import { ulid } from 'ulid'
import {
	OpenAiDictationButton,
	useOpenAiDictation,
} from '#app/routes/resources+/open-ai-dictation'
import { Input } from './ui/input'

export function DictationInput() {
	// Generate a unique fetcher key once per component mount
	const fetcherKeyRef = useRef<string>(ulid())
	const fetcherKey = fetcherKeyRef.current
	const { error, isProcessing, transcription, setTranscription } =
		useOpenAiDictation({ fetcherKey })
	return (
		<div className="flex flex-row items-center p-4">
			<Input
				type="text"
				value={transcription || ''}
				onChange={(e) => setTranscription(e.target.value)}
				placeholder="Dictated text will appear here"
				className="mr-2"
			/>
			<OpenAiDictationButton fetcherKey={fetcherKey} />
			{isProcessing && <p className="ml-2">Processing...</p>}
			{error && <p className="ml-2 error">{error}</p>}
		</div>
	)
}
