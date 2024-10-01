import { Copy, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '#app/utils/misc'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ChatArticle } from './chat-article'

export interface ChatRespoonseProps {
	isMostRecentResponse?: boolean
}

export const ChatResponse = ({ isMostRecentResponse }: ChatRespoonseProps) => {
	const [isHovered, setIsHovered] = useState(false)

	const handleMouseEnter = () => {
		setIsHovered(true)
	}

	const handleMouseLeave = () => {
		setIsHovered(false)
	}
	return (
		<ChatArticle
			screenReaderContent="AI said:"
			handleMouseEnter={handleMouseEnter}
			handleMouseLeave={handleMouseLeave}
		>
			<div className="flex max-w-full flex-grow flex-col">
				<div
					data-message-author-role="assistant"
					dir="auto"
					className="flex min-h-[20px] w-full flex-col items-start gap-2 whitespace-normal break-words rounded-3xl"
				>
					<div className="flex w-full flex-col items-start gap-1 empty:hidden rtl:items-end">
						<div className="relative max-w-[70%] rounded-3xl bg-secondary px-5 py-2.5">
							<div className="whitespace-pre-wrap">
								It is a long established fact that a reader will be distracted
								by the readable content of a page when looking at its layout.
								The point of using Lorem Ipsum is that it has a more-or-less
								normal distribution of letters, as opposed to using 'Content
								here, content here', making it look like readable English. Many
								desktop publishing packages and web page editors now use Lorem
								Ipsum as their default model text, and a search for 'lorem
								ipsum' will uncover many web sites still in their infancy.
								Various versions have evolved over the years, sometimes by
								accident, sometimes on purpose (injected humour and the like).
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="flex max-w-[70%] justify-start gap-3 empty:hidden">
				<div
					className={cn(
						'flex items-center justify-start rounded-xl pl-3.5 pt-1',
						'z-10 md:absolute',
						isMostRecentResponse || isHovered ? 'flex' : 'md:sr-only',
						isMostRecentResponse && 'md:pb-[18px]',
					)}
				>
					<div className="flex items-center">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Volume2 width={18} height={18} />
									<span className="sr-only">Speak text</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top">Speak text</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Copy width={18} height={18} />
									<span className="sr-only">Copy text</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top">Copy text</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</div>
		</ChatArticle>
	)
}
