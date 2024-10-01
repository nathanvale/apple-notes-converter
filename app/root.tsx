import { type LinksFunction } from '@remix-run/node'
import { Links, Meta, Outlet, Scripts } from '@remix-run/react'
import { TooltipProvider } from './components/ui/tooltip'
import { DictationProvider } from './routes/resources+/open-ai-dictation'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { LayoutProvider } from './utils/layout-provider'

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: tailwindStyleSheetUrl }].filter(Boolean)
}

function Document({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" dir="ltr">
			<head>
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />

				<Links />
			</head>
			<body className="bg-background text-foreground">
				{children}
				<Scripts />
			</body>
		</html>
	)
}

export default function Root() {
	return (
		<LayoutProvider>
			<TooltipProvider>
				<DictationProvider>
					<Document>
						<Outlet />
					</Document>
				</DictationProvider>
			</TooltipProvider>
		</LayoutProvider>
	)
}
