'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { apiClient } from '@/shared/api/axios-instance'
import { bookmarksApi } from '@/shared/api/bookmarks/bookmark-api'
import {
	Collection,
	collectionsApi,
} from '@/shared/api/collections/collections-api'
import {
	WatchStatus,
	watchStatusApi,
} from '@/shared/api/watch-status/watch-status-api'
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
	User,
	XCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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

export default function MoviePage() {
	const { id } = useParams()
	const router = useRouter()
	const { user } = useAuth()
	const [movie, setMovie] = useState<Movie | null>(null)
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
				const response = await apiClient.get(`/content/movies/${id}`)
				console.log('📥 Movie data:', response.data)
				setMovie(response.data)
			} catch (error) {
				console.error('Failed to fetch movie:', error)
			} finally {
				setLoading(false)
			}
		}
		if (id) fetchData()
	}, [id])

	// Загрузка данных пользователя (избранное, статус)
	useEffect(() => {
		if (!user || !movie) return

		const fetchUserData = async () => {
			try {
				const [favResponse, statusResponse] = await Promise.all([
					bookmarksApi.checkBookmark(movie.id),
					watchStatusApi
						.getStatus(movie.id)
						.catch(() => ({ data: { status: null } })),
				])
				setIsFavorite(favResponse.data.isBookmarked)
				setCurrentStatus(statusResponse.data.status || null)
			} catch (error) {
				console.error('Failed to fetch user data:', error)
			}
		}

		fetchUserData()
	}, [user, movie])

	const handleFavoriteClick = async () => {
		if (!user) {
			router.push('/login')
			return
		}

		setFavoriteLoading(true)
		try {
			if (isFavorite) {
				await bookmarksApi.removeBookmark(movie!.id)
				setIsFavorite(false)
				showNotification('success', 'Удалено из избранного')
			} else {
				await bookmarksApi.addBookmark(movie!.id)
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
				await watchStatusApi.deleteStatus(movie!.id)
				setCurrentStatus(null)
				showNotification('success', 'Статус удален')
			} else {
				await watchStatusApi.setStatus(movie!.id, status)
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
		if (!movie) return

		const collection = userCollections.find(c => c.id === collectionId)
		const isAlreadyInCollection = collection?.items?.some(
			item => item.contentId === movie.id,
		)

		if (isAlreadyInCollection) {
			showNotification('error', 'Фильм уже в этом сборнике!')
			setShowCollectionsModal(false)
			return
		}

		try {
			await collectionsApi.addItem(collectionId, movie.id)
			setShowCollectionsModal(false)
			showNotification('success', 'Фильм добавлен в сборник!')
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
										item => item.contentId === movie.id,
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
