import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fsExtra from 'fs-extra'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDirPath = path.join(__dirname, '..', 'fixtures')

export async function readFixture(subdir: string, name: string) {
	return fsExtra.readJSON(path.join(fixturesDirPath, subdir, `${name}.json`))
}

export async function createFixture(
	subdir: string,
	name: string,
	data: unknown,
) {
	const dir = path.join(fixturesDirPath, subdir)
	await fsExtra.ensureDir(dir)
	return fsExtra.writeJSON(path.join(dir, `./${name}.json`), data)
}
