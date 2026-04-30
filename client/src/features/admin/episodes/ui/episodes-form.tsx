'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import Button from '@/shared/ui/Button'
import { Calendar, Clock, FileText, X } from 'lucide-react'
import { useState } from 'react'

interface EpisodeFormProps {
	seriesId: string
	initialData?: any
	isEditing?: boolean
	episodeId?: string
	onClose: () => void
	onSuccess: () => void
}

export function EpisodeForm({
	seriesId,
	initialData,
	isEditing,
	episodeId,
	onClose,
	onSuccess,
}: EpisodeFormProps) {
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		seasonNumber: initialData?.seasonNumber || 1,
		episodeNumber: initialData?.episodeNumber || 1,
		title: initialData?.title || '',
		duration: initialData?.duration || 0,
		description: initialData?.description || '',
		airDate: initialData?.airDate ? initialData.airDate.split('T')[0] : '',
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			if (!formData.title) throw new Error('Название обязательно')
			if (formData.duration <= 0)
				throw new Error('Длительность должна быть больше 0')
			if (formData.seasonNumber < 1)
				throw new Error('Номер сезона должен быть больше 0')
			if (formData.episodeNumber < 1)
				throw new Error('Номер эпизода должен быть больше 0')

			const dataToSend = {
				...formData,
				duration: Number(formData.duration),
				seasonNumber: Number(formData.seasonNumber),
				episodeNumber: Number(formData.episodeNumber),
				airDate: formData.airDate || undefined,
			}

			if (isEditing && episodeId) {
				await adminApi.updateEpisode(episodeId, dataToSend)
			} else {
				await adminApi.createEpisode(seriesId, dataToSend)
			}

			onSuccess()
			onClose()
		} catch (error: any) {
			console.error('Failed to save episode:', error)
			alert(
				error.response?.data?.message ||
					error.message ||
					'Ошибка при сохранении эпизода',
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'>
			<div className='bg-custom-dark rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700'>
				<div className='flex justify-between items-center p-6 border-b border-gray-700'>
					<h2 className='text-2xl font-bold text-white'>
						{isEditing ? 'Редактирование эпизода' : 'Добавление эпизода'}
					</h2>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-white transition-colors'
					>
						<X className='w-6 h-6' />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='p-6 space-y-6'>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Номер сезона <span className='text-red-500'>*</span>
							</label>
							<input
								type='number'
								min='1'
								value={formData.seasonNumber}
								onChange={e =>
									setFormData({
										...formData,
										seasonNumber: parseInt(e.target.value) || 1,
									})
								}
								className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Номер эпизода <span className='text-red-500'>*</span>
							</label>
							<input
								type='number'
								min='1'
								value={formData.episodeNumber}
								onChange={e =>
									setFormData({
										...formData,
										episodeNumber: parseInt(e.target.value) || 1,
									})
								}
								className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
								required
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Название <span className='text-red-500'>*</span>
						</label>
						<div className='relative'>
							<FileText className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
							<input
								type='text'
								value={formData.title}
								onChange={e =>
									setFormData({ ...formData, title: e.target.value })
								}
								className='w-full pl-10 pr-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
								placeholder='Название эпизода'
								required
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Длительность (мин) <span className='text-red-500'>*</span>
						</label>
						<div className='relative'>
							<Clock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
							<input
								type='number'
								min='1'
								max='180'
								value={formData.duration}
								onChange={e =>
									setFormData({
										...formData,
										duration: parseInt(e.target.value) || 0,
									})
								}
								className='w-full pl-10 pr-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
								required
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Дата выхода
						</label>
						<div className='relative'>
							<Calendar className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
							<input
								type='date'
								value={formData.airDate}
								onChange={e =>
									setFormData({ ...formData, airDate: e.target.value })
								}
								className='w-full pl-10 pr-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Описание
						</label>
						<textarea
							value={formData.description}
							onChange={e =>
								setFormData({ ...formData, description: e.target.value })
							}
							rows={4}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
							placeholder='Краткое описание эпизода...'
						/>
					</div>

					<div className='flex justify-end space-x-4 pt-4 border-t border-gray-700'>
						<Button type='button' variant='outline' onClick={onClose}>
							Отмена
						</Button>
						<Button type='submit' disabled={loading}>
							{loading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Добавить'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
