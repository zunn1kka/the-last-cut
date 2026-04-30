import { apiClient } from '../axios-instance'
import { UploadImagesData } from './upload-images-data.interface'

export const adminApi = {
	// Удаление контента
	deleteContent: (contentId: string) =>
		apiClient.delete(`/admin/content/${contentId}`),

	// Фильмы
	getMovies: () => apiClient.get('/content/movies'),
	getMovie: (id: string) => apiClient.get(`/content/movies/${id}`),
	createMovie: (data: any) => apiClient.post('/admin/movies', data),
	updateMovie: (id: string, data: any) =>
		apiClient.put(`/admin/movies/${id}`, data),
	deleteMovie: (id: string) => apiClient.delete(`/admin/movies/${id}`),

	// Сериалы
	getSeries: () => apiClient.get('/content/series'),
	getSeriesById: (id: string) => apiClient.get(`/content/series/${id}`),
	createSeries: (data: any) => apiClient.post('/admin/series', data),
	updateSeries: (id: string, data: any) =>
		apiClient.put(`/admin/series/${id}`, data),
	deleteSeries: (id: string) => apiClient.delete(`/admin/series/${id}`),

	// Эпизоды

	getEpisodesBySeries: (seriesId: string) =>
		apiClient.get(`/episodes/series/${seriesId}`),

	createEpisode: (seriesId: string, data: any) =>
		apiClient.post(`/admin/series/${seriesId}/episodes`, data),

	updateEpisode: (episodeId: string, data: any) =>
		apiClient.put(`/admin/episodes/${episodeId}`, data),

	deleteEpisode: (episodeId: string) =>
		apiClient.delete(`/admin/episodes/${episodeId}`),

	getEpisodeById: (episodeId: string) =>
		apiClient.get(`/episodes/${episodeId}`),

	// Персоны
	getPersons: () => apiClient.get('/persons'),
	getPersonById: (id: string) => apiClient.get(`/persons/${id}`),
	createPerson: (data: FormData) =>
		apiClient.post('/admin/persons', data, {
			headers: { 'Content-Type': 'multipart/form-data' },
		}),
	updatePerson: (id: string, data: FormData) =>
		apiClient.put(`/admin/persons/${id}`, data, {
			headers: { 'Content-Type': 'multipart/form-data' },
		}),
	deletePerson: (id: string) => apiClient.delete(`/admin/persons/${id}`),

	// Жанры
	getGenres: () => apiClient.get('/genres'),
	getGenresById: (id: string) => apiClient.get(`/genres/${id}`),
	createGenre: (data: any) => apiClient.post('/admin/genres', data),
	updateGenre: (id: string, data: any) =>
		apiClient.put(`/admin/genres/${id}`, data),
	deleteGenre: (id: string) => apiClient.delete(`/admin/genres/${id}`),

	// Роли персон
	getPersonRoles: () => apiClient.get('/persons-roles'),
	createPersonRole: (data: any) => apiClient.post('/admin/person-roles', data),
	updatePersonRole: (id: string, data: any) =>
		apiClient.put(`/admin/person-roles/${id}`, data),
	deletePersonRole: (id: string) =>
		apiClient.delete(`/admin/person-roles/${id}`),

	// Пользователи
	getUsers: () => apiClient.get('/admin/users'),
	getUserById: (id: string) => apiClient.get(`/admin/users/${id}`),
	updateUserRole: (id: string, role: string) =>
		apiClient.patch(`/admin/users/${id}/role`, { role }),
	deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),

	// Комментарии
	getComments: (params?: { status?: string; page?: number }) =>
		apiClient.get('/admin/comments', { params }),
	getCommentById: (id: string) => apiClient.get(`/admin/comments/${id}`),
	deleteComment: (id: string) => apiClient.delete(`/admin/comments/${id}`),
	getReports: () => apiClient.get('/admin/reports'),
	resolveReport: (id: string) =>
		apiClient.patch(`/admin/reports/${id}/resolve`),
	rejectReport: (id: string) => apiClient.patch(`/admin/reports/${id}/reject`),

	// Загрузка изображений

	uploadContentPoster: (contentId: string, posterFile: File) => {
		console.log('📤 ADMIN API - uploadContentPoster called:', {
			contentId,
			fileName: posterFile.name,
			fileSize: posterFile.size,
		})

		const formData = new FormData()
		formData.append('poster', posterFile)

		return apiClient.post(`/admin/content/${contentId}/poster`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
	},

	uploadContentBackdrop: (contentId: string, backdropFile: File) => {
		const formData = new FormData()
		formData.append('backdrop', backdropFile)
		return apiClient.post(`/admin/content/${contentId}/backdrop`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
	},

	uploadContentImages: (contentId: string, files: UploadImagesData) => {
		const formData = new FormData()
		if (files.poster) formData.append('poster', files.poster)
		if (files.backdrop) formData.append('backdrop', files.backdrop)
		return apiClient.post(`/admin/content/${contentId}/images`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
	},
}
