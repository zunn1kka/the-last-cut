'use client'
import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import Button from '@/shared/ui/Button'
import { DataTable } from '@/widgets/admin/data-table'
import { Filter, Plus, Search, X } from 'lucide-react'
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
	})

	const fetchMovies = async () => {
		try {
			const response = await adminApi.getMovies()
			console.log('📥 GET /admin/movies response:', response)

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

	// Применение фильтров
	useEffect(() => {
		let result = [...movies]

		// Фильтр по названию
		if (filters.title.trim()) {
			const query = filters.title.toLowerCase()
			result = result.filter(movie => movie.title.toLowerCase().includes(query))
		}

		// Фильтр по году (от)
		if (filters.yearFrom) {
			const yearFrom = parseInt(filters.yearFrom)
			result = result.filter(movie => movie.releaseYear >= yearFrom)
		}

		// Фильтр по году (до)
		if (filters.yearTo) {
			const yearTo = parseInt(filters.yearTo)
			result = result.filter(movie => movie.releaseYear <= yearTo)
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
		})
	}

	const columns = [
		{ key: 'posterUrl', label: 'Постер', type: 'image' },
		{ key: 'title', label: 'Название' },
		{ key: 'releaseYear', label: 'Год' },
		{ key: 'duration', label: 'Длительность' },
	]

	const handleEdit = (movie: Movie) => {
		router.push(`/admin/movies/${movie.id}`)
	}

	const handleDelete = async (id: string) => {
		console.log('🗑️ Начинаем удаление фильма с ID:', id)

		if (confirm('Вы уверены, что хотите удалить этот фильм?')) {
			console.log('✅ Пользователь подтвердил удаление')

			try {
				console.log('📤 Отправляем DELETE запрос на:', `/admin/movies/${id}`)

				const response = await adminApi.deleteMovie(id)

				console.log('📥 Ответ от сервера:', {
					status: response.status,
					statusText: response.statusText,
					data: response.data,
					headers: response.headers,
				})

				if (response.status === 200 || response.status === 204) {
					console.log('✅ Фильм успешно удален на сервере')

					setMovies(prev => {
						const newMovies = prev.filter(movie => movie.id !== id)
						console.log('🔄 Обновленный список фильмов:', newMovies)
						return newMovies
					})

					alert('Фильм успешно удален')
				} else {
					console.log('⚠️ Неожиданный статус ответа:', response.status)
					alert('Ошибка при удалении фильма')
				}
			} catch (error: any) {
				console.error('❌ Ошибка при удалении:', error)

				if (error.response) {
					console.error('Статус ошибки:', error.response.status)
					console.error('Данные ошибки:', error.response.data)

					const errorMessage =
						error.response.data?.message || 'Ошибка при удалении фильма'
					alert(`Ошибка: ${errorMessage}`)
				} else if (error.request) {
					alert('Сервер не отвечает. Проверьте подключение.')
				} else {
					console.error('Ошибка запроса:', error.message)
					alert('Ошибка при отправке запроса')
				}
			}
		} else {
			console.log('❌ Пользователь отменил удаление')
		}
	}

	// Получить уникальные годы для селекта
	const availableYears = Array.from(
		{ length: new Date().getFullYear() - 1950 + 1 },
		(_, i) => 1950 + i,
	).reverse()

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

				{/* Панель фильтрации */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-4 mb-6'>
					<div className='flex items-center justify-between mb-4'>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className='flex items-center gap-2 text-gray-300 hover:text-white transition-colors'
						>
							<Filter className='w-5 h-5' />
							<span>Фильтры</span>
							{(filters.title || filters.yearFrom || filters.yearTo) && (
								<span className='ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full'>
									Активны
								</span>
							)}
						</button>
						{(filters.title || filters.yearFrom || filters.yearTo) && (
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
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800'>
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
						</div>
					)}

					{/* Информация о результатах фильтрации */}
					{(filters.title || filters.yearFrom || filters.yearTo) && (
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
					searchFields={['title']}
				/>
			</div>
		</AdminGuard>
	)
}

export default AdminMoviesPage
