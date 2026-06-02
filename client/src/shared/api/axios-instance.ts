import axios from 'axios'

export const apiClient = axios.create({
	baseURL: process.env.TEST_URL,
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

// Массив маршрутов, для которых не нужно перенаправлять на логин
const publicRoutes = ['/', '/movies', '/series', '/actors', '/top', '/about']

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

		// Для запросов к auth не пытаемся обновлять токен
		if (originalRequest.url?.includes('/auth/')) {
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

			// Проверяем, не является ли текущий путь публичным
			const currentPath = window.location.pathname
			const isPublicRoute = publicRoutes.some(
				route => currentPath === route || currentPath.startsWith(route + '/'),
			)

			// Перенаправляем только если текущий путь не публичный
			if (
				!isPublicRoute &&
				!currentPath.includes('/login') &&
				!currentPath.includes('/register')
			) {
				window.location.href = '/login'
			}
			return Promise.reject(refreshError)
		} finally {
			isRefreshing = false
		}
	},
)
