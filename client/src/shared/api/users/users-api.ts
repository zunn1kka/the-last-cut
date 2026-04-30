import { apiClient } from '../axios-instance'
import { UpdateProfileData } from './update-profile-data.interface'

export const usersApi = {
	getProfile: () => apiClient.get('/users/profile'),

	updateProfile: (data: UpdateProfileData) =>
		apiClient.put('/users/profile', data),

	updateAvatar: (avatarFile: File) => {
		const formData = new FormData()
		formData.append('avatarUrl', avatarFile)
		return apiClient.put('/users/profile', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
	},

	changeEmail: (email: string, password: string) =>
		apiClient.put('/users/change-email', { email, password }),

	changePassword: (
		currentPassword: string,
		newPassword: string,
		confirmPassword: string,
	) =>
		apiClient.put('/users/change-password', {
			currentPassword,
			newPassword,
			confirmPassword,
		}),

	deleteAccount: (password: string) =>
		apiClient.delete('/users/delete-account', { data: { password } }),
}
