'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import Button from '@/shared/ui/Button'
import { DataTable } from '@/widgets/admin/data-table'
import { Filter, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Series {
	id: string
	title: string
	posterUrl?: string
	releaseYear: number
	seasonsCount: number
	episodesCount: number
}

interface Filters {
	title: string
	yearFrom: string
	yearTo: string
	seasonsFrom: string
	seasonsTo: string
	episodesFrom: string
	episodesTo: string
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
		episodesFrom: '',
		episodesTo: '',
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

	useEffect(() => {
		let result = [...series]

		if (filters.title.trim()) {
			const query = filters.title.toLowerCase()
			result = result.filter(s => s.title.toLowerCase().includes(query))
		}

		if (filters.yearFrom) {
			const yearFrom = parseInt(filters.yearFrom)
			result = result.filter(s => s.releaseYear >= yearFrom)
		}

		if (filters.yearTo) {
			const yearTo = parseInt(filters.yearTo)
			result = result.filter(s => s.releaseYear <= yearTo)
		}

		if (filters.seasonsFrom) {
			const seasonsFrom = parseInt(filters.seasonsFrom)
			result = result.filter(s => s.seasonsCount >= seasonsFrom)
		}

		if (filters.seasonsTo) {
			const seasonsTo = parseInt(filters.seasonsTo)
			result = result.filter(s => s.seasonsCount <= seasonsTo)
		}

		if (filters.episodesFrom) {
			const episodesFrom = parseInt(filters.episodesFrom)
			result = result.filter(s => s.episodesCount >= episodesFrom)
		}

		if (filters.episodesTo) {
			const episodesTo = parseInt(filters.episodesTo)
			result = result.filter(s => s.episodesCount <= episodesTo)
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
			episodesFrom: '',
			episodesTo: '',
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
				alert('Сериал успешно удален')
			} catch (error) {
				console.error('Failed to delete series:', error)
				alert('Ошибка при удалении сериала')
			}
		}
	}

	const availableYears = Array.from(
		{ length: new Date().getFullYear() - 1950 + 1 },
		(_, i) => 1950 + i,
	).reverse()

	const maxSeasons = Math.max(...series.map(s => s.seasonsCount), 0)
	const maxEpisodes = Math.max(...series.map(s => s.episodesCount), 0)

	const columns = [
		{ key: 'posterUrl', label: 'Постер', type: 'image' },
		{ key: 'title', label: 'Название', sortable: true },
		{ key: 'releaseYear', label: 'Год', sortable: true },
		{ key: 'seasonsCount', label: 'Сезонов', sortable: true },
		{ key: 'episodesCount', label: 'Серий', sortable: true },
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
					<h1 className='text-3xl font-bold'>Управление сериалами</h1>
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

				<div className='bg-custom-dark rounded-xl border border-gray-800 p-4 mb-6'>
					<div className='flex items-center justify-between mb-4'>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className='flex items-center gap-2 text-gray-300 hover:text-white transition-colors'
						>
							<Filter className='w-5 h-5' />
							<span>Фильтры</span>
							{Object.values(filters).some(v => v) && (
								<span className='ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full'>
									Активны
								</span>
							)}
						</button>
						{Object.values(filters).some(v => v) && (
							<button
								onClick={resetFilters}
								className='flex items-center gap-1 text-sm text-red-400 hover:text-red-300'
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
								<input
									type='text'
									value={filters.title}
									onChange={e => handleFilterChange('title', e.target.value)}
									placeholder='Поиск по названию...'
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Год (от)
								</label>
								<select
									value={filters.yearFrom}
									onChange={e => handleFilterChange('yearFrom', e.target.value)}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm'
								>
									<option value=''>Любой</option>
									{availableYears.map(year => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Год (до)
								</label>
								<select
									value={filters.yearTo}
									onChange={e => handleFilterChange('yearTo', e.target.value)}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm'
								>
									<option value=''>Любой</option>
									{availableYears.map(year => (
										<option key={year} value={year}>
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
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm'
								>
									<option value=''>Любое</option>
									{[...Array(maxSeasons + 1)].map((_, i) => (
										<option key={i} value={i}>
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
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm'
								>
									<option value=''>Любое</option>
									{[...Array(maxSeasons + 1)].map((_, i) => (
										<option key={i} value={i}>
											{i}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Серий (от)
								</label>
								<select
									value={filters.episodesFrom}
									onChange={e =>
										handleFilterChange('episodesFrom', e.target.value)
									}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm'
								>
									<option value=''>Любое</option>
									{[...Array(Math.min(maxEpisodes, 100) + 1)].map((_, i) => (
										<option key={i} value={i}>
											{i}+
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Серий (до)
								</label>
								<select
									value={filters.episodesTo}
									onChange={e =>
										handleFilterChange('episodesTo', e.target.value)
									}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm'
								>
									<option value=''>Любое</option>
									{[...Array(Math.min(maxEpisodes, 100) + 1)].map((_, i) => (
										<option key={i} value={i}>
											{i}
										</option>
									))}
								</select>
							</div>
						</div>
					)}

					{Object.values(filters).some(v => v) && (
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
				/>
			</div>
		</AdminGuard>
	)
}
