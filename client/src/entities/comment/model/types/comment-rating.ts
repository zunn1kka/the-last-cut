export interface CommentRating {
	id: string
	isPositive: boolean
	user: {
		id: string
		username: string
	}
}
