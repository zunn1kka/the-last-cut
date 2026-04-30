'use client'

import { PersonForm } from '@/features/admin/persons/ui/person-form'
import { adminApi } from '@/shared/api/admin/admin-api'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditPersonPage() {
	const { id } = useParams()
	const [person, setPerson] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchPerson = async () => {
			try {
				const response = await adminApi.getPersonById(id as string)
				setPerson(response.data)
			} catch (error) {
				console.error('Failed to fetch person:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchPerson()
	}, [id])

	if (loading) {
		return (
			<div className='flex justify-center py-12'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
			</div>
		)
	}

	if (!person) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-500'>Персона не найдена</p>
			</div>
		)
	}

	return (
		<div>
			<h1 className='text-3xl font-bold mb-8'>Редактирование персоны</h1>
			<PersonForm initialData={person} isEditing personId={id as string} />
		</div>
	)
}
