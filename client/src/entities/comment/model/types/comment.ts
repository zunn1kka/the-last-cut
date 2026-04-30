import { CommentRating } from './comment-rating'

export interface Comment {
	id: string
	text: string
	rating?: number
	createdAt: string
	updatedAt: string
	user: {
		id: string
		username: string
		avatarUrl?: string
	}
	content?: {
		id: string
		title: string
		posterUrl?: string
	}
	parentId?: string
	replies?: Comment[]
	ratings?: CommentRating[]
}
