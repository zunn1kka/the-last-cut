'use client'
import {
	BookMarked,
	Film,
	MessageSquare,
	Settings,
	Tv,
	User,
	Users,
	Home
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
	{ href: '/admin/movies', icon: Film, label: 'Фильмы' },
	{ href: '/admin/series', icon: Tv, label: 'Сериалы' },
	{ href: '/admin/persons', icon: Users, label: 'Персоны' },
	{ href: '/admin/genres', icon: BookMarked, label: 'Жанры' },
	{ href: '/admin/users', icon: User, label: 'Пользователи' },
	{ href: '/admin/comments', icon: MessageSquare, label: 'Комментарии' },
	{ href: '/', icon: Home, label: 'На главную' },
]

export function AdminSidebar() {
	const pathname = usePathname()

	return (
		<aside className='w-64 .bg-custom-dark text-white'>
			<div className='p-4'>
				<h2 className='text-xl font-bold'>The Last Cut</h2>
				<p className='text-sm text-gray-400'>Админ-панель</p>
			</div>

			<nav className='mt-6'>
				{menuItems.map(item => {
					const isActive = pathname === item.href
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center px-4 py-3 transition-colors ${
								isActive
									? 'bg-custom-darker border-l-4 border-blue-500'
									: 'hover:bg-custom-darker'
							}`}
						>
							<item.icon className='w-5 h-5 mr-3' />
							<span>{item.label}</span>
						</Link>
					)
				})}
			</nav>
		</aside>
	)
}
