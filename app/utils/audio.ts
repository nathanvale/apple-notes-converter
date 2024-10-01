import audioBufferToWav from 'audiobuffer-to-wav'

/**
 * Converts an audio Blob to a mono WAV Blob with a specified sample rate.
 * Suitable for coverting audio for OpenAI's Speech API.
 *
 * @param audioBlob - The input audio Blob to be converted.
 * @param targetSampleRate - The target sample rate for the output WAV file (default is 16,000 Hz).
 * @returns A Promise that resolves to a Blob containing the converted mono WAV audio.
 * @throws Will throw an error if the conversion process fails.
 *
 * @example
 * ```typescript
 * const audioBlob = new Blob([...], { type: 'audio/webm' });
 * const wavBlob = await convertAudioBlobToMonoWav(audioBlob, 16000);
 * ```
 */

export const convertAudioBlobToMonoWav = async (
	audioBlob: Blob,
	targetSampleRate = 16000,
): Promise<Blob> => {
	try {
		// Create an AudioContext with the target sample rate of 16,000 Hz
		const audioContext = new AudioContext()

		// Convert the webm blob to an ArrayBuffer
		const arrayBuffer = await audioBlob.arrayBuffer()

		// Decode the audio data from the arrayBuffer
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

		// Create a new AudioContext for resampling to 16 kHz
		const offlineAudioContext = new OfflineAudioContext(
			1, // Mono output
			(audioBuffer.length * targetSampleRate) / audioBuffer.sampleRate,
			targetSampleRate,
		)

		// Create a buffer source
		const bufferSource = offlineAudioContext.createBufferSource()
		bufferSource.buffer = audioBuffer

		// Connect the buffer source to the destination (i.e., the output)
		bufferSource.connect(offlineAudioContext.destination)
		bufferSource.start(0)

		// Start rendering the audio
		const resampledBuffer = await offlineAudioContext.startRendering()

		// Convert the resampled mono audio buffer to WAV format
		const wavBuffer = audioBufferToWav(resampledBuffer)

		// Create a new Blob with the WAV buffer and correct MIME type
		return new Blob([wavBuffer], { type: 'audio/wav' })
	} catch (error) {
		console.error('Error converting audio blob to a mono wav blob:', error)
		throw error
	}
}
