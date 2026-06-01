'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import Button from '@/shared/ui/Button'
import { DataTable } from '@/widgets/admin/data-table'
import { Filter, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Person {
	id: string
	fullname: string
	photoUrl?: string
	biography?: string
	createdAt?: string
}

interface Filters {
	fullname: string
	hasPhoto: string
}

export default function AdminPersonsPage() {
	const router = useRouter()
	const [persons, setPersons] = useState<Person[]>([])
	const [filteredPersons, setFilteredPersons] = useState<Person[]>([])
	const [loading, setLoading] = useState(true)
	const [showFilters, setShowFilters] = useState(false)
	const [filters, setFilters] = useState<Filters>({
		fullname: '',
		hasPhoto: '',
	})

	useEffect(() => {
		fetchPersons()
	}, [])

	const fetchPersons = async () => {
		try {
			const response = await adminApi.getPersons()
			const personsData = response.data?.items || []
			setPersons(personsData)
			setFilteredPersons(personsData)
		} catch (error) {
			console.error('Failed to fetch persons:', error)
			setPersons([])
			setFilteredPersons([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let result = [...persons]

		if (filters.fullname.trim()) {
			const query = filters.fullname.toLowerCase()
			result = result.filter(person =>
				person.fullname.toLowerCase().includes(query),
			)
		}

		if (filters.hasPhoto === 'yes') {
			result = result.filter(person => person.photoUrl)
		} else if (filters.hasPhoto === 'no') {
			result = result.filter(person => !person.photoUrl)
		}

		setFilteredPersons(result)
	}, [persons, filters])

	const handleFilterChange = (key: keyof Filters, value: string) => {
		setFilters(prev => ({ ...prev, [key]: value }))
	}

	const resetFilters = () => {
		setFilters({ fullname: '', hasPhoto: '' })
	}

	const handleEdit = (person: Person) => {
		router.push(`/admin/persons/${person.id}`)
	}

	const handleDelete = async (id: string) => {
		if (confirm('Вы уверены, что хотите удалить эту персону?')) {
			try {
				await adminApi.deletePerson(id)
				setPersons(persons.filter(p => p.id !== id))
				alert('Персона успешно удалена')
			} catch (error) {
				console.error('Failed to delete person:', error)
				alert('Ошибка при удалении персоны')
			}
		}
	}

	const truncateText = (text: string, maxLength: number = 50) => {
		if (!text) return '—'
		if (text.length <= maxLength) return text
		return text.substring(0, maxLength) + '...'
	}

	const columns = [
		{ key: 'photoUrl', label: 'Фото', type: 'image', sortable: true },
		{ key: 'fullname', label: 'Имя', sortable: true },
		{
			key: 'biography',
			label: 'Биография',
			render: (item: Person) => truncateText(item.biography, 60),
			sortable: true,
		},
	]

	return (
		<AdminGuard requiredRole='ADMIN'>
			<div>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold'>Управление персонами</h1>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							onClick={() => {
								setLoading(true)
								fetchPersons()
							}}
						>
							Обновить
						</Button>
						<Link href='/admin/persons/create'>
							<Button>
								<Plus className='w-4 h-4 mr-2' />
								Добавить персону
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
							{(filters.fullname || filters.hasPhoto) && (
								<span className='ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full'>
									Активны
								</span>
							)}
						</button>
						{(filters.fullname || filters.hasPhoto) && (
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
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800'>
							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Имя персоны
								</label>
								<input
									type='text'
									value={filters.fullname}
									onChange={e => handleFilterChange('fullname', e.target.value)}
									placeholder='Поиск по имени...'
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Наличие фото
								</label>
								<select
									value={filters.hasPhoto}
									onChange={e => handleFilterChange('hasPhoto', e.target.value)}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
								>
									<option value=''>Все</option>
									<option value='yes'>Есть фото</option>
									<option value='no'>Нет фото</option>
								</select>
							</div>
						</div>
					)}

					{(filters.fullname || filters.hasPhoto) && (
						<div className='mt-4 text-sm text-gray-400'>
							Найдено: {filteredPersons.length} из {persons.length} персон
						</div>
					)}
				</div>

				<DataTable
					data={filteredPersons}
					columns={columns}
					loading={loading}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</div>
		</AdminGuard>
	)
}
