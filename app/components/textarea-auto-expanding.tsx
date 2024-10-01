import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from '#app/utils/misc'

export interface TextareaPropsAutoExpanding
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextareaAutoExpanding = React.forwardRef<
	HTMLTextAreaElement,
	TextareaPropsAutoExpanding
>(({ className, onChange, ...props }, ref) => {
	const [value, setValue] = useState('')
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)

	// Merge forwarded ref with textareaRef
	useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		onChange && onChange(e)
		setValue(e.target.value)
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto'
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
			if (textareaRef.current.scrollHeight > 208) {
				textareaRef.current.style.overflowY = 'scroll'
			} else {
				textareaRef.current.style.overflowY = 'hidden'
			}
		}
	}

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
		}
	}, [value])

	return (
		<textarea
			className={cn(
				'm-0 max-h-52 min-h-[40px] resize-none appearance-none rounded-none bg-transparent bg-none p-2 px-0 text-base leading-6 text-primary shadow-none outline-none ring-0 focus:ring-0 focus-visible:ring-0',
				className,
			)}
			ref={textareaRef}
			value={value}
			onChange={handleInputChange}
			tabIndex={0}
			rows={1}
			{...props}
		/>
	)
})

TextareaAutoExpanding.displayName = 'TextareaAutoExpanding'

export { TextareaAutoExpanding }
