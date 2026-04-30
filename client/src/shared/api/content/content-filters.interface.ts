export interface ContentFilters {
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
}
