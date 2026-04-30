'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { authApi } from '@/shared/api/auth/auth-api'
import { CheckCircle, Loader2, Mail, Send, XCircle } from 'lucide-react'
import { useState } from 'react'

interface EmailVerificationProps {
	email: string
	isVerified: boolean
}

export function EmailVerification({
	email,
	isVerified,
}: EmailVerificationProps) {
	const { updateUser, user } = useAuth() // 👈 Добавьте user
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<{
		type: 'success' | 'error'
		text: string
	} | null>(null)

	const handleResend = async () => {
		setLoading(true)
		setMessage(null)
		try {
			await authApi.resendVerification(email)
			setMessage({
				type: 'success',
				text: 'Письмо с подтверждением отправлено! Проверьте свою почту.',
			})
		} catch (error: any) {
			setMessage({
				type: 'error',
				text: error.response?.data?.message || 'Ошибка при отправке письма',
			})
		} finally {
			setLoading(false)
		}
	}

	// Если email уже подтверждён, показываем зелёный блок
	if (isVerified || user?.emailVerified) {
		return (
			<div className='bg-green-500/10 border border-green-500/20 rounded-lg p-4'>
				<div className='flex items-center gap-3'>
					<CheckCircle className='w-5 h-5 text-green-400' />
					<div>
						<p className='text-green-400 font-medium'>Email подтверждён</p>
						<p className='text-sm text-gray-400'>
							Ваш email {email} успешно подтверждён
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4'>
			<div className='flex items-start gap-3'>
				<Mail className='w-5 h-5 text-yellow-400 mt-0.5' />
				<div className='flex-1'>
					<p className='text-yellow-400 font-medium'>Email не подтверждён</p>
					<p className='text-sm text-gray-400 mb-3'>
						Подтвердите email {email}, чтобы получить доступ к комментариям и
						дополнительным функциям
					</p>
					<button
						onClick={handleResend}
						disabled={loading}
						className='inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors disabled:opacity-50'
					>
						{loading ? (
							<Loader2 className='w-4 h-4 animate-spin' />
						) : (
							<Send className='w-4 h-4' />
						)}
						{loading ? 'Отправка...' : 'Отправить письмо повторно'}
					</button>
					{message && (
						<p
							className={`text-sm mt-2 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
						>
							{message.text}
						</p>
					)}
				</div>
				<XCircle
					className='w-5 h-5 text-yellow-400 cursor-pointer hover:opacity-70'
					onClick={() => setMessage(null)}
				/>
			</div>
		</div>
	)
}
