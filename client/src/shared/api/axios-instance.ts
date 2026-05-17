import axios from 'axios'

export const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
})

let isRefreshing = false
let failedQueue: Array<{
	resolve: (value?: unknown) => void
	reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach(promise => {
		if (error) {
			promise.reject(error)
		} else {
			promise.resolve(token)
		}
	})
	failedQueue = []
}

apiClient.interceptors.request.use(
	config => {
		const token = localStorage.getItem('accessToken')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	error => Promise.reject(error),
)

apiClient.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		// Если ошибка не 401 или запрос уже был повторён - отклоняем
		if (error.response?.status !== 401 || originalRequest._retry) {
			return Promise.reject(error)
		}

		if (originalRequest.url?.includes('/auth/refresh')) {
			return Promise.reject(error)
		}

		originalRequest._retry = true

		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject })
			})
				.then(() => {
					const token = localStorage.getItem('accessToken')
					originalRequest.headers.Authorization = `Bearer ${token}`
					return apiClient(originalRequest)
				})
				.catch(err => Promise.reject(err))
		}

		isRefreshing = true

		try {
			const response = await apiClient.post('/auth/refresh')
			const { accessToken } = response.data

			if (accessToken) {
				localStorage.setItem('accessToken', accessToken)
				processQueue(null, accessToken)
				originalRequest.headers.Authorization = `Bearer ${accessToken}`
				return apiClient(originalRequest)
			} else {
				throw new Error('No access token received')
			}
		} catch (refreshError) {
			localStorage.removeItem('accessToken')
			processQueue(refreshError as Error, null)

			if (
				!window.location.pathname.includes('/login') &&
				!window.location.pathname.includes('/register')
			) {
				window.location.href = '/login'
			}
			return Promise.reject(refreshError)
		} finally {
			isRefreshing = false
		}
	},
)
