// vitest.setup.ts or at the top of your test file
import { vi } from 'vitest'

class MockAudioBuffer implements AudioBuffer {
	numberOfChannels: number
	length: number
	sampleRate: number
	duration: number

	constructor({
		numberOfChannels = 2,
		length = 44100,
		sampleRate = 44100,
	} = {}) {
		this.numberOfChannels = numberOfChannels
		this.length = length
		this.sampleRate = sampleRate
		this.duration = length / sampleRate
	}

	// Method to retrieve channel data
	getChannelData(channel: number): Float32Array {
		if (channel >= this.numberOfChannels) {
			throw new Error('Invalid channel number')
		}
		return new Float32Array(this.length)
	}

	// Methods to copy data to and from channels
	copyToChannel(source: Float32Array, channelNumber: number): void {
		if (channelNumber >= this.numberOfChannels) {
			throw new Error('Invalid channel number')
		}
	}

	copyFromChannel(destination: Float32Array, channelNumber: number): void {
		if (channelNumber >= this.numberOfChannels) {
			throw new Error('Invalid channel number')
		}
	}
}

class MockAudioContext {
	createBufferSource() {
		return {
			buffer: null,
			connect: vi.fn(),
			start: vi.fn(),
		}
	}

	decodeAudioData() {
		return Promise.resolve({
			length: 1024,
			sampleRate: 48000,
		})
	}

	close() {
		return Promise.resolve()
	}
}

class MockOfflineAudioContext {
	constructor(
		public numberOfChannels: number,
		public length: number,
		public sampleRate: number,
	) {}

	createBufferSource() {
		return {
			buffer: null,
			connect: vi.fn(),
			start: vi.fn(),
		}
	}

	startRendering() {
		// Return a mock AudioBuffer object
		return Promise.resolve({
			getChannelData: () => new Float32Array(1024),
			sampleRate: this.sampleRate,
			length: this.length,
			numberOfChannels: this.numberOfChannels,
		})
	}

	destination = {}
}

global.AudioContext = MockAudioContext as any
global.OfflineAudioContext = MockOfflineAudioContext as any
global.AudioBuffer = MockAudioBuffer as any
global.HTMLMediaElement.prototype.pause = () => {
	// No-op (no operation) since we only need this for testing
}

global.HTMLMediaElement.prototype.load = () => {
	// No-op (no operation) since we only need this for testing
}
