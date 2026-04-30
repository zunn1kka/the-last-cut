'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import Button from '@/shared/ui/Button'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditGenrePage() {
	const { id } = useParams()
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [fetchLoading, setFetchLoading] = useState(true)
	const [formData, setFormData] = useState({
		name: '',
		slug: '',
	})

	useEffect(() => {
		const fetchGenre = async () => {
			try {
				const response = await adminApi.getGenreById(id as string)
				setFormData({
					name: response.data.name,
					slug: response.data.slug,
				})
			} catch (error) {
				console.error('Failed to fetch genre:', error)
			} finally {
				setFetchLoading(false)
			}
		}
		fetchGenre()
	}, [id])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			if (!formData.name) throw new Error('Название обязательно')
			if (!formData.slug) throw new Error('Slug обязателен')

			await adminApi.updateGenre(id as string, formData)
			router.push('/admin/genres')
			router.refresh()
		} catch (error: any) {
			console.error('Failed to update genre:', error)
			alert(
				error.response?.data?.message ||
					error.message ||
					'Ошибка при обновлении жанра',
			)
		} finally {
			setLoading(false)
		}
	}

	if (fetchLoading) {
		return (
			<div className='flex justify-center py-12'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
			</div>
		)
	}

	return (
		<div>
			<h1 className='text-3xl font-bold mb-8'>Редактирование жанра</h1>

			<form onSubmit={handleSubmit} className='max-w-2xl space-y-6'>
				<div>
					<label className='block text-sm font-medium mb-2'>
						Название <span className='text-red-500'>*</span>
					</label>
					<input
						type='text'
						value={formData.name}
						onChange={e => setFormData({ ...formData, name: e.target.value })}
						className='w-full px-3 py-2 border rounded-lg'
						required
					/>
				</div>

				<div>
					<label className='block text-sm font-medium mb-2'>
						Slug <span className='text-red-500'>*</span>
					</label>
					<input
						type='text'
						value={formData.slug}
						onChange={e => setFormData({ ...formData, slug: e.target.value })}
						className='w-full px-3 py-2 border rounded-lg'
						required
					/>
				</div>

				<div className='flex justify-end space-x-4'>
					<Button type='button' variant='outline' onClick={() => router.back()}>
						Отмена
					</Button>
					<Button type='submit' disabled={loading}>
						{loading ? 'Сохранение...' : 'Сохранить изменения'}
					</Button>
				</div>
			</form>
		</div>
	)
}
