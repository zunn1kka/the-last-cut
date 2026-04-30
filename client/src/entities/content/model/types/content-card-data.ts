export interface ContentCardData {
	id: string
	title: string
	posterUrl: string
	releaseYear: number
	contentType: 'MOVIE' | 'SERIES'
	rating?: string
	genres: string[]
}
