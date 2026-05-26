'use client'

import { apiClient } from '@/shared/api/axios-instance'
import { getImageUrl } from '@/shared/lib/get-image-url'
import { Comments } from '@/widgets/comments'
import { Calendar, Clock, Film, Star, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Movie {
	id: string
	title: string
	originalTitle: string | null
	description: string
	releaseYear: number
	posterUrl: string
	backdropUrl: string | null
	imdbRating: number | null
	kinopoiskRating: number | null
	siteRating: number | null
	ageRating: string | null
	contentType: 'MOVIE' | 'SERIES'
	movie?: {
		duration: number | null
		budget: number | null
	}
	genres?: Array<{
		genre: {
			id: string
			name: string
			slug: string
		}
	}>
	persons?: Array<{
		person: {
			id: string
			fullname: string
			photoUrl: string | null
		}
		roleName: string | null
		role?: {
			name: string
		}
	}>
}

export default function MoviePage() {
	const { id } = useParams()
	const [movie, setMovie] = useState<Movie | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			try {
				const response = await apiClient.get(`/content/movies/${id}`)
				console.log('📥 Movie data:', response.data)
				console.log('📥 Duration:', response.data.movie?.duration)
				console.log('📥 Genres count:', response.data.genres?.length)
				console.log('📥 Persons count:', response.data.persons?.length)
				setMovie(response.data)
			} catch (error) {
				console.error('Failed to fetch movie:', error)
			} finally {
				setLoading(false)
			}
		}
		if (id) fetchData()
	}, [id])

	if (loading) {
		return (
			<main className='bg-custom-darker min-h-screen py-12'>
				<div className='container mx-auto px-4 flex justify-center py-12'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
				</div>
			</main>
		)
	}

	if (!movie) {
		return (
			<main className='bg-custom-darker min-h-screen py-12'>
				<div className='container mx-auto px-4 text-center py-12'>
					<Film className='w-16 h-16 text-gray-600 mx-auto mb-4' />
					<h1 className='text-2xl font-bold text-white'>Фильм не найден</h1>
					<Link href='/movies' className='text-blue-400 mt-4 inline-block'>
						Вернуться к списку фильмов
					</Link>
				</div>
			</main>
		)
	}

	const primaryRating =
		movie.siteRating || movie.imdbRating || movie.kinopoiskRating

	return (
		<main className='bg-custom-darker min-h-screen py-12'>
			<div className='container mx-auto px-4'>
				<div className='mb-6 text-sm text-gray-500'>
					<Link href='/movies' className='hover:text-blue-400'>
						Фильмы
					</Link>
					<span className='mx-2'>/</span>
					<span className='text-gray-400'>{movie.title}</span>
				</div>

				{/* Основная информация */}
				<div className='flex flex-col lg:flex-row gap-8'>
					{/* Постер */}
					<div className='lg:w-1/3'>
						<div className='relative aspect-[2/3] rounded-xl overflow-hidden bg-custom-dark shadow-2xl'>
							{movie.posterUrl ? (
								<Image
									src={getImageUrl(movie.posterUrl)}
									alt={movie.title}
									fill
									className='object-cover'
									unoptimized={true}
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600'>
									<Film className='w-16 h-16 text-white/50' />
								</div>
							)}
						</div>
					</div>

					{/* Информация */}
					<div className='lg:w-2/3'>
						<h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>
							{movie.title}
						</h1>
						{movie.originalTitle && (
							<p className='text-gray-400 mb-4'>{movie.originalTitle}</p>
						)}

						{/* Мета-информация */}
						<div className='flex flex-wrap gap-4 mb-6'>
							{movie.releaseYear && (
								<div className='flex items-center gap-2 text-gray-400'>
									<Calendar className='w-4 h-4' />
									<span>{movie.releaseYear}</span>
								</div>
							)}
							{movie.movie?.duration && (
								<div className='flex items-center gap-2 text-gray-400'>
									<Clock className='w-4 h-4' />
									<span>{movie.movie.duration} мин</span>
								</div>
							)}
							{movie.ageRating && (
								<div className='px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300'>
									{movie.ageRating}
								</div>
							)}
						</div>

						{/* Звёздный рейтинг */}
						{primaryRating && (
							<div className='flex items-center gap-2 mb-4'>
								<div className='flex items-center gap-1'>
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`w-5 h-5 ${
												i < Math.floor(primaryRating / 2)
													? 'fill-yellow-500 text-yellow-500'
													: 'text-gray-600'
											}`}
										/>
									))}
								</div>
								<span className='text-xl font-bold text-white'>
									{primaryRating.toFixed(1)}
								</span>
								<span className='text-gray-500'>/ 10</span>
							</div>
						)}

						{/* Рейтинги IMDb и Кинопоиск */}
						{(movie.imdbRating || movie.kinopoiskRating) && (
							<div className='flex flex-wrap gap-3 mb-6'>
								{movie.imdbRating && (
									<div className='flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded'>
										<span className='text-xs text-gray-400'>IMDb</span>
										<span className='text-sm font-bold text-yellow-500'>
											{movie.imdbRating.toFixed(1)}
										</span>
									</div>
								)}
								{movie.kinopoiskRating && (
									<div className='flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded'>
										<span className='text-xs text-gray-400'>КП</span>
										<span className='text-sm font-bold text-yellow-500'>
											{movie.kinopoiskRating.toFixed(1)}
										</span>
									</div>
								)}
							</div>
						)}

						{/* Описание */}
						{movie.description && (
							<div className='mb-6'>
								<h2 className='text-lg font-semibold text-white mb-2'>
									Описание
								</h2>
								<p className='text-gray-300 leading-relaxed'>
									{movie.description}
								</p>
							</div>
						)}

						{/* Жанры */}
						{movie.genres && movie.genres.length > 0 && (
							<div className='mb-6'>
								<h2 className='text-lg font-semibold text-white mb-2'>Жанры</h2>
								<div className='flex flex-wrap gap-2'>
									{movie.genres.map(g => (
										<Link
											key={g.genre.id}
											href={`/movies?genre=${g.genre.id}`}
											className='px-3 py-1 bg-custom-darker border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-blue-500 transition-colors'
										>
											{g.genre.name}
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Актёры и создатели */}
				{movie.persons && movie.persons.length > 0 && (
					<div className='mt-12'>
						<h2 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
							<User className='w-5 h-5 text-blue-400' />
							Актёры и создатели
						</h2>
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
							{movie.persons.map(person => (
								<Link
									key={person.person.id}
									href={`/actors/${person.person.id}`}
									className='group bg-custom-dark rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all duration-300'
								>
									<div className='relative aspect-square overflow-hidden bg-custom-darker'>
										{person.person.photoUrl ? (
											<Image
												src={getImageUrl(person.person.photoUrl)}
												alt={person.person.fullname}
												fill
												className='object-cover group-hover:scale-105 transition-transform'
												unoptimized={true}
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600'>
												<User className='w-8 h-8 text-white/50' />
											</div>
										)}
									</div>
									<div className='p-3 text-center'>
										<h4 className='font-semibold text-white text-sm line-clamp-1'>
											{person.person.fullname}
										</h4>
										<p className='text-xs text-gray-500 mt-1'>
											{person.roleName || person.role?.name || 'Актёр'}
										</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}

				{/* Комментарии */}
				<div className='mt-12'>
					<Comments contentId={movie.id} contentType='MOVIE' />
				</div>
			</div>
		</main>
	)
}
