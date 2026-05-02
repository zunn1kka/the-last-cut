'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import {
	Calendar,
	CheckCircle,
	ChevronLeft,
	Mail,
	Shield,
	XCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function UserDetailsPage() {
	const { id } = useParams()
	const router = useRouter()
	const [user, setUser] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchUser()
	}, [id])

	const fetchUser = async () => {
		try {
			const response = await adminApi.getUserById(id as string)
			setUser(response.data)
		} catch (error) {
			console.error('Failed to fetch user:', error)
		} finally {
			setLoading(false)
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	if (loading) {
		return (
			<div className='flex justify-center py-12'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
			</div>
		)
	}

	if (!user) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-500'>Пользователь не найден</p>
			</div>
		)
	}

	return (
		<div>
			<button
				onClick={() => router.push('/admin/users')}
				className='flex items-center text-gray-600 hover:text-gray-900 mb-6'
			>
				<ChevronLeft className='w-4 h-4 mr-1' />
				Назад к пользователям
			</button>

			<div className='bg-white rounded-lg shadow overflow-hidden'>
				<div className='p-6 border-b'>
					<div className='flex items-center space-x-4'>
						<div className='relative w-20 h-20 rounded-full overflow-hidden bg-gray-200'>
							{user.avatarUrl ? (
								<Image
									src={getImageUrl(user.avatarUrl)}
									alt={user.username}
									fill
									className='object-cover'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center bg-blue-600 text-white text-2xl'>
									{user.username.charAt(0).toUpperCase()}
								</div>
							)}
						</div>
						<div>
							<h1 className='text-2xl font-bold'>{user.username}</h1>
							<p className='text-gray-500'>ID: {user.id}</p>
						</div>
					</div>
				</div>

				<div className='p-6 space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label className='block text-sm font-medium text-gray-500'>
								Email
							</label>
							<div className='flex items-center mt-1'>
								<Mail className='w-4 h-4 mr-2 text-gray-400' />
								<span>{user.email}</span>
								{user.emailVerified ? (
									<CheckCircle className='w-4 h-4 ml-2 text-green-500' />
								) : (
									<XCircle className='w-4 h-4 ml-2 text-red-500' />
								)}
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-500'>
								Роль
							</label>
							<div className='flex items-center mt-1'>
								<Shield className='w-4 h-4 mr-2 text-gray-400' />
								<span
									className={`px-2 py-1 rounded text-sm font-medium ${
										user.role === 'ADMIN'
											? 'bg-red-100 text-red-800'
											: user.role === 'MODERATOR'
												? 'bg-yellow-100 text-yellow-800'
												: 'bg-green-100 text-green-800'
									}`}
								>
									{user.role}
								</span>
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-500'>
								Telegram
							</label>
							<div className='mt-1'>{user.telegramId || '—'}</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-500'>
								Биография
							</label>
							<div className='mt-1'>{user.bio || '—'}</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-500'>
								Дата регистрации
							</label>
							<div className='flex items-center mt-1'>
								<Calendar className='w-4 h-4 mr-2 text-gray-400' />
								{formatDate(user.createdAt)}
							</div>
						</div>
					</div>

					<div className='flex justify-end space-x-4 pt-6 border-t'>
						<Button
							variant='outline'
							onClick={() => router.push('/admin/users')}
						>
							Назад
						</Button>
						<Button
							variant='danger'
							onClick={async () => {
								if (confirm('Удалить пользователя?')) {
									await adminApi.deleteUser(user.id)
									router.push('/admin/users')
								}
							}}
						>
							Удалить пользователя
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
