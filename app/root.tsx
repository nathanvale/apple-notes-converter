import { Links, Meta, Outlet, Scripts } from '@remix-run/react'
import { DictationInput } from './components/DictationInput'
import { DictationProvider } from './utils/providers/DictationProvider'

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
				<DictationInput buttonId="button1" />
				<DictationInput buttonId="button2" />
				<DictationInput buttonId="button3" />
			</Document>
		</DictationProvider>
	)
}
