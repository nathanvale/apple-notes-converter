/* c8 ignore start */
;({
	autoLog: false,
})

import { prisma } from './db.server'

async function fetchEntriesWithRelationships() {
	await prisma.entry.findMany({
		include: {
			keyEvents: true, // Include related KeyEvents
			actionItems: true, // Include related ActionItems
		},
	})
}

fetchEntriesWithRelationships()
	.catch((e) => {
		console.error(e)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
