'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import Button from '@/shared/ui/Button'
import { DataTable } from '@/widgets/admin/data-table'
import { Filter, Plus, Search, Tv, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Series {
	id: string
	title: string
	posterUrl?: string
	releaseYear: number
	series?: {
		seasonsCount: number
		episodesCount?: number
	}
}

interface Filters {
	title: string
	yearFrom: string
	yearTo: string
	seasonsFrom: string
	seasonsTo: string
}

export default function AdminSeriesPage() {
	const router = useRouter()
	const [series, setSeries] = useState<Series[]>([])
	const [filteredSeries, setFilteredSeries] = useState<Series[]>([])
	const [loading, setLoading] = useState(true)
	const [showFilters, setShowFilters] = useState(false)
	const [filters, setFilters] = useState<Filters>({
		title: '',
		yearFrom: '',
		yearTo: '',
		seasonsFrom: '',
		seasonsTo: '',
	})

	useEffect(() => {
		fetchSeries()
	}, [])

	const fetchSeries = async () => {
		try {
			const response = await adminApi.getSeries()
			const formattedSeries = (response.data || []).map((item: any) => ({
				id: item.id,
				title: item.title,
				posterUrl: item.posterUrl,
				releaseYear: item.releaseYear,
				seasonsCount: item.series?.seasonsCount || 0,
				episodesCount: item.series?.episodesCount || 0,
			}))
			setSeries(formattedSeries)
			setFilteredSeries(formattedSeries)
		} catch (error) {
			console.error('Failed to fetch series:', error)
		} finally {
			setLoading(false)
		}
	}

	// Применение фильтров
	useEffect(() => {
		let result = [...series]

		// Фильтр по названию
		if (filters.title.trim()) {
			const query = filters.title.toLowerCase()
			result = result.filter(series =>
				series.title.toLowerCase().includes(query),
			)
		}

		// Фильтр по году (от)
		if (filters.yearFrom) {
			const yearFrom = parseInt(filters.yearFrom)
			result = result.filter(series => series.releaseYear >= yearFrom)
		}

		// Фильтр по году (до)
		if (filters.yearTo) {
			const yearTo = parseInt(filters.yearTo)
			result = result.filter(series => series.releaseYear <= yearTo)
		}

		// Фильтр по количеству сезонов (от)
		if (filters.seasonsFrom) {
			const seasonsFrom = parseInt(filters.seasonsFrom)
			result = result.filter(series => series.seasonsCount >= seasonsFrom)
		}

		// Фильтр по количеству сезонов (до)
		if (filters.seasonsTo) {
			const seasonsTo = parseInt(filters.seasonsTo)
			result = result.filter(series => series.seasonsCount <= seasonsTo)
		}

		setFilteredSeries(result)
	}, [series, filters])

	const handleFilterChange = (key: keyof Filters, value: string) => {
		setFilters(prev => ({ ...prev, [key]: value }))
	}

	const resetFilters = () => {
		setFilters({
			title: '',
			yearFrom: '',
			yearTo: '',
			seasonsFrom: '',
			seasonsTo: '',
		})
	}

	const handleEdit = (series: Series) => {
		router.push(`/admin/series/${series.id}`)
	}

	const handleDelete = async (id: string) => {
		if (confirm('Вы уверены, что хотите удалить этот сериал?')) {
			try {
				await adminApi.deleteSeries(id)
				setSeries(series.filter(s => s.id !== id))
			} catch (error) {
				console.error('Failed to delete series:', error)
			}
		}
	}

	// Получить уникальные годы для селекта
	const availableYears = Array.from(
		{ length: new Date().getFullYear() - 1950 + 1 },
		(_, i) => 1950 + i,
	).reverse()

	// Максимальное количество сезонов для фильтра
	const maxSeasons = Math.max(...series.map(s => s.seasonsCount), 0)

	const columns = [
		{ key: 'posterUrl', label: 'Постер', type: 'image' },
		{ key: 'title', label: 'Название' },
		{ key: 'releaseYear', label: 'Год' },
		{ key: 'seasonsCount', label: 'Сезонов' },
		{ key: 'episodesCount', label: 'Серий' },
		{
			key: 'episodes',
			label: 'Эпизоды',
			render: (item: any) => (
				<Link href={`/admin/series/${item.id}/episodes`}>
					<Button variant='outline' size='sm'>
						Управление
					</Button>
				</Link>
			),
		},
	]

	return (
		<AdminGuard requiredRole='ADMIN'>
			<div>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold flex items-center'>
						<Tv className='w-8 h-8 mr-3' />
						Управление сериалами
					</h1>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							onClick={() => {
								setLoading(true)
								fetchSeries()
							}}
						>
							Обновить
						</Button>
						<Link href='/admin/series/create'>
							<Button>
								<Plus className='w-4 h-4 mr-2' />
								Добавить сериал
							</Button>
						</Link>
					</div>
				</div>

				{/* Панель фильтрации */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-4 mb-6'>
					<div className='flex items-center justify-between mb-4'>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className='flex items-center gap-2 text-gray-300 hover:text-white transition-colors'
						>
							<Filter className='w-5 h-5' />
							<span>Фильтры</span>
							{(filters.title ||
								filters.yearFrom ||
								filters.yearTo ||
								filters.seasonsFrom ||
								filters.seasonsTo) && (
								<span className='ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full'>
									Активны
								</span>
							)}
						</button>
						{(filters.title ||
							filters.yearFrom ||
							filters.yearTo ||
							filters.seasonsFrom ||
							filters.seasonsTo) && (
							<button
								onClick={resetFilters}
								className='flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors'
							>
								<X className='w-4 h-4' />
								Сбросить все
							</button>
						)}
					</div>

					{showFilters && (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-800'>
							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Название
								</label>
								<div className='relative'>
									<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
									<input
										type='text'
										value={filters.title}
										onChange={e => handleFilterChange('title', e.target.value)}
										placeholder='Поиск по названию...'
										className='w-full pl-9 pr-4 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
									/>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Год выпуска (от)
								</label>
								<select
									value={filters.yearFrom}
									onChange={e => handleFilterChange('yearFrom', e.target.value)}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
									style={{ colorScheme: 'dark' }}
								>
									<option value='' className='bg-custom-darker text-white'>
										Любой
									</option>
									{availableYears.map(year => (
										<option
											key={year}
											value={year}
											className='bg-custom-darker text-white'
										>
											{year}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Год выпуска (до)
								</label>
								<select
									value={filters.yearTo}
									onChange={e => handleFilterChange('yearTo', e.target.value)}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
									style={{ colorScheme: 'dark' }}
								>
									<option value='' className='bg-custom-darker text-white'>
										Любой
									</option>
									{availableYears.map(year => (
										<option
											key={year}
											value={year}
											className='bg-custom-darker text-white'
										>
											{year}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Сезонов (от)
								</label>
								<select
									value={filters.seasonsFrom}
									onChange={e =>
										handleFilterChange('seasonsFrom', e.target.value)
									}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
									style={{ colorScheme: 'dark' }}
								>
									<option value='' className='bg-custom-darker text-white'>
										Любое
									</option>
									{[...Array(maxSeasons + 1)].map((_, i) => (
										<option
											key={i}
											value={i}
											className='bg-custom-darker text-white'
										>
											{i}+
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Сезонов (до)
								</label>
								<select
									value={filters.seasonsTo}
									onChange={e =>
										handleFilterChange('seasonsTo', e.target.value)
									}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
									style={{ colorScheme: 'dark' }}
								>
									<option value='' className='bg-custom-darker text-white'>
										Любое
									</option>
									{[...Array(maxSeasons + 1)].map((_, i) => (
										<option
											key={i}
											value={i}
											className='bg-custom-darker text-white'
										>
											{i}
										</option>
									))}
								</select>
							</div>
						</div>
					)}

					{(filters.title ||
						filters.yearFrom ||
						filters.yearTo ||
						filters.seasonsFrom ||
						filters.seasonsTo) && (
						<div className='mt-4 text-sm text-gray-400'>
							Найдено: {filteredSeries.length} из {series.length} сериалов
						</div>
					)}
				</div>

				<DataTable
					data={filteredSeries}
					columns={columns}
					loading={loading}
					onEdit={handleEdit}
					onDelete={handleDelete}
					searchFields={['title']}
				/>
			</div>
		</AdminGuard>
	)
}
