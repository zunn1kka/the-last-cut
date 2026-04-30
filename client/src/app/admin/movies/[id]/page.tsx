'use client'

import { MovieForm } from '@/features/admin/movies/ui/movie-form'
import { adminApi } from '@/shared/api/admin/admin-api'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditMoviePage() {
	const { id } = useParams()
	const [movie, setMovie] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchMovie = async () => {
			try {
				const response = await adminApi.getMovie(id as string)
				setMovie(response.data)
			} catch (error) {
				console.error('Failed to fetch movie:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchMovie()
	}, [id])

	if (loading) {
		return (
			<div className='flex justify-center py-12'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
			</div>
		)
	}

	if (!movie) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-500'>Фильм не найден</p>
			</div>
		)
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-8'>Редактирование фильма</h1>
			<MovieForm initialData={movie} isEditing movieId={id as string} />
		</div>
	)
}
