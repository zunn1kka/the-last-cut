import { Content } from '@/entities/content/model/types/content'
import { apiClient } from '../axios-instance'

export const contentApi = {
	// Получить популярный контент (просто все, без сортировки)
	getPopular: (limit = 10) => apiClient.get('/content', { params: { limit } }),

	// Получить новинки
	getNewReleases: (limit = 10) =>
		apiClient.get('/content', {
			params: { sortBy: 'releaseYear', sortOrder: 'desc', limit },
		}),

	// Получить лучшие по рейтингу
	getTopRated: (limit = 10) =>
		apiClient.get('/content', {
			params: { sortBy: 'siteRating', sortOrder: 'desc', limit },
		}),

	// Получить по типу
	getByType: (type: 'MOVIE' | 'SERIES', limit = 10) =>
		apiClient.get('/content', {
			params: { contentType: type, limit },
		}),

	// Получить все контент с фильтрацией
	getAll: (params?: {
		page?: number
		limit?: number
		contentType?: 'MOVIE' | 'SERIES'
		genreIds?: string[]
		yearFrom?: number
		yearTo?: number
		ratingFrom?: number
		ratingTo?: number
		sortBy?: string
		sortOrder?: 'asc' | 'desc'
		search?: string
	}) => {
		return apiClient.get('/content', {
			params,
			paramsSerializer: params => {
				const searchParams = new URLSearchParams()
				Object.entries(params).forEach(([key, value]) => {
					if (value === undefined || value === null) return

					if (key === 'genreIds' && Array.isArray(value) && value.length > 0) {
						// Преобразуем массив в строку через запятую, как ожидает бэкенд
						searchParams.append(key, value.join(','))
					} else {
						searchParams.append(key, String(value))
					}
				})
				return searchParams.toString()
			},
		})
	},

	// Получить контент по ID
	getById: (id: string) => {
		return apiClient.get<Content>(`/content/${id}`)
	},
}
