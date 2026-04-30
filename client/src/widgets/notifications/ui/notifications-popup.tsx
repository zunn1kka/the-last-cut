'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import {
	Notification,
	notificationsApi,
} from '@/shared/api/notifications/notifications-api'
import {
	Bell,
	Check,
	CheckCheck,
	MessageCircle,
	ThumbsUp,
	UserPlus,
	X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface NotificationsPopupProps {
	onClose?: () => void
}

const getNotificationIcon = (type: string) => {
	switch (type) {
		case 'COMMENT_REPLY':
			return <MessageCircle className='w-4 h-4 text-blue-400' />
		case 'COMMENT_LIKE':
			return <ThumbsUp className='w-4 h-4 text-green-400' />
		case 'FRIEND_REQUEST':
			return <UserPlus className='w-4 h-4 text-yellow-400' />
		case 'FRIEND_ACCEPTED':
			return <UserPlus className='w-4 h-4 text-green-400' />
		default:
			return <Bell className='w-4 h-4 text-gray-400' />
	}
}

const formatDate = (dateString: string) => {
	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	const diffHours = Math.floor(diffMs / 3600000)
	const diffDays = Math.floor(diffMs / 86400000)

	if (diffMins < 1) return 'только что'
	if (diffMins < 60) return `${diffMins} мин назад`
	if (diffHours < 24) return `${diffHours} ч назад`
	if (diffDays === 1) return 'вчера'
	return date.toLocaleDateString('ru-RU')
}

export function NotificationsPopup({ onClose }: NotificationsPopupProps) {
	const { user } = useAuth()
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const popupRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!user) return

		const fetchNotifications = async () => {
			setLoading(true)
			try {
				const [notificationsRes, countRes] = await Promise.all([
					notificationsApi.getNotifications({ page, limit: 20 }),
					notificationsApi.getUnreadCount(),
				])
				setNotifications(notificationsRes.data.items)
				setTotalPages(notificationsRes.data.totalPages)
				setUnreadCount(countRes.data.count)
			} catch (error) {
				console.error('Failed to fetch notifications:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchNotifications()
	}, [user, page])

	const handleMarkAsRead = async (id: string) => {
		try {
			await notificationsApi.markAsRead(id)
			setNotifications(prev =>
				prev.map(n => (n.id === id ? { ...n, isRead: true } : n)),
			)
			setUnreadCount(prev => Math.max(0, prev - 1))
		} catch (error) {
			console.error('Failed to mark as read:', error)
		}
	}

	const handleMarkAllAsRead = async () => {
		try {
			const response = await notificationsApi.markAllAsRead()
			console.log('Mark all as read response:', response.data)

			// Обновляем локальное состояние - отмечаем все как прочитанные
			setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
			setUnreadCount(0)
		} catch (error: any) {
			console.error('Failed to mark all as read:', error)

			// Если ошибка, всё равно обновляем состояние, пытаясь получить актуальные данные
			try {
				const refreshResponse = await notificationsApi.getNotifications({
					page,
					limit: 20,
				})
				setNotifications(refreshResponse.data.items)
				setUnreadCount(refreshResponse.data.unreadCount)
			} catch (refreshError) {
				console.error('Failed to refresh notifications:', refreshError)
			}
		}
	}

	const handleDelete = async (id: string) => {
		try {
			await notificationsApi.deleteNotification(id)
			setNotifications(prev => prev.filter(n => n.id !== id))
			if (!notifications.find(n => n.id === id)?.isRead) {
				setUnreadCount(prev => Math.max(0, prev - 1))
			}
		} catch (error) {
			console.error('Failed to delete notification:', error)
		}
	}

	// Закрытие при клике вне попапа
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				popupRef.current &&
				!popupRef.current.contains(event.target as Node)
			) {
				onClose?.()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [onClose])

	if (!user) return null

	return (
		<div
			ref={popupRef}
			className='absolute right-0 top-full mt-2 w-96 bg-custom-dark rounded-xl border border-gray-700 shadow-xl z-50 overflow-hidden'
		>
			{/* Заголовок */}
			<div className='flex items-center justify-between px-4 py-3 border-b border-gray-800'>
				<h3 className='font-semibold text-white'>Уведомления</h3>
				<div className='flex items-center gap-2'>
					{unreadCount > 0 && (
						<button
							onClick={handleMarkAllAsRead}
							className='text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1'
						>
							<CheckCheck className='w-3 h-3' />
							Прочитать всё
						</button>
					)}
				</div>
			</div>

			{/* Список уведомлений */}
			<div className='max-h-96 overflow-y-auto'>
				{loading ? (
					<div className='flex justify-center py-8'>
						<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500' />
					</div>
				) : notifications.length === 0 ? (
					<div className='text-center py-8 text-gray-500'>
						<Bell className='w-8 h-8 mx-auto mb-2 opacity-50' />
						<p className='text-sm'>Нет уведомлений</p>
					</div>
				) : (
					<>
						{notifications.map(notification => (
							<div
								key={notification.id}
								className={`px-4 py-3 border-b border-gray-800 hover:bg-custom-darker transition-colors ${
									!notification.isRead ? 'bg-blue-500/5' : ''
								}`}
							>
								<div className='flex gap-3'>
									{/* Иконка */}
									<div className='flex-shrink-0 mt-1'>
										{getNotificationIcon(notification.type)}
									</div>

									{/* Контент */}
									<div className='flex-1 min-w-0'>
										<div className='flex items-start justify-between gap-2'>
											<div>
												<p className='text-sm font-medium text-white'>
													{notification.title}
												</p>
												{notification.message && (
													<p className='text-xs text-gray-400 mt-1 line-clamp-2'>
														{notification.message}
													</p>
												)}
												<p className='text-xs text-gray-500 mt-1'>
													{formatDate(notification.createdAt)}
												</p>
											</div>

											<div className='flex items-center gap-1 flex-shrink-0'>
												{!notification.isRead && (
													<button
														onClick={() => handleMarkAsRead(notification.id)}
														className='p-1 text-gray-500 hover:text-blue-400 transition-colors'
														title='Отметить как прочитанное'
													>
														<Check className='w-3 h-3' />
													</button>
												)}
												<button
													onClick={() => handleDelete(notification.id)}
													className='p-1 text-gray-500 hover:text-red-400 transition-colors'
													title='Удалить'
												>
													<X className='w-3 h-3' />
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}

						{/* Пагинация */}
						{totalPages > 1 && (
							<div className='px-4 py-2 border-t border-gray-800 flex justify-center gap-2'>
								<button
									onClick={() => setPage(p => Math.max(1, p - 1))}
									disabled={page === 1}
									className='text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
								>
									Назад
								</button>
								<span className='text-xs text-gray-500'>
									{page} / {totalPages}
								</span>
								<button
									onClick={() => setPage(p => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
									className='text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
								>
									Вперёд
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}
