import { MovieForm } from '@/features/admin/movies/ui/movie-form'

export const metadata = {
	title: 'Создание фильма | Админ-панель',
}

export default function CreateMoviePage() {
	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-8'>Создание нового фильма</h1>
			<MovieForm />
		</div>
	)
}
