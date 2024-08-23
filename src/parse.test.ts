import { describe, expect, it } from 'vitest'
import { parseJournal } from './parse'

describe('parseJournal', () => {
	const journalEntry = `2024/08/21 Cleaning Up, Connecting, and New Beginnings

## Key Events
-Cleaned out old GitHub repos, making space for new projects.
-Spent quality time with Melanie at Cafe Bliss.
-Felt stress due to Melanie's anxieties about the weekend.
-Started learning about setting up TypeScript with Node and SQLite for a new project.
-Experienced growth through progress in setting up the tech stack for a new app.

## Action Items



-Continue development on the Gratitude journal project, focusing on database integration.
-Reflect on how to support Melanie while managing personal anxieties.
-Plan for the weekend with Melanie, considering her concerns and finding ways to ease any potential stress.



## Journal Entry


Today was a day of both productivity and connection. I started by tackling a long-overdue task: cleaning out my old GitHub repositories. These repos had been sitting there, untouched, for over ten years, and clearing them out felt like a fresh start. It was satisfying to tidy things up and make space for the new projects I'm excited to develop. This achievement gave me a sense of accomplishment and readiness for what's to come.
I also spent a lovely time with Melanie at Cafe Bliss. This cafe holds special memories for us, as it was the location of our second date, and we've had several sweet moments there since. Melanie looked stunning in her new outfit, and her unique style always captivates me. We connected deeply during our time together, and her touch was so soothing that it made me feel almost sleepy. It was a beautiful, intimate moment that added a layer of warmth to my day.
However, the day wasn't without its challenges. During our time together, Melanie shared her anxieties about the upcoming weekend, including the concert on Friday night and a family dinner on Saturday. Her worries about potentially bumping into her ex's wife at the concert, as well as her concerns about the family dinner, began to weigh on me. I found myself feeling anxious, as her stress seemed to rub off on me. It was disappointing because I had been looking forward to the weekend, and now I find myself concerned about whether I'll be able to enjoy it fully.

In our conversation, we also touched on the topic of bumping into exes. Melanie expressed a desire for her ex-husband to know how well she's doing, which made me reflect on my own feelings. After so many years, I don't have the same need for my ex to be aware of my life. This difference in our perspectives made me question whether there's still some emotional attachment on her end, though I understand that it's a complex situation.
On a more positive note, I made progress in my learning today. I started setting up TypeScript with the latest version of Node and integrating it with a SQLite database. This is part of a new project for organizing my Gratitude journal entries. Getting the stack set up felt like a big win, and it’s exciting to have everything in place to start building. I'm looking forward to chipping away at this project and seeing it evolve.

## Psychological Assessment
Today was a mix of accomplishment, connection, and emotional complexity. On one hand, I experienced significant progress in my personal and professional life, with the successful cleanup of my GitHub repos and the start of a new technical project. These achievements gave me a sense of control and forward momentum, contributing positively to my self-esteem and overall sense of purpose.
On the other hand, the emotional impact of Melanie's anxieties introduced a layer of stress that I hadn't anticipated. My own worries were triggered by her concerns, leading to a ripple effect that affected my mood. The conversation about exes brought up unresolved feelings and highlighted differences in how we both relate to our pasts, adding another dimension of emotional complexity to the day.
Balancing the excitement of new beginnings with the weight of emotional challenges will be crucial moving forward. It might be helpful to explore ways to support Melanie through her anxieties without allowing them to overshadow my own well-being. Finding this balance could enhance both my personal resilience and the strength of our relationship.
`

	it('should correctly parse the date and title', () => {
		const testCases = [
			{
				journalEntry: `2024/08/21- Cleaning Up, Connecting, and New Beginnings`,
				expectedDate: '2024/08/21',
				expectedTitle: 'Cleaning Up, Connecting, and New Beginnings',
			},
			{
				journalEntry: `2024/08/22 - Another Day, Another Challenge`,
				expectedDate: '2024/08/22',
				expectedTitle: 'Another Day, Another Challenge',
			},
			{
				journalEntry: `2024/08/23 A Day of Reflection and Growth`,
				expectedDate: '2024/08/23',
				expectedTitle: 'A Day of Reflection and Growth',
			},
		]

		testCases.forEach((testCase) => {
			const result = parseJournal(testCase.journalEntry)
			expect(result.date).toBe(testCase.expectedDate)
			expect(result.title).toBe(testCase.expectedTitle)
		})
	})

	it('should correctly parse the key events', () => {
		const result = parseJournal(journalEntry)
		expect(result.keyEvents).toEqual([
			'Cleaned out old GitHub repos, making space for new projects.',
			'Spent quality time with Melanie at Cafe Bliss.',
			"Felt stress due to Melanie's anxieties about the weekend.",
			'Started learning about setting up TypeScript with Node and SQLite for a new project.',
			'Experienced growth through progress in setting up the tech stack for a new app.',
		])
	})

	it('should correctly parse the action items', () => {
		const result = parseJournal(journalEntry)
		expect(result.actionItems).toEqual([
			'Continue development on the Gratitude journal project, focusing on database integration.',
			'Reflect on how to support Melanie while managing personal anxieties.',
			'Plan for the weekend with Melanie, considering her concerns and finding ways to ease any potential stress.',
		])
	})

	it('should correctly parse the journal entry body', () => {
		const result = parseJournal(journalEntry)
		expect(result.journalEntry).toContain(
			'Today was a day of both productivity and connection.',
		)
		expect(result.journalEntry).toContain(
			'I started by tackling a long-overdue task: cleaning out my old GitHub repositories.',
		)
	})

	it('should correctly parse the psychological assessment', () => {
		const result = parseJournal(journalEntry)
		expect(result.assessment).toContain(
			'Today was a mix of accomplishment, connection, and emotional complexity.',
		)
		expect(result.assessment).toContain(
			"On the other hand, the emotional impact of Melanie's anxieties introduced a layer of stress that I hadn't anticipated.",
		)
	})

	it('should match the snapshot', () => {
		const result = parseJournal(journalEntry)
		expect(result).toMatchSnapshot()
	})
})
