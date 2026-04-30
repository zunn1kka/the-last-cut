import { apiClient } from '../axios-instance'
import { Genre } from './genre.interface'

export const genreApi = {
	getAll: () => apiClient.get<Genre[]>('/genres'),
}
