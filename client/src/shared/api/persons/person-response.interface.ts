import { Person } from './person.interface'

export interface PersonsResponse {
	items: Person[]
	total: number
	page: number
	totalPages: number
}
