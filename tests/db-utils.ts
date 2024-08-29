import { type PrismaClient } from '@prisma/client'

export async function cleanupDb(prisma: PrismaClient) {
	const tables = await prisma.$queryRaw<{ name: string }[]>`
		SELECT name 
		FROM sqlite_master 
		WHERE type='table' 
		AND name NOT LIKE 'sqlite_%' 
		AND name NOT LIKE '_prisma_migrations';
	`

	try {
		// Disable FK constraints to avoid relation conflicts during deletion
		await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF`)

		await prisma.$transaction([
			// Delete all rows from each table, preserving table structures
			...tables.map(({ name }) =>
				prisma.$executeRawUnsafe(`DELETE FROM "${name}"`),
			),
			// Reset the auto-increment counter for each table
			...tables.map(({ name }) =>
				prisma.$executeRawUnsafe(
					`DELETE FROM sqlite_sequence WHERE name='${name}';`,
				),
			),
		])
	} catch (error) {
		console.error('Error cleaning up database:', error)
	} finally {
		await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON`)
	}
}
