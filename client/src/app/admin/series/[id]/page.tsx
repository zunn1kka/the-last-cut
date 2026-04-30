'use client'

import { SeriesForm } from '@/features/admin/series/ui/series-form'
import { adminApi } from '@/shared/api/admin/admin-api'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditSeriesPage() {
	const { id } = useParams()
	const [series, setSeries] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchSeries = async () => {
			try {
				const response = await adminApi.getSeriesById(id as string)
				setSeries(response.data)
			} catch (error) {
				console.error('Failed to fetch series:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchSeries()
	}, [id])

	if (loading) {
		return (
			<div className='flex justify-center py-12'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
			</div>
		)
	}

	if (!series) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-500'>Сериал не найден</p>
			</div>
		)
	}

	return (
		<div>
			<h1 className='text-3xl font-bold mb-8'>Редактирование сериала</h1>
			<SeriesForm initialData={series} isEditing movieId={id as string} />
		</div>
	)
}
