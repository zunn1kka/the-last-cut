'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ContentCard } from '@/entities/content/ui/content-card'
import { bookmarksApi } from '@/shared/api/bookmarks/bookmark-api'
import {
	Collection,
	collectionsApi,
} from '@/shared/api/collections/collections-api'
import { ratingsApi } from '@/shared/api/ratings/ratings-api'
import { usersApi } from '@/shared/api/users/users-api'
import { watchStatusApi } from '@/shared/api/watch-status/watch-status-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import { Tabs } from '@/shared/ui/Tabs'
import { EmailVerification } from '@/widgets/email-verification/ui/email-verification'
import {
	Camera,
	CheckCircle,
	Clock,
	Edit,
	FolderPlus,
	LogOut,
	Mail,
	PlayCircle,
	User as UserIcon,
	X,
	XCircle,
} from 'lucide-react'

import { ChangeEmailModal } from '@/features/profile/ui/change-email-modal'
import { ChangePasswordModal } from '@/features/profile/ui/change-password-modal'

interface UserStats {
	ratingsCount: number
	favoritesCount: number
	watchStatusCount: number
	collectionsCount: number
}

// Статусы просмотра (в нижнем регистре, как в БД)
type WatchStatusType = 'planned' | 'watching' | 'completed' | 'dropped'

interface WatchStatusItem {
	id: string
	userId: string
	contentId: string
	status: WatchStatusType
	progress: number
	updatedAt: string
	content: {
		id: string
		title: string
		posterUrl: string
		releaseYear: number
		contentType: 'MOVIE' | 'SERIES'
		siteRating: number | null
	}
}

const statusLabels: Record<
	WatchStatusType,
	{ label: string; icon: React.ReactNode; color: string }
> = {
	planned: {
		label: 'В планах',
		icon: <Clock className='w-4 h-4' />,
		color: 'text-yellow-400',
	},
	watching: {
		label: 'Смотрю',
		icon: <PlayCircle className='w-4 h-4' />,
		color: 'text-blue-400',
	},
	completed: {
		label: 'Просмотрено',
		icon: <CheckCircle className='w-4 h-4' />,
		color: 'text-green-400',
	},
	dropped: {
		label: 'Брошено',
		icon: <XCircle className='w-4 h-4' />,
		color: 'text-red-400',
	},
}

export default function ProfilePage() {
	const { user, updateUser, logout } = useAuth()
	const [isEditing, setIsEditing] = useState(false)
	const [favoriteSortBy, setFavoriteSortBy] = useState<
		'date' | 'title' | 'rating'
	>('date')
	const [favoriteSortOrder, setFavoriteSortOrder] = useState<'asc' | 'desc'>(
		'desc',
	)
	const [isChangingAvatar, setIsChangingAvatar] = useState(false)
	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [stats, setStats] = useState<UserStats>({
		ratingsCount: 0,
		favoritesCount: 0,
		watchStatusCount: 0,
		collectionsCount: 0,
	})
	const [activeTab, setActiveTab] = useState('ratings')
	const [ratings, setRatings] = useState<any[]>([])
	const [favorites, setFavorites] = useState<any[]>([])
	const [showChangeEmail, setShowChangeEmail] = useState(false)
	const [showChangePassword, setShowChangePassword] = useState(false)
	const [watchStatuses, setWatchStatuses] = useState<WatchStatusItem[]>([])
	const [collections, setCollections] = useState<Collection[]>([])
	const [loading, setLoading] = useState(true)
	const [formData, setFormData] = useState({
		username: user?.username || '',
		bio: user?.bio || '',
	})

	const sortedFavorites = useMemo(() => {
		const sorted = [...favorites]

		switch (favoriteSortBy) {
			case 'date':
				sorted.sort((a, b) => {
					const dateA = new Date(a.createdAt || a.content?.createdAt || 0)
					const dateB = new Date(b.createdAt || b.content?.createdAt || 0)
					return favoriteSortOrder === 'desc'
						? dateB.getTime() - dateA.getTime()
						: dateA.getTime() - dateB.getTime()
				})
				break
			case 'title':
				sorted.sort((a, b) => {
					const titleA = (a.content?.title || a.title || '').toLowerCase()
					const titleB = (b.content?.title || b.title || '').toLowerCase()
					return favoriteSortOrder === 'desc'
						? titleB.localeCompare(titleA)
						: titleA.localeCompare(titleB)
				})
				break
			case 'rating':
				sorted.sort((a, b) => {
					const ratingA = a.content?.siteRating || 0
					const ratingB = b.content?.siteRating || 0
					return favoriteSortOrder === 'desc'
						? ratingB - ratingA
						: ratingA - ratingB
				})
				break
		}
		return sorted
	}, [favorites, favoriteSortBy, favoriteSortOrder])

	useEffect(() => {
		if (user) {
			setFormData({
				username: user.username || '',
				bio: user.bio || '',
			})
		}
	}, [user])

	useEffect(() => {
		const fetchData = async () => {
			if (!user) return

			setLoading(true)
			try {
				console.log('🔍 Начинаем загрузку данных профиля...')

				const [ratingsRes, favoritesRes, watchStatusesRes, collectionsRes] =
					await Promise.all([
						ratingsApi.getUserRatings(),
						bookmarksApi.getBookmarks(),
						watchStatusApi.getAllStatuses().catch(() => ({ data: [] })),
						collectionsApi.getMyCollections().catch(() => ({ data: [] })),
					])

				const ratingsData = ratingsRes.data || []
				const favoritesData = favoritesRes.data || []
				const watchStatusesData = watchStatusesRes.data || []
				const collectionsData = collectionsRes.data || []

				console.log('✅ Оценок загружено:', ratingsData.length)
				console.log('✅ Избранного загружено:', favoritesData.length)
				console.log(
					'✅ Статусов просмотра загружено:',
					watchStatusesData.length,
				)
				console.log('✅ Сборников загружено:', collectionsData.length)

				setRatings(ratingsData)
				setFavorites(favoritesData)
				setWatchStatuses(watchStatusesData)
				setCollections(collectionsData)

				setStats({
					ratingsCount: ratingsData.length,
					favoritesCount: favoritesData.length,
					watchStatusCount: watchStatusesData.length,
					collectionsCount: collectionsData.length,
				})
			} catch (error) {
				console.error('❌ Ошибка при загрузке данных:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [user])

	const handleAvatarClick = () => {
		fileInputRef.current?.click()
	}

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setAvatarFile(file)
			const reader = new FileReader()
			reader.onloadend = () => {
				setAvatarPreview(reader.result as string)
			}
			reader.readAsDataURL(file)
			setIsChangingAvatar(true)
		}
	}

	const handleAvatarUpload = async () => {
		if (!avatarFile) return

		try {
			const response = await usersApi.updateAvatar(avatarFile)
			console.log('✅ Ответ от сервера:', response.data)

			if (response.data.user) {
				updateUser(response.data.user)
			}

			setIsChangingAvatar(false)
			setAvatarFile(null)
			setAvatarPreview(null)

			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		} catch (error) {
			console.error('Failed to upload avatar:', error)
		}
	}

	const cancelAvatarChange = () => {
		setIsChangingAvatar(false)
		setAvatarFile(null)
		setAvatarPreview(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			console.log('📝 Отправка данных профиля:', formData)

			const dataToSend = {
				username: formData.username,
				bio: formData.bio,
			}

			const response = await usersApi.updateProfile(dataToSend)
			console.log('✅ Ответ от сервера:', response.data)

			if (response.data.user) {
				updateUser(response.data.user)
				console.log('👤 Пользователь обновлен в контексте')
			}

			setIsEditing(false)
		} catch (error) {
			console.error('❌ Failed to update profile:', error)
		}
	}

	const handleLogout = async () => {
		await logout()
	}

	if (!user) {
		return (
			<>
				<main className='container mx-auto px-4 py-16 text-center'>
					<h1 className='text-2xl font-bold mb-4 text-white'>
						Необходимо авторизоваться
					</h1>
					<Link href='/login'>
						<Button>Войти</Button>
					</Link>
				</main>
			</>
		)
	}

	const tabs = [
		{ id: 'ratings', label: `Мои оценки (${stats.ratingsCount})` },
		{ id: 'favorites', label: `Избранное (${stats.favoritesCount})` },
		{ id: 'watch-status', label: `Статусы (${stats.watchStatusCount})` },
		{ id: 'collections', label: `Сборники (${stats.collectionsCount})` },
	]

	// Группировка статусов по типу (используем нижний регистр, как в БД)
	const plannedStatuses = watchStatuses.filter(s => s.status === 'planned')
	const watchingStatuses = watchStatuses.filter(s => s.status === 'watching')
	const completedStatuses = watchStatuses.filter(s => s.status === 'completed')
	const droppedStatuses = watchStatuses.filter(s => s.status === 'dropped')

	return (
		<>
			<main className='bg-custom-darker min-h-screen py-8'>
				<div className='container mx-auto px-4'>
					{/* Шапка профиля */}
					<div className='bg-custom-dark rounded-xl shadow-xl border border-gray-800 p-4 md:p-6 mb-8'>
						<div className='flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6'>
							{/* Аватар */}
							<div className='relative flex-shrink-0'>
								<div
									onClick={handleAvatarClick}
									className='relative w-24 h-24 rounded-full overflow-hidden bg-custom-darker cursor-pointer group ring-2 ring-gray-700 hover:ring-blue-500 transition-all'
								>
									{isChangingAvatar && avatarPreview ? (
										<Image
											src={avatarPreview}
											alt='Avatar preview'
											fill
											className='object-cover'
										/>
									) : user.avatarUrl ? (
										<Image
											src={getImageUrl(user.avatarUrl)}
											alt={user.username}
											fill
											unoptimized={true}
											className='object-cover group-hover:opacity-75 transition-opacity'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white text-3xl'>
											{user.username.charAt(0).toUpperCase()}
										</div>
									)}

									<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
										<Camera className='w-6 h-6 text-white' />
									</div>
								</div>

								<input
									ref={fileInputRef}
									type='file'
									accept='image/*'
									onChange={handleAvatarChange}
									className='hidden'
								/>

								{isChangingAvatar && (
									<div className='absolute -bottom-12 left-1/2 -translate-x-1/2 flex space-x-2 bg-custom-dark rounded-lg shadow-lg p-2 z-10 border border-gray-700'>
										<Button size='sm' onClick={handleAvatarUpload}>
											Сохранить
										</Button>
										<Button
											size='sm'
											variant='outline'
											onClick={cancelAvatarChange}
										>
											<X className='w-4 h-4' />
										</Button>
									</div>
								)}
							</div>

							{/* Информация */}
							<div className='flex-1 w-full md:w-auto'>
								{isEditing ? (
									<form onSubmit={handleUpdateProfile} className='space-y-4'>
										<div>
											<label className='block text-sm font-medium text-gray-300 mb-1'>
												Имя пользователя
											</label>
											<input
												type='text'
												value={formData.username}
												onChange={e =>
													setFormData({ ...formData, username: e.target.value })
												}
												className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
												required
											/>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-300 mb-1'>
												О себе
											</label>
											<textarea
												value={formData.bio}
												onChange={e =>
													setFormData({ ...formData, bio: e.target.value })
												}
												rows={3}
												className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-25'
											/>
										</div>

										<div className='flex space-x-2'>
											<Button type='submit' size='sm'>
												Сохранить
											</Button>
											<Button
												type='button'
												variant='outline'
												size='sm'
												onClick={() => setIsEditing(false)}
											>
												Отмена
											</Button>
										</div>
									</form>
								) : (
									<>
										<div className='flex items-center justify-between mb-2 flex-wrap gap-2'>
											<h1 className='text-2xl font-bold text-white'>
												{user.username}
											</h1>
											<div className='flex space-x-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => setIsEditing(true)}
												>
													<Edit className='w-4 h-4 mr-2' />
													Редактировать
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={handleLogout}
													className='text-red-400 border-red-800 hover:bg-red-950/50'
												>
													<LogOut className='w-4 h-4 mr-2' />
													Выйти
												</Button>
											</div>
										</div>

										<div className='space-y-2 text-gray-400'>
											<div className='flex items-center'>
												<Mail className='w-4 h-4 mr-2' />
												<span>{user.email}</span>
												<button
													onClick={() => setShowChangeEmail(true)}
													className='text-xs text-blue-400 hover:text-blue-300 ml-2'
												>
													(сменить)
												</button>
											</div>

											{user.bio && (
												<div className='flex items-start'>
													<UserIcon className='w-4 h-4 mr-2 mt-1' />
													<p>{user.bio}</p>
												</div>
											)}

											{/* Кнопка смены пароля */}
											<button
												onClick={() => setShowChangePassword(true)}
												className='text-sm text-blue-400 hover:text-blue-300 transition-colors'
											>
												Сменить пароль
											</button>
										</div>
									</>
								)}
							</div>

							{/* Статистика */}
							<div className='grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto'>
								<div className='text-center px-3 py-2 bg-custom-darker rounded-lg border border-gray-800'>
									<div className='text-xl md:text-2xl font-bold text-white'>
										{stats.ratingsCount}
									</div>
									<div className='text-xs text-gray-500'>Оценок</div>
								</div>
								<div className='text-center px-3 py-2 bg-custom-darker rounded-lg border border-gray-800'>
									<div className='text-xl md:text-2xl font-bold text-white'>
										{stats.favoritesCount}
									</div>
									<div className='text-xs text-gray-500'>В избранном</div>
								</div>
								<div className='text-center px-3 py-2 bg-custom-darker rounded-lg border border-gray-800'>
									<div className='text-xl md:text-2xl font-bold text-white'>
										{stats.watchStatusCount}
									</div>
									<div className='text-xs text-gray-500'>Статусов</div>
								</div>
								<div className='text-center px-3 py-2 bg-custom-darker rounded-lg border border-gray-800'>
									<div className='text-xl md:text-2xl font-bold text-white'>
										{stats.collectionsCount}
									</div>
									<div className='text-xs text-gray-500'>Сборников</div>
								</div>
							</div>
						</div>
					</div>

					{/* Верификация email */}
					<div className='mb-8'>
						<EmailVerification
							email={user.email}
							isVerified={(user as any).emailVerified || false}
							onVerified={() => {
								updateUser({ emailVerified: true })
							}}
						/>
					</div>

					{/* Табы с контентом */}
					<Tabs
						tabs={tabs}
						activeTab={activeTab}
						onTabChange={setActiveTab}
						className='mb-6'
					/>

					{loading ? (
						<div className='flex justify-center py-12'>
							<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
						</div>
					) : (
						<>
							{activeTab === 'ratings' && (
								<div>
									{ratings.length > 0 ? (
										<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
											{ratings.map((rating: any) => (
												<div key={rating.contentId} className='relative'>
													<ContentCard content={rating.content} />
													<div className='absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold'>
														★ {rating.value}
													</div>
												</div>
											))}
										</div>
									) : (
										<p className='text-center text-gray-500 py-12'>
											У вас пока нет оценок
										</p>
									)}
								</div>
							)}

							{activeTab === 'favorites' && (
								<div>
									{/* Панель сортировки */}
									<div className='flex gap-4 mb-6 justify-end'>
										<div className='flex items-center gap-2'>
											<span className='text-sm text-gray-400'>
												Сортировать по:
											</span>
											<select
												value={favoriteSortBy}
												onChange={e => setFavoriteSortBy(e.target.value as any)}
												className='px-3 py-1 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm'
											>
												<option
													value='date'
													className='bg-custom-darker text-white'
												>
													Дате добавления
												</option>
												<option
													value='title'
													className='bg-custom-darker text-white'
												>
													Названию
												</option>
												<option
													value='rating'
													className='bg-custom-darker text-white'
												>
													Рейтингу
												</option>
											</select>
											<button
												onClick={() =>
													setFavoriteSortOrder(
														favoriteSortOrder === 'desc' ? 'asc' : 'desc',
													)
												}
												className='px-3 py-1 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm hover:bg-gray-700 transition'
											>
												{favoriteSortOrder === 'desc'
													? '↓ По убыванию'
													: '↑ По возрастанию'}
											</button>
										</div>
									</div>

									{sortedFavorites.length > 0 ? (
										<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
											{sortedFavorites.map((item: any) => (
												<ContentCard
													key={item.contentId}
													content={item.content}
												/>
											))}
										</div>
									) : (
										<p className='text-center text-gray-500 py-12'>
											В избранном пока ничего нет
										</p>
									)}
								</div>
							)}

							{activeTab === 'watch-status' && (
								<div className='space-y-8'>
									{/* В планах */}
									{plannedStatuses.length > 0 && (
										<div>
											<h3 className='text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2'>
												<Clock className='w-5 h-5' />В планах (
												{plannedStatuses.length})
											</h3>
											<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
												{plannedStatuses.map(item => (
													<div key={item.contentId} className='relative'>
														<ContentCard content={item.content} />
														<div className='absolute top-2 right-2 bg-yellow-500/90 text-black px-2 py-1 rounded text-xs font-medium'>
															В планах
														</div>
													</div>
												))}
											</div>
										</div>
									)}

									{/* Смотрю */}
									{watchingStatuses.length > 0 && (
										<div>
											<h3 className='text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2'>
												<PlayCircle className='w-5 h-5' />
												Смотрю ({watchingStatuses.length})
											</h3>
											<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
												{watchingStatuses.map(item => (
													<div key={item.contentId} className='relative'>
														<ContentCard content={item.content} />
														<div className='absolute top-2 right-2 bg-blue-500/90 text-white px-2 py-1 rounded text-xs font-medium'>
															Смотрю
														</div>
														{item.progress > 0 && (
															<div className='absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg px-2 py-1'>
																<div className='text-xs text-white'>
																	Прогресс: {item.progress}%
																</div>
																<div className='w-full h-1 bg-gray-600 rounded-full mt-1 overflow-hidden'>
																	<div
																		className='h-full bg-blue-500 rounded-full'
																		style={{ width: `${item.progress}%` }}
																	/>
																</div>
															</div>
														)}
													</div>
												))}
											</div>
										</div>
									)}

									{/* Просмотрено */}
									{completedStatuses.length > 0 && (
										<div>
											<h3 className='text-lg font-semibold text-green-400 mb-4 flex items-center gap-2'>
												<CheckCircle className='w-5 h-5' />
												Просмотрено ({completedStatuses.length})
											</h3>
											<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
												{completedStatuses.map(item => (
													<div key={item.contentId} className='relative'>
														<ContentCard content={item.content} />
														<div className='absolute top-2 right-2 bg-green-500/90 text-white px-2 py-1 rounded text-xs font-medium'>
															Просмотрено
														</div>
													</div>
												))}
											</div>
										</div>
									)}

									{/* Брошено */}
									{droppedStatuses.length > 0 && (
										<div>
											<h3 className='text-lg font-semibold text-red-400 mb-4 flex items-center gap-2'>
												<XCircle className='w-5 h-5' />
												Брошено ({droppedStatuses.length})
											</h3>
											<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
												{droppedStatuses.map(item => (
													<div key={item.contentId} className='relative'>
														<ContentCard content={item.content} />
														<div className='absolute top-2 right-2 bg-red-500/90 text-white px-2 py-1 rounded text-xs font-medium'>
															Брошено
														</div>
													</div>
												))}
											</div>
										</div>
									)}

									{watchStatuses.length === 0 && (
										<p className='text-center text-gray-500 py-12'>
											У вас пока нет отмеченных статусов просмотра
										</p>
									)}
								</div>
							)}

							{activeTab === 'collections' && (
								<div>
									{collections.length > 0 ? (
										<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
											{collections.map(collection => (
												<Link
													key={collection.id}
													href={`/collections/${collection.id}`}
													className='bg-custom-dark rounded-xl border border-gray-800 hover:border-gray-700 transition-all overflow-hidden group'
												>
													<div className='p-5'>
														<div className='flex items-start justify-between mb-2'>
															<h3 className='text-xl font-semibold text-white group-hover:text-blue-400 transition-colors'>
																{collection.title}
															</h3>
															{collection.isPublic ? (
																<span className='text-xs text-green-400'>
																	Публичный
																</span>
															) : (
																<span className='text-xs text-gray-500'>
																	Приватный
																</span>
															)}
														</div>
														{collection.description && (
															<p className='text-gray-400 text-sm mb-3 line-clamp-2'>
																{collection.description}
															</p>
														)}
														<div className='flex items-center justify-between text-sm'>
															<span className='text-gray-500 text-xs'>
																{collection.items?.length || 0} фильмов
															</span>
														</div>
													</div>
													{/* Миниатюры фильмов */}
													{collection.items && collection.items.length > 0 && (
														<div className='flex border-t border-gray-800'>
															{collection.items.slice(0, 4).map(item => (
																<div
																	key={item.id}
																	className='flex-1 aspect-[2/3] bg-custom-darker overflow-hidden'
																>
																	{item.content.posterUrl ? (
																		<img
																			src={getImageUrl(item.content.posterUrl)}
																			alt={item.content.title}
																			className='w-full h-full object-cover'
																		/>
																	) : (
																		<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600'>
																			<span className='text-white text-xs text-center px-1'>
																				{item.content.title.slice(0, 20)}
																			</span>
																		</div>
																	)}
																</div>
															))}
															{collection.items.length > 4 && (
																<div className='flex-1 aspect-[2/3] bg-custom-darker flex items-center justify-center'>
																	<span className='text-gray-500 text-sm'>
																		+{collection.items.length - 4}
																	</span>
																</div>
															)}
														</div>
													)}
												</Link>
											))}
										</div>
									) : (
										<div className='text-center py-12'>
											<FolderPlus className='w-16 h-16 text-gray-600 mx-auto mb-4' />
											<p className='text-gray-500 mb-4'>
												У вас пока нет сборников
											</p>
											<Link href='/collections'>
												<Button>Создать сборник</Button>
											</Link>
										</div>
									)}
								</div>
							)}
						</>
					)}
				</div>
			</main>

			{/* Модальные окна */}
			<ChangeEmailModal
				isOpen={showChangeEmail}
				onClose={() => setShowChangeEmail(false)}
				onSuccess={(newEmail: string) => {
					updateUser({ email: newEmail })
					alert('Email успешно изменён')
				}}
			/>

			<ChangePasswordModal
				isOpen={showChangePassword}
				onClose={() => setShowChangePassword(false)}
				onSuccess={() => {
					alert('Пароль успешно изменён')
				}}
			/>
		</>
	)
}
