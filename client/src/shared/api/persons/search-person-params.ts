export interface SearchPersonParams {
	query?: string
	birthYear?: number
	deathYear?: number
	sortBy?: 'fullname' | 'birthDate' | 'createdAt'
	sortOrder?: 'asc' | 'desc'
	page?: number
	limit?: number
}
