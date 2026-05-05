'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { notificationsApi } from '@/shared/api/notifications/notifications-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import { Bell, Film, LogOut, Menu, Shield, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NotificationsPopup } from '../notifications/ui/notifications-popup'

export function Header() {
	const pathname = usePathname()
	const { user, logout, isLoading } = useAuth()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [showNotifications, setShowNotifications] = useState(false)
	const [unreadCount, setUnreadCount] = useState(0)

	const navItems = [
		{ href: '/movies', label: 'Фильмы' },
		{ href: '/series', label: 'Сериалы' },
		{ href: '/actors', label: 'Актеры' },
		{ href: '/top', label: 'Топ' },
	]

	useEffect(() => {
		if (!user) return

		const fetchUnreadCount = async () => {
			try {
				const response = await notificationsApi.getUnreadCount()
				setUnreadCount(response.data.count)
			} catch (error) {
				console.error('Failed to fetch unread count:', error)
			}
		}

		fetchUnreadCount()

		const interval = setInterval(fetchUnreadCount, 30000)
		return () => clearInterval(interval)
	}, [user])

	const isActive = (href: string) => pathname === href

	if (isLoading) {
		return (
			<header className='bg-custom-dark text-white sticky top-0 z-50'>
				<div className='container mx-auto px-4'>
					<div className='flex items-center justify-between h-16'>
						<div className='flex items-center space-x-2 flex-shrink-0'>
							<Film className='w-7 h-7 md:w-8 md:h-8 text-blue-400' />
							<span className='text-lg md:text-xl font-bold whitespace-nowrap'>
								The Last Cut
							</span>
						</div>
						<div className='w-24 h-8 bg-gray-700 animate-pulse rounded-lg' />
					</div>
				</div>
			</header>
		)
	}

	return (
		<header className='bg-custom-dark text-white sticky top-0 z-50'>
			<div className='container mx-auto px-4'>
				<div className='flex items-center justify-between h-16'>
					{/* Логотип - уменьшен на мобильных */}
					<Link href='/' className='flex items-center space-x-2 flex-shrink-0'>
						<Film className='w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-blue-400' />
						<span className='text-base md:text-lg lg:text-xl font-bold whitespace-nowrap'>
							The Last Cut
						</span>
					</Link>

					{/* Десктоп навигация - скрывается на планшетах и мобильных */}
					<nav className='hidden lg:flex items-center space-x-1'>
						{navItems.map(item => (
							<Link
								key={item.href}
								href={item.href}
								className={`px-3 py-2 rounded-lg transition-colors text-sm ${
									isActive(item.href)
										? 'bg-blue-600 text-white'
										: 'text-gray-300 hover:bg-custom-darker hover:text-white'
								}`}
							>
								{item.label}
							</Link>
						))}

						{user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && (
							<Link
								href='/admin/comments'
								className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
									isActive('/admin/comments') || isActive('/admin/reports')
										? 'bg-blue-600 text-white'
										: 'text-gray-300 hover:bg-custom-darker hover:text-white'
								}`}
							>
								<Shield className='w-4 h-4' />
								<span>Модерация</span>
							</Link>
						)}

						{user?.role === 'ADMIN' && (
							<Link
								href='/admin/movies'
								className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
									isActive('/admin/movies') ||
									isActive('/admin/series') ||
									isActive('/admin/persons') ||
									isActive('/admin/genres') ||
									isActive('/admin/users')
										? 'bg-blue-600 text-white'
										: 'text-gray-300 hover:bg-custom-darker hover:text-white'
								}`}
							>
								<span>Управление</span>
							</Link>
						)}
					</nav>

					{/* Правая часть */}
					<div className='flex items-center space-x-1 md:space-x-3'>
						{/* Кнопка уведомлений */}
						{user && (
							<div className='relative'>
								<button
									onClick={() => setShowNotifications(!showNotifications)}
									className='relative p-1.5 md:p-2 rounded-lg hover:bg-custom-darker transition-colors'
								>
									<Bell className='w-4 h-4 md:w-5 md:h-5 text-gray-400' />
									{unreadCount > 0 && (
										<span className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center'>
											{unreadCount > 9 ? '9+' : unreadCount}
										</span>
									)}
								</button>
								{showNotifications && (
									<NotificationsPopup
										onClose={() => setShowNotifications(false)}
									/>
								)}
							</div>
						)}

						{/* Пользовательское меню */}
						{user ? (
							<div className='flex items-center space-x-1 md:space-x-2'>
								<Link
									href='/profile'
									className='flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-3 md:py-2 rounded-lg hover:bg-custom-darker transition-colors'
								>
									<div className='relative w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden bg-gray-600'>
										{user.avatarUrl ? (
											<Image
												src={getImageUrl(user.avatarUrl)}
												alt={user.username}
												fill
												unoptimized={true}
												className='object-cover'
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center bg-blue-600'>
												<span className='text-xs md:text-sm font-medium'>
													{user.username.charAt(0).toUpperCase()}
												</span>
											</div>
										)}
									</div>
									<span className='text-xs md:text-sm font-medium hidden sm:inline-block'>
										{user.username}
									</span>
								</Link>

								<Button
									variant='outline'
									size='sm'
									onClick={logout}
									className='border-gray-600 text-gray-300 hover:bg-custom-darker hover:text-white text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5'
								>
									<LogOut className='w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2' />
									<span className='hidden sm:inline'>Выйти</span>
								</Button>
							</div>
						) : (
							<div className='flex items-center space-x-1 md:space-x-2'>
								<Link href='/login'>
									<Button
										variant='outline'
										size='sm'
										className='border-gray-600 text-gray-300 hover:bg-custom-darker hover:text-white text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5'
									>
										Войти
									</Button>
								</Link>
								<Link href='/register'>
									<Button
										size='sm'
										className='text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5'
									>
										Регистрация
									</Button>
								</Link>
							</div>
						)}
					</div>

					{/* Мобильное меню кнопка */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className='lg:hidden p-2 rounded-lg hover:bg-custom-darker'
					>
						{isMenuOpen ? (
							<X className='w-5 h-5' />
						) : (
							<Menu className='w-5 h-5' />
						)}
					</button>
				</div>

				{/* Мобильное меню */}
				{isMenuOpen && (
					<div className='lg:hidden py-4 border-t border-gray-700'>
						<nav className='flex flex-col space-y-2'>
							{navItems.map(item => (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setIsMenuOpen(false)}
									className={`px-4 py-2 rounded-lg transition-colors ${
										isActive(item.href)
											? 'bg-blue-600 text-white'
											: 'text-gray-300 hover:bg-custom-darker hover:text-white'
									}`}
								>
									{item.label}
								</Link>
							))}

							{user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && (
								<Link
									href='/admin/comments'
									onClick={() => setIsMenuOpen(false)}
									className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
										isActive('/admin/comments') || isActive('/admin/reports')
											? 'bg-blue-600 text-white'
											: 'text-gray-300 hover:bg-custom-darker hover:text-white'
									}`}
								>
									<Shield className='w-4 h-4' />
									Модерация
								</Link>
							)}

							{user?.role === 'ADMIN' && (
								<Link
									href='/admin/movies'
									onClick={() => setIsMenuOpen(false)}
									className={`px-4 py-2 rounded-lg transition-colors ${
										isActive('/admin/movies') ||
										isActive('/admin/series') ||
										isActive('/admin/persons') ||
										isActive('/admin/genres') ||
										isActive('/admin/users')
											? 'bg-blue-600 text-white'
											: 'text-gray-300 hover:bg-custom-darker hover:text-white'
									}`}
								>
									Управление
								</Link>
							)}

							<div className='pt-4 border-t border-gray-700'>
								{user ? (
									<div className='space-y-2'>
										<div className='flex items-center justify-between px-4 py-2'>
											<Link
												href='/profile'
												onClick={() => setIsMenuOpen(false)}
												className='flex items-center space-x-3'
											>
												<div className='relative w-8 h-8 rounded-full overflow-hidden bg-gray-600'>
													{user.avatarUrl ? (
														<Image
															src={getImageUrl(user.avatarUrl)}
															alt={user.username}
															fill
															className='object-cover'
														/>
													) : (
														<div className='w-full h-full flex items-center justify-center bg-blue-600'>
															<span className='text-sm font-medium'>
																{user.username.charAt(0).toUpperCase()}
															</span>
														</div>
													)}
												</div>
												<span>{user.username}</span>
											</Link>
										</div>

										<button
											onClick={() => {
												logout()
												setIsMenuOpen(false)
											}}
											className='w-full text-left px-4 py-2 text-red-400 hover:bg-custom-darker rounded-lg'
										>
											Выйти
										</button>
									</div>
								) : (
									<div className='space-y-2'>
										<Link href='/login' onClick={() => setIsMenuOpen(false)}>
											<Button
												variant='outline'
												className='w-full border-gray-600 text-gray-300'
											>
												Войти
											</Button>
										</Link>
										<Link href='/register' onClick={() => setIsMenuOpen(false)}>
											<Button className='w-full'>Регистрация</Button>
										</Link>
									</div>
								)}
							</div>
						</nav>
					</div>
				)}
			</div>
		</header>
	)
}
