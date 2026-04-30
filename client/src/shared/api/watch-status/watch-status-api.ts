import { apiClient } from '../axios-instance'

export type WatchStatus = 'PLANNED' | 'WATCHING' | 'COMPLETED' | 'DROPPED'

export interface WatchStatusResponse {
	id: string
	userId: string
	contentId: string
	status: WatchStatus
	progress: number
	updatedAt: string
}

export const watchStatusApi = {
	// Получить статус для конкретного контента
	getStatus: (contentId: string) => {
		return apiClient.get<WatchStatusResponse>(`/watch-status/${contentId}`)
	},

	// Создать или обновить статус
	setStatus: (contentId: string, status: WatchStatus, progress?: number) => {
		return apiClient.post(`/watch-status/${contentId}`, { status, progress })
	},

	// Обновить статус
	updateStatus: (contentId: string, status: WatchStatus, progress?: number) => {
		return apiClient.put(`/watch-status/${contentId}`, { status, progress })
	},

	// Удалить статус
	deleteStatus: (contentId: string) => {
		return apiClient.delete(`/watch-status/${contentId}`)
	},

	// Получить все статусы пользователя
	getAllStatuses: () => {
		return apiClient.get<WatchStatusResponse[]>('/watch-status')
	},

	// Получить статистику
	getStats: () => {
		return apiClient.get('/watch-status/stats')
	},
}
