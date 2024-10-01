import { cn } from '#app/utils/misc'

export interface ArticleProps {
	className?: string
	children?: React.ReactNode
	screenReaderContent: string
	dataScrollAnchor?: boolean
	dataTestId?: string
	handleMouseEnter?: () => void
	handleMouseLeave?: () => void
}

export const ChatArticle = ({
	className,
	children,
	screenReaderContent,
	dataScrollAnchor = false,
	dataTestId,
	handleMouseEnter,
	handleMouseLeave,
}: ArticleProps) => {
	return (
		<article
			className={cn(
				`w-full focus-visible:outline-2 focus-visible:outline-offset-[-4px]`,
				className,
			)}
			dir="auto"
			data-testid={dataTestId}
			data-scroll-anchor={dataScrollAnchor}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{screenReaderContent && (
				<h5 className="sr-only">{screenReaderContent}</h5>
			)}
			<div className="m-auto w-full px-3 py-[18px] text-base md:px-4 lg:px-1 xl:px-5">
				<div className="mx-auto flex flex-1 gap-4 text-base md:max-w-3xl md:gap-5 lg:max-w-[40rem] lg:gap-6 xl:max-w-[48rem]">
					<div className="group relative flex w-full min-w-0 flex-col">
						{children}
					</div>
				</div>
			</div>
		</article>
	)
}
