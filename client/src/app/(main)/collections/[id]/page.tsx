'use client'

import { ContentCard } from '@/entities/content/ui/content-card'
import {
	Collection,
	collectionsApi,
} from '@/shared/api/collections/collections-api'
import { Globe, Lock, Trash2, User } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CollectionPage() {
	const { id } = useParams()
	const router = useRouter()
	const [collection, setCollection] = useState<Collection | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchCollection()
	}, [id])

	const fetchCollection = async () => {
		setLoading(true)
		try {
			const response = await collectionsApi.getCollection(id as string)
			setCollection(response.data)
		} catch (error) {
			console.error('Failed to fetch collection:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleRemoveItem = async (contentId: string) => {
		if (!confirm('Удалить фильм из сборника?')) return

		try {
			await collectionsApi.removeItem(id as string, contentId)
			fetchCollection()
		} catch (error) {
			console.error('Failed to remove item:', error)
		}
	}

	const handleDeleteCollection = async () => {
		if (!confirm('Вы уверены, что хотите удалить этот сборник?')) return

		try {
			await collectionsApi.deleteCollection(id as string)
			router.push('/collections')
		} catch (error) {
			console.error('Failed to delete collection:', error)
		}
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

	if (!collection) {
		return (
			<div className='bg-custom-darker min-h-screen py-12'>
				<div className='container mx-auto px-4 text-center py-12'>
					<p className='text-gray-500'>Сборник не найден</p>
					<Link
						href='/collections'
						className='text-blue-400 hover:underline mt-2 inline-block'
					>
						Вернуться к сборникам
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className='bg-custom-darker min-h-screen py-12'>
			<div className='container mx-auto px-4'>
				<div className='mb-6 text-sm text-gray-500'>
					<Link href='/collections' className='hover:text-blue-400'>
						Мои сборники
					</Link>
					<span className='mx-2'>/</span>
					<span className='text-gray-400'>{collection.title}</span>
				</div>

				{/* Информация о сборнике */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-6 mb-8'>
					<div className='flex justify-between items-start'>
						<div className='flex-1'>
							<h1 className='text-3xl font-bold text-white mb-2'>
								{collection.title}
							</h1>
							{collection.description && (
								<p className='text-gray-400 mb-4'>{collection.description}</p>
							)}
							<div className='flex items-center gap-4 text-sm'>
								<div className='flex items-center gap-1'>
									{collection.isPublic ? (
										<>
											<Globe className='w-4 h-4 text-green-400' />
											<span className='text-green-400'>Публичный</span>
										</>
									) : (
										<>
											<Lock className='w-4 h-4 text-gray-500' />
											<span className='text-gray-500'>Приватный</span>
										</>
									)}
								</div>
								<div className='flex items-center gap-1'>
									<User className='w-4 h-4 text-gray-500' />
									<span className='text-gray-500'>
										{collection.user?.username || 'Я'}
									</span>
								</div>
								<span className='text-gray-500'>
									{collection.items?.length || 0} фильмов
								</span>
							</div>
						</div>
						<button
							onClick={handleDeleteCollection}
							className='p-2 text-red-400 hover:bg-red-950/50 rounded-lg transition-colors'
						>
							<Trash2 className='w-5 h-5' />
						</button>
					</div>
				</div>

				{/* Список фильмов в сборнике */}
				{collection.items && collection.items.length > 0 ? (
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
						{collection.items.map(item => (
							<div key={item.id} className='relative group'>
								<ContentCard content={item.content as any} />
								<button
									onClick={() => handleRemoveItem(item.contentId)}
									className='absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10'
								>
									<Trash2 className='w-3 h-3 text-white' />
								</button>
							</div>
						))}
					</div>
				) : (
					<div className='text-center py-16 bg-custom-dark rounded-xl border border-gray-800'>
						<p className='text-gray-500 mb-4'>В сборнике пока нет фильмов</p>
						<Link href='/movies' className='text-blue-400 hover:underline'>
							Добавить фильмы
						</Link>
					</div>
				)}
			</div>
		</div>
	)
}
