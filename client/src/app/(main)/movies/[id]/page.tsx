'use client'

import { contentApi } from '@/shared/api/content/content-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import { Calendar, Clock, DollarSign, Film, Star, User } from 'lucide-react'
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
				const response = await contentApi.getById(id as string)
				setMovie(response.data)
			} catch (error) {
				console.error('Failed to fetch movie data:', error)
			} finally {
				setLoading(false)
			}
		}

		if (id) {
			fetchData()
		}
	}, [id])

	const formatDuration = (minutes: number | null | undefined) => {
		if (!minutes) return null
		const hours = Math.floor(minutes / 60)
		const mins = minutes % 60
		if (hours === 0) return `${mins} мин`
		return `${hours} ч ${mins} мин`
	}

	const formatBudget = (budget: number | null | undefined) => {
		if (!budget) return null
		if (budget >= 1000000) {
			return `$${(budget / 1000000).toFixed(1)} млн`
		}
		if (budget >= 1000) {
			return `$${(budget / 1000).toFixed(0)} тыс`
		}
		return `$${budget}`
	}

	const getAgeRatingColor = (rating: string | null) => {
		if (!rating) return 'bg-gray-500/20 text-gray-400'
		if (rating === '18+' || rating === 'R' || rating === 'NC-17') {
			return 'bg-red-500/20 text-red-400'
		}
		if (rating === '16+') {
			return 'bg-orange-500/20 text-orange-400'
		}
		return 'bg-green-500/20 text-green-400'
	}

	if (loading) {
		return (
			<main className='bg-custom-darker min-h-screen py-12'>
				<div className='container mx-auto px-4'>
					<div className='flex justify-center py-12'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
					</div>
				</div>
			</main>
		)
	}

	if (!movie) {
		return (
			<main className='bg-custom-darker min-h-screen py-12'>
				<div className='container mx-auto px-4 text-center py-12'>
					<Film className='w-16 h-16 text-gray-600 mx-auto mb-4' />
					<h1 className='text-2xl font-bold text-white mb-2'>
						Фильм не найден
					</h1>
					<p className='text-gray-500'>
						Возможно, он был удалён или вы перешли по неверной ссылке
					</p>
					<Link
						href='/movies'
						className='inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors'
					>
						Вернуться к списку фильмов
					</Link>
				</div>
			</main>
		)
	}

	const primaryRating =
		movie.siteRating || movie.imdbRating || movie.kinopoiskRating
	const averageRating = primaryRating?.toFixed(1)

	return (
		<main className='bg-custom-darker min-h-screen py-12'>
			<div className='container mx-auto px-4'>
				{/* Хлебные крошки */}
				<div className='mb-6 text-sm text-gray-500'>
					<Link
						href='/movies'
						className='hover:text-blue-400 transition-colors'
					>
						Фильмы
					</Link>
					<span className='mx-2'>/</span>
					<span className='text-gray-400'>{movie.title}</span>
				</div>

				{/* Основная информация */}
				<div className='flex flex-col lg:flex-row gap-8 mb-12'>
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
									<Film className='w-24 h-24 text-white/50' />
								</div>
							)}
						</div>
					</div>

					{/* Информация */}
					<div className='lg:w-2/3'>
						<h1 className='text-4xl md:text-5xl font-bold text-white mb-2'>
							{movie.title}
						</h1>
						{movie.originalTitle && (
							<p className='text-xl text-gray-400 mb-4'>
								{movie.originalTitle}
							</p>
						)}

						{/* Мета-информация */}
						<div className='flex flex-wrap gap-4 mb-6'>
							{movie.releaseYear && (
								<div className='flex items-center gap-2 text-gray-400'>
									<Calendar className='w-5 h-5' />
									<span className='text-white font-medium'>
										{movie.releaseYear}
									</span>
								</div>
							)}
							{movie.movie?.duration && (
								<div className='flex items-center gap-2 text-gray-400'>
									<Clock className='w-5 h-5' />
									<span>{formatDuration(movie.movie.duration)}</span>
								</div>
							)}
							{movie.ageRating && (
								<div
									className={`px-2 py-1 rounded text-xs font-medium ${getAgeRatingColor(movie.ageRating)}`}
								>
									{movie.ageRating}
								</div>
							)}
						</div>

						{/* Рейтинги */}
						<div className='flex flex-wrap gap-4 mb-6'>
							{averageRating && (
								<div className='flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-lg'>
									<Star className='w-5 h-5 text-yellow-500 fill-yellow-500' />
									<span className='text-2xl font-bold text-white'>
										{averageRating}
									</span>
									<span className='text-gray-400'>/10</span>
								</div>
							)}
							{movie.imdbRating && (
								<div className='flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-lg'>
									<span className='text-sm font-medium text-gray-400'>
										IMDb
									</span>
									<span className='text-lg font-bold text-yellow-500'>
										{movie.imdbRating.toFixed(1)}
									</span>
								</div>
							)}
							{movie.kinopoiskRating && (
								<div className='flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-lg'>
									<span className='text-sm font-medium text-gray-400'>КП</span>
									<span className='text-lg font-bold text-yellow-500'>
										{movie.kinopoiskRating.toFixed(1)}
									</span>
								</div>
							)}
						</div>

						{/* Описание */}
						{movie.description && (
							<div className='mb-8'>
								<h2 className='text-xl font-semibold text-white mb-3'>
									Описание
								</h2>
								<p className='text-gray-300 leading-relaxed'>
									{movie.description}
								</p>
							</div>
						)}

						{/* Жанры */}
						{movie.genres && movie.genres.length > 0 && (
							<div className='mb-8'>
								<h2 className='text-xl font-semibold text-white mb-3'>Жанры</h2>
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

						{/* Бюджет */}
						{movie.movie?.budget && (
							<div className='flex items-center gap-2 text-gray-400'>
								<DollarSign className='w-5 h-5' />
								<span>Бюджет: {formatBudget(movie.movie.budget)}</span>
							</div>
						)}
					</div>
				</div>

				{/* Актёры и создатели */}
				{movie.persons && movie.persons.length > 0 && (
					<div className='mb-12'>
						<h2 className='text-2xl font-bold text-white mb-6 flex items-center gap-2'>
							<User className='w-6 h-6 text-blue-400' />
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
												className='object-cover group-hover:scale-105 transition-transform duration-300'
												unoptimized={true}
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600'>
												<User className='w-12 h-12 text-white/50' />
											</div>
										)}
									</div>
									<div className='p-3 text-center'>
										<h4 className='font-semibold text-white text-sm line-clamp-1'>
											{person.person.fullname}
										</h4>
										<p className='text-xs text-gray-500 mt-1'>
											{person.roleName || person.role?.name || ''}
										</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</main>
	)
}
