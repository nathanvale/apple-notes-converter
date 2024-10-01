// useWavesurferRecorder.tsx
import { useWavesurfer } from '@wavesurfer/react'
import { useCallback, useEffect, useReducer, useRef } from 'react'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'

const DEFAULT_WAVE_COLOR = '#737373'
const ERROR_WAVE_COLOR = '#ef4444'

// Define the state interface
interface RecorderState {
	isRecording: boolean
	isProcessing: boolean
	error: string
	secondsElapsed: number
	transcription: string
}

// Define the action types
type RecorderAction =
	| { type: 'START_RECORDING' }
	| { type: 'STOP_RECORDING' }
	| { type: 'SET_PROCESSING'; payload: boolean }
	| { type: 'SET_TRANSCRIPTION'; payload: string }
	| { type: 'SET_ERROR'; payload: string }
	| { type: 'SET_SECONDS_ELAPSED'; payload: number }
	| { type: 'RESET_STATE' }

// Initial state
const initialState: RecorderState = {
	isRecording: false,
	isProcessing: false,
	error: '',
	secondsElapsed: 0,
	transcription: '',
}

// Reducer function
function reducer(state: RecorderState, action: RecorderAction): RecorderState {
	switch (action.type) {
		case 'START_RECORDING':
			return {
				...state,
				isRecording: true,
				error: '',
				secondsElapsed: 0,
			}
		case 'STOP_RECORDING':
			return { ...state, isRecording: false }
		case 'SET_PROCESSING':
			return { ...state, isProcessing: action.payload }
		case 'SET_TRANSCRIPTION':
			return { ...state, transcription: action.payload }
		case 'SET_ERROR':
			return { ...state, error: action.payload }
		case 'SET_SECONDS_ELAPSED':
			return { ...state, secondsElapsed: action.payload }
		case 'RESET_STATE':
			return { ...initialState }
		default:
			return state
	}
}

export function useWavesurferRecorder(
	onRecordingEnd: (blob: Blob) => Promise<void>,
) {
	const waveformRef = useRef<HTMLDivElement | null>(null)
	const [state, dispatch] = useReducer(reducer, initialState)
	const isCancelledRef = useRef(false)
	const recordedBlobRef = useRef<Blob | null>(null)
	const recordPlugin = useRef<RecordPlugin | null>(null)

	const { wavesurfer } = useWavesurfer({
		container: waveformRef,
		waveColor: DEFAULT_WAVE_COLOR,
		progressColor: DEFAULT_WAVE_COLOR,
		cursorColor: 'transparent',
		barWidth: 2,
		height: 24,
		barHeight: 2,
		barGap: 2,
		renderFunction,
		peaks: silentData,
		duration: 0.5,
		backend: 'MediaElement',
		normalize: true,
	})

	const resetState = useCallback(() => {
		dispatch({ type: 'RESET_STATE' })
		isCancelledRef.current = false
		recordedBlobRef.current = null
		wavesurfer?.empty()
		wavesurfer?.setOptions({
			waveColor: DEFAULT_WAVE_COLOR,
		})
	}, [wavesurfer])

	const handleRecordEnd = useCallback(
		async (blob: Blob) => {
			try {
				dispatch({ type: 'SET_PROCESSING', payload: true })
				await onRecordingEnd(blob)
				dispatch({ type: 'SET_PROCESSING', payload: false })
				dispatch({ type: 'STOP_RECORDING' })
			} catch (error) {
				dispatch({ type: 'SET_PROCESSING', payload: false })
				if (error instanceof Error) {
					dispatch({ type: 'SET_ERROR', payload: error.message })
				} else {
					dispatch({
						type: 'SET_ERROR',
						payload: 'An unexpected error occurred',
					})
				}
				wavesurfer?.setOptions({ waveColor: ERROR_WAVE_COLOR })
			}
		},
		[wavesurfer, onRecordingEnd],
	)

	const handleRetryProcessing = useCallback(async () => {
		dispatch({ type: 'SET_ERROR', payload: '' })
		wavesurfer?.setOptions({ waveColor: DEFAULT_WAVE_COLOR })
		if (recordedBlobRef.current) await handleRecordEnd(recordedBlobRef.current)
	}, [handleRecordEnd, wavesurfer])

	const handleStartRecording = useCallback(async () => {
		dispatch({ type: 'START_RECORDING' })
		isCancelledRef.current = false
		wavesurfer?.empty()
		wavesurfer?.setOptions({
			waveColor: DEFAULT_WAVE_COLOR,
		})
		await wavesurfer?.load('', silentData, 0.5)
		await recordPlugin.current?.startMic()
		await recordPlugin.current?.startRecording()
	}, [wavesurfer])

	const handleStopRecording = useCallback(async () => {
		isCancelledRef.current = false
		recordPlugin.current?.stopRecording()
	}, [])

	const handleCancelRecording = useCallback(async () => {
		if (state.error) {
			// If in a retry state, reset state variables directly
			resetState()
		} else if (state.isRecording) {
			// If recording is in progress, cancel it properly
			isCancelledRef.current = true
			// The 'record-end' event handler will handle resetting state
			recordPlugin.current?.stopRecording()
		}
	}, [state.error, state.isRecording, resetState])

	useEffect(() => {
		const initializeWaveSurfer = async () => {
			if (wavesurfer) {
				const recordPluginInstance = RecordPlugin.create({
					audioBitsPerSecond: 22050,
					scrollingWaveform: true,
					renderRecordedAudio: false,
					scrollingWaveformWindow: 10,
				})

				recordPlugin.current = wavesurfer.registerPlugin(recordPluginInstance)

				recordPlugin.current.on('record-progress', (time: number) => {
					dispatch({ type: 'SET_SECONDS_ELAPSED', payload: time })
				})

				recordPlugin.current.on('destroy', () => {
					recordPlugin.current?.unAll()
				})

				recordPlugin.current.on('record-end', async (blob: Blob) => {
					if (isCancelledRef.current) {
						// Recording was cancelled; do not process blob
						isCancelledRef.current = false // Reset the flag for future recordings
						dispatch({ type: 'STOP_RECORDING' }) // Update the recording state
						dispatch({ type: 'SET_SECONDS_ELAPSED', payload: 0 }) // Reset the timer
						dispatch({ type: 'SET_ERROR', payload: '' }) // Clear any error messages
						wavesurfer?.empty() // Clear the waveform
					} else {
						// Proceed with processing the recorded blob
						recordedBlobRef.current = blob
						await handleRecordEnd(blob)
					}
				})
			}
		}

		void initializeWaveSurfer()

		return () => {
			if (wavesurfer) {
				wavesurfer.destroy()
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [wavesurfer])

	return {
		waveformRef,
		state,
		handleStartRecording,
		handleStopRecording,
		handleCancelRecording,
		handleRetryProcessing,
		resetState,
	}
}

const MIN_BAR_HEIGHT = 8 // Small uniform bars for no-sound
const BAR_WIDTH = 2 // Narrow bars
const SPACING = 2 // Small space between bars

// Utility to get pixel ratio for high DPI displays
function getPixelRatio() {
	return Math.max(1, window.devicePixelRatio || 1)
}

// Custom render function to adjust bar height based on amplitude
const renderWaveform = (
	channelData: Array<Float32Array | number[]>,
	ctx: CanvasRenderingContext2D,
) => {
	const options = {
		barWidth: BAR_WIDTH,
		barGap: SPACING,
		barRadius: 0,
		barAlign: 'center',
		barHeight: 2,
	}

	const topChannel = channelData[0]
	if (!topChannel) {
		throw new Error('Top channel data is undefined')
	}
	const bottomChannel = channelData[1] || topChannel
	const length = topChannel.length

	let { width, height } = ctx.canvas
	width += 8
	const halfHeight = height / 2
	const pixelRatio = getPixelRatio()
	const vScale = options.barHeight || 1

	const barWidth = options.barWidth ? options.barWidth * pixelRatio : 1
	const barGap = options.barGap ? options.barGap * pixelRatio : 0
	const barRadius = options.barRadius || 0
	const barIndexScale = width / (barWidth + barGap) / length

	// Clear the canvas for redrawing
	ctx.clearRect(0, 0, width, height)

	ctx.beginPath()

	let prevX = 0
	let maxTop = 0
	let maxBottom = 0

	// Draw the bars
	for (let i = 0; i < length; i++) {
		const x = Math.floor(i * barIndexScale) // Use Math.floor for consistent pixel alignment
		if (x > prevX) {
			const topBarHeight = Math.round(maxTop * halfHeight * vScale)
			const bottomBarHeight = Math.round(maxBottom * halfHeight * vScale)
			let barHeight = topBarHeight + bottomBarHeight || 1

			// Ensure the minimum bar height is at least MIN_BAR_HEIGHT px
			barHeight = Math.max(barHeight, MIN_BAR_HEIGHT)

			// Vertical alignment
			let y = halfHeight - topBarHeight
			if (options.barAlign === 'top') {
				y = 0
			} else if (options.barAlign === 'bottom') {
				y = height - barHeight
			}

			// Draw the bar, fallback to rect if roundRect is not supported
			const rectFn = barRadius && 'roundRect' in ctx ? 'roundRect' : 'rect'
			//@ts-ignore
			ctx[rectFn](
				prevX * (barWidth + barGap),
				barHeight === MIN_BAR_HEIGHT ? halfHeight - 2 : y,
				barWidth,
				barHeight,
				barRadius,
			)

			// Update prevX and reset max values
			prevX = x
			maxTop = 0
			maxBottom = 0
		}

		// Track the max amplitude for the current batch
		const magnitudeTop = Math.abs(topChannel[i] || 0)
		const magnitudeBottom = Math.abs(bottomChannel[i] || 0)
		if (magnitudeTop > maxTop) maxTop = magnitudeTop
		if (magnitudeBottom > maxBottom) maxBottom = magnitudeBottom
	}

	// Finalize the drawing
	ctx.fill()
	ctx.closePath()
}

// Animation loop using requestAnimationFrame
export const renderFunction = (
	channelData: Array<Float32Array | number[]>,
	ctx: CanvasRenderingContext2D,
) => {
	const animate = () => {
		renderWaveform(channelData, ctx)
	}
	requestAnimationFrame(animate) // Sync with the browser's frame ratio
}

const silentData = [
	new Float32Array(500).fill(0.01), // Small values to render minimal bars
	new Float32Array(500).fill(0.01),
]
