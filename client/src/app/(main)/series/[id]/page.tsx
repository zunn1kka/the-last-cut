'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { apiClient } from '@/shared/api/axios-instance'
import { bookmarksApi } from '@/shared/api/bookmarks/bookmark-api'
import {
	Collection,
	collectionsApi,
} from '@/shared/api/collections/collections-api'
import { watchStatusApi } from '@/shared/api/watch-status/watch-status-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import { Comments } from '@/widgets/comments'
import {
	Calendar,
	CheckCircle,
	Clock,
	Eye,
	Film,
	FolderPlus,
	Heart,
	PlayCircle,
	Star,
	Tv,
	User,
	XCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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

type WatchStatus = 'planned' | 'watching' | 'completed' | 'dropped'

const statusOptions: {
	value: WatchStatus
	label: string
	icon: React.ReactNode
	color: string
}[] = [
	{
		value: 'planned',
		label: 'В планах',
		icon: <Clock className='w-4 h-4' />,
		color: 'text-yellow-400 border-yellow-400 hover:bg-yellow-400/10',
	},
	{
		value: 'watching',
		label: 'Смотрю',
		icon: <PlayCircle className='w-4 h-4' />,
		color: 'text-blue-400 border-blue-400 hover:bg-blue-400/10',
	},
	{
		value: 'completed',
		label: 'Просмотрено',
		icon: <CheckCircle className='w-4 h-4' />,
		color: 'text-green-400 border-green-400 hover:bg-green-400/10',
	},
	{
		value: 'dropped',
		label: 'Брошено',
		icon: <XCircle className='w-4 h-4' />,
		color: 'text-red-400 border-red-400 hover:bg-red-400/10',
	},
]

export default function SeriesPage() {
	const { id } = useParams()
	const router = useRouter()
	const { user } = useAuth()
	const [series, setSeries] = useState<Series | null>(null)
	const [loading, setLoading] = useState(true)

	// Состояния для избранного
	const [isFavorite, setIsFavorite] = useState(false)
	const [favoriteLoading, setFavoriteLoading] = useState(false)

	// Состояния для статуса просмотра
	const [currentStatus, setCurrentStatus] = useState<WatchStatus | null>(null)
	const [statusLoading, setStatusLoading] = useState(false)
	const [showStatusDropdown, setShowStatusDropdown] = useState(false)

	// Состояния для сборников
	const [showCollectionsModal, setShowCollectionsModal] = useState(false)
	const [userCollections, setUserCollections] = useState<Collection[]>([])
	const [collectionsLoading, setCollectionsLoading] = useState(false)

	// Уведомления
	const [notification, setNotification] = useState<{
		type: 'success' | 'error'
		message: string
	} | null>(null)

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

	// Загрузка данных пользователя (избранное, статус)
	useEffect(() => {
		if (!user || !series) return

		const fetchUserData = async () => {
			try {
				const [favResponse, statusResponse] = await Promise.all([
					bookmarksApi.checkBookmark(series.id),
					watchStatusApi
						.getStatus(series.id)
						.catch(() => ({ data: { status: null } })),
				])
				setIsFavorite(favResponse.data.isBookmarked)
				setCurrentStatus(statusResponse.data.status || null)
			} catch (error) {
				console.error('Failed to fetch user data:', error)
			}
		}

		fetchUserData()
	}, [user, series])

	const handleFavoriteClick = async () => {
		if (!user) {
			router.push('/login')
			return
		}

		setFavoriteLoading(true)
		try {
			if (isFavorite) {
				await bookmarksApi.removeBookmark(series!.id)
				setIsFavorite(false)
				showNotification('success', 'Удалено из избранного')
			} else {
				await bookmarksApi.addBookmark(series!.id)
				setIsFavorite(true)
				showNotification('success', 'Добавлено в избранное')
			}
		} catch (error) {
			console.error('Failed to toggle favorite:', error)
			showNotification('error', 'Ошибка при сохранении')
		} finally {
			setFavoriteLoading(false)
		}
	}

	const handleStatusChange = async (status: WatchStatus) => {
		if (!user) {
			router.push('/login')
			return
		}

		setStatusLoading(true)
		try {
			if (currentStatus === status) {
				await watchStatusApi.deleteStatus(series!.id)
				setCurrentStatus(null)
				showNotification('success', 'Статус удален')
			} else {
				await watchStatusApi.setStatus(series!.id, status)
				setCurrentStatus(status)
				showNotification(
					'success',
					`Статус изменен на "${statusOptions.find(opt => opt.value === status)?.label}"`,
				)
			}
		} catch (error) {
			console.error('Failed to change watch status:', error)
			showNotification('error', 'Ошибка при изменении статуса')
		} finally {
			setStatusLoading(false)
			setShowStatusDropdown(false)
		}
	}

	const fetchUserCollections = async () => {
		try {
			const response = await collectionsApi.getMyCollections()
			setUserCollections(response.data)
		} catch (error) {
			console.error('Failed to fetch collections:', error)
		}
	}

	const handleAddToCollection = async (collectionId: string) => {
		if (!series) return

		const collection = userCollections.find(c => c.id === collectionId)
		const isAlreadyInCollection = collection?.items?.some(
			item => item.contentId === series.id,
		)

		if (isAlreadyInCollection) {
			showNotification('error', 'Сериал уже в этом сборнике!')
			setShowCollectionsModal(false)
			return
		}

		try {
			await collectionsApi.addItem(collectionId, series.id)
			setShowCollectionsModal(false)
			showNotification('success', 'Сериал добавлен в сборник!')
		} catch (error) {
			console.error('Failed to add to collection:', error)
			showNotification('error', 'Ошибка при добавлении')
		}
	}

	const showNotification = (type: 'success' | 'error', message: string) => {
		setNotification({ type, message })
		setTimeout(() => setNotification(null), 3000)
	}

	const currentStatusOption = statusOptions.find(
		opt => opt.value === currentStatus,
	)

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

						{/* Кнопки действий */}
						<div className='flex flex-wrap gap-3 mb-6'>
							{/* Кнопка избранного */}
							<button
								onClick={handleFavoriteClick}
								disabled={favoriteLoading}
								className={`px-4 py-2 rounded-lg border transition-all duration-300 flex items-center gap-2 ${
									isFavorite
										? 'bg-red-500/20 border-red-500 text-red-400'
										: 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400'
								}`}
							>
								<Heart
									className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`}
								/>
								<span className='text-sm'>
									{isFavorite ? 'В избранном' : 'В избранное'}
								</span>
							</button>

							{/* Кнопка добавления в сборник */}
							<button
								onClick={() => {
									fetchUserCollections()
									setShowCollectionsModal(true)
								}}
								className='px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all duration-300 flex items-center gap-2'
							>
								<FolderPlus className='w-4 h-4' />
								<span className='text-sm'>В сборник</span>
							</button>

							{/* Кнопка статуса просмотра */}
							<div className='relative'>
								<button
									onClick={() => setShowStatusDropdown(!showStatusDropdown)}
									disabled={statusLoading}
									className={`px-4 py-2 rounded-lg border transition-all duration-300 flex items-center gap-2 ${
										currentStatusOption
											? `${currentStatusOption.color} bg-opacity-10`
											: 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400'
									}`}
								>
									{currentStatusOption ? (
										<>
											{currentStatusOption.icon}
											<span className='text-sm'>
												{currentStatusOption.label}
											</span>
										</>
									) : (
										<>
											<Eye className='w-4 h-4' />
											<span className='text-sm'>Статус</span>
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
														currentStatus === option.value
															? `${option.color} bg-opacity-10`
															: 'text-gray-400 hover:bg-custom-darker hover:text-white'
													}`}
												>
													{option.icon}
													<span className='text-sm'>{option.label}</span>
													{currentStatus === option.value && (
														<CheckCircle className='w-4 h-4 ml-auto text-green-400' />
													)}
												</button>
											))}
										</div>
									</>
								)}
							</div>
						</div>

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

			{/* Модальное окно выбора сборника */}
			{showCollectionsModal && (
				<>
					<div
						className='fixed inset-0 bg-black/80 z-50'
						onClick={() => setShowCollectionsModal(false)}
					/>
					<div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-custom-dark rounded-xl border border-gray-800 p-6 z-50'>
						<h3 className='text-xl font-bold text-white mb-4'>
							Добавить в сборник
						</h3>

						{userCollections.length === 0 ? (
							<div className='text-center py-6'>
								<p className='text-gray-500 mb-4'>У вас пока нет сборников</p>
								<Link
									href='/collections'
									onClick={() => setShowCollectionsModal(false)}
									className='text-blue-400 hover:underline'
								>
									Создать сборник
								</Link>
							</div>
						) : (
							<div className='space-y-2 max-h-96 overflow-y-auto'>
								{userCollections.map(collection => {
									const isAlreadyInCollection = collection.items?.some(
										item => item.contentId === series.id,
									)
									return (
										<button
											key={collection.id}
											onClick={() => handleAddToCollection(collection.id)}
											className='w-full text-left p-3 rounded-lg bg-custom-darker hover:bg-custom-darker/70 transition-colors border border-gray-800'
										>
											<div className='font-medium text-white'>
												{collection.title}
											</div>
											{collection.description && (
												<div className='text-xs text-gray-500 mt-1'>
													{collection.description}
												</div>
											)}
											<div className='text-xs text-gray-500 mt-1'>
												{collection.items?.length || 0} фильмов
												{isAlreadyInCollection && (
													<span className='ml-2 text-green-400'>
														✓ Уже добавлен
													</span>
												)}
											</div>
										</button>
									)
								})}
							</div>
						)}

						<div className='flex justify-end mt-4'>
							<Button
								variant='outline'
								onClick={() => setShowCollectionsModal(false)}
							>
								Отмена
							</Button>
						</div>
					</div>
				</>
			)}

			{/* Уведомление */}
			{notification && (
				<div
					className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
						notification.type === 'success'
							? 'bg-green-500 text-white'
							: 'bg-red-500 text-white'
					}`}
				>
					{notification.message}
				</div>
			)}
		</main>
	)
}
