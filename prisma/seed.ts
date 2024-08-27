// prisma/seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	// Seed data
	// const entries = [
	// 	{
	// 		title: 'First Note',
	// 		content: 'This is the content of the first note.',
	// 	},
	// 	{
	// 		title: 'Second Note',
	// 		content: 'This is the content of the second note.',
	// 	},
	// 	// Add more seed data as needed
	// ]
	// // Insert data into the Note model
	// await prisma.entry.createMany({
	// 	data: entries,
	// })
	// console.log('Seeding finished.')
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
