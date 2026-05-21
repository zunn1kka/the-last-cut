import { Comments } from '@/widgets/comments'
import { ContentDetails } from '@/widgets/content-details'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ id: string }>
}

async function getMovie(id: string) {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL
	if (!apiUrl) {
		console.error('NEXT_PUBLIC_API_URL is not set')
		return null
	}

	try {
		// Используем fetch вместо apiClient
		const response = await fetch(`${apiUrl}/content/movies/${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			// Важно: не кешируем данные для динамических страниц
			cache: 'no-store',
		})

		if (!response.ok) {
			console.error(`API returned ${response.status} for movie ${id}`)
			return null
		}

		return response.json()
	} catch (error) {
		console.error('Failed to fetch movie:', error)
		return null
	}
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params
	const movie = await getMovie(id)

	if (!movie) {
		return { title: 'Фильм не найден' }
	}

	return {
		title: `${movie.title} | The Last Cut`,
		description: movie.description,
	}
}

// Важно: отключаем статическую генерацию для этой страницы
export const dynamic = 'force-dynamic'

export default async function MoviePage({ params }: PageProps) {
	const { id } = await params
	const movie = await getMovie(id)

	if (!movie) {
		notFound()
	}

	return (
		<main className='bg-custom-darker min-h-screen py-12'>
			<div className='container mx-auto px-4'>
				<ContentDetails content={movie} contentType='MOVIE' />
				<Comments contentId={movie.id} contentType='MOVIE' />
			</div>
		</main>
	)
}
