import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@radix-ui/react-tooltip'
import { Menu, PanelRightClose } from 'lucide-react'
import { useLayoutContext } from '#app/utils/layout-provider'
import { SideNavigation } from './side-navigation'
import { Button } from './ui/button'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet'

export const Header: React.FC = () => {
	const { toggleNav, isSideNavOpen } = useLayoutContext()
	return (
		<div className="mb-1.5 flex h-header-height items-center justify-between p-3">
			<div className="flex items-center">
				{!isSideNavOpen && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className="hidden md:flex"
								variant="ghost"
								size="icon"
								onClick={toggleNav}
							>
								<PanelRightClose className="h-6 w-6" />
								<span className="sr-only">Open sidebar</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="top">Open sidebar</TooltipContent>
					</Tooltip>
				)}
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="shrink-0 md:hidden">
							<Menu className="h-6 w-6" />
							<span className="sr-only">Toggle navigation menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="nav" className="flex flex-col">
						<div className="sr-only">
							<SheetTitle>Navigation</SheetTitle>
							<SheetDescription>Explore the app</SheetDescription>
						</div>
						<SideNavigation isSheet></SideNavigation>
					</SheetContent>
				</Sheet>
			</div>
			<div className="flex items-center gap-2 pr-1 leading-[0]">
				<span data-state="closed">
					<button
						data-testid="share-chat-button"
						className="text-token-text-secondary disabled:text-token-text-quaternary focus-visible:bg-token-main-surface-secondary enabled:hover:bg-token-main-surface-secondary h-10 rounded-lg px-2 focus-visible:outline-0"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="icon-xl-heavy"
						>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M11.2929 3.29289C11.6834 2.90237 12.3166 2.90237 12.7071 3.29289L16.7071 7.29289C17.0976 7.68342 17.0976 8.31658 16.7071 8.70711C16.3166 9.09763 15.6834 9.09763 15.2929 8.70711L13 6.41421V15C13 15.5523 12.5523 16 12 16C11.4477 16 11 15.5523 11 15V6.41421L8.70711 8.70711C8.31658 9.09763 7.68342 9.09763 7.29289 8.70711C6.90237 8.31658 6.90237 7.68342 7.29289 7.29289L11.2929 3.29289ZM4 14C4.55228 14 5 14.4477 5 15V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V15C19 14.4477 19.4477 14 20 14C20.5523 14 21 14.4477 21 15V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V15C3 14.4477 3.44772 14 4 14Z"
								fill="currentColor"
							/>
						</svg>
					</button>
				</span>
				<button
					data-testid="profile-button"
					className="hover:bg-token-main-surface-secondary focus-visible:bg-token-main-surface-secondary flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-0"
					type="button"
					id="radix-:rh:"
					aria-haspopup="menu"
					aria-expanded="false"
					data-state="closed"
				>
					<div className="flex items-center justify-center overflow-hidden rounded-full">
						<div className="relative flex">
							<img
								src="https://s.gravatar.com/avatar/90d9036b3f538506b46956fc7e42ed65?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fna.png"
								alt="User"
								width="32"
								height="32"
								className="rounded-sm"
								referrerPolicy="no-referrer"
							/>
						</div>
					</div>
				</button>
			</div>
		</div>
	)
}
