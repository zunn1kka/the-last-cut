'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import Button from '@/shared/ui/Button'
import { DataTable } from '@/widgets/admin/data-table'
import { Plus, Tv } from 'lucide-react'
import Link from 'next/link'
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

export default function AdminSeriesPage() {
	const [series, setSeries] = useState<Series[]>([])
	const [loading, setLoading] = useState(true)

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
		} catch (error) {
			console.error('Failed to fetch series:', error)
		} finally {
			setLoading(false)
		}
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
		{ key: 'actions', label: 'Действия', type: 'actions' },
	]

	return (
		<AdminGuard requiredRole='ADMIN'>
			<div>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold flex items-center'>
						<Tv className='w-8 h-8 mr-3' />
						Управление сериалами
					</h1>
					<Link href='/admin/series/create'>
						<Button>
							<Plus className='w-4 h-4 mr-2' />
							Добавить сериал
						</Button>
					</Link>
				</div>

				<DataTable
					data={series}
					columns={columns}
					loading={loading}
					onEdit={id => `/admin/series/${id}`}
					onDelete={handleDelete}
				/>
			</div>
		</AdminGuard>
	)
}
