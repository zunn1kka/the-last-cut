export interface Content {
	id: string
	title: string
	originalTitle?: string
	description: string
	releaseYear: number
	posterUrl: string
	backdropUrl?: string
	imdbRating?: string
	kinopoiskRating?: string
	siteRating?: number
	ageRating?: string
	contentType: 'MOVIE' | 'SERIES'
	createdAt: string
	updatedAt: string
	movie?: {
		duration: number
		budget?: number
	} | null
	series?: {
		seasonsCount: number
		episodesCount?: number
	} | null
	genres: {
		genre: {
			id: string
			name: string
			slug: string
		}
	}[]
}
