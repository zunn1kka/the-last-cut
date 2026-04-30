import { apiClient } from '../axios-instance'

export const ratingsApi = {
	// Получить среднюю оценку контента
	getContentRating: (contentId: string) =>
		apiClient.get(`/ratings/content/${contentId}`),

	// Получить оценку пользователя
	getUserRating: (contentId: string) =>
		apiClient.get(`/ratings/my/content/${contentId}`),

	// Поставить оценку
	rateContent: (contentId: string, rating: number) =>
		apiClient.post(`/ratings/content/${contentId}`, { rating }),

	// Удалить оценку
	deleteRating: (contentId: string) =>
		apiClient.delete(`/ratings/content/${contentId}`),

	// Получить все оценки пользователя
	getUserRatings: () => apiClient.get('/ratings/my/content'),

	// Оценить комментарий (лайк/дизлайк)
	rateComment: (commentId: string, isPositive: boolean) =>
		apiClient.post(`/ratings/comment/${commentId}`, { isPositive }),

	// Удалить оценку комментария
	deleteCommentRating: (commentId: string) =>
		apiClient.delete(`/ratings/comment/${commentId}`),

	// Получить рейтинг комментария
	getCommentRating: (commentId: string) =>
		apiClient.get(`/ratings/comment/${commentId}`),
}
