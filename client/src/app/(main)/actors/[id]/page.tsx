'use client'

import { personsApi } from '@/shared/api/persons/persons-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import { Calendar, Clapperboard, Film, Star, Tv, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Person {
	id: string
	fullname: string
	photoUrl: string | null
	birthDate: string | null
	deathDate: string | null
	biography: string | null
	createdAt?: string
}

interface ContentPerson {
	id: string
	roleName: string | null
	role?: { name: string }
	content: {
		id: string
		title: string
		posterUrl: string
		releaseYear: number
		contentType: 'MOVIE' | 'SERIES'
		siteRating: number | null
		imdbRating: number | null
		kinopoiskRating: number | null
	}
}

export default function ActorPage() {
	const { id } = useParams()
	const [person, setPerson] = useState<Person | null>(null)
	const [movies, setMovies] = useState<ContentPerson[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			try {
				const [personRes, moviesRes] = await Promise.all([
					personsApi.getById(id as string),
					personsApi.getByContentId(id as string),
				])
				setPerson(personRes.data)
				setMovies(moviesRes.data || [])
			} catch (error) {
				console.error('Failed to fetch actor data:', error)
			} finally {
				setLoading(false)
			}
		}

		if (id) {
			fetchData()
		}
	}, [id])

	// Форматирование даты
	const formatDate = (dateString: string | null) => {
		if (!dateString) return null
		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}

	const formatAge = (age: number | null): string => {
		if (age === null) return ''

		const lastDigit = age % 10
		const lastTwoDigits = age % 100

		if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
			return `${age} лет`
		}

		switch (lastDigit) {
			case 1:
				return `${age} год`
			case 2:
			case 3:
			case 4:
				return `${age} года`
			default:
				return `${age} лет`
		}
	}

	// Получение возраста
	const getAge = (birthDate: string | null, deathDate: string | null) => {
		if (!birthDate) return null
		const birth = new Date(birthDate)
		const end = deathDate ? new Date(deathDate) : new Date()
		let age = end.getFullYear() - birth.getFullYear()
		const m = end.getMonth() - birth.getMonth()
		if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
			age--
		}
		return age
	}

	// Группировка фильмов по типу
	const moviesList = movies.filter(m => m.content.contentType === 'MOVIE')
	const seriesList = movies.filter(m => m.content.contentType === 'SERIES')

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

	if (!person) {
		return (
			<main className='bg-custom-darker min-h-screen py-12'>
				<div className='container mx-auto px-4 text-center py-12'>
					<User className='w-16 h-16 text-gray-600 mx-auto mb-4' />
					<h1 className='text-2xl font-bold text-white mb-2'>
						Персона не найдена
					</h1>
					<p className='text-gray-500'>
						Возможно, она была удалена или вы перешли по неверной ссылке
					</p>
					<Link
						href='/actors'
						className='inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors'
					>
						Вернуться к списку актёров
					</Link>
				</div>
			</main>
		)
	}

	const birthDateFormatted = formatDate(person.birthDate)
	const deathDateFormatted = formatDate(person.deathDate)
	const age = getAge(person.birthDate, person.deathDate)
	const isAlive = !person.deathDate

	return (
		<main className='bg-custom-darker min-h-screen py-12'>
			<div className='container mx-auto px-4'>
				{/* Хлебные крошки */}
				<div className='mb-6 text-sm text-gray-500'>
					<Link
						href='/actors'
						className='hover:text-blue-400 transition-colors'
					>
						Актёры
					</Link>
					<span className='mx-2'>/</span>
					<span className='text-gray-400'>{person.fullname}</span>
				</div>

				{/* Основная информация */}
				<div className='flex flex-col lg:flex-row gap-8 mb-12'>
					{/* Фото */}
					<div className='lg:w-1/3'>
						<div className='relative aspect-[3/4] rounded-xl overflow-hidden bg-custom-dark shadow-2xl'>
							{person.photoUrl ? (
								<Image
									src={getImageUrl(person.photoUrl)}
									alt={person.fullname}
									fill
									className='object-cover'
									unoptimized={true}
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600'>
									<User className='w-24 h-24 text-white/50' />
								</div>
							)}
						</div>
					</div>

					{/* Информация */}
					<div className='lg:w-2/3'>
						<h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>
							{person.fullname}
						</h1>

						{/* Даты жизни */}
						{(birthDateFormatted || deathDateFormatted) && (
							<div className='flex flex-wrap gap-6 mb-6'>
								{birthDateFormatted && (
									<div className='flex items-center gap-2 text-gray-400'>
										<Calendar className='w-5 h-5' />
										<div>
											<div className='text-sm text-gray-500'>Дата рождения</div>
											<div className='text-white font-medium'>
												{birthDateFormatted}
												{age !== null && (
													<span className='text-gray-400 ml-2'>
														({formatAge(age)})
													</span>
												)}
											</div>
										</div>
									</div>
								)}
								{deathDateFormatted && (
									<div className='flex items-center gap-2 text-gray-400'>
										<Calendar className='w-5 h-5' />
										<div>
											<div className='text-sm text-gray-500'>Дата смерти</div>
											<div className='text-white font-medium'>
												{deathDateFormatted}
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Биография */}
						{person.biography && (
							<div className='mb-8'>
								<h2 className='text-xl font-semibold text-white mb-3'>
									Биография
								</h2>
								<p className='text-gray-300 leading-relaxed whitespace-pre-line'>
									{person.biography}
								</p>
							</div>
						)}

						{/* Статистика */}
						<div className='flex flex-wrap gap-6 pt-4 border-t border-gray-800'>
							<div className='flex items-center gap-2'>
								<Film className='w-5 h-5 text-blue-400' />
								<div>
									<div className='text-2xl font-bold text-white'>
										{moviesList.length}
									</div>
									<div className='text-xs text-gray-500'>фильмов</div>
								</div>
							</div>
							<div className='flex items-center gap-2'>
								<Tv className='w-5 h-5 text-green-400' />
								<div>
									<div className='text-2xl font-bold text-white'>
										{seriesList.length}
									</div>
									<div className='text-xs text-gray-500'>сериалов</div>
								</div>
							</div>
							<div className='flex items-center gap-2'>
								<Star className='w-5 h-5 text-yellow-400' />
								<div>
									<div className='text-2xl font-bold text-white'>
										{movies.length}
									</div>
									<div className='text-xs text-gray-500'>всего работ</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Фильмография */}
				{movies.length > 0 && (
					<div>
						<h2 className='text-2xl font-bold text-white mb-6 flex items-center gap-2'>
							<Clapperboard className='w-6 h-6 text-blue-400' />
							Фильмография
						</h2>

						{/* Фильмы */}
						{moviesList.length > 0 && (
							<div className='mb-8'>
								<h3 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
									<Film className='w-5 h-5 text-blue-400' />
									Фильмы
								</h3>
								<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
									{moviesList.map(movie => (
										<Link
											key={movie.id}
											href={`/movies/${movie.content.id}`}
											className='group bg-custom-dark rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all duration-300'
										>
											<div className='relative aspect-[2/3] overflow-hidden bg-custom-darker'>
												{movie.content.posterUrl ? (
													<Image
														src={getImageUrl(movie.content.posterUrl)}
														alt={movie.content.title}
														fill
														className='object-cover group-hover:scale-105 transition-transform duration-300'
														unoptimized={true}
													/>
												) : (
													<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600'>
														<Film className='w-12 h-12 text-white/50' />
													</div>
												)}
											</div>
											<div className='p-3'>
												<h4 className='font-semibold text-white text-sm line-clamp-1'>
													{movie.content.title}
												</h4>
												<div className='flex items-center justify-between mt-1'>
													<span className='text-xs text-gray-500'>
														{movie.content.releaseYear}
													</span>
													{movie.content.siteRating && (
														<div className='flex items-center gap-1'>
															<Star className='w-3 h-3 text-yellow-500 fill-yellow-500' />
															<span className='text-xs text-white'>
																{movie.content.siteRating.toFixed(1)}
															</span>
														</div>
													)}
												</div>
												{movie.roleName && (
													<div className='mt-2 text-xs text-blue-400 truncate'>
														{movie.roleName}
													</div>
												)}
											</div>
										</Link>
									))}
								</div>
							</div>
						)}

						{/* Сериалы */}
						{seriesList.length > 0 && (
							<div>
								<h3 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
									<Tv className='w-5 h-5 text-green-400' />
									Сериалы
								</h3>
								<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
									{seriesList.map(series => (
										<Link
											key={series.id}
											href={`/series/${series.content.id}`}
											className='group bg-custom-dark rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all duration-300'
										>
											<div className='relative aspect-[2/3] overflow-hidden bg-custom-darker'>
												{series.content.posterUrl ? (
													<Image
														src={getImageUrl(series.content.posterUrl)}
														alt={series.content.title}
														fill
														className='object-cover group-hover:scale-105 transition-transform duration-300'
														unoptimized={true}
													/>
												) : (
													<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-teal-600'>
														<Tv className='w-12 h-12 text-white/50' />
													</div>
												)}
											</div>
											<div className='p-3'>
												<h4 className='font-semibold text-white text-sm line-clamp-1'>
													{series.content.title}
												</h4>
												<div className='flex items-center justify-between mt-1'>
													<span className='text-xs text-gray-500'>
														{series.content.releaseYear}
													</span>
													{series.content.siteRating && (
														<div className='flex items-center gap-1'>
															<Star className='w-3 h-3 text-yellow-500 fill-yellow-500' />
															<span className='text-xs text-white'>
																{series.content.siteRating.toFixed(1)}
															</span>
														</div>
													)}
												</div>
												{series.roleName && (
													<div className='mt-2 text-xs text-blue-400 truncate'>
														{series.roleName}
													</div>
												)}
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Если нет фильмов */}
				{movies.length === 0 && (
					<div className='text-center py-12'>
						<Clapperboard className='w-16 h-16 text-gray-600 mx-auto mb-4' />
						<p className='text-gray-500'>
							Нет информации о фильмах с участием {person.fullname}
						</p>
					</div>
				)}
			</div>
		</main>
	)
}
