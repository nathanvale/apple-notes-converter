let mediaRecorder
let recordedChunks = []

const recordButton = document.getElementById('recordButton')
const transcriptionResult = document.getElementById('transcriptionResult')

recordButton.addEventListener('click', async () => {
	if (!mediaRecorder || mediaRecorder.state === 'inactive') {
		startRecording()
	} else if (mediaRecorder.state === 'recording') {
		stopRecording()
	}
})

async function startRecording() {
	const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
	mediaRecorder = new MediaRecorder(stream)

	mediaRecorder.ondataavailable = (event) => {
		if (event.data.size > 0) {
			recordedChunks.push(event.data)
		}
	}
	mediaRecorder.onstop = async () => {
		const blob = new Blob(recordedChunks, {
			type: 'audio/wav',
		})
		recordedChunks = []

		const formData = new FormData()
		formData.append('audio', blob, 'recording.wav')

		const response = await fetch('/upload', {
			method: 'POST',
			body: formData,
		})

		const result = await response.json()
		transcriptionResult.textContent = `Transcription: ${result.transcription}`
	}

	mediaRecorder.start()
	recordButton.textContent = 'Stop Recording'
}

function stopRecording() {
	mediaRecorder.stop()
	recordButton.textContent = 'Start Recording'
}
