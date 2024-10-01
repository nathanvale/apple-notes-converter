import { ChatBox } from '#app/components/chat/chat-box'
import { ChatResponse } from '#app/components/chat/chat-response'
import { ChatTurn } from '#app/components/chat/chat-turn'

export default function JournalEntries() {
	return (
		<div role="presentation" className="flex h-full flex-col">
			<div className="h-full flex-1 overflow-y-auto focus-visible:outline-0">
				<ChatTurn />
				<ChatResponse />
				<ChatTurn />
				<ChatResponse />
				<ChatTurn />
				<ChatResponse />
				<ChatTurn />
				<ChatResponse />
				<ChatTurn />
				<ChatResponse isMostRecentResponse />
			</div>
			<ChatBox />
		</div>
	)
}
