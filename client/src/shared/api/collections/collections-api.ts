import { apiClient } from '../axios-instance'

export interface Collection {
	id: string
	title: string
	description: string | null
	isPublic: boolean
	createdAt: string
	updatedAt: string
	items: CollectionItem[]
	user?: {
		id: string
		username: string
		avatarUrl: string | null
	}
}

export interface CollectionItem {
	id: string
	contentId: string
	notes: string | null
	order: number
	content: {
		id: string
		title: string
		posterUrl: string
		releaseYear: number
		contentType: 'MOVIE' | 'SERIES'
		siteRating: number | null
	}
}

export const collectionsApi = {
	// Получить все мои сборники
	getMyCollections: () => {
		return apiClient.get<Collection[]>('/collections')
	},

	// Получить сборник по ID
	getCollection: (id: string) => {
		return apiClient.get<Collection>(`/collections/${id}`)
	},

	// Создать сборник
	createCollection: (data: {
		title: string
		description?: string
		isPublic?: boolean
	}) => {
		return apiClient.post<Collection>('/collections', data)
	},

	// Обновить сборник
	updateCollection: (
		id: string,
		data: { title?: string; description?: string; isPublic?: boolean },
	) => {
		return apiClient.patch<Collection>(`/collections/${id}`, data)
	},

	// Удалить сборник
	deleteCollection: (id: string) => {
		return apiClient.delete(`/collections/${id}`)
	},

	// Добавить элемент в сборник
	addItem: (collectionId: string, contentId: string, notes?: string) => {
		return apiClient.post(`/collections/${collectionId}/items`, {
			contentId,
			notes,
		})
	},

	// Удалить элемент из сборника
	removeItem: (collectionId: string, contentId: string) => {
		return apiClient.delete(`/collections/${collectionId}/items/${contentId}`)
	},

	// Изменить порядок элементов
	reorderItems: (
		collectionId: string,
		items: { id: string; order: number }[],
	) => {
		return apiClient.patch(`/collections/${collectionId}/items/reorder`, {
			items,
		})
	},
}
