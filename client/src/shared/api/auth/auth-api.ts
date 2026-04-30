import { apiClient } from '../axios-instance'
import { RegisterData } from './register-data.interface'

export const authApi = {
	register: async (data: RegisterData, avatarUrl?: File) => {
		const formData = new FormData()
		Object.entries(data).forEach(([key, value]) => {
			if (value) formData.append(key, value)
		})
		if (avatarUrl) formData.append('avatarUrl', avatarUrl)

		return apiClient.post('/auth/register', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
	},

	login: async (credentials: { email: string; password: string }) => {
		console.log('📤 API login request to:', '/auth/login')
		const response = await apiClient.post('/auth/login', credentials)

		console.log('📥 API login response:', {
			status: response.status,
			hasAccessToken: !!response.data?.accessToken,
			hasUser: !!response.data?.user,
			data: response.data,
		})

		// Проверяем и сохраняем токен
		if (response.data?.accessToken) {
			localStorage.setItem('accessToken', response.data.accessToken)
			console.log('📦 Токен сохранен в localStorage')
		}

		return response
	},

	logout: () => {
		localStorage.removeItem('accessToken')
		// Не ждем ответа, просто очищаем на клиенте
		apiClient.post('/auth/logout').catch(() => {})
		return Promise.resolve()
	},

	refresh: () => apiClient.post('/auth/refresh'),

	getMe: () => {
		console.log('📤 Запрос /auth/me')
		return apiClient.get('/auth/me')
	},

	resendVerification: (email: string) => {
		return apiClient.post('/auth/resend-verification', { email })
	},

	verifyEmail: (token: string) =>
		apiClient.get(`/auth/verify-email?token=${token}`),
}
