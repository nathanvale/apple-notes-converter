interface SuccessResponse {
	status: 'success'
	data: {
		transcription: string
	}
}

interface ErrorResponse {
	status: 'error'
	message: string
}

export type ApiResponse = SuccessResponse | ErrorResponse
