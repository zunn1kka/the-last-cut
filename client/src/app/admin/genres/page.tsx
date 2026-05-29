'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import Button from '@/shared/ui/Button'
import { DataTable } from '@/widgets/admin/data-table'
import { BookMarked, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Genre {
	id: string
	name: string
	slug: string
}

export default function AdminGenresPage() {
	const router = useRouter()
	const [genres, setGenres] = useState<Genre[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchGenres()
	}, [])

	const fetchGenres = async () => {
		try {
			const response = await adminApi.getGenres()
			setGenres(response.data || [])
		} catch (error) {
			console.error('Failed to fetch genres:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = (genre: Genre) => {
		router.push(`/admin/genres/${genre.id}`)
	}

	const handleDelete = async (id: string) => {
		if (confirm('Вы уверены, что хотите удалить этот жанр?')) {
			try {
				await adminApi.deleteGenre(id)
				setGenres(genres.filter(g => g.id !== id))
			} catch (error) {
				console.error('Failed to delete genre:', error)
			}
		}
	}

	const columns = [
		{ key: 'name', label: 'Название' },
		{ key: 'slug', label: 'Slug' },
	]

	return (
		<AdminGuard requiredRole='ADMIN'>
			<div>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold flex items-center'>
						<BookMarked className='w-8 h-8 mr-3' />
						Управление жанрами
					</h1>
					<Link href='/admin/genres/create'>
						<Button>
							<Plus className='w-4 h-4 mr-2' />
							Добавить жанр
						</Button>
					</Link>
				</div>

				<DataTable
					data={genres}
					columns={columns}
					loading={loading}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</div>
		</AdminGuard>
	)
}
