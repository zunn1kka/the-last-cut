'use client'
import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import Button from '@/shared/ui/Button'
import { DataTable } from '@/widgets/admin/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Movie {
	id: string
	posterUrl?: string
	title: string
	releaseYear: number
	duration?: string | number
}

function AdminMoviesPage() {
	const [movies, setMovies] = useState<Movie[]>([])
	const [loading, setLoading] = useState(true)

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
		} catch (error) {
			console.error('Failed to fetch movies:', error)
			setMovies([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchMovies()
	}, [])

	const columns = [
		{ key: 'posterUrl', label: 'Постер', type: 'image' },
		{ key: 'title', label: 'Название' },
		{ key: 'releaseYear', label: 'Год' },
		{ key: 'duration', label: 'Длительность' },
		{ key: 'actions', label: 'Действия', type: 'actions' },
	]

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

				// Проверяем успешность запроса
				if (response.status === 200 || response.status === 204) {
					console.log('✅ Фильм успешно удален на сервере')

					// Обновляем локальный state
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

				// Детальный вывод ошибки
				if (error.response) {
					// Сервер ответил с ошибкой
					console.error('Статус ошибки:', error.response.status)
					console.error('Данные ошибки:', error.response.data)
					console.error('Заголовки:', error.response.headers)

					const errorMessage =
						error.response.data?.message || 'Ошибка при удалении фильма'
					alert(`Ошибка: ${errorMessage}`)
				} else if (error.request) {
					// Запрос был отправлен, но нет ответа
					console.error('Нет ответа от сервера:', error.request)
					alert('Сервер не отвечает. Проверьте подключение.')
				} else {
					// Ошибка при настройке запроса
					console.error('Ошибка запроса:', error.message)
					alert('Ошибка при отправке запроса')
				}
			}
		} else {
			console.log('❌ Пользователь отменил удаление')
		}
	}

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

				<DataTable
					data={movies}
					columns={columns}
					loading={loading}
					onEdit={id => `/admin/movies/${id}`}
					onDelete={handleDelete}
				/>
			</div>
		</AdminGuard>
	)
}

export default AdminMoviesPage
