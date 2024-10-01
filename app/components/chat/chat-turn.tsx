import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ChatArticle } from './chat-article'

interface MessageProps {
	onEditOpen(): void
}

const Message = ({ onEditOpen }: MessageProps) => {
	return (
		<div
			data-message-author-role="user"
			data-message-id="aaa251fd-6c47-420f-8b45-04137f9e97eb"
			dir="auto"
			className="text-message flex min-h-[20px] w-full flex-col items-end gap-2 whitespace-normal break-words"
		>
			<div className="flex w-full flex-col items-end gap-1 empty:hidden rtl:items-start">
				<div className="relative max-w-[70%] rounded-3xl bg-blue-500 px-5 py-2.5 text-white">
					<div className="whitespace-pre-wrap">My turn goes like this</div>
					<div className="absolute bottom-0 right-full top-0 -mr-3.5 hidden pr-5 pt-1 group-hover:block">
						<span className="" data-state="closed">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
										onClick={onEditOpen}
									>
										<Pencil className="h-5 w-5 text-black" />
										<span className="sr-only">Edit message</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent side="top">Edit message</TooltipContent>
							</Tooltip>
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

interface MessageEditProps {
	onEditClose(): void
}

const MessageEdit = ({ onEditClose }: MessageEditProps) => {
	const [message, setMessage] = useState('')
	return (
		<div className="rounded-3xl bg-secondary px-3 py-3">
			<div className="m-2 max-h-[25dvh] overflow-auto">
				<div className="grid">
					<textarea
						className="col-start-1 col-end-2 row-start-1 row-end-2 m-0 w-full resize-none overflow-hidden border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<span className="invisible col-start-1 col-end-2 row-start-1 row-end-2 whitespace-pre-wrap p-0">
						{message}{' '}
					</span>
				</div>
			</div>
			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					className="relative rounded-[9999px]"
					onClick={onEditClose}
				>
					Cancel
				</Button>
				<Button className="relative rounded-[9999px]">Send</Button>
			</div>
		</div>
	)
}

export const ChatTurn: React.FC = () => {
	const [isEdit, setIsEdit] = useState(false)
	return (
		<ChatArticle screenReaderContent="You said:">
			<div className="flex max-w-full flex-grow flex-col">
				{isEdit ? (
					<MessageEdit onEditClose={() => setIsEdit(false)} />
				) : (
					<Message onEditOpen={() => setIsEdit(true)} />
				)}
			</div>
		</ChatArticle>
	)
}
