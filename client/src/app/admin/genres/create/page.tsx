'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import Button from '@/shared/ui/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateGenrePage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		slug: '',
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			if (!formData.name) throw new Error('Название обязательно')
			if (!formData.slug) throw new Error('Slug обязателен')

			await adminApi.createGenre(formData)
			router.push('/admin/genres')
			router.refresh()
		} catch (error: any) {
			console.error('Failed to create genre:', error)
			alert(
				error.response?.data?.message ||
					error.message ||
					'Ошибка при создании жанра',
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<h1 className='text-3xl font-bold mb-8'>Создание нового жанра</h1>

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
					<p className='text-xs text-gray-500 mt-1'>
						Например: Фантастика, Боевик, Комедия
					</p>
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
					<p className='text-xs text-gray-500 mt-1'>
						URL-идентификатор. Например: sci-fi, action, comedy
					</p>
				</div>

				<div className='flex justify-end space-x-4'>
					<Button type='button' variant='outline' onClick={() => router.back()}>
						Отмена
					</Button>
					<Button type='submit' disabled={loading}>
						{loading ? 'Сохранение...' : 'Создать жанр'}
					</Button>
				</div>
			</form>
		</div>
	)
}
