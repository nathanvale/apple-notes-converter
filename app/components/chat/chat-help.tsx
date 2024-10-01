export const ChatHelp: React.FC = () => {
	return (
		<div className="group absolute bottom-2 end-2 z-20 gap-1 md:flex lg:bottom-3 lg:end-3">
			<button
				className="border-token-border-light text-token-text-secondary flex h-6 w-6 items-center justify-center rounded-full border text-xs"
				type="button"
				id="radix-:r3:"
				aria-haspopup="menu"
				aria-expanded="false"
				data-state="closed"
			>
				?
			</button>
		</div>
	)
}
