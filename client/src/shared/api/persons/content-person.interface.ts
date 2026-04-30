export interface ContentPerson {
	id: string
	roleName: string | null
	role?: { name: string }
	content: {
		id: string
		title: string
		posterUrl: string
		releaseYear: number
		contentType: 'MOVIE' | 'SERIES'
		siteRating: number | null
		imdbRating: number | null
		kinopoiskRating: number | null
	}
}
