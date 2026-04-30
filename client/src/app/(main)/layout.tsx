import { Footer } from '@/widgets/footer'
import { Header } from '@/widgets/header'

export default function MainLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<Header />
			{children}
			<Footer />
		</>
	)
}
