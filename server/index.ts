import { createRequestHandler } from '@remix-run/express'
import { type ServerBuild } from '@remix-run/node'
import express, {
	type Request,
	type Response,
	type NextFunction,
} from 'express'
import { type ViteDevServer } from 'vite'

const isProduction = process.env.NODE_ENV === 'production'

const viteDevServer: ViteDevServer | null = isProduction
	? null
	: await import('vite').then((vite) =>
			vite.createServer({
				server: { middlewareMode: true },
			}),
		)

const app = express()

// Use Vite's middlewares in development or serve static files in production
app.use(
	viteDevServer
		? (viteDevServer as ViteDevServer).middlewares
		: express.static('build/client'),
)

// Define a function to load the build
async function getBuild() {
	const build = viteDevServer
		? viteDevServer.ssrLoadModule('virtual:remix/server-build')
		: // @ts-ignore this should exist before running the server
			// but it may not exist just yet.
			await import('../build/server/index.js')
	// not sure how to make this happy 🤷‍♂️
	return build as unknown as ServerBuild
}

// Handle all requests with Remix
app.all('*', async (req: Request, res: Response, next: NextFunction) => {
	const build = await getBuild()
	const handler = createRequestHandler({ build })
	return handler(req, res, next)
})

// Start the Express server
app.listen(3000, () => {
	console.log('App listening on http://localhost:3000')
})
