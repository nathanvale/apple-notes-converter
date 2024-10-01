import React from 'react'
import { Button } from '#app/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card'

export const CallToAction: React.FC = () => {
	return (
		<Card x-chunk="dashboard-02-chunk-0">
			<CardHeader className="p-4">
				<CardTitle>Upgrade to Pro</CardTitle>
				<CardDescription>
					Unlock all features and get unlimited access to our support team.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-2 pt-0 md:p-4 md:pt-0">
				<Button size="sm" className="w-full">
					Upgrade
				</Button>
			</CardContent>
		</Card>
	)
}
