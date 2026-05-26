'use client'

import { contentApi } from '@/shared/api/content/content-api'
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
	imdbRating: number | null
	kinopoiskRating: number | null
	siteRating: number | null
	ageRating: string | null
	movie?: {
		duration: number | null
	}
	genres?: Array<{
		genre: {
			id: string
			name: string
		}
	}>
	persons?: Array<{
		person: {
			id: string
			fullname: string
			photoUrl: string | null
		}
		roleName: string | null
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
				const response = await contentApi.getById(id as string)
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
						Вернуться к списку
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
				{/* Хлебные крошки */}
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
						<div className='relative aspect-[2/3] rounded-xl overflow-hidden bg-custom-dark'>
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
						<div className='flex flex-wrap gap-4 mb-6 text-gray-400'>
							{movie.releaseYear && (
								<div className='flex items-center gap-1'>
									<Calendar className='w-4 h-4' />
									<span>{movie.releaseYear}</span>
								</div>
							)}
							{movie.movie?.duration && (
								<div className='flex items-center gap-1'>
									<Clock className='w-4 h-4' />
									<span>{movie.movie.duration} мин</span>
								</div>
							)}
							{movie.ageRating && (
								<span className='px-2 py-0.5 bg-gray-800 rounded text-xs'>
									{movie.ageRating}
								</span>
							)}
						</div>

						{/* Рейтинг */}
						{primaryRating && (
							<div className='flex items-center gap-2 mb-6'>
								<div className='flex items-center gap-1'>
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`w-4 h-4 ${
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
								<span className='text-gray-500'>/10</span>
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
											className='px-3 py-1 bg-custom-darker border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-blue-500'
										>
											{g.genre.name}
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Актёры */}
				{movie.persons && movie.persons.length > 0 && (
					<div className='mt-12'>
						<h2 className='text-xl font-semibold text-white mb-4'>
							Актёры и создатели
						</h2>
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
							{movie.persons.map(person => (
								<Link
									key={person.person.id}
									href={`/actors/${person.person.id}`}
									className='bg-custom-dark rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition p-2 text-center'
								>
									<div className='relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-custom-darker'>
										{person.person.photoUrl ? (
											<Image
												src={getImageUrl(person.person.photoUrl)}
												alt={person.person.fullname}
												fill
												className='object-cover'
												unoptimized={true}
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center bg-blue-600'>
												<User className='w-6 h-6 text-white' />
											</div>
										)}
									</div>
									<div className='mt-2'>
										<div className='text-sm font-medium text-white truncate'>
											{person.person.fullname}
										</div>
										<div className='text-xs text-gray-500 truncate'>
											{person.roleName || 'Актёр'}
										</div>
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
