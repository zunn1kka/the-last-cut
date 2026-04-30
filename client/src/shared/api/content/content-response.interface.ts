import { Content } from '@/entities/content/model/types/content'

export interface ContentsResponse {
	items: Content[]
	total: number
	page: number
	totalPages: number
}
