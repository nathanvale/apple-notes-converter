import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { axe } from 'jest-axe'
import { act } from 'react'
import {
	beforeEach,
	describe,
	expect,
	type MockInstance,
	test,
	vi,
} from 'vitest'
import RecordPluginMock, {
	type RecordPluginMockInstance,
} from '#tests/__mocks__/wavesurfer.record'
import { createRemixStubHelper } from '#tests/helpers'
import { consoleError } from '#tests/setup/setup-test-env'
import { ChatBox, formatElaspedTime } from './chat-box'
import { ChatBoxDataIds, ChatBoxLabels } from './chat-box.constants'

vi.mock(
	'wavesurfer.js/dist/plugins/record.esm.js',
	async () => await import('#tests/__mocks__/wavesurfer.record'),
)

describe('ChatBox Component', () => {
	let createRecordPluginSpy: MockInstance<() => RecordPluginMock>

	beforeEach(() => {
		createRecordPluginSpy = vi.spyOn(RecordPluginMock, 'create')
		consoleError.mockImplementation(() => {})
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('should have no accessibility violations', async () => {
		const RemixStub = createRemixStubHelper(ChatBox)
		await act(async () => {
			const { container } = render(<RemixStub />)
			const results = await axe(container)
			expect(results).toHaveNoViolations()
		})
	})

	test('renders initial UI elements', async () => {
		const RemixStub = createRemixStubHelper(ChatBox)

		render(<RemixStub />)
		await act(async () => {
			expect(ChatBoxPage.getTextArea()).toBeInTheDocument()
		})
		expect(ChatBoxPage.getStartDictationButton()).toBeInTheDocument()
		expect(ChatBoxPage.getWaveform()).toHaveClass('hidden')
	})

	test('shows send button when message is typed', async () => {
		const RemixStub = createRemixStubHelper(ChatBox)
		render(<RemixStub />)
		await ChatBoxPage.typeMessage('Hello')
		expect(ChatBoxPage.getSendButton()).toBeInTheDocument()
		expect(ChatBoxPage.getStopDictationButton()).not.toBeInTheDocument()
		expect(ChatBoxPage.getWaveform()).toHaveClass('hidden')
		expect(ChatBoxPage.getCancelDictationButton()).not.toBeInTheDocument()
		expect(ChatBoxPage.getProcessingButton()).not.toBeInTheDocument()
		expect(ChatBoxPage.getRetryButton()).not.toBeInTheDocument()
	})

	test('starts recording when mic button is clicked', async () => {
		const RemixStub = createRemixStubHelper(ChatBox)
		render(<RemixStub />)
		await ChatBoxPage.clickStartDictation()
		expect(ChatBoxPage.getWaveform()).not.toHaveClass('hidden')
		expect(ChatBoxPage.getStartDictationButton()).not.toBeInTheDocument()
		expect(ChatBoxPage.getStopDictationButton()).toBeInTheDocument()
		expect(ChatBoxPage.getCancelDictationButton()).toBeInTheDocument()
		expect(ChatBoxPage.getProcessingButton()).not.toBeInTheDocument()
		expect(ChatBoxPage.getRetryButton()).not.toBeInTheDocument()
	})

	test('shows recording UI elements when recording', async () => {
		const RemixStub = createRemixStubHelper(ChatBox)
		render(<RemixStub />)
		await ChatBoxPage.clickStartDictation()
		expect(ChatBoxPage.getStartDictationButton()).not.toBeInTheDocument()
		expect(ChatBoxPage.getStopDictationButton()).toBeInTheDocument()
		expect(ChatBoxPage.getTimer()).toBeInTheDocument()
		expect(ChatBoxPage.getWaveform()).not.toHaveClass('hidden')
		expect(ChatBoxPage.getCancelDictationButton()).toBeInTheDocument()
		expect(ChatBoxPage.getProcessingButton()).not.toBeInTheDocument()
		expect(createRecordPluginSpy).toHaveBeenCalledTimes(1)
		await ChatBoxPage.triggerRecordProgress(createRecordPluginSpy, 3000)
		expect(ChatBoxPage.getTimer()).toHaveTextContent('00:03')
	})

	test('successfully transcribes a dictation when stop button is clicked', async () => {
		const RemixStub = createRemixStubHelper(ChatBox, [
			{
				path: '/resources/open-ai-dictation',
				action: async ({ request }) => {
					// Simulate server processing
					await new Promise((resolve) => setTimeout(resolve, 20))
					if (request.method === 'POST') {
						return new Response(
							JSON.stringify({
								status: 'success',
								data: {
									transcription: 'One, two, three.',
								},
							}),
							{
								status: 200,
								headers: { 'Content-Type': 'application/json' },
							},
						)
					}
					return new Response('Method Not Allowed', { status: 405 })
				},
			},
		])
		render(<RemixStub />)
		await ChatBoxPage.clickStartDictation()
		await ChatBoxPage.triggerRecordProgress(createRecordPluginSpy, 3000)
		expect(ChatBoxPage.getTimer()).toHaveTextContent('00:03')
		await ChatBoxPage.clickStopDictation()
		await waitFor(() => {
			expect(ChatBoxPage.getProcessingButton()).toBeInTheDocument()
		})
		await waitFor(() => {
			expect(ChatBoxPage.getTextArea()).toHaveValue('One, two, three.')
		})
	})

	test('unsuccessfully transcribes a dictation with an error', async () => {
		const RemixStub = createRemixStubHelper(ChatBox, [
			{
				path: '/resources/open-ai-dictation',
				action: async ({ request }) => {
					// Simulate server processing
					await new Promise((resolve) => setTimeout(resolve, 20))
					if (request.method === 'POST') {
						return new Response(
							JSON.stringify({
								status: 'error',
								message: 'Something nasty happened!',
							}),
							{
								status: 400,
								headers: { 'Content-Type': 'application/json' },
							},
						)
					}
					return new Response('Method Not Allowed', { status: 405 })
				},
			},
		])
		render(<RemixStub />)
		await ChatBoxPage.clickStartDictation()
		await ChatBoxPage.triggerRecordProgress(createRecordPluginSpy, 3000)
		expect(ChatBoxPage.getTimer()).toHaveTextContent('00:03')
		await ChatBoxPage.clickStopDictation()
		await waitFor(() => {
			expect(ChatBoxPage.getProcessingButton()).toBeInTheDocument()
		})

		await waitFor(() => {
			expect(ChatBoxPage.getRetryButton()).toBeInTheDocument()
		})
		expect(ChatBoxPage.getErrorMessage()).toHaveTextContent(
			'Something nasty happened!',
		)
		await ChatBoxPage.clickRetry()
		await waitFor(() => {
			expect(ChatBoxPage.getProcessingButton()).toBeInTheDocument()
		})
		await waitFor(() => {
			expect(ChatBoxPage.getRetryButton()).toBeInTheDocument()
		})
		await ChatBoxPage.clickCancelDictation()
		await act(async () => {
			expect(ChatBoxPage.getTextArea()).toBeInTheDocument()
		})
		expect(ChatBoxPage.getCancelDictationButton()).not.toBeInTheDocument()
		expect(ChatBoxPage.getTimer()).not.toBeInTheDocument()
		expect(ChatBoxPage.getStopDictationButton()).not.toBeInTheDocument()
		expect(ChatBoxPage.getStartDictationButton()).toBeInTheDocument()
		expect(ChatBoxPage.getWaveform()).toHaveClass('hidden')
	})

	test('cancels recording when cancel button is clicked', async () => {
		const RemixStub = createRemixStubHelper(ChatBox)
		render(<RemixStub />)
		await ChatBoxPage.clickStartDictation()
		await ChatBoxPage.triggerRecordProgress(createRecordPluginSpy, 3000)
		expect(ChatBoxPage.getTimer()).toHaveTextContent('00:03')
		await ChatBoxPage.clickCancelDictation()
		await act(async () => {
			expect(ChatBoxPage.getTextArea()).toBeInTheDocument()
		})
		expect(ChatBoxPage.getCancelDictationButton()).not.toBeInTheDocument()
		expect(ChatBoxPage.getTimer()).not.toBeInTheDocument()
		expect(ChatBoxPage.getStopDictationButton()).not.toBeInTheDocument()
		expect(ChatBoxPage.getStartDictationButton()).toBeInTheDocument()
		expect(ChatBoxPage.getWaveform()).toHaveClass('hidden')
	})
})

class ChatBoxPage {
	static getErrorMessage() {
		return screen.getByRole('alert')
	}

	static getTextArea() {
		return screen.getByPlaceholderText(ChatBoxLabels.PLACEHOLDER)
	}

	static getStartDictationButton() {
		return screen.queryByRole('button', { name: ChatBoxLabels.START_DICTATION })
	}

	static getSendButton() {
		return screen.queryByRole('button', { name: ChatBoxLabels.SEND_MESSAGE })
	}

	static getStopDictationButton() {
		return screen.queryByRole('button', { name: ChatBoxLabels.STOP_DICTATION })
	}

	static getCancelDictationButton() {
		return screen.queryByRole('button', {
			name: ChatBoxLabels.CANCEL_DICTATION,
		})
	}

	static getProcessingButton() {
		return screen.queryByRole('button', { name: ChatBoxLabels.PROCESSING })
	}

	static getRetryButton() {
		return screen.queryByRole('button', { name: ChatBoxLabels.RETRY })
	}

	static getTimer() {
		return screen.queryByRole('timer', {
			name: new RegExp(`^${ChatBoxLabels.ELAPSED_TIME}`),
		})
	}

	static getWaveform() {
		return screen.getByTestId(ChatBoxDataIds.WAVEFORM)
	}

	static async typeMessage(message: string) {
		const textarea = this.getTextArea()
		fireEvent.change(textarea, { target: { value: message } })
	}

	static async clickStartDictation() {
		const button = this.getStartDictationButton()
		if (button) {
			fireEvent.click(button)
		}
	}

	static async clickStopDictation() {
		const button = this.getStopDictationButton()
		if (button) {
			fireEvent.click(button)
		}
	}

	static async clickCancelDictation() {
		const button = this.getCancelDictationButton()
		if (button) {
			fireEvent.click(button)
		}
	}

	static async clickRetry() {
		const button = this.getRetryButton()
		if (button) {
			fireEvent.click(button)
		}
	}

	static getRecordPluginInstance(
		createRecordPluginSpy: MockInstance<() => RecordPluginMock>,
	): RecordPluginMockInstance | undefined {
		return createRecordPluginSpy.mock.results[0]?.value as
			| RecordPluginMockInstance
			| undefined
	}

	static async triggerRecordProgress(
		createRecordPluginSpy: MockInstance<() => RecordPluginMock>,
		milliseconds: number,
	) {
		await act(async () => {
			const recordPluginInstance = this.getRecordPluginInstance(
				createRecordPluginSpy,
			)
			if (recordPluginInstance) {
				recordPluginInstance.trigger('record-progress', milliseconds)
			}
		})
		await vi.waitFor(() => {
			expect(screen.getByRole('timer')).toHaveTextContent(
				formatElaspedTime(milliseconds),
			)
		})
	}

	static triggerRecordEnd(
		createRecordPluginSpy: MockInstance<() => RecordPluginMock>,
		blob: Blob,
	) {
		const recordPluginInstance = this.getRecordPluginInstance(
			createRecordPluginSpy,
		)
		if (recordPluginInstance) {
			recordPluginInstance.trigger('record-end', blob)
		}
	}
}
