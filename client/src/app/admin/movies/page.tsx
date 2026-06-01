'use client'
import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import Button from '@/shared/ui/Button'
import { DataTable } from '@/widgets/admin/data-table'
import { Filter, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Movie {
	id: string
	posterUrl?: string
	title: string
	releaseYear: number
	duration?: string | number
}

interface Filters {
	title: string
	yearFrom: string
	yearTo: string
	durationFrom: string
	durationTo: string
}

function AdminMoviesPage() {
	const router = useRouter()
	const [movies, setMovies] = useState<Movie[]>([])
	const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
	const [loading, setLoading] = useState(true)
	const [showFilters, setShowFilters] = useState(false)
	const [filters, setFilters] = useState<Filters>({
		title: '',
		yearFrom: '',
		yearTo: '',
		durationFrom: '',
		durationTo: '',
	})

	const fetchMovies = async () => {
		try {
			const response = await adminApi.getMovies()
			let moviesData = []
			if (response?.data?.data) {
				moviesData = response.data.data
			} else if (response?.data) {
				moviesData = response.data
			} else if (Array.isArray(response)) {
				moviesData = response
			}

			const formattedMovies = moviesData.map((item: any) => ({
				id: item.id,
				posterUrl: item.posterUrl,
				title: item.title,
				releaseYear: item.releaseYear,
				duration: item.movie?.duration ? `${item.movie.duration} мин` : '—',
				durationMinutes: item.movie?.duration || 0,
			}))

			setMovies(formattedMovies)
			setFilteredMovies(formattedMovies)
		} catch (error) {
			console.error('Failed to fetch movies:', error)
			setMovies([])
			setFilteredMovies([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchMovies()
	}, [])

	useEffect(() => {
		let result = [...movies]

		if (filters.title.trim()) {
			const query = filters.title.toLowerCase()
			result = result.filter(movie => movie.title.toLowerCase().includes(query))
		}

		if (filters.yearFrom) {
			const yearFrom = parseInt(filters.yearFrom)
			result = result.filter(movie => movie.releaseYear >= yearFrom)
		}

		if (filters.yearTo) {
			const yearTo = parseInt(filters.yearTo)
			result = result.filter(movie => movie.releaseYear <= yearTo)
		}

		if (filters.durationFrom) {
			const durationFrom = parseInt(filters.durationFrom)
			result = result.filter(movie => movie.durationMinutes >= durationFrom)
		}

		if (filters.durationTo) {
			const durationTo = parseInt(filters.durationTo)
			result = result.filter(movie => movie.durationMinutes <= durationTo)
		}

		setFilteredMovies(result)
	}, [movies, filters])

	const handleFilterChange = (key: keyof Filters, value: string) => {
		setFilters(prev => ({ ...prev, [key]: value }))
	}

	const resetFilters = () => {
		setFilters({
			title: '',
			yearFrom: '',
			yearTo: '',
			durationFrom: '',
			durationTo: '',
		})
	}

	const columns = [
		{ key: 'posterUrl', label: 'Постер', type: 'image' },
		{ key: 'title', label: 'Название', sortable: true },
		{ key: 'releaseYear', label: 'Год', sortable: true },
		{ key: 'duration', label: 'Длительность', sortable: true },
	]

	const handleEdit = (movie: Movie) => {
		router.push(`/admin/movies/${movie.id}`)
	}

	const handleDelete = async (id: string) => {
		if (confirm('Вы уверены, что хотите удалить этот фильм?')) {
			try {
				await adminApi.deleteMovie(id)
				setMovies(prev => prev.filter(movie => movie.id !== id))
				alert('Фильм успешно удален')
			} catch (error: any) {
				console.error('Failed to delete movie:', error)
				alert(error.response?.data?.message || 'Ошибка при удалении фильма')
			}
		}
	}

	const availableYears = Array.from(
		{ length: new Date().getFullYear() - 1950 + 1 },
		(_, i) => 1950 + i,
	).reverse()

	const durationOptions = [0, 30, 60, 90, 120, 150, 180, 210, 240]

	return (
		<AdminGuard requiredRole='ADMIN'>
			<div>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-2xl font-bold'>Управление фильмами</h1>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => {
								setLoading(true)
								fetchMovies()
							}}
						>
							Обновить
						</Button>
						<Link href='/admin/movies/create'>
							<Button>
								<Plus className='w-4 h-4 mr-2' />
								Добавить фильм
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
							{(filters.title || filters.yearFrom || filters.yearTo || filters.durationFrom || filters.durationTo) && (
								<span className='ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full'>
									Активны
								</span>
							)}
						</button>
						{(filters.title || filters.yearFrom || filters.yearTo || filters.durationFrom || filters.durationTo) && (
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
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-800'>
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
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
								>
									<option value=''>Любой</option>
									{availableYears.map(year => (
										<option key={year} value={year}>{year}</option>
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
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
								>
									<option value=''>Любой</option>
									{availableYears.map(year => (
										<option key={year} value={year}>{year}</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Длительность (от, мин)
								</label>
								<select
									value={filters.durationFrom}
									onChange={e => handleFilterChange('durationFrom', e.target.value)}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
								>
									<option value=''>Любая</option>
									{durationOptions.map(d => (
										<option key={d} value={d}>{d === 0 ? '0' : d}+'}</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Длительность (до, мин)
								</label>
								<select
									value={filters.durationTo}
									onChange={e => handleFilterChange('durationTo', e.target.value)}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
								>
									<option value=''>Любая</option>
									{durationOptions.map(d => (
										<option key={d} value={d}>{d === 0 ? '0' : `до ${d}`}</option>
									))}
								</select>
							</div>
						</div>
					)}

					{(filters.title || filters.yearFrom || filters.yearTo || filters.durationFrom || filters.durationTo) && (
						<div className='mt-4 text-sm text-gray-400'>
							Найдено: {filteredMovies.length} из {movies.length} фильмов
						</div>
					)}
				</div>

				<DataTable
					data={filteredMovies}
					columns={columns}
					loading={loading}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</div>
		</AdminGuard>
	)
}

export default AdminMoviesPage