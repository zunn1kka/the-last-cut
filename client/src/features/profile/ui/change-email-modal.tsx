'use client'

import { usersApi } from '@/shared/api/users/users-api'
import Button from '@/shared/ui/Button'
import { Mail, X } from 'lucide-react'
import { useState } from 'react'

interface ChangeEmailModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

export function ChangeEmailModal({
	isOpen,
	onClose,
	onSuccess,
}: ChangeEmailModalProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			await usersApi.changeEmail({ email, password })
			onSuccess()
			onClose()
			setEmail('')
			setPassword('')
		} catch (err: any) {
			setError(err.response?.data?.message || 'Ошибка при смене email')
		} finally {
			setLoading(false)
		}
	}

	if (!isOpen) return null

	return (
		<>
			<div className='fixed inset-0 bg-black/80 z-40' onClick={onClose} />
			<div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-custom-dark rounded-xl border border-gray-800 p-6 z-50'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-xl font-bold text-white flex items-center gap-2'>
						<Mail className='w-5 h-5 text-blue-400' />
						Сменить email
					</h2>
					<button onClick={onClose} className='text-gray-400 hover:text-white'>
						<X className='w-5 h-5' />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1'>
							Новый email
						</label>
						<input
							type='email'
							value={email}
							onChange={e => setEmail(e.target.value)}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1'>
							Подтверждение паролем
						</label>
						<input
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					{error && (
						<div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm'>
							{error}
						</div>
					)}

					<div className='flex gap-3 pt-2'>
						<Button type='submit' disabled={loading}>
							{loading ? 'Сохранение...' : 'Сохранить'}
						</Button>
						<Button type='button' variant='outline' onClick={onClose}>
							Отмена
						</Button>
					</div>
				</form>
			</div>
		</>
	)
}
