'use client'

import { EpisodeForm } from '@/features/admin/episodes/ui/episodes-form'
import { adminApi } from '@/shared/api/admin/admin-api'
import Button from '@/shared/ui/Button'
import { Calendar, ChevronLeft, Clock, Edit, Plus, Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Episode {
	id: string
	seasonNumber: number
	episodeNumber: number
	title: string
	duration: number
	description?: string
	airDate?: string
}

export default function EpisodesPage() {
	const { id } = useParams()
	const router = useRouter()
	const [episodes, setEpisodes] = useState<Episode[]>([])
	const [series, setSeries] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null)

	useEffect(() => {
		fetchData()
	}, [id])

	const fetchData = async () => {
		try {
			const [seriesRes, episodesRes] = await Promise.all([
				adminApi.getSeriesById(id as string),
				adminApi.getEpisodesBySeries(id as string),
			])
			setSeries(seriesRes.data)
			setEpisodes(episodesRes.data || [])
		} catch (error) {
			console.error('Failed to fetch data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async (episodeId: string) => {
		if (confirm('Вы уверены, что хотите удалить этот эпизод?')) {
			try {
				await adminApi.deleteEpisode(episodeId)
				setEpisodes(episodes.filter(e => e.id !== episodeId))
			} catch (error) {
				console.error('Failed to delete episode:', error)
			}
		}
	}

	const formatDate = (dateString?: string) => {
		if (!dateString) return '—'
		return new Date(dateString).toLocaleDateString('ru-RU')
	}

	// Группировка эпизодов по сезонам
	const episodesBySeason = episodes.reduce(
		(acc, episode) => {
			const season = episode.seasonNumber
			if (!acc[season]) acc[season] = []
			acc[season].push(episode)
			return acc
		},
		{} as Record<number, Episode[]>,
	)

	// Сортировка эпизодов в каждом сезоне
	Object.keys(episodesBySeason).forEach(season => {
		episodesBySeason[Number(season)].sort(
			(a, b) => a.episodeNumber - b.episodeNumber,
		)
	})

	if (loading) {
		return (
			<div className='flex justify-center py-12'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
			</div>
		)
	}

	return (
		<div>
			{/* Хлебные крошки и заголовок */}
			<div className='mb-6'>
				<button
					onClick={() => router.push('/admin/series')}
					className='flex items-center text-gray-600 hover:text-gray-900 mb-4'
				>
					<ChevronLeft className='w-4 h-4 mr-1' />
					Назад к сериалам
				</button>
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-3xl font-bold'>{series?.title || 'Сериал'}</h1>
						<p className='text-gray-500 mt-1'>Управление эпизодами</p>
					</div>
					<Button onClick={() => setShowForm(true)}>
						<Plus className='w-4 h-4 mr-2' />
						Добавить эпизод
					</Button>
				</div>
			</div>

			{/* Список эпизодов по сезонам */}
			{Object.keys(episodesBySeason).length > 0 ? (
				<div className='space-y-8'>
					{Object.entries(episodesBySeason)
						.sort(([a], [b]) => Number(a) - Number(b))
						.map(([season, seasonEpisodes]) => (
							<div
								key={season}
								className='bg-white rounded-lg shadow overflow-hidden'
							>
								<div className='bg-gray-50 px-6 py-4 border-b'>
									<h2 className='text-xl font-bold'>
										Сезон {season}
										<span className='text-sm text-gray-500 ml-2'>
											{seasonEpisodes.length} эпизодов
										</span>
									</h2>
								</div>
								<div className='divide-y'>
									{seasonEpisodes.map(episode => (
										<div
											key={episode.id}
											className='p-6 hover:bg-gray-50 transition-colors'
										>
											<div className='flex items-start justify-between'>
												<div className='flex-1'>
													<div className='flex items-center space-x-3'>
														<span className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium'>
															Эпизод {episode.episodeNumber}
														</span>
														<h3 className='text-lg font-semibold'>
															{episode.title}
														</h3>
													</div>
													<div className='flex items-center space-x-4 mt-2 text-sm text-gray-500'>
														<div className='flex items-center'>
															<Clock className='w-4 h-4 mr-1' />
															{episode.duration} мин
														</div>
														{episode.airDate && (
															<div className='flex items-center'>
																<Calendar className='w-4 h-4 mr-1' />
																{formatDate(episode.airDate)}
															</div>
														)}
													</div>
													{episode.description && (
														<p className='mt-2 text-gray-600 text-sm line-clamp-2'>
															{episode.description}
														</p>
													)}
												</div>
												<div className='flex space-x-2 ml-4'>
													<Button
														variant='outline'
														size='sm'
														onClick={() => {
															setEditingEpisode(episode)
															setShowForm(true)
														}}
													>
														<Edit className='w-4 h-4' />
													</Button>
													<Button
														variant='danger'
														size='sm'
														onClick={() => handleDelete(episode.id)}
													>
														<Trash2 className='w-4 h-4' />
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
				</div>
			) : (
				<div className='text-center py-12 bg-white rounded-lg shadow'>
					<p className='text-gray-500'>Нет эпизодов</p>
					<p className='text-sm text-gray-400 mt-2'>
						Нажмите "Добавить эпизод", чтобы начать
					</p>
				</div>
			)}

			{/* Модальное окно для добавления/редактирования */}
			{showForm && (
				<EpisodeForm
					seriesId={id as string}
					initialData={editingEpisode || undefined}
					isEditing={!!editingEpisode}
					episodeId={editingEpisode?.id}
					onClose={() => {
						setShowForm(false)
						setEditingEpisode(null)
					}}
					onSuccess={fetchData}
				/>
			)}
		</div>
	)
}
