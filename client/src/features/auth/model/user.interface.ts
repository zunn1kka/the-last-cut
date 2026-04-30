export interface User {
	id: string
	email: string
	username: string
	role: 'ADMIN' | 'USER' | 'MODERATOR'
	bio?: string
	telegramId: string
	avatarUrl?: string
}
