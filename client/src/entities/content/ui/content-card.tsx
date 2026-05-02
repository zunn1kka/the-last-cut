'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { bookmarksApi } from '@/shared/api/bookmarks/bookmark-api'
import {
	Collection,
	collectionsApi,
} from '@/shared/api/collections/collections-api'
import { ratingsApi } from '@/shared/api/ratings/ratings-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import { Film, FolderPlus, Heart, Star, Tv } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Content } from '../model/types/content'
import { ContentCardData } from '../model/types/content-card-data'

interface ContentCardProps {
	content: Content
	showRatings?: boolean
	showFavoriteButton?: boolean
}

export function ContentCard({
	content,
	showRatings = true,
	showFavoriteButton = true,
}: ContentCardProps) {
	const { user } = useAuth()
	const [isFavorite, setIsFavorite] = useState(false)
	const [imageError, setImageError] = useState(false)
	const [showCollectionsModal, setShowCollectionsModal] = useState(false)
	const [userCollections, setUserCollections] = useState<Collection[]>([])
	const [loading, setLoading] = useState(false)
	const [userRating, setUserRating] = useState<number | null>(null)
	const [notification, setNotification] = useState<{
		type: 'success' | 'error'
		message: string
	} | null>(null)

	// Загрузка всех данных пользователя
	useEffect(() => {
		if (!user) return

		const fetchData = async () => {
			try {
				const [favResponse, ratingResponse] = await Promise.all([
					bookmarksApi.checkBookmark(content.id),
					ratingsApi.getUserRating(content.id),
				])
				setIsFavorite(favResponse.data.isBookmarked)

				if (ratingResponse.data?.rating) {
					setUserRating(ratingResponse.data.rating)
				}
			} catch (error) {
				console.error('Failed to fetch user data:', error)
			}
		}

		fetchData()
	}, [user, content.id])

	// Загрузка сборников пользователя
	const fetchUserCollections = async () => {
		try {
			const response = await collectionsApi.getMyCollections()
			setUserCollections(response.data)
		} catch (error) {
			console.error('Failed to fetch collections:', error)
		}
	}

	// Обновление оценки после изменения
	const handleRatingChange = async (rating: number) => {
		setUserRating(rating)
		try {
			const response = await ratingsApi.getUserRating(content.id)
			if (response.data?.rating) {
				setUserRating(response.data.rating)
			} else if (rating === 0) {
				setUserRating(null)
			}
		} catch (error) {
			console.error('Failed to refresh rating:', error)
		}
	}

	// Получение рейтингов
	const ratings = {
		site: content.siteRating ? Number(content.siteRating).toFixed(1) : null,
	}

	// Основной рейтинг для отображения
	const primaryRating = ratings.site

	const cardData: ContentCardData = {
		id: content.id,
		title: content.title || '',
		posterUrl: content.posterUrl,
		releaseYear: content.releaseYear || 0,
		contentType: content.contentType || 'MOVIE',
		rating: primaryRating || '',
		genres: [],
	}

	const href =
		content.contentType === 'MOVIE'
			? `/movies/${content.id}`
			: `/series/${content.id}`

	const handleFavoriteClick = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (!user) {
			window.location.href = '/login'
			return
		}

		setLoading(true)
		try {
			if (isFavorite) {
				await bookmarksApi.removeBookmark(content.id)
				setIsFavorite(false)
				setNotification({ type: 'success', message: 'Удалено из избранного' })
				setTimeout(() => setNotification(null), 3000)
			} else {
				await bookmarksApi.addBookmark(content.id)
				setIsFavorite(true)
				setNotification({ type: 'success', message: 'Добавлено в избранное' })
				setTimeout(() => setNotification(null), 3000)
			}
		} catch (error) {
			console.error('Failed to toggle favorite:', error)
			setNotification({ type: 'error', message: 'Ошибка при сохранении' })
			setTimeout(() => setNotification(null), 3000)
		} finally {
			setLoading(false)
		}
	}

	// Отображение звездного рейтинга (только если есть)
	const renderStars = () => {
		if (!primaryRating) return null
		const rating = parseFloat(primaryRating)
		const fullStars = Math.floor(rating / 2)
		const stars = []
		for (let i = 0; i < 5; i++) {
			stars.push(
				<Star
					key={i}
					className={`w-3 h-3 ${
						i < fullStars ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'
					}`}
				/>,
			)
		}
		return <div className='flex items-center gap-0.5'>{stars}</div>
	}

	const isNew = content.releaseYear === new Date().getFullYear()

	return (
		<>
			<Link href={href} className='group block h-full'>
				<div className='bg-custom-dark rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-800 group-hover:border-gray-700 relative'>
					{/* Постер */}
					<div className='relative w-full pt-[150%] bg-custom-darker overflow-hidden'>
						{cardData.posterUrl && !imageError ? (
							<Image
								src={getImageUrl(cardData.posterUrl)}
								alt={cardData.title}
								fill
								unoptimized={true}
								className='object-cover group-hover:scale-105 transition-transform duration-500'
								sizes='(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw'
								onError={() => setImageError(true)}
							/>
						) : (
							<div className='absolute inset-0 flex flex-col items-center justify-center bg-custom-darker'>
								{cardData.contentType === 'MOVIE' ? (
									<Film className='w-12 h-12 text-gray-700' />
								) : (
									<Tv className='w-12 h-12 text-gray-700' />
								)}
								<span className='text-gray-600 text-sm mt-2'>Нет постера</span>
							</div>
						)}

						{/* Бейдж "Новинка" */}
						{isNew && (
							<div className='absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg z-10'>
								Новинка
							</div>
						)}

						{/* Тип контента */}
						<div className='absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs flex items-center gap-1'>
							{cardData.contentType === 'MOVIE' ? (
								<>
									<Film className='w-3 h-3' />
									<span>Фильм</span>
								</>
							) : (
								<>
									<Tv className='w-3 h-3' />
									<span>Сериал</span>
								</>
							)}
						</div>

						{/* Кнопка добавления в сборник */}
						{showFavoriteButton && user && (
							<button
								onClick={e => {
									e.preventDefault()
									e.stopPropagation()
									fetchUserCollections()
									setShowCollectionsModal(true)
								}}
								className='absolute top-12 right-2 bg-black/70 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10'
								title='Добавить в сборник'
							>
								<FolderPlus className='w-4 h-4 text-white' />
							</button>
						)}

						{/* Кнопка избранного */}
						{showFavoriteButton && user && (
							<button
								onClick={handleFavoriteClick}
								disabled={loading}
								className='absolute top-2 right-2 bg-black/70 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10 disabled:opacity-50'
								title='В избранное'
							>
								<Heart
									className={`w-4 h-4 transition-colors ${
										isFavorite
											? 'fill-red-500 text-red-500'
											: 'text-white hover:text-red-400'
									}`}
								/>
							</button>
						)}

						{/* Рейтинг на постере */}
						{showRatings && primaryRating && (
							<div className='absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-1'>
								<Star className='w-3 h-3 text-yellow-500 fill-yellow-500' />
								<span className='text-white'>{primaryRating}</span>
							</div>
						)}
					</div>

					{/* Информация */}
					<div className='p-3 flex-1 flex flex-col'>
						<h3 className='font-semibold text-sm line-clamp-1 group-hover:text-blue-400 transition-colors'>
							{cardData.title}
						</h3>

						<div className='flex items-center gap-2 text-xs text-gray-500 mt-1'>
							<span>{cardData.releaseYear}</span>
							{content.movie?.duration && (
								<>
									<span>•</span>
									<span>{content.movie.duration} мин</span>
								</>
							)}
							{content.series?.seasonsCount && (
								<>
									<span>•</span>
									<span>{content.series.seasonsCount} сез.</span>
								</>
							)}
						</div>

						{/* Звездный рейтинг */}
						{showRatings && primaryRating && (
							<div className='mt-2'>{renderStars()}</div>
						)}
					</div>
				</div>
			</Link>

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
										item => item.contentId === content.id,
									)
									return (
										<button
											key={collection.id}
											onClick={async () => {
												if (isAlreadyInCollection) {
													setNotification({
														type: 'error',
														message: 'Фильм уже в этом сборнике!',
													})
													setTimeout(() => setNotification(null), 3000)
													setShowCollectionsModal(false)
													return
												}
												try {
													await collectionsApi.addItem(
														collection.id,
														content.id,
													)
													setShowCollectionsModal(false)
													setNotification({
														type: 'success',
														message: 'Фильм добавлен в сборник!',
													})
													setTimeout(() => setNotification(null), 3000)
												} catch (error) {
													console.error('Failed to add to collection:', error)
													setNotification({
														type: 'error',
														message: 'Ошибка при добавлении',
													})
													setTimeout(() => setNotification(null), 3000)
												}
											}}
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
		</>
	)
}
