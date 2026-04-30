import { apiClient } from '../axios-instance'
import { ContentPerson } from './content-person.interface'
import { Person } from './person.interface'
import { SearchPersonParams } from './search-person-params'

export const personsApi = {
	// Получить всех персон с пагинацией
	getAll: (params?: {
		page?: number
		limit?: number
		query?: string
		sortBy?: string
		sortOrder?: 'asc' | 'desc'
	}) => {
		return apiClient.get<{
			items: Person[]
			total: number
			page: number
			totalPages: number
		}>('/persons', { params })
	},

	getById: (id: string) => {
		return apiClient.get<Person>(`/persons/${id}`)
	},

	// Получить персон по контенту
	getByContentId: (personId: string) => {
		return apiClient.get<ContentPerson[]>(`/persons/${personId}/content`)
	},

	search: (params: SearchPersonParams) =>
		apiClient.get('/persons/search', { params }),

	autocomplete: (query: string) =>
		apiClient.get('/persons/autocomplete', { params: { q: query } }),
}
