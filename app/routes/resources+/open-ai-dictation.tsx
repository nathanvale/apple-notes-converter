import { type ActionFunctionArgs, json } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import OpenAI from 'openai'
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { type RecordRTCPromisesHandler } from 'recordrtc'
import { Button } from '#app/components/ui/button'
import { type ErrorResponse, type SuccessResponse } from '#app/types/api'
import { prisma } from '#node/utils/db.server'

export type OpenAiDictationResponse = SuccessResponse | ErrorResponse

type CustomError = Error & {
	code?: string
	message: string
	param?: string
	type?: string
}

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

		if (!['audio/wav'].includes(audioFile.type)) {
			return errorResponse('Only .wav allowed!')
		}

		if (audioFile.size > 10 * 1024 * 1024) {
			return errorResponse('File size exceeds 10MB limit.')
		}

		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		})

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
	} catch (error: unknown) {
		const err = error as CustomError

		const serverError = 'An error occured on the server.'

		if (err.type && err.message) {
			const [statusStr, ...messageParts] = err.message.trim().split(' ')
			const status = parseInt(statusStr || '500', 10)
			const message = messageParts.join(' ').trim() || serverError
			return errorResponse(message, status)
		}

		return errorResponse(serverError, 500)
	}
}

export function OpenAiDictationButton({ fetcherKey }: { fetcherKey: string }) {
	const { submitTranscription, isProcessing } = useOpenAiDictation({
		fetcherKey,
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
		<Button
			type="button"
			onClick={toggleDictation}
			disabled={isProcessing || (isUsingMicrophone && !isDictating)}
		>
			{isDictating ? 'Stop Recording' : 'Start Recording!'}
		</Button>
	)
}

export function useOpenAiDictation({ fetcherKey }: { fetcherKey: string }) {
	const fetcher = useFetcher<typeof action>({
		key: fetcherKey,
	})
	const [transcription, setTranscription] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const promiseRef = useRef<{
		resolve: (value: string) => void
		reject: (reason: Error) => void
	} | null>(null)

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data) {
			if (fetcher.data.status === 'success') {
				setTranscription(fetcher.data.data.transcription)
				setError(null)
				promiseRef.current?.resolve(fetcher.data.data.transcription)
			} else if (fetcher.data.status === 'error') {
				setError(fetcher.data.message)
				setTranscription(null)
				promiseRef.current?.reject(new Error(fetcher.data.message))
			}
		}
	}, [fetcher.state, fetcher.data])

	// Function to submit the transcription request as a Promise
	const submitTranscriptionAsync = (payload: FormData) => {
		fetcher.submit(payload, {
			action: '/resources/open-ai-dictation',
			method: 'post',
			encType: 'multipart/form-data',
		})

		// Return a new promise and store its resolve/reject handlers
		return new Promise<string>((resolve, reject) => {
			promiseRef.current = { resolve, reject }
		})
	}

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
		submitTranscriptionAsync,
		isProcessing: fetcher.state === 'submitting',
	}
}

interface UseVoiceRecorderProps {
	onDictationComplete: (audioBlob: Blob) => void
	onDictationError?: (error: string) => void
}

const useVoiceDictation = ({ onDictationComplete }: UseVoiceRecorderProps) => {
	const mediaRecorderRef = useRef<RecordRTCPromisesHandler | null>(null) // useRef instead of useState
	const { isUsingMicrophone, setIsUsingMicrophone } = useDictationContext()
	const [isDictating, setDictating] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const startDictating = async () => {
		if (!isDictating && !isUsingMicrophone) {
			try {
				const { RecordRTCPromisesHandler, StereoAudioRecorder } = await import(
					'recordrtc'
				)
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				})
				const recorder = new RecordRTCPromisesHandler(stream, {
					mimeType: 'audio/wav',
					recorderType: StereoAudioRecorder,
					bufferSize: 2048,
					numberOfAudioChannels: 1, // Mono recording to reduce file size
					desiredSampRate: 22050,
				})
				mediaRecorderRef.current = recorder // Use ref to store the recorder
				await recorder.startRecording()
				setDictating(true)
				setIsUsingMicrophone(true)
			} catch (error) {
				const err = error as Error
				console.error('Error accessing microphone:', err.message)
				setError(err.message)
			}
		}
	}

	const stopDictating = async () => {
		const mediaRecorder = mediaRecorderRef.current // Access from ref
		if (mediaRecorder && isDictating) {
			await mediaRecorder.stopRecording()
			const audioBlob = await mediaRecorder.getBlob()
			await mediaRecorder.destroy()
			mediaRecorderRef.current = null // Set ref to null without causing a re-render
			onDictationComplete(audioBlob)
			setDictating(false)
			setIsUsingMicrophone(false)
		}
	}

	const toggleDictation = async () => {
		if (!isDictating) {
			await startDictating()
		} else {
			await stopDictating()
		}
	}

	// Cleanup effect when component unmounts
	useEffect(() => {
		return () => {
			const cleanUp = async () => {
				if (mediaRecorderRef.current) {
					await mediaRecorderRef.current.destroy()
					mediaRecorderRef.current = null
					setDictating(false)
					setIsUsingMicrophone(false)
				}
			}
			void cleanUp()
		}
	}, [setIsUsingMicrophone])

	return {
		error,
		isDictating,
		isUsingMicrophone,
		toggleDictation,
	}
}

interface DictationContextProps {
	isUsingMicrophone: boolean
	setIsUsingMicrophone: (value: boolean) => void
}

const DictationContext = createContext<DictationContextProps | undefined>(
	undefined,
)

export const useDictationContext = (): DictationContextProps => {
	const context = useContext(DictationContext)
	if (!context) {
		throw new Error(
			'useDictationContext must be used within a DictationProvider',
		)
	}
	return context
}

interface DictationProviderProps {
	children: ReactNode
}

export const DictationProvider = ({
	children,
}: DictationProviderProps): JSX.Element => {
	const [isUsingMicrophone, setIsUsingMicrophone] = useState(false)
	return (
		<DictationContext.Provider
			value={{ isUsingMicrophone, setIsUsingMicrophone }}
		>
			{children}
		</DictationContext.Provider>
	)
}
