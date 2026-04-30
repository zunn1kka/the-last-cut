import { apiClient } from '../axios-instance'

export interface CreateCommentData {
	text: string
	rating?: number
	parentId?: string
}

export interface UpdateCommentData {
	text?: string
	rating?: number
}

export const commentsApi = {
	// Получить комментарии контента
	getComments: (contentId: string, page = 1) =>
		apiClient.get(`/comments/${contentId}`, { params: { page } }),

	// Получить комментарий по ID
	getCommentById: (commentId: string) =>
		apiClient.get(`/comments/${commentId}`),

	// Создать комментарий
	createComment: (contentId: string, data: CreateCommentData) =>
		apiClient.post(`/comments/${contentId}`, data),

	// Обновить комментарий
	updateComment: (commentId: string, data: UpdateCommentData) =>
		apiClient.put(`/comments/${commentId}`, data),

	// Удалить комментарий
	deleteComment: (commentId: string) =>
		apiClient.delete(`/comments/${commentId}`),

	// Получить ответы на комментарий
	getReplies: (commentId: string) =>
		apiClient.get(`/comments/${commentId}/replies`),

	// Пожаловаться на комментарий
	reportComment: (commentId: string, reason: string) =>
		apiClient.post(`/comments/${commentId}/report`, { reason }),

	getUserComments: () => {
		console.log('📤 [usersApi] Вызов getUserComments()')
		return apiClient.get('/comments/my')
	},
}
