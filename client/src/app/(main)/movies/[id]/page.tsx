import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MovieClient } from './movie-client'

interface PageProps {
	params: Promise<{ id: string }>
}

async function getMovie(id: string) {
	const baseURL = process.env.NEXT_PUBLIC_API_URL
	try {
		const response = await fetch(`${baseURL}/content/movies/${id}`, {
			cache: 'no-store',
		})
		if (!response.ok) return null
		return response.json()
	} catch (error) {
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

export default async function MoviePage({ params }: PageProps) {
	const { id } = await params
	const movie = await getMovie(id)

	if (!movie) {
		notFound()
	}

	return <MovieClient movie={movie} />
}
