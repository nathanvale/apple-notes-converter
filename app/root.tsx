import { type LinksFunction } from '@remix-run/node'
import { Links, Meta, Outlet, Scripts } from '@remix-run/react'
import { DictationProvider } from './routes/resources+/open-ai-dictation'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: tailwindStyleSheetUrl }].filter(Boolean)
}

function Document({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
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
		<DictationProvider>
			<Document>
				<Outlet />
			</Document>
		</DictationProvider>
	)
}
