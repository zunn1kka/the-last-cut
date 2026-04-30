'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { authApi } from '@/shared/api/auth/auth-api'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function VerifyEmailContent() {
	const searchParams = useSearchParams()
	const token = searchParams.get('token')
	const { updateUser } = useAuth() // 👈 Добавьте это
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
		'loading',
	)
	const [message, setMessage] = useState('')

	useEffect(() => {
		if (!token) {
			setStatus('error')
			setMessage('Отсутствует токен подтверждения')
			return
		}

		const verify = async () => {
			try {
				const response = await authApi.verifyEmail(token)
				setStatus('success')
				setMessage(response.data?.message || 'Email успешно подтверждён!')

				// 👇 Обновляем статус верификации в контексте
				updateUser({ emailVerified: true })
			} catch (error: any) {
				setStatus('error')
				setMessage(
					error.response?.data?.message || 'Ошибка при подтверждении email',
				)
			}
		}

		verify()
	}, [token, updateUser])

	return (
		<div className='min-h-screen flex items-center justify-center bg-custom-darker px-4'>
			<div className='bg-custom-dark rounded-xl border border-gray-800 p-8 max-w-md w-full text-center'>
				{status === 'loading' && (
					<>
						<Loader2 className='w-12 h-12 text-blue-400 animate-spin mx-auto mb-4' />
						<h2 className='text-xl font-semibold text-white mb-2'>
							Подтверждение email
						</h2>
						<p className='text-gray-400'>Пожалуйста, подождите...</p>
					</>
				)}

				{status === 'success' && (
					<>
						<CheckCircle className='w-12 h-12 text-green-400 mx-auto mb-4' />
						<h2 className='text-xl font-semibold text-white mb-2'>
							Email подтверждён!
						</h2>
						<p className='text-gray-400 mb-6'>{message}</p>
						<Link
							href='/profile'
							className='inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
						>
							Перейти в профиль
						</Link>
					</>
				)}

				{status === 'error' && (
					<>
						<XCircle className='w-12 h-12 text-red-400 mx-auto mb-4' />
						<h2 className='text-xl font-semibold text-white mb-2'>Ошибка</h2>
						<p className='text-gray-400 mb-6'>{message}</p>
						<Link
							href='/profile'
							className='inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
						>
							Вернуться в профиль
						</Link>
					</>
				)}
			</div>
		</div>
	)
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-custom-darker'>
					<Loader2 className='w-8 h-8 text-blue-400 animate-spin' />
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	)
}
