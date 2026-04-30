import axios from 'axios'

export const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
})

// Переменная для хранения accessToken в памяти
let accessToken: string | null = null

// Флаг для предотвращения множественных запросов на обновление
let isRefreshing = false
// Очередь запросов, ожидающих обновления токена
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error)
		} else {
			prom.resolve(token)
		}
	})
	failedQueue = []
}

// Функция для установки токена
export const setAccessToken = (token: string) => {
	accessToken = token
	console.log('📦 AccessToken сохранен в памяти')
}

// ЗАГРУЗКА ТОКЕНА ИЗ LOCALSTORAGE ПРИ СТАРТЕ
if (typeof window !== 'undefined') {
	const savedToken = localStorage.getItem('accessToken')
	if (savedToken) {
		accessToken = savedToken
		console.log('📦 Токен загружен из localStorage при старте')
	}
}

// ========== REQUEST INTERCEPTOR ==========
apiClient.interceptors.request.use(config => {
	// Логирование запроса
	console.log(
		`🚀 API ${config.method?.toUpperCase()} ${config.url}`,
		config.params,
	)

	// Пропускаем запрос на обновление токена
	if (config.url?.includes('/auth/refresh')) {
		return config
	}

	// Добавляем токен, если есть
	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`
	}

	return config
})

// ========== RESPONSE INTERCEPTOR ==========
apiClient.interceptors.response.use(
	response => {
		console.log(`✅ Успех:`, response.status, response.config.url)

		// Если в ответе есть accessToken - сохраняем
		if (response.data?.accessToken) {
			console.log('📦 Получен новый accessToken')
			accessToken = response.data.accessToken
			localStorage.setItem('accessToken', response.data.accessToken)
		}

		return response
	},
	async error => {
		const originalRequest = error.config

		// Если нет originalRequest или это запрос на обновление - просто reject
		if (!originalRequest || originalRequest.url?.includes('/auth/refresh')) {
			return Promise.reject(error)
		}

		// Если ошибка не 401 - просто reject
		if (error.response?.status !== 401) {
			return Promise.reject(error)
		}

		// Если уже пробовали обновить - reject
		if (originalRequest._retry) {
			// Очищаем токены и перенаправляем на логин
			accessToken = null
			localStorage.removeItem('accessToken')

			if (
				typeof window !== 'undefined' &&
				!window.location.pathname.includes('/login')
			) {
				console.log('🔄 Перенаправление на логин...')
				window.location.href = '/login'
			}
			return Promise.reject(error)
		}

		// Пробуем обновить токен
		if (!isRefreshing) {
			isRefreshing = true
			originalRequest._retry = true

			try {
				console.log('🔄 Пробуем обновить токен...')
				const response = await apiClient.post('/auth/refresh')

				if (response.data?.accessToken) {
					console.log('✅ Токен обновлен')
					accessToken = response.data.accessToken
					localStorage.setItem('accessToken', response.data.accessToken)

					processQueue(null, accessToken)

					// Повторяем исходный запрос
					originalRequest.headers.Authorization = `Bearer ${accessToken}`
					return apiClient(originalRequest)
				}
			} catch (refreshError) {
				console.log('❌ Не удалось обновить токен')
				processQueue(refreshError, null)

				// Очищаем токены
				accessToken = null
				localStorage.removeItem('accessToken')

				// Перенаправляем на логин
				if (
					typeof window !== 'undefined' &&
					!window.location.pathname.includes('/login')
				) {
					window.location.href = '/login'
				}

				return Promise.reject(refreshError)
			} finally {
				isRefreshing = false
			}
		}

		// Если уже обновляем - добавляем в очередь
		return new Promise((resolve, reject) => {
			failedQueue.push({ resolve, reject })
		})
			.then(token => {
				originalRequest.headers.Authorization = `Bearer ${token}`
				return apiClient(originalRequest)
			})
			.catch(err => Promise.reject(err))
	},
)
