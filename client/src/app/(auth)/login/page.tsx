'use client'

import { authApi } from '@/shared/api/auth/auth-api'
import Button from '@/shared/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			await authApi.login({ email, password })
			window.location.reload() // Принудительная перезагрузка
			router.push('/')
		} catch (err: any) {
			setError(err.response?.data?.message || 'Ошибка входа')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<form
				onSubmit={handleSubmit}
				className='bg-white p-8 rounded-lg shadow-md w-96'
			>
				<h1 className='text-2xl font-bold mb-6 text-center'>Вход</h1>

				{error && (
					<div className='bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm'>
						{error}
					</div>
				)}

				<div className='mb-4'>
					<label className='block text-sm font-medium mb-1'>Email</label>
					<input
						type='email'
						value={email}
						onChange={e => setEmail(e.target.value)}
						className='w-full px-3 py-2 border rounded-lg'
						required
					/>
				</div>

				<div className='mb-6'>
					<label className='block text-sm font-medium mb-1'>Пароль</label>
					<input
						type='password'
						value={password}
						onChange={e => setPassword(e.target.value)}
						className='w-full px-3 py-2 border rounded-lg'
						required
					/>
				</div>

				<Button type='submit' className='w-full' disabled={loading}>
					{loading ? 'Вход...' : 'Войти'}
				</Button>

				<p className='text-center mt-4 text-sm text-gray-600'>
					Нет аккаунта?{' '}
					<Link href='/register' className='text-blue-600 hover:underline'>
						Зарегистрироваться
					</Link>
				</p>
			</form>
		</div>
	)
}
