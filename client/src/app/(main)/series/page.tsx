'use client'

import { ContentCard } from '@/entities/content/ui/content-card'
import { contentApi } from '@/shared/api/content/content-api'
import { genreApi } from '@/shared/api/genres/genre-api'
import Button from '@/shared/ui/Button'
import { Loader2, Search, SlidersHorizontal, Tv, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Filters {
	genreIds: string[]
	yearFrom: number | null
	yearTo: number | null
	ratingFrom: number | null
	ratingTo: number | null
	sortBy: string
	sortOrder: 'asc' | 'desc'
}

export default function SeriesPage() {
	const [series, setSeries] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [showFilters, setShowFilters] = useState(false)
	const [filters, setFilters] = useState<Filters>({
		genreIds: [],
		yearFrom: null,
		yearTo: null,
		ratingFrom: null,
		ratingTo: null,
		sortBy: 'releaseYear',
		sortOrder: 'desc',
	})
	const [genres, setGenres] = useState<any[]>([])

	useEffect(() => {
		fetchGenres()
		fetchSeries()
	}, [])

	const fetchGenres = async () => {
		try {
			const response = await genreApi.getAll()
			setGenres(response.data || [])
		} catch (error) {
			console.error('Failed to fetch genres:', error)
		}
	}

	const fetchSeries = async () => {
		setLoading(true)
		try {
			const response = await contentApi.getAll({
				contentType: 'SERIES',
				search: searchQuery || undefined,
				genreIds: filters.genreIds.length ? filters.genreIds : undefined,
				yearFrom: filters.yearFrom || undefined,
				yearTo: filters.yearTo || undefined,
				ratingFrom: filters.ratingFrom || undefined,
				ratingTo: filters.ratingTo || undefined,
				sortBy: filters.sortBy,
				sortOrder: filters.sortOrder,
				limit: 100,
			})
			setSeries(response.data?.items || [])
		} catch (error) {
			console.error('Failed to fetch series:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleSearch = () => {
		fetchSeries()
	}

	const applyFilters = () => {
		fetchSeries()
		setShowFilters(false)
	}

	const resetFilters = () => {
		setFilters({
			genreIds: [],
			yearFrom: null,
			yearTo: null,
			ratingFrom: null,
			ratingTo: null,
			sortBy: 'releaseYear',
			sortOrder: 'desc',
		})
		setTimeout(() => fetchSeries(), 0)
	}

	const toggleGenre = (genreId: string) => {
		setFilters(prev => ({
			...prev,
			genreIds: prev.genreIds.includes(genreId)
				? prev.genreIds.filter(id => id !== genreId)
				: [...prev.genreIds, genreId],
		}))
	}

	const years = Array.from(
		{ length: 2025 - 1950 + 1 },
		(_, i) => 1950 + i,
	).reverse()

	return (
		<main className='bg-custom-darker min-h-screen py-8'>
			<div className='container mx-auto px-4'>
				{/* Заголовок */}
				<div className='flex items-center gap-3 mb-8'>
					<Tv className='w-8 h-8 text-blue-400' />
					<h1 className='text-3xl font-bold text-white'>Сериалы</h1>
				</div>

				{/* Поиск и фильтры */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-4 mb-8'>
					<div className='flex flex-col md:flex-row gap-4'>
						<div className='flex-1 relative'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
							<input
								type='text'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && handleSearch()}
								placeholder='Поиск сериалов...'
								className='w-full pl-10 pr-4 py-3 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>
						<Button onClick={handleSearch}>Найти</Button>
						<Button
							variant='outline'
							onClick={() => setShowFilters(!showFilters)}
							className='flex items-center gap-2'
						>
							<SlidersHorizontal className='w-4 h-4' />
							Фильтры
						</Button>
					</div>

					{/* Панель фильтров (аналогична фильмам) */}
					{showFilters && (
						<div className='mt-6 pt-6 border-t border-gray-800'>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Жанры
									</label>
									<div className='flex flex-wrap gap-2 max-h-32 overflow-y-auto'>
										{genres.map(genre => (
											<button
												key={genre.id}
												onClick={() => toggleGenre(genre.id)}
												className={`px-3 py-1 rounded-full text-sm transition-colors ${
													filters.genreIds.includes(genre.id)
														? 'bg-blue-600 text-white'
														: 'bg-custom-darker text-gray-400 hover:bg-gray-700'
												}`}
											>
												{genre.name}
											</button>
										))}
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Год выпуска
									</label>
									<div className='flex gap-2'>
										<select
											value={filters.yearFrom || ''}
											onChange={e =>
												setFilters({
													...filters,
													yearFrom: e.target.value
														? Number(e.target.value)
														: null,
												})
											}
											className='flex-1 px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
										>
											<option value=''>От</option>
											{years.map(year => (
												<option key={year} value={year}>
													{year}
												</option>
											))}
										</select>
										<select
											value={filters.yearTo || ''}
											onChange={e =>
												setFilters({
													...filters,
													yearTo: e.target.value
														? Number(e.target.value)
														: null,
												})
											}
											className='flex-1 px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
										>
											<option value=''>До</option>
											{years.map(year => (
												<option key={year} value={year}>
													{year}
												</option>
											))}
										</select>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Рейтинг
									</label>
									<div className='flex gap-2'>
										<select
											value={filters.ratingFrom || ''}
											onChange={e =>
												setFilters({
													...filters,
													ratingFrom: e.target.value
														? Number(e.target.value)
														: null,
												})
											}
											className='flex-1 px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
										>
											<option value=''>От</option>
											{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
												<option key={r} value={r}>
													{r}
												</option>
											))}
										</select>
										<select
											value={filters.ratingTo || ''}
											onChange={e =>
												setFilters({
													...filters,
													ratingTo: e.target.value
														? Number(e.target.value)
														: null,
												})
											}
											className='flex-1 px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
										>
											<option value=''>До</option>
											{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
												<option key={r} value={r}>
													{r}
												</option>
											))}
										</select>
									</div>
								</div>

								{/* Сортировка */}
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Сортировка
									</label>
									<div className='flex flex-col gap-2'>
										<select
											value={filters.sortBy}
											onChange={e =>
												setFilters({ ...filters, sortBy: e.target.value })
											}
											className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
										>
											<option value='releaseYear'>По году</option>
											<option value='title'>По названию</option>
											<option value='siteRating'>По рейтингу</option>
											<option value='createdAt'>По дате добавления</option>
										</select>
										<select
											value={filters.sortOrder}
											onChange={e =>
												setFilters({
													...filters,
													sortOrder: e.target.value as 'asc' | 'desc',
												})
											}
											className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
										>
											<option value='desc'>По убыванию</option>
											<option value='asc'>По возрастанию</option>
										</select>
									</div>
								</div>
							</div>
							<div className='flex justify-end gap-2 mt-6'>
								<Button
									variant='outline'
									onClick={resetFilters}
									className='flex items-center gap-2'
								>
									<X className='w-4 h-4' />
									Сбросить
								</Button>
								<Button onClick={applyFilters}>Применить</Button>
							</div>
						</div>
					)}
				</div>

				{/* Результаты */}
				{loading ? (
					<div className='flex justify-center py-12'>
						<Loader2 className='w-8 h-8 text-blue-400 animate-spin' />
					</div>
				) : series.length === 0 ? (
					<div className='text-center py-12'>
						<Tv className='w-16 h-16 text-gray-600 mx-auto mb-4' />
						<p className='text-gray-500'>Сериалы не найдены</p>
					</div>
				) : (
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
						{series.map(item => (
							<ContentCard key={item.id} content={item} />
						))}
					</div>
				)}
			</div>
		</main>
	)
}
