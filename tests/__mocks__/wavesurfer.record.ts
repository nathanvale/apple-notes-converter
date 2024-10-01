// __mocks__/wavesurfer.record.ts

import { vi } from 'vitest'

// Define the events and their corresponding data types
interface RecordPluginEvents {
	'record-progress': number // Represents milliseconds elapsed
	'record-end': Blob // Represents the recorded audio blob
	// Add other events as needed
}

// Create a union type of all event names
type RecordPluginEventName = keyof RecordPluginEvents

// Define a generic callback type for event listeners
type RecordPluginCallback<E extends RecordPluginEventName> = (
	data: RecordPluginEvents[E],
) => void

// Define the RecordPlugin interface
interface RecordPlugin {
	on<E extends RecordPluginEventName>(
		event: E,
		callback: RecordPluginCallback<E>,
	): void
	once<E extends RecordPluginEventName>(
		event: E,
		callback: RecordPluginCallback<E>,
	): void
	un<E extends RecordPluginEventName>(
		event: E,
		callback: RecordPluginCallback<E>,
	): void
	emit<E extends RecordPluginEventName>(
		event: E,
		data: RecordPluginEvents[E],
	): void
	startMic(): void
	startRecording(): void
	stopRecording(): void
	cancel(): void
	destroy(): void
	_init(): void
}

// Extend the interface to include the trigger method for testing purposes
export interface RecordPluginMockInstance extends RecordPlugin {
	trigger<E extends RecordPluginEventName>(
		event: E,
		data: RecordPluginEvents[E],
	): void
}

class RecordPluginMock implements RecordPluginMockInstance {
	// Store event listeners internally within the mock
	private events: Partial<
		Record<RecordPluginEventName, RecordPluginCallback<RecordPluginEventName>[]>
	> = {}

	constructor() {}

	/**
	 * Registers an event listener for a specific event.
	 * @param event - The name of the event to listen for.
	 * @param callback - The callback function to invoke when the event is triggered.
	 */
	on<E extends RecordPluginEventName>(
		event: E,
		callback: RecordPluginCallback<E>,
	): () => void {
		if (!this.events[event]) {
			this.events[event] = []
		}
		this.events[event]!.push(
			callback as RecordPluginCallback<RecordPluginEventName>,
		)

		return () => this.un(event, callback)
	}

	/**
	 * Registers a one-time event listener for a specific event.
	 * @param event - The name of the event to listen for.
	 * @param callback - The callback function to invoke once when the event is triggered.
	 */
	once<E extends RecordPluginEventName>(
		event: E,
		callback: RecordPluginCallback<E>,
	): () => void {
		const onceCallback = (data: RecordPluginEvents[E]) => {
			callback(data)
			this.un(event, onceCallback)
		}
		return this.on(event, onceCallback as RecordPluginCallback<E>)
	}

	/**
	 * Unregisters an event listener for a specific event.
	 * @param event - The name of the event to unregister.
	 * @param callback - The callback function to remove.
	 */
	un<E extends RecordPluginEventName>(
		event: E,
		callback: RecordPluginCallback<E>,
	): void {
		if (!this.events[event]) return

		this.events[event] = this.events[event]!.filter(
			(registeredCallback) => registeredCallback !== callback,
		)
	}

	/**
	 * Emits an event, invoking all registered listeners with the provided data.
	 * @param event - The name of the event to emit.
	 * @param data - The data to pass to the event listeners.
	 */
	emit<E extends RecordPluginEventName>(
		event: E,
		data: RecordPluginEvents[E],
	): void {
		if (this.events[event]) {
			this.events[event]!.forEach((callback) => {
				;(callback as RecordPluginCallback<E>)(data)
			})
		}
	}

	// Mock other methods required by the RecordPlugin
	startMic = vi.fn()
	startRecording = vi.fn()
	stopRecording = () => {
		const blob = this.blob ?? createMockAudioBlob()
		this.emit('record-end', blob)
	}
	cancel = vi.fn()
	destroy = vi.fn()
	_init = vi.fn()

	blob: Blob | undefined

	// create function to set a mock blob on the insstance this.blob
	setBlob = (blob: Blob) => {
		this.blob = blob
	}

	// The trigger method helps simulate events in your tests
	trigger<E extends RecordPluginEventName>(
		event: E,
		data: RecordPluginEvents[E],
	): void {
		this.emit(event, data)
	}

	static create = () => {
		const instance = new RecordPluginMock()
		return instance
	}
}

export function createMockAudioBlob(
	durationInSeconds = 1,
	sampleRate = 44100,
): Blob {
	// Total number of samples (sample rate * duration in seconds)
	const totalSamples = sampleRate * durationInSeconds

	// Create a buffer to hold sample data (16-bit PCM, so use Int16Array)
	const audioData = new Int16Array(totalSamples)

	// Fill the buffer with mock data (e.g., a simple sine wave)
	for (let i = 0; i < totalSamples; i++) {
		audioData[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0x7fff // 440 Hz sine wave
	}

	// Create a Blob object
	const blob = new Blob([audioData.buffer], {
		type: 'application/octet-stream',
	})

	// Patch the blob to include the `arrayBuffer()` method if not present
	if (!blob.arrayBuffer) {
		;(blob as any).arrayBuffer = async function () {
			return audioData.buffer
		}
	}

	return blob
}

// Export the mock constructor as the default export
export default RecordPluginMock
