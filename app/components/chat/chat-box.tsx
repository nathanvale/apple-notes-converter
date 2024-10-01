import { ArrowUp, Check, Loader, Mic, X } from 'lucide-react'
import { useCallback, useReducer, useRef } from 'react'
import { ulid } from 'ulid'
import { useOpenAiDictation } from '#app/routes/resources+/open-ai-dictation'
import { convertAudioBlobToMonoWav } from '#app/utils/audio'
import { cn } from '#app/utils/misc'
import { useWavesurferRecorder } from '#app/utils/use-wavesurfer-recorder'
import { TextareaAutoExpanding } from '../textarea-auto-expanding'
import { Button } from '../ui/button'
import { ChatBoxDataIds, ChatBoxLabels } from './chat-box.constants'

// Define the action types for message state
type MessageAction =
	| { type: 'SET_MESSAGE'; payload: string }
	| { type: 'RESET_MESSAGE' }

// Reducer function for message state
function messageReducer(state: string, action: MessageAction): string {
	switch (action.type) {
		case 'SET_MESSAGE':
			return action.payload
		case 'RESET_MESSAGE':
			return ''
		default:
			return state
	}
}
export const formatElaspedTime = (time: number) => {
	// time will be in milliseconds, convert it to mm:ss format
	const formattedTime = [
		Math.floor((time % 3600000) / 60000), // minutes
		Math.floor((time % 60000) / 1000), // seconds
	]
		.map((v) => (v < 10 ? '0' + v : v))
		.join(':')
	return formattedTime
}
export const ChatBox = () => {
	const fetcherKeyRef = useRef<string>(ulid())
	const fetcherKey = fetcherKeyRef.current
	const { submitTranscriptionAsync } = useOpenAiDictation({ fetcherKey })
	const [message, dispatchMessage] = useReducer(messageReducer, '')

	const handleRecordEnd = useCallback(
		async (blob: Blob) => {
			const wavBlob = await convertAudioBlobToMonoWav(blob)
			const formData = new FormData()
			formData.append('audio', wavBlob, 'recording.wav') // Append with a .wav filename
			const audioFile = formData.get('audio') as File
			if (!audioFile) {
				throw new Error('No audio file uploaded.')
			}
			if (!['audio/wav'].includes(audioFile.type)) {
				throw new Error('Only .wav files are allowed!')
			}
			if (audioFile.size > 25 * 1024 * 1024) {
				throw new Error('File size exceeds 25MB limit.')
			}
			const transition = await submitTranscriptionAsync(formData)
			dispatchMessage({ type: 'SET_MESSAGE', payload: transition })
		},
		[submitTranscriptionAsync],
	)
	const {
		waveformRef,
		state: recorderState,
		handleStartRecording,
		handleStopRecording,
		handleCancelRecording,
		handleRetryProcessing,
	} = useWavesurferRecorder(handleRecordEnd)

	// Helper function to render the action button
	const renderActionButton = () => {
		const errorClasses = 'bg-red-500 text-white hover:bg-red-600'
		const actionButtonClasses = cn('h-8 w-8 rounded-full')
		const actionButtonErrorClasses = cn(
			actionButtonClasses,
			recorderState.error && errorClasses,
		)

		if (message) {
			return (
				<Button size="icon" className={actionButtonClasses}>
					<ArrowUp className="h-6 w-6" strokeWidth={2} />
					<span className="sr-only">Send message</span>
				</Button>
			)
		}

		if (recorderState.isProcessing) {
			return (
				<Button size="icon" disabled className={actionButtonErrorClasses}>
					<Loader className="h-5 w-5 animate-spin" />
					<span className="sr-only">Processing...</span>
				</Button>
			)
		}

		if (!recorderState.isRecording || recorderState.error) {
			return (
				<Button
					size="icon"
					onClick={handleStartRecording}
					className={actionButtonClasses}
					aria-describedby="error-message"
				>
					<Mic className="h-5 w-5" />
					<span className="sr-only">Start dictation</span>
				</Button>
			)
		}

		// If recording is in progress
		return (
			<Button
				size="icon"
				onClick={handleStopRecording}
				className={actionButtonErrorClasses}
			>
				<Check className="h-4 w-4" strokeWidth={3} />
				<span className="sr-only">Stop dictation</span>
			</Button>
		)
	}

	// Helper function to render the timer or retry button
	const renderTimerOrRetry = () => {
		const actionItemClasses = 'h-8 w-10 flex items-center justify-center'
		if (recorderState.error) {
			return (
				<Button
					variant="ghost"
					className={cn(
						actionItemClasses,
						'font-semibold text-red-500 hover:text-red-600',
					)}
					onClick={handleRetryProcessing}
				>
					Retry
				</Button>
			)
		} else if (recorderState.isRecording) {
			return (
				<div className={actionItemClasses}>
					<span
						role="timer"
						className="text-sm font-semibold text-primary"
						aria-live="polite"
						aria-atomic="true"
						aria-label={`Elapsed time: ${recorderState.secondsElapsed}`}
					>
						{formatElaspedTime(recorderState.secondsElapsed)}
					</span>
				</div>
			)
		} else {
			return null
		}
	}

	return (
		<div className="w-full">
			<div className="m-auto w-full px-3 text-base md:px-4 lg:px-1 xl:px-5">
				<div className="mx-auto flex flex-1 gap-4 text-base md:max-w-3xl md:gap-5 lg:max-w-[40rem] lg:gap-6 xl:max-w-[48rem]">
					<div className="w-full">
						<div className="flex w-full flex-col gap-1.5 rounded-[26px] bg-secondary p-1.5 transition-colors">
							<div className="flex items-center gap-1.5 pl-2 pr-2 md:gap-2">
								{recorderState.isRecording && (
									<Button
										size="icon"
										onClick={handleCancelRecording}
										className={cn(
											'h-6 w-6 rounded-full',
											recorderState.error &&
												'bg-red-500 text-white hover:bg-red-600',
										)}
										disabled={recorderState.isProcessing}
									>
										<X className="h-4 w-4" strokeWidth={2} />
										<span className="sr-only">
											{ChatBoxLabels.CANCEL_DICTATION}
										</span>
									</Button>
								)}
								<div
									data-testid={ChatBoxDataIds.WAVEFORM}
									className={cn(
										'flex h-10 w-full flex-1 items-center',
										!recorderState.isRecording && 'hidden',
									)}
								>
									<div className="relative h-6 w-full">
										<div ref={waveformRef}></div>
									</div>
								</div>

								{renderTimerOrRetry()}

								{!recorderState.isRecording && !recorderState.error && (
									<TextareaAutoExpanding
										onChange={(event) =>
											dispatchMessage({
												type: 'SET_MESSAGE',
												payload: event.target.value,
											})
										}
										value={message}
										placeholder={ChatBoxLabels.PLACEHOLDER}
										aria-describedby="error-message"
										className="flex-1 pl-2"
									/>
								)}
								<div className="flex items-center justify-start">
									{renderActionButton()}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="relative w-full px-2 py-2 text-center text-xs text-red-500 empty:hidden md:px-[60px]">
				<span id="error-message" role="alert" aria-live="assertive">
					{recorderState.error}
				</span>
			</div>
		</div>
	)
}
