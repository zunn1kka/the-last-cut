'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import { DataTable } from '@/widgets/admin/data-table'
import { Flag, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Comment {
	id: string
	text: string
	rating?: number
	createdAt: string
	user: {
		id: string
		username: string
		avatarUrl?: string
	}
	content: {
		id: string
		title: string
		posterUrl?: string
	}
}

export default function AdminCommentsPage() {
	const [comments, setComments] = useState<Comment[]>([])
	const [loading, setLoading] = useState(true)
	const [status, setStatus] = useState('all')
	const [pagination, setPagination] = useState({
		page: 1,
		totalPages: 1,
		total: 0,
	})

	useEffect(() => {
		fetchComments()
	}, [status])

	const fetchComments = async () => {
		try {
			const response = await adminApi.getComments({ status })
			console.log('📥 Comments response:', response.data) // ← СМОТРИ СЮДА!

			// 🔥 ВАЖНО: извлекаем массив из response.data
			let commentsData = []
			let total = 0
			let page = 1
			let totalPages = 1

			if (response.data?.items) {
				commentsData = response.data.items
				total = response.data.total
				page = response.data.page
				totalPages = response.data.totalPages
			} else if (Array.isArray(response.data)) {
				commentsData = response.data
			} else {
				commentsData = []
			}

			setComments(commentsData)
			setPagination({ page, totalPages, total })
		} catch (error) {
			console.error('Failed to fetch comments:', error)
			setComments([])
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async (id: string) => {
		if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
			try {
				await adminApi.deleteComment(id)
				setComments(comments.filter(c => c.id !== id))
			} catch (error) {
				console.error('Failed to delete comment:', error)
			}
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const truncateText = (text: string, maxLength: number = 100) => {
		if (!text) return ''
		if (text.length <= maxLength) return text
		return text.substring(0, maxLength) + '...'
	}

	const columns = [
		{
			key: 'content',
			label: 'Контент',
			render: (item: Comment) => (
				<div className='flex items-center space-x-2'>
					<div className='relative w-8 h-12 rounded overflow-hidden bg-gray-200'>
						{item.content?.posterUrl ? (
							<Image
								src={getImageUrl(item.content.posterUrl)}
								alt={item.content.title}
								unoptimized={true}
								fill
								className='object-cover'
							/>
						) : (
							<div className='w-full h-full flex items-center justify-center bg-gray-300 text-xs'>
								Нет
							</div>
						)}
					</div>
					<span className='font-medium'>{item.content?.title}</span>
				</div>
			),
		},
		{
			key: 'user',
			label: 'Пользователь',
			render: (item: Comment) => (
				<div className='flex items-center space-x-2'>
					<div className='relative w-6 h-6 rounded-full overflow-hidden bg-gray-200'>
						{item.user?.avatarUrl ? (
							<Image
								src={getImageUrl(item.user.avatarUrl)}
								alt={item.user.username}
								fill
								unoptimized={true}
								className='object-cover'
							/>
						) : (
							<div className='w-full h-full flex items-center justify-center bg-blue-600 text-white text-xs'>
								{item.user?.username?.charAt(0)?.toUpperCase()}
							</div>
						)}
					</div>
					<Link
						href={`/admin/users/${item.user?.id}`}
						className='hover:text-blue-600'
					>
						{item.user?.username}
					</Link>
				</div>
			),
		},
		{
			key: 'text',
			label: 'Комментарий',
			render: (item: Comment) => (
				<div className='max-w-md'>
					<p className='text-sm'>{truncateText(item.text, 80)}</p>
					{item.rating && (
						<span className='inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded'>
							★ {item.rating}
						</span>
					)}
				</div>
			),
		},

		{ key: 'actions', label: 'Действия', type: 'actions' },
	]

	return (
		<AdminGuard requiredRole='MODERATOR'>
			<div>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold flex items-center'>
						<MessageSquare className='w-8 h-8 mr-3' />
						Управление комментариями
					</h1>
					<Link href='/admin/comments/reports'>
						<Button variant='outline'>
							<Flag className='w-4 h-4 mr-2' />
							Жалобы
						</Button>
					</Link>
				</div>

				<DataTable
					data={comments}
					columns={columns}
					loading={loading}
					onDelete={handleDelete}
				/>
			</div>
		</AdminGuard>
	)
}
