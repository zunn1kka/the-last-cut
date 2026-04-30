import { AdminFooter } from '@/widgets/admin/footer'
import { AdminSidebar } from '@/widgets/admin/sidebar'

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className='flex h-screen '>
			<AdminSidebar />
			<div className='flex-1 flex flex-col overflow-auto'>
				<div className='flex-1 p-8'>{children}</div>
				<AdminFooter />
			</div>
		</div>
	)
}
