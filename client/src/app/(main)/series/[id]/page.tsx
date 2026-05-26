'use client'

import { apiClient } from '@/shared/api/axios-instance'
import { getImageUrl } from '@/shared/lib/get-image-url'
import { Comments } from '@/widgets/comments'
import { Calendar, Clock, Film, Star, Tv, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Episode {
	id: string
	seasonNumber: number
	episodeNumber: number
	title: string
	duration: number
	description: string | null
	airDate: string | null
}

interface Series {
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
	series?: {
		seasonsCount: number | null
		episodesCount: number | null
		episodes?: Episode[]
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

export default function SeriesPage() {
	const { id } = useParams()
	const [series, setSeries] = useState<Series | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			try {
				const response = await apiClient.get(`/content/series/${id}`)
				console.log('📥 Series data:', response.data)
				setSeries(response.data)
			} catch (error) {
				console.error('Failed to fetch series:', error)
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

	if (!series) {
		return (
			<main className='bg-custom-darker min-h-screen py-12'>
				<div className='container mx-auto px-4 text-center py-12'>
					<Tv className='w-16 h-16 text-gray-600 mx-auto mb-4' />
					<h1 className='text-2xl font-bold text-white'>Сериал не найден</h1>
					<Link href='/series' className='text-blue-400 mt-4 inline-block'>
						Вернуться к списку сериалов
					</Link>
				</div>
			</main>
		)
	}

	const primaryRating =
		series.siteRating || series.imdbRating || series.kinopoiskRating

	// Группировка эпизодов по сезонам
	const episodesBySeason = (series.series?.episodes || []).reduce(
		(acc, episode) => {
			const season = episode.seasonNumber
			if (!acc[season]) acc[season] = []
			acc[season].push(episode)
			return acc
		},
		{} as Record<number, Episode[]>,
	)

	const sortedSeasons = Object.keys(episodesBySeason).sort(
		(a, b) => Number(a) - Number(b),
	)

	return (
		<main className='bg-custom-darker min-h-screen py-12'>
			<div className='container mx-auto px-4'>
				{/* Хлебные крошки */}
				<div className='mb-6 text-sm text-gray-500'>
					<Link href='/series' className='hover:text-blue-400'>
						Сериалы
					</Link>
					<span className='mx-2'>/</span>
					<span className='text-gray-400'>{series.title}</span>
				</div>

				{/* Основная информация */}
				<div className='flex flex-col lg:flex-row gap-8'>
					{/* Постер */}
					<div className='lg:w-1/3'>
						<div className='relative aspect-[2/3] rounded-xl overflow-hidden bg-custom-dark'>
							{series.posterUrl ? (
								<Image
									src={getImageUrl(series.posterUrl)}
									alt={series.title}
									fill
									className='object-cover'
									unoptimized={true}
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-teal-600'>
									<Tv className='w-16 h-16 text-white/50' />
								</div>
							)}
						</div>
					</div>

					{/* Информация */}
					<div className='lg:w-2/3'>
						<h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>
							{series.title}
						</h1>
						{series.originalTitle && (
							<p className='text-gray-400 mb-4'>{series.originalTitle}</p>
						)}

						{/* Мета-информация */}
						<div className='flex flex-wrap gap-4 mb-6'>
							{series.releaseYear && (
								<div className='flex items-center gap-2 text-gray-400'>
									<Calendar className='w-4 h-4' />
									<span>{series.releaseYear}</span>
								</div>
							)}
							{series.series?.seasonsCount && (
								<div className='flex items-center gap-2 text-gray-400'>
									<Tv className='w-4 h-4' />
									<span>{series.series.seasonsCount} сезонов</span>
								</div>
							)}
							{series.series?.episodesCount && (
								<div className='flex items-center gap-2 text-gray-400'>
									<Film className='w-4 h-4' />
									<span>{series.series.episodesCount} эпизодов</span>
								</div>
							)}
							{series.ageRating && (
								<div className='px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300'>
									{series.ageRating}
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
						{(series.imdbRating || series.kinopoiskRating) && (
							<div className='flex flex-wrap gap-3 mb-6'>
								{series.imdbRating && (
									<div className='flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded'>
										<span className='text-xs text-gray-400'>IMDb</span>
										<span className='text-sm font-bold text-yellow-500'>
											{series.imdbRating.toFixed(1)}
										</span>
									</div>
								)}
								{series.kinopoiskRating && (
									<div className='flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded'>
										<span className='text-xs text-gray-400'>КП</span>
										<span className='text-sm font-bold text-yellow-500'>
											{series.kinopoiskRating.toFixed(1)}
										</span>
									</div>
								)}
							</div>
						)}

						{/* Описание */}
						{series.description && (
							<div className='mb-6'>
								<h2 className='text-lg font-semibold text-white mb-2'>
									Описание
								</h2>
								<p className='text-gray-300 leading-relaxed'>
									{series.description}
								</p>
							</div>
						)}

						{/* Жанры */}
						{series.genres && series.genres.length > 0 && (
							<div className='mb-6'>
								<h2 className='text-lg font-semibold text-white mb-2'>Жанры</h2>
								<div className='flex flex-wrap gap-2'>
									{series.genres.map(g => (
										<Link
											key={g.genre.id}
											href={`/series?genre=${g.genre.id}`}
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

				{/* Актёры и создатели */}
				{series.persons && series.persons.length > 0 && (
					<div className='mt-12'>
						<h2 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
							<User className='w-5 h-5 text-blue-400' />
							Актёры и создатели
						</h2>
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
							{series.persons.map(person => (
								<Link
									key={person.person.id}
									href={`/actors/${person.person.id}`}
									className='group bg-custom-dark rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all'
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

				{/* Эпизоды по сезонам */}
				{sortedSeasons.length > 0 && (
					<div className='mt-12'>
						<h2 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
							<Clock className='w-5 h-5 text-blue-400' />
							Эпизоды
						</h2>
						{sortedSeasons.map(seasonNum => (
							<div key={seasonNum} className='mb-8'>
								<h3 className='text-lg font-semibold text-white mb-3'>
									Сезон {seasonNum}
								</h3>
								<div className='space-y-2'>
									{episodesBySeason[Number(seasonNum)].map(episode => (
										<div
											key={episode.id}
											className='bg-custom-dark rounded-lg p-4 border border-gray-800'
										>
											<div className='flex items-start justify-between'>
												<div className='flex-1'>
													<div className='flex items-center gap-2 mb-1'>
														<span className='text-sm text-gray-500'>
															Серия {episode.episodeNumber}
														</span>
														{episode.duration && (
															<>
																<span className='text-gray-600'>•</span>
																<span className='text-sm text-gray-500'>
																	{episode.duration} мин
																</span>
															</>
														)}
														{episode.airDate && (
															<>
																<span className='text-gray-600'>•</span>
																<span className='text-sm text-gray-500'>
																	{new Date(episode.airDate).toLocaleDateString(
																		'ru-RU',
																	)}
																</span>
															</>
														)}
													</div>
													<h4 className='text-white font-medium'>
														{episode.title}
													</h4>
													{episode.description && (
														<p className='text-gray-400 text-sm mt-1'>
															{episode.description}
														</p>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}

				{/* Комментарии */}
				<div className='mt-12'>
					<Comments contentId={series.id} contentType='SERIES' />
				</div>
			</div>
		</main>
	)
}
