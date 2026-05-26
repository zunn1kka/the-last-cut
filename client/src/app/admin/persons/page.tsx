'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import Button from '@/shared/ui/Button'
import { DataTable } from '@/widgets/admin/data-table'
import { Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Person {
	id: string
	fullname: string
	photoUrl?: string
	biography?: string
}

export default function AdminPersonsPage() {
	const router = useRouter()
	const [persons, setPersons] = useState<Person[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchPersons()
	}, [])

	const fetchPersons = async () => {
		try {
			const response = await adminApi.getPersons()
			const personsData = response.data?.items || []
			setPersons(personsData)
		} catch (error) {
			console.error('Failed to fetch persons:', error)
			setPersons([])
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = (person: Person) => {
		router.push(`/admin/persons/${person.id}`)
	}

	const handleDelete = async (id: string) => {
		if (confirm('Вы уверены, что хотите удалить эту персону?')) {
			try {
				await adminApi.deletePerson(id)
				setPersons(persons.filter(p => p.id !== id))
			} catch (error) {
				console.error('Failed to delete person:', error)
			}
		}
	}

	const truncateText = (text: string, maxLength: number = 50) => {
		if (!text) return '—'
		if (text.length <= maxLength) return text
		return text.substring(0, maxLength) + '...'
	}

	const columns = [
		{ key: 'photoUrl', label: 'Фото', type: 'image' },
		{ key: 'fullname', label: 'Имя' },
		{
			key: 'biography',
			label: 'Биография',
			render: (item: Person) => truncateText(item.biography, 60),
		},
		{ key: 'actions', label: 'Действия', type: 'actions' },
	]

	return (
		<AdminGuard requiredRole='ADMIN'>
			<div>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold flex items-center'>
						<Users className='w-8 h-8 mr-3' />
						Управление персонами
					</h1>
					<Link href='/admin/persons/create'>
						<Button>
							<Plus className='w-4 h-4 mr-2' />
							Добавить персону
						</Button>
					</Link>
				</div>

				<DataTable
					data={persons}
					columns={columns}
					loading={loading}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</div>
		</AdminGuard>
	)
}
