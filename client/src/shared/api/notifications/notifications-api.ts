import { apiClient } from '../axios-instance'

export type NotificationType =
	| 'COMMENT_REPLY'
	| 'COMMENT_LIKE'
	| 'FRIEND_REQUEST'
	| 'FRIEND_ACCEPTED'
	| 'MOVIE_UPDATE'
	| 'SYSTEM'

export interface Notification {
	id: string
	userId: string
	type: NotificationType
	title: string
	message: string | null
	data: any | null
	isRead: boolean
	createdAt: string
}

export interface NotificationsResponse {
	items: Notification[]
	total: number
	unreadCount: number
	page: number
	totalPages: number
}

export const notificationsApi = {
	// Получить уведомления пользователя
	getNotifications: (params?: { page?: number; limit?: number }) => {
		return apiClient.get<NotificationsResponse>('/notifications', { params })
	},

	// Отметить уведомление как прочитанное
	markAsRead: (id: string) => {
		return apiClient.patch(`/notifications/${id}/read`)
	},

	// Отметить все уведомления как прочитанные
	markAllAsRead: () => {
		console.log('📤 Отправка запроса на markAllAsRead')
		return apiClient.patch('/notifications/read-all')
	},

	// Получить количество непрочитанных уведомлений
	getUnreadCount: () => {
		return apiClient.get<{ count: number }>('/notifications/unread-count')
	},

	// Удалить уведомление
	deleteNotification: (id: string) => {
		return apiClient.delete(`/notifications/${id}`)
	},
}
