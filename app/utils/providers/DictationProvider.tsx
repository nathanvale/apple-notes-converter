import React, {
	createContext,
	useContext,
	useState,
	type ReactNode,
} from 'react'

interface DictationContextProps {
	isUsingMicrophone: boolean
	setIsUsingMicrophone: (value: boolean) => void
}

const DictationContext = createContext<DictationContextProps | undefined>(
	undefined,
)

export const useDictationContext = (): DictationContextProps => {
	const context = useContext(DictationContext)
	if (!context) {
		throw new Error(
			'useDictationContext must be used within a DictationProvider',
		)
	}
	return context
}

interface DictationProviderProps {
	children: ReactNode
}

export const DictationProvider = ({
	children,
}: DictationProviderProps): JSX.Element => {
	const [isUsingMicrophone, setIsUsingMicrophone] = useState(false)
	return (
		<DictationContext.Provider
			value={{ isUsingMicrophone, setIsUsingMicrophone }}
		>
			{children}
		</DictationContext.Provider>
	)
}
