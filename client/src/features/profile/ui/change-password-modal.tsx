'use client'

import { usersApi } from '@/shared/api/users/users-api'
import Button from '@/shared/ui/Button'
import { Lock, X } from 'lucide-react'
import { useState } from 'react'

interface ChangePasswordModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

export function ChangePasswordModal({
	isOpen,
	onClose,
	onSuccess,
}: ChangePasswordModalProps) {
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		if (newPassword !== confirmPassword) {
			setError('Новые пароли не совпадают')
			setLoading(false)
			return
		}

		try {
			await usersApi.changePassword({
				currentPassword,
				newPassword,
				confirmPassword,
			})
			onSuccess()
			onClose()
			setCurrentPassword('')
			setNewPassword('')
			setConfirmPassword('')
		} catch (err: any) {
			setError(err.response?.data?.message || 'Ошибка при смене пароля')
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
						<Lock className='w-5 h-5 text-blue-400' />
						Сменить пароль
					</h2>
					<button onClick={onClose} className='text-gray-400 hover:text-white'>
						<X className='w-5 h-5' />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1'>
							Текущий пароль
						</label>
						<input
							type='password'
							value={currentPassword}
							onChange={e => setCurrentPassword(e.target.value)}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1'>
							Новый пароль
						</label>
						<input
							type='password'
							value={newPassword}
							onChange={e => setNewPassword(e.target.value)}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
						<p className='text-xs text-gray-500 mt-1'>
							Пароль должен содержать минимум 8 символов, одну заглавную букву и
							одну цифру
						</p>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1'>
							Подтверждение нового пароля
						</label>
						<input
							type='password'
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
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
