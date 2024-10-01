import { createContext, type ReactNode, useContext, useState } from 'react'

interface LayoutContextProps {
	isSideNavOpen: boolean
	toggleNav: () => void
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined)

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
	const [isSideNavOpen, setIsSideNavOpen] = useState(true)

	const toggleNav = () => {
		setIsSideNavOpen((prev) => !prev)
	}

	return (
		<LayoutContext.Provider value={{ isSideNavOpen, toggleNav }}>
			{children}
		</LayoutContext.Provider>
	)
}

export const useLayoutContext = () => {
	const context = useContext(LayoutContext)
	if (!context) {
		throw new Error('useLayoutContext must be used within a LayoutProvider')
	}
	return context
}
