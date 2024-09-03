import { type ActionFunctionArgs, json } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import OpenAI from 'openai'
import { useEffect, useRef, useState } from 'react'
import { type ErrorResponse, type SuccessResponse } from '#app/types/api'
import { useDictationContext } from '#app/utils/providers/DictationProvider.js'
import { prisma } from '#node/utils/db.server'

export type OpenAiDictationResponse = SuccessResponse | ErrorResponse

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY, // Add your OpenAI API key in the environment variables
})

const errorResponse = (message: string, status: number = 400) => {
	return json<ErrorResponse>({ status: 'error', message }, { status })
}

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData()
		const audioFile = formData.get('audio') as File

		if (!audioFile) {
			return errorResponse('No audio file uploaded.')
		}

		if (!['audio/wav', 'audio/mpeg'].includes(audioFile.type)) {
			return errorResponse('Only .wav or .mp3 files are allowed!')
		}

		if (audioFile.size > 10 * 1024 * 1024) {
			return errorResponse('File size exceeds 10MB limit.')
		}

		const response = await openai.audio.transcriptions.create({
			file: audioFile, // Pass the readable stream directly
			model: 'whisper-1',
		})

		const savedTranscription = await prisma.speechTranscription.create({
			data: {
				transcription: response.text,
			},
		})

		return json<SuccessResponse>({
			status: 'success',
			data: { transcription: savedTranscription.transcription },
		})
	} catch (error) {
		console.error('Error during transcription:', error)
		return errorResponse('An error occurred while processing the audio.', 500)
	}
}

export function OpenAiDictationButton({ buttonId }: { buttonId: string }) {
	const { submitTranscription, isProcessing } = useOpenAiDictation({
		buttonId,
	})

	const onDictationComplete = (audioBlob: Blob) => {
		const formData = new FormData()
		formData.append('audio', audioBlob, 'recording.wav')
		submitTranscription(formData)
	}

	const { isDictating, toggleDictation, isUsingMicrophone } = useVoiceDictation(
		{
			onDictationComplete,
		},
	)

	return (
		<button
			type="button"
			onClick={toggleDictation}
			disabled={isProcessing || (isUsingMicrophone && !isDictating)}
		>
			{isDictating ? 'Stop Recording' : 'Start Recording!'}
		</button>
	)
}

export function useOpenAiDictation({ buttonId }: { buttonId: string }) {
	const fetcher = useFetcher<typeof action>({
		key: buttonId,
	})

	const [transcription, setTranscription] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data) {
			if (fetcher.data.status === 'success') {
				setTranscription(fetcher.data.data.transcription)
				setError(null)
			} else if (fetcher.data.status === 'error') {
				setError(fetcher.data.message)
				setTranscription(null)
			}
		}
	}, [fetcher.state, fetcher.data])

	return {
		setTranscription,
		transcription,
		error,
		submitTranscription: (payload: FormData) =>
			fetcher.submit(payload, {
				action: '/resources/open-ai-dictation',
				method: 'post',
				encType: 'multipart/form-data',
			}),
		isProcessing: fetcher.state === 'submitting',
	}
}

interface UseVoiceRecorderProps {
	onDictationComplete: (audioBlob: Blob) => void
	onDictationError?: (error: Error) => void
}

const useVoiceDictation = ({
	onDictationComplete,
	onDictationError,
}: UseVoiceRecorderProps) => {
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
	const { isUsingMicrophone, setIsUsingMicrophone } = useDictationContext()
	const [isDictating, setDictating] = useState(false)
	const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
	const recordedChunksRef = useRef<Blob[]>([]) // Use a ref to store the chunks

	useEffect(() => {
		if (mediaRecorder) {
			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					// Push to the ref's current array
					recordedChunksRef.current.push(event.data)
				}
			}

			mediaRecorder.onstop = () => {
				const blob = new Blob(recordedChunksRef.current, { type: 'audio/wav' })
				recordedChunksRef.current = [] // Clear recorded chunks in the ref

				// Stop and release the media stream to avoid memory leaks
				if (mediaStream) {
					mediaStream.getTracks().forEach((track) => track.stop())
				}

				onDictationComplete(blob)
			}
		}

		return () => {
			if (mediaRecorder) {
				mediaRecorder.ondataavailable = null
				mediaRecorder.onstop = null
				mediaRecorder.stream.getTracks().forEach((track) => track.stop()) // Stop all tracks
			}
			if (mediaStream) {
				mediaStream.getTracks().forEach((track) => track.stop()) // Stop the media stream tracks
			}
		}
	}, [mediaRecorder, mediaStream, onDictationComplete])

	const startDictating = async () => {
		if (!isDictating && !isUsingMicrophone) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				})
				const newMediaRecorder = new MediaRecorder(stream)
				setMediaStream(stream)
				setMediaRecorder(newMediaRecorder)
				newMediaRecorder.start()
				setDictating(true)
				setIsUsingMicrophone(true)
			} catch (error) {
				console.error('Error accessing microphone:', error)
				onDictationError?.(error as Error)
			}
		}
	}

	const stopDictating = () => {
		if (mediaRecorder && isDictating) {
			mediaRecorder.stop()
			setDictating(false)
			setIsUsingMicrophone(false)
		}
	}

	const toggleDictation = async () => {
		if (!isDictating) {
			await startDictating()
		} else {
			stopDictating()
		}
	}

	return {
		isDictating,
		isUsingMicrophone,
		toggleDictation,
	}
}
