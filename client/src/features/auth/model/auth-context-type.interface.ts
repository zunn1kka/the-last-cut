import { User } from './user.interface'

export interface AuthContextType {
	user: User | null
	isLoading: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => Promise<void>
	updateUser: (userData: Partial<User>) => void
}
