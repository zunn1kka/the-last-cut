'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Report {
	id: string
	reason: string
	status: string
	createdAt: string
	comment: {
		id: string
		text: string
		user?: {
			id: string
			username: string
			avatarUrl?: string
		}
		content?: {
			id: string
			title: string
		}
	}
	user?: {
		id: string
		username: string
		avatarUrl?: string
	}
}

export default function ReportsPage() {
	const [reports, setReports] = useState<Report[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchReports()
	}, [])

	const fetchReports = async () => {
		setLoading(true)
		try {
			const response = await adminApi.getReports()
			// Обрабатываем разные структуры данных
			let reportsData = response.data
			if (!Array.isArray(reportsData)) {
				reportsData = []
			}
			setReports(reportsData)
		} catch (error) {
			console.error('Failed to fetch reports:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleResolve = async (id: string) => {
		try {
			await adminApi.resolveReport(id)
			fetchReports()
		} catch (error) {
			console.error('Failed to resolve report:', error)
		}
	}

	const handleReject = async (id: string) => {
		try {
			await adminApi.rejectReport(id)
			fetchReports()
		} catch (error) {
			console.error('Failed to reject report:', error)
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-500/20 text-yellow-400'
			case 'resolved':
				return 'bg-green-500/20 text-green-400'
			case 'rejected':
				return 'bg-red-500/20 text-red-400'
			default:
				return 'bg-gray-500/20 text-gray-400'
		}
	}

	const getStatusText = (status: string) => {
		switch (status) {
			case 'pending':
				return 'В обработке'
			case 'resolved':
				return 'Решена'
			case 'rejected':
				return 'Отклонена'
			default:
				return status
		}
	}

	if (loading) {
		return (
			<div className='flex justify-center py-12'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
			</div>
		)
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-2xl font-bold text-white mb-6'>
				Жалобы на комментарии
			</h1>

			{reports.length === 0 ? (
				<div className='text-center py-12 text-gray-500'>
					Нет жалоб на комментарии
				</div>
			) : (
				<div className='space-y-4'>
					{reports.map(report => (
						<div
							key={report.id}
							className='bg-custom-dark rounded-xl border border-gray-800 p-4'
						>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									{/* Кто пожаловался */}
									<div className='mb-2'>
										<span className='text-sm text-gray-500'>Жалоба от: </span>
										<span className='text-sm text-white font-medium'>
											{report.user?.username || 'Неизвестный пользователь'}
										</span>
									</div>

									{/* На какой комментарий */}
									<div className='mb-2 p-2 bg-custom-darker rounded-lg'>
										<div className='text-xs text-gray-500 mb-1'>
											Комментарий:
										</div>
										<div className='text-sm text-gray-300'>
											{report.comment?.text || 'Комментарий не найден'}
										</div>
										{report.comment?.user && (
											<div className='text-xs text-gray-500 mt-1'>
												Автор комментария: {report.comment.user.username}
											</div>
										)}
										{report.comment?.content && (
											<div className='text-xs text-gray-500'>
												Фильм/Сериал: {report.comment.content.title}
											</div>
										)}
									</div>

									{/* Причина жалобы */}
									<div className='mb-2'>
										<span className='text-sm text-gray-500'>Причина: </span>
										<span className='text-sm text-white'>{report.reason}</span>
									</div>

									{/* Статус */}
									<div>
										<span
											className={`text-xs px-2 py-1 rounded ${getStatusColor(report.status)}`}
										>
											{getStatusText(report.status)}
										</span>
									</div>
								</div>

								{/* Кнопки действий */}
								{report.status === 'pending' && (
									<div className='flex gap-2 ml-4'>
										<button
											onClick={() => handleResolve(report.id)}
											className='p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors'
											title='Решить жалобу'
										>
											<CheckCircle className='w-5 h-5' />
										</button>
										<button
											onClick={() => handleReject(report.id)}
											className='p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors'
											title='Отклонить жалобу'
										>
											<XCircle className='w-5 h-5' />
										</button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
