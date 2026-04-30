import { PersonForm } from '@/features/admin/persons/ui/person-form'

export const metadata = {
	title: 'Создание персоны | Админ-панель',
}

export default function CreatePersonPage() {
	return (
		<div>
			<h1 className='text-3xl font-bold mb-8'>Создание новой персоны</h1>
			<PersonForm />
		</div>
	)
}
