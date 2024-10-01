import { CircleGauge, LineChart, NotebookPen, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export const NavLinks: React.FC = () => {
	return (
		<div>
			<Link
				to="/dashboard"
				className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
			>
				<CircleGauge className="h-4 w-4" />
				Dashboard{' '}
			</Link>
			<Link
				to="/dashboard/journal-entries"
				className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
			>
				<NotebookPen className="h-4 w-4" />
				Journal Entries
			</Link>
			<Link
				to="/dashboard/contacts"
				className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
			>
				<Users className="h-4 w-4" />
				Contacts
			</Link>
			<Link
				to="/dashboard/analytics"
				className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
			>
				<LineChart className="h-4 w-4" />
				Analytics
			</Link>
		</div>
	)
}
