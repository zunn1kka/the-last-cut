'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { authApi } from '@/shared/api/auth/auth-api'
import Button from '@/shared/ui/Button'
import { Film, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { login } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [success, setSuccess] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (searchParams.get('registered') === 'true') {
			setSuccess('Регистрация прошла успешно! Теперь вы можете войти.')
		}
	}, [searchParams])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')
		setSuccess('')
		try {
			const response = await authApi.login({ email, password })
			console.log('📥 Ответ от сервера:', response.data)

			// Сохраняем пользователя в контексте
			if (response.data.user) {
				login(response.data.user)
			}

			// Полная перезагрузка страницы для обновления всех компонентов
			window.location.href = '/'
		} catch (err: any) {
			setError(err.response?.data?.message || 'Ошибка входа')
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-custom-darker px-4'>
			{/* Фоновые декоративные элементы */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl' />
				<div className='absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl' />
			</div>

			<form
				onSubmit={handleSubmit}
				className='relative bg-custom-dark rounded-2xl shadow-2xl border border-gray-800 p-8 w-full max-w-md'
			>
				{/* Логотип */}
				<div className='flex justify-center mb-6'>
					<div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg'>
						<Film className='w-8 h-8 text-white' />
					</div>
				</div>

				<h1 className='text-2xl font-bold text-center text-white mb-2'>
					Добро пожаловать
				</h1>
				<p className='text-center text-gray-400 text-sm mb-8'>
					Войдите в свой аккаунт
				</p>

				{error && (
					<div className='bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm'>
						{error}
					</div>
				)}

				<div className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Email
						</label>
						<div className='relative'>
							<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
							<input
								type='email'
								value={email}
								onChange={e => setEmail(e.target.value)}
								className='w-full pl-10 pr-4 py-3 bg-custom-darker border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
								placeholder='your@email.com'
								required
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Пароль
						</label>
						<div className='relative'>
							<Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
							<input
								type='password'
								value={password}
								onChange={e => setPassword(e.target.value)}
								className='w-full pl-10 pr-4 py-3 bg-custom-darker border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
								placeholder='••••••••'
								required
							/>
						</div>
					</div>
				</div>

				<Button
					type='submit'
					className='w-full mt-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25'
					disabled={loading}
				>
					{loading ? (
						<span className='flex items-center justify-center gap-2'>
							<div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
							Вход...
						</span>
					) : (
						'Войти'
					)}
				</Button>

				<p className='text-center mt-6 text-sm text-gray-400'>
					Нет аккаунта?{' '}
					<Link
						href='/register'
						className='text-blue-400 hover:text-blue-300 font-medium transition-colors'
					>
						Зарегистрироваться
					</Link>
				</p>
			</form>
		</div>
	)
}
