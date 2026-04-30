'use client'

import { SeriesForm } from '@/features/admin/series/ui/series-form'

export default function CreateSeriesPage() {
	return (
		<div>
			<h1 className='text-3xl font-bold mb-8'>Создание нового сериала</h1>
			<SeriesForm />
		</div>
	)
}
