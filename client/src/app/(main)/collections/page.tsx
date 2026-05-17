'use client'

import {
	Collection,
	collectionsApi,
} from '@/shared/api/collections/collections-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import {
	FolderPlus,
	Globe,
	Lock,
	MoreVertical,
	Pencil,
	Search,
	Trash2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function CollectionsPage() {
	const router = useRouter()
	const [collections, setCollections] = useState<Collection[]>([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [sortBy, setSortBy] = useState<'title' | 'date' | 'itemsCount'>('date')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
	const [filterPublic, setFilterPublic] = useState<
		'all' | 'public' | 'private'
	>('all')
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [newCollection, setNewCollection] = useState({
		title: '',
		description: '',
		isPublic: true,
	})
	const [creating, setCreating] = useState(false)

	// Фильтрация сборников
	const filteredCollections = useMemo(() => {
		let result = [...collections]

		// Поиск по названию и описанию
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase()
			result = result.filter(
				collection =>
					collection.title.toLowerCase().includes(query) ||
					collection.description?.toLowerCase().includes(query),
			)
		}

		// Фильтрация по публичности
		if (filterPublic !== 'all') {
			result = result.filter(collection =>
				filterPublic === 'public' ? collection.isPublic : !collection.isPublic,
			)
		}

		// Сортировка
		result.sort((a, b) => {
			let comparison = 0
			switch (sortBy) {
				case 'title':
					comparison = a.title.localeCompare(b.title)
					break
				case 'date':
					comparison =
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					break
				case 'itemsCount':
					comparison = (a.items?.length || 0) - (b.items?.length || 0)
					break
			}
			return sortOrder === 'asc' ? comparison : -comparison
		})

		return result
	}, [collections, searchQuery, sortBy, sortOrder, filterPublic])

	useEffect(() => {
		fetchCollections()
	}, [])

	const fetchCollections = async () => {
		setLoading(true)
		try {
			const response = await collectionsApi.getMyCollections()
			setCollections(response.data || [])
		} catch (error) {
			console.error('Failed to fetch collections:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleCreate = async () => {
		if (!newCollection.title.trim()) return

		setCreating(true)
		try {
			await collectionsApi.createCollection(newCollection)
			setShowCreateModal(false)
			setNewCollection({ title: '', description: '', isPublic: true })
			fetchCollections()
		} catch (error) {
			console.error('Failed to create collection:', error)
		} finally {
			setCreating(false)
		}
	}

	const handleDelete = async (id: string) => {
		if (!confirm('Вы уверены, что хотите удалить этот сборник?')) return

		try {
			await collectionsApi.deleteCollection(id)
			fetchCollections()
		} catch (error) {
			console.error('Failed to delete collection:', error)
		}
	}

	const resetFilters = () => {
		setSearchQuery('')
		setSortBy('date')
		setSortOrder('desc')
		setFilterPublic('all')
	}

	if (loading) {
		return (
			<div className='bg-custom-darker min-h-screen py-12'>
				<div className='container mx-auto px-4'>
					<div className='flex justify-center py-12'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='bg-custom-darker min-h-screen py-12'>
			<div className='container mx-auto px-4'>
				{/* Заголовок */}
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-white'>Мои сборники</h1>
					<p className='text-gray-400 mt-1'>
						Собирайте фильмы и сериалы в свои подборки
					</p>
				</div>

				{/* Панель поиска и фильтров */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-4 mb-8'>
					<div className='flex flex-col md:flex-row gap-4'>
						{/* Поиск */}
						<div className='flex-1 relative'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
							<input
								type='text'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								placeholder='Поиск сборников по названию или описанию...'
								className='w-full pl-9 pr-4 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>

						{/* Фильтр по публичности */}
						<select
							value={filterPublic}
							onChange={e =>
								setFilterPublic(e.target.value as 'all' | 'public' | 'private')
							}
							className='px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
						>
							<option value='all'>Все сборники</option>
							<option value='public'>Только публичные</option>
							<option value='private'>Только приватные</option>
						</select>

						{/* Сортировка */}
						<select
							value={sortBy}
							onChange={e =>
								setSortBy(e.target.value as 'title' | 'date' | 'itemsCount')
							}
							className='px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
						>
							<option value='date'>По дате создания</option>
							<option value='title'>По названию</option>
							<option value='itemsCount'>По количеству фильмов</option>
						</select>

						{/* Порядок сортировки */}
						<button
							onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
							className='px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm hover:bg-gray-700 transition-colors'
						>
							{sortOrder === 'asc' ? '↑ По возрастанию' : '↓ По убыванию'}
						</button>

						{(searchQuery || filterPublic !== 'all') && (
							<button
								onClick={resetFilters}
								className='px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors'
							>
								Сбросить фильтры
							</button>
						)}

						<Button
							onClick={() => setShowCreateModal(true)}
							className='flex items-center gap-2'
						>
							<FolderPlus className='w-4 h-4' />
							Создать сборник
						</Button>
					</div>

					{/* Результаты поиска */}
					{searchQuery && (
						<div className='mt-3 text-sm text-gray-400'>
							Найдено: {filteredCollections.length} сборников
						</div>
					)}
				</div>

				{/* Список сборников */}
				{filteredCollections.length === 0 ? (
					<div className='text-center py-16 bg-custom-dark rounded-xl border border-gray-800'>
						<FolderPlus className='w-16 h-16 text-gray-600 mx-auto mb-4' />
						{collections.length === 0 ? (
							<>
								<p className='text-gray-500 mb-4'>У вас пока нет сборников</p>
								<Button onClick={() => setShowCreateModal(true)}>
									Создать первый сборник
								</Button>
							</>
						) : (
							<p className='text-gray-500'>Сборники не найдены</p>
						)}
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{filteredCollections.map(collection => (
							<div
								key={collection.id}
								className='bg-custom-dark rounded-xl border border-gray-800 hover:border-gray-700 transition-all overflow-hidden group'
							>
								<div className='p-5'>
									<div className='flex items-start justify-between mb-2'>
										<Link
											href={`/collections/${collection.id}`}
											className='flex-1 group'
										>
											<h2 className='text-xl font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1'>
												{collection.title}
											</h2>
										</Link>
										<div className='relative'>
											<button className='p-1 text-gray-500 hover:text-white transition-colors'>
												<MoreVertical className='w-5 h-5' />
											</button>
											<div className='absolute right-0 mt-1 w-36 bg-custom-dark border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10'>
												<button
													onClick={() =>
														router.push(`/collections/${collection.id}/edit`)
													}
													className='w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-custom-darker hover:text-white flex items-center gap-2 rounded-t-lg'
												>
													<Pencil className='w-4 h-4' />
													Редактировать
												</button>
												<button
													onClick={() => handleDelete(collection.id)}
													className='w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/50 flex items-center gap-2 rounded-b-lg'
												>
													<Trash2 className='w-4 h-4' />
													Удалить
												</button>
											</div>
										</div>
									</div>

									{collection.description && (
										<p className='text-gray-400 text-sm mb-3 line-clamp-2'>
											{collection.description}
										</p>
									)}

									<div className='flex items-center justify-between text-sm'>
										<div className='flex items-center gap-2'>
											{collection.isPublic ? (
												<span className='flex items-center gap-1 text-green-400 text-xs'>
													<Globe className='w-3 h-3' />
													Публичный
												</span>
											) : (
												<span className='flex items-center gap-1 text-gray-500 text-xs'>
													<Lock className='w-3 h-3' />
													Приватный
												</span>
											)}
										</div>
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
													<Image
														src={getImageUrl(item.content.posterUrl)}
														alt={item.content.title}
														width={100}
														height={150}
														className='w-full h-full object-cover'
														unoptimized={true}
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
							</div>
						))}
					</div>
				)}

				{/* Модальное окно создания сборника */}
				{showCreateModal && (
					<>
						<div
							className='fixed inset-0 bg-black/80 z-40'
							onClick={() => setShowCreateModal(false)}
						/>
						<div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-custom-dark rounded-xl border border-gray-800 p-6 z-50'>
							<h2 className='text-xl font-bold text-white mb-4'>
								Создать сборник
							</h2>
							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-1'>
										Название *
									</label>
									<input
										type='text'
										value={newCollection.title}
										onChange={e =>
											setNewCollection({
												...newCollection,
												title: e.target.value,
											})
										}
										className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
										placeholder='Например: Любимые фильмы'
									/>
									{!newCollection.title.trim() && (
										<p className='text-red-400 text-xs mt-1'>
											Название обязательно
										</p>
									)}
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-1'>
										Описание
									</label>
									<textarea
										value={newCollection.description}
										onChange={e =>
											setNewCollection({
												...newCollection,
												description: e.target.value,
											})
										}
										rows={3}
										className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
										placeholder='Коротко о сборнике...'
									/>
								</div>
								<div className='flex items-center gap-2'>
									<input
										type='checkbox'
										id='isPublic'
										checked={newCollection.isPublic}
										onChange={e =>
											setNewCollection({
												...newCollection,
												isPublic: e.target.checked,
											})
										}
										className='w-4 h-4 rounded border-gray-700 bg-custom-darker text-blue-600 focus:ring-blue-500'
									/>
									<label htmlFor='isPublic' className='text-sm text-gray-300'>
										Публичный сборник (видят другие пользователи)
									</label>
								</div>
								<div className='flex gap-3 pt-4'>
									<Button
										onClick={handleCreate}
										disabled={creating || !newCollection.title.trim()}
									>
										{creating ? 'Создание...' : 'Создать'}
									</Button>
									<Button
										variant='outline'
										onClick={() => setShowCreateModal(false)}
									>
										Отмена
									</Button>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
