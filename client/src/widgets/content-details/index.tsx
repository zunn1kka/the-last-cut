'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { RatingStars } from '@/features/rate-content/ui/RatingStars'
import { bookmarksApi } from '@/shared/api/bookmarks/bookmark-api'
import { ratingsApi } from '@/shared/api/ratings/ratings-api'
import {
	watchStatusApi,
	WatchStatus as WatchStatusType,
} from '@/shared/api/watch-status/watch-status-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import {
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Eye,
	Film,
	Heart,
	PlayCircle,
	Star,
	Tv,
	User,
	XCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ContentDetailsProps {
	content: any
	contentType: 'MOVIE' | 'SERIES'
}

const statusOptions: {
	value: WatchStatusType
	label: string
	icon: React.ReactNode
	color: string
}[] = [
	{
		value: 'PLANNED',
		label: 'В планах',
		icon: <Clock className='w-4 h-4' />,
		color: 'text-yellow-400 border-yellow-400 hover:bg-yellow-400/10',
	},
	{
		value: 'WATCHING',
		label: 'Смотрю',
		icon: <PlayCircle className='w-4 h-4' />,
		color: 'text-blue-400 border-blue-400 hover:bg-blue-400/10',
	},
	{
		value: 'COMPLETED',
		label: 'Просмотрено',
		icon: <CheckCircle className='w-4 h-4' />,
		color: 'text-green-400 border-green-400 hover:bg-green-400/10',
	},
	{
		value: 'DROPPED',
		label: 'Брошено',
		icon: <XCircle className='w-4 h-4' />,
		color: 'text-red-400 border-red-400 hover:bg-red-400/10',
	},
]

export function ContentDetails({ content, contentType }: ContentDetailsProps) {
	const { user } = useAuth()
	const [isFavorite, setIsFavorite] = useState(false)
	const [userRating, setUserRating] = useState<number | null>(null)
	const [watchStatus, setWatchStatus] = useState<WatchStatusType | null>(null)
	const [showStatusDropdown, setShowStatusDropdown] = useState(false)
	const [loading, setLoading] = useState(false)

	// Загрузка данных пользователя
	useEffect(() => {
		if (!user) return

		const fetchData = async () => {
			try {
				const [favResponse, ratingResponse, watchResponse] = await Promise.all([
					bookmarksApi.checkBookmark(content.id),
					ratingsApi.getUserRating(content.id),
					watchStatusApi.getStatus(content.id).catch(() => ({ data: null })),
				])
				setIsFavorite(favResponse.data.isBookmarked)
				setUserRating(ratingResponse.data?.rating || null)
				setWatchStatus(watchResponse.data?.status || null)
			} catch (error) {
				console.error('Failed to fetch user data:', error)
			}
		}
		fetchData()
	}, [user, content.id])

	const handleFavoriteClick = async () => {
		if (!user) {
			window.location.href = '/login'
			return
		}

		setLoading(true)
		try {
			if (isFavorite) {
				await bookmarksApi.removeBookmark(content.id)
				setIsFavorite(false)
			} else {
				await bookmarksApi.addBookmark(content.id)
				setIsFavorite(true)
			}
		} catch (error) {
			console.error('Failed to toggle favorite:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleRatingChange = async (rating: number) => {
		setUserRating(rating)
		try {
			const response = await ratingsApi.getUserRating(content.id)
			setUserRating(response.data?.rating || null)
		} catch (error) {
			console.error('Failed to refresh rating:', error)
		}
	}

	const handleStatusChange = async (status: WatchStatusType) => {
		if (!user) {
			window.location.href = '/login'
			return
		}

		setLoading(true)
		try {
			if (watchStatus === status) {
				await watchStatusApi.deleteStatus(content.id)
				setWatchStatus(null)
			} else {
				await watchStatusApi.setStatus(content.id, status)
				setWatchStatus(status)
			}
		} catch (error) {
			console.error('Failed to change watch status:', error)
		} finally {
			setLoading(false)
			setShowStatusDropdown(false)
		}
	}

	const ratings = {
		site: content.siteRating ? Number(content.siteRating).toFixed(1) : null,
		imdb: content.imdbRating ? Number(content.imdbRating).toFixed(1) : null,
		kinopoisk: content.kinopoiskRating
			? Number(content.kinopoiskRating).toFixed(1)
			: null,
	}

	const primaryRating = ratings.site || ratings.imdb || ratings.kinopoisk
	const currentStatusOption = statusOptions.find(
		opt => opt.value === watchStatus,
	)

	const renderStars = (rating: number | null) => {
		if (!rating) return null
		const starRating = Math.floor(rating / 2)
		const stars = []
		for (let i = 0; i < 5; i++) {
			stars.push(
				<Star
					key={i}
					className={`w-4 h-4 ${i < starRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
				/>,
			)
		}
		return stars
	}

	return (
		<div className='max-w-6xl mx-auto'>
			{/* Постер и основная информация */}
			<div className='flex flex-col lg:flex-row gap-8 mb-12'>
				{/* Постер */}
				<div className='lg:w-1/3'>
					<div className='relative aspect-[2/3] rounded-xl overflow-hidden bg-custom-darker shadow-2xl'>
						{content.posterUrl ? (
							<Image
								src={getImageUrl(content.posterUrl)}
								alt={content.title}
								fill
								className='object-cover'
								unoptimized={true}
							/>
						) : (
							<div className='w-full h-full flex items-center justify-center'>
								{contentType === 'MOVIE' ? (
									<Film className='w-20 h-20 text-gray-700' />
								) : (
									<Tv className='w-20 h-20 text-gray-700' />
								)}
							</div>
						)}
					</div>
				</div>

				{/* Информация */}
				<div className='lg:w-2/3'>
					{/* Название и оригинальное название */}
					<h1 className='text-4xl md:text-5xl font-bold text-white mb-2'>
						{content.title}
					</h1>
					{content.originalTitle && (
						<p className='text-xl text-gray-400 mb-4'>
							{content.originalTitle}
						</p>
					)}

					{/* Мета-информация (год, длительность, возрастной рейтинг) */}
					<div className='flex flex-wrap gap-4 mb-6'>
						<div className='flex items-center gap-2 text-gray-400'>
							<Calendar className='w-4 h-4' />
							<span>{content.releaseYear}</span>
						</div>
						{contentType === 'MOVIE' && content.movie?.duration && (
							<div className='flex items-center gap-2 text-gray-400'>
								<Clock className='w-4 h-4' />
								<span>{content.movie.duration} мин</span>
							</div>
						)}
						{contentType === 'SERIES' && content.series?.seasonsCount && (
							<div className='flex items-center gap-2 text-gray-400'>
								<Tv className='w-4 h-4' />
								<span>{content.series.seasonsCount} сезонов</span>
							</div>
						)}
						{content.ageRating && (
							<div
								className={`px-2 py-1 rounded text-xs font-medium ${
									content.ageRating === 'R' || content.ageRating === 'NC-17'
										? 'bg-red-500/20 text-red-400'
										: 'bg-green-500/20 text-green-400'
								}`}
							>
								{content.ageRating}
							</div>
						)}
					</div>

					{/* Рейтинг (звезды и число) */}
					{primaryRating && (
						<div className='flex items-center gap-3 mb-6'>
							<div className='flex items-center gap-1'>
								{renderStars(parseFloat(primaryRating))}
							</div>
							<span className='text-2xl font-bold text-white'>
								{primaryRating}
							</span>
							<span className='text-gray-500'>/ 10</span>
						</div>
					)}

					{/* Рейтинги IMDb и Кинопоиск */}
					{(ratings.imdb || ratings.kinopoisk) && (
						<div className='flex gap-4 mb-6'>
							{ratings.imdb && (
								<div className='flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-lg'>
									<span className='text-sm font-medium text-gray-400'>
										IMDb
									</span>
									<span className='text-lg font-bold text-yellow-500'>
										{ratings.imdb}
									</span>
								</div>
							)}
							{ratings.kinopoisk && (
								<div className='flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-lg'>
									<span className='text-sm font-medium text-gray-400'>КП</span>
									<span className='text-lg font-bold text-yellow-500'>
										{ratings.kinopoisk}
									</span>
								</div>
							)}
						</div>
					)}

					{/* Кнопки действий: Избранное и Статус просмотра */}
					<div className='flex flex-wrap gap-4 mb-6'>
						<button
							onClick={handleFavoriteClick}
							disabled={loading}
							className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
								isFavorite
									? 'bg-red-600 hover:bg-red-700 text-white'
									: 'bg-gray-800 hover:bg-gray-700 text-white'
							}`}
						>
							<Heart
								className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
							/>
							{isFavorite ? 'В избранном' : 'В избранное'}
						</button>

						{/* Статус просмотра */}
						<div className='relative'>
							<button
								onClick={() => setShowStatusDropdown(!showStatusDropdown)}
								disabled={loading}
								className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all border ${
									currentStatusOption
										? `${currentStatusOption.color} bg-opacity-10`
										: 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400'
								}`}
							>
								{currentStatusOption ? (
									<>
										{currentStatusOption.icon}
										<span>{currentStatusOption.label}</span>
									</>
								) : (
									<>
										<Eye className='w-5 h-5' />
										<span>Статус просмотра</span>
									</>
								)}
							</button>

							{showStatusDropdown && (
								<>
									<div
										className='fixed inset-0 z-10'
										onClick={() => setShowStatusDropdown(false)}
									/>
									<div className='absolute top-full left-0 mt-2 w-48 bg-custom-dark rounded-xl border border-gray-700 shadow-xl z-20 overflow-hidden'>
										{statusOptions.map(option => (
											<button
												key={option.value}
												onClick={() => handleStatusChange(option.value)}
												className={`w-full px-4 py-2 flex items-center gap-2 transition-colors ${
													watchStatus === option.value
														? `${option.color} bg-opacity-10`
														: 'text-gray-400 hover:bg-custom-darker hover:text-white'
												}`}
											>
												{option.icon}
												<span className='text-sm'>{option.label}</span>
												{watchStatus === option.value && (
													<CheckCircle className='w-4 h-4 ml-auto text-green-400' />
												)}
											</button>
										))}
									</div>
								</>
							)}
						</div>
					</div>

					{/* Оценка пользователя */}
					{user && (
						<div className='flex items-center gap-4 bg-gray-800/50 px-4 py-2 rounded-xl mb-6'>
							<span className='text-sm text-gray-400'>Ваша оценка:</span>
							<RatingStars
								contentId={content.id}
								initialRating={userRating}
								size='md'
								onRate={handleRatingChange}
							/>
						</div>
					)}

					{/* Бюджет для фильмов */}
					{contentType === 'MOVIE' && content.movie?.budget && (
						<div className='flex items-center gap-2 text-gray-400 mb-6'>
							<DollarSign className='w-4 h-4' />
							<span>Бюджет: ${content.movie.budget.toLocaleString()}</span>
						</div>
					)}

					{/* Описание */}
					<p className='text-gray-300 leading-relaxed'>{content.description}</p>
				</div>
			</div>

			{/* Актеры и создатели */}
			{content.persons && content.persons.length > 0 && (
				<div className='mb-12'>
					<h2 className='text-2xl font-bold text-white mb-6'>
						Актеры и создатели
					</h2>
					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
						{content.persons.map((person: any) => (
							<Link
								key={person.id}
								href={`/actors/${person.person.id}`}
								className='group block'
							>
								<div className='bg-custom-dark rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-all'>
									<div className='relative aspect-square overflow-hidden'>
										{person.person.photoUrl ? (
											<Image
												src={getImageUrl(person.person.photoUrl)}
												alt={person.person.fullname}
												fill
												unoptimized={true}
												className='object-cover group-hover:scale-105 transition-transform'
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center bg-custom-darker'>
												<User className='w-12 h-12 text-gray-700' />
											</div>
										)}
									</div>
									<div className='p-3 text-center'>
										<div className='font-medium text-white text-sm truncate'>
											{person.person.fullname}
										</div>
										<div className='text-xs text-gray-500 mt-1'>
											{person.role?.name || person.roleName}
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* Эпизоды для сериалов */}
			{contentType === 'SERIES' && (
				<div className='mb-12'>
					<h2 className='text-2xl font-bold text-white mb-6'>Эпизоды</h2>

					{content.series?.episodes && content.series.episodes.length > 0 ? (
						// Есть эпизоды - показываем их
						(() => {
							// Группируем эпизоды по сезонам
							const episodesBySeason = content.series.episodes.reduce(
								(acc: any, episode: any) => {
									const season = episode.seasonNumber
									if (!acc[season]) acc[season] = []
									acc[season].push(episode)
									return acc
								},
								{},
							)

							// Сортируем сезоны
							const sortedSeasons = Object.keys(episodesBySeason).sort(
								(a, b) => Number(a) - Number(b),
							)

							return sortedSeasons.map(seasonNum => (
								<div
									key={seasonNum}
									className='bg-custom-dark rounded-xl overflow-hidden border border-gray-800 mb-6'
								>
									<div className='bg-custom-darker px-6 py-3 border-b border-gray-800'>
										<h3 className='text-xl font-semibold text-white'>
											Сезон {seasonNum}
										</h3>
									</div>
									<div className='divide-y divide-gray-800'>
										{episodesBySeason[seasonNum].map((episode: any) => (
											<div
												key={episode.id}
												className='p-4 hover:bg-custom-darker transition-colors'
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
																		{new Date(
																			episode.airDate,
																		).toLocaleDateString('ru-RU')}
																	</span>
																</>
															)}
														</div>
														<h4 className='text-lg font-medium text-white mb-2'>
															{episode.title}
														</h4>
														{episode.description && (
															<p className='text-gray-400 text-sm line-clamp-2'>
																{episode.description}
															</p>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							))
						})()
					) : (
						// Нет эпизодов - показываем сообщение
						<div className='bg-custom-dark rounded-xl p-8 text-center'>
							<Tv className='w-12 h-12 text-gray-600 mx-auto mb-3' />
							<p className='text-gray-500'>Эпизоды в разработке</p>
						</div>
					)}
				</div>
			)}

			{/* Жанры */}
			{content.genres && content.genres.length > 0 && (
				<div className='mb-12'>
					<h2 className='text-2xl font-bold text-white mb-4'>Жанры</h2>
					<div className='flex flex-wrap gap-2'>
						{content.genres.map((g: any) => (
							<Link
								key={g.genre?.id || g.id}
								href={`/movies?genre=${g.genre?.id || g.id}`}
								className='px-4 py-2 bg-custom-darker border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-blue-500 transition-colors'
							>
								{g.genre?.name || g.name}
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
