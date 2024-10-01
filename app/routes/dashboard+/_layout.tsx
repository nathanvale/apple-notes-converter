import { Outlet } from '@remix-run/react'
import { Header } from '#app/components/header'
import { SideNavigation } from '#app/components/side-navigation'
import { useLayoutContext } from '#app/utils/layout-provider'
import { cn } from '#app/utils/misc'

export default function Layout() {
	const { isSideNavOpen } = useLayoutContext()
	return (
		<div
			className={cn(
				'relative grid h-full min-h-screen w-full overflow-hidden transition-all',
				isSideNavOpen
					? 'md:grid-cols-[14rem_1fr] lg:grid-cols-[18rem_1fr]'
					: 'md:grid-cols-[0_1fr] lg:grid-cols-[0_1fr]',
			)}
		>
			{/* Left Nav */}
			<div className="hidden flex-shrink-0 overflow-x-hidden md:flex">
				<div className="h-full min-h-0 flex-col border-r">
					<SideNavigation />
				</div>
			</div>
			{/* Main Content */}
			<main className="flex h-full flex-col overflow-y-auto focus-visible:outline-0">
				<Header />
				<div className="h-full flex-1 overflow-y-auto focus-visible:outline-0">
					<Outlet />
				</div>
			</main>
		</div>
	)
}
