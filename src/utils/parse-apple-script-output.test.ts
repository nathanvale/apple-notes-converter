import { describe, it, expect } from 'vitest'
import { consoleError } from '#tests/setup/setup-test-env.js'
import {
	parseAppleScriptOutput,
	type AppleScriptNote,
} from './parse-apple-script-output'

describe('parseAppleScriptOutput', () => {
	it('should correctly parse valid AppleScript output', () => {
		consoleError.mockImplementation(() => {})
		const output = `id1----------Title 1----------Content 1__________id2----------Title 2----------Content 2__________`
		const expected: AppleScriptNote[] = [
			{ id: 'id1', title: 'Title 1', content: 'Content 1' },
			{ id: 'id2', title: 'Title 2', content: 'Content 2' },
		]

		expect(parseAppleScriptOutput(output)).toEqual(expected)
	})

	it('should correctly parse valid AppleScript output with missing props', () => {
		consoleError.mockImplementation(() => {})
		const output = `--------------------__________id2----------Title 2----------Content 2__________`
		const expected: AppleScriptNote[] = [
			{ id: '', title: '', content: '' },
			{ id: 'id2', title: 'Title 2', content: 'Content 2' },
		]

		expect(parseAppleScriptOutput(output)).toEqual(expected)
	})

	it('should throw an error if note format is invalid', () => {
		consoleError.mockImplementation(() => {})
		const output = `id1----------Title 1----------Content 1__________Invalid Note Format`

		expect(() => parseAppleScriptOutput(output)).toThrow('Invalid note format')
	})

	it('should throw an error if failed to parse AppleScript output', () => {
		consoleError.mockImplementation(() => {})
		const output = 'Invalid content without proper delimiters'

		expect(() => parseAppleScriptOutput(output)).toThrow('Invalid note format')
	})
})
