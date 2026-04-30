'use client'

import { authApi } from '@/shared/api/auth/auth-api'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'
import { AuthContextType } from './auth-context-type.interface'
import { User } from './user.interface'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()

	// Загрузка пользователя при старте
	useEffect(() => {
		const loadUser = async () => {
			try {
				console.log('📥 Загрузка пользователя при старте...')
				const response = await authApi.getMe()
				console.log('✅ Полный ответ от getMe:', response.data)

				const userData = response.data.user || response.data
				console.log('👤 userData из getMe:', userData)
				console.log('👤 role из getMe:', userData?.role)

				setUser(userData)
			} catch (error) {
				console.log('❌ Пользователь не загружен (не авторизован)')
				setUser(null)
			} finally {
				setIsLoading(false)
			}
		}
		loadUser()
	}, [])

	const login = async (email: string, password: string) => {
		try {
			console.log('🔑 1. Начало входа для:', email)

			// 1. Логинимся
			console.log('📤 2. Отправка запроса /auth/login')
			const response = await authApi.login({ email, password })
			console.log('✅ 3. Ответ от /auth/login:', response.data)
			console.log('✅ 3.1 role из ответа логина:', response.data.user?.role)

			// 2. Сохраняем пользователя ИЗ ОТВЕТА ЛОГИНА (не делаем дополнительный запрос)
			const userData = response.data.user
			console.log('👤 4. Сохраняем пользователя из логина:', userData)
			console.log('👤 4.1 role пользователя:', userData?.role)

			setUser(userData)

			// 3. Перенаправление
			console.log(
				'🔄 5. Перенаправление на:',
				userData.role === 'ADMIN' ? '/admin/movies' : '/profile',
			)

			// Небольшая задержка для сохранения состояния
			setTimeout(() => {
				if (userData.role === 'ADMIN') {
					window.location.href = '/admin/movies'
				} else {
					window.location.href = '/profile'
				}
			}, 100)
		} catch (error: any) {
			console.error('❌ Ошибка входа:', error)
			throw error
		}
	}

	const logout = async () => {
		try {
			await authApi.logout()
			setUser(null)
			localStorage.removeItem('accessToken')
			router.push('/')
		} catch (error) {
			console.error('❌ Ошибка выхода:', error)
		}
	}

	const updateUser = (userData: Partial<User>) => {
		setUser(prev => (prev ? { ...prev, ...userData } : null))
	}

	return (
		<AuthContext.Provider
			value={{ user, isLoading, login, logout, updateUser }}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) throw new Error('useAuth must be used within AuthProvider')
	return context
}
