import { apiClient } from '@/shared/api/axios-instance'
import { getImageUrl } from '@/shared/lib/get-image-url'
import { Comments } from '@/widgets/comments'
import { ContentDetails } from '@/widgets/content-details'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ id: string }>
}

async function getMovie(id: string) {
	try {
		const response = await apiClient.get(`/content/movies/${id}`)
		return response.data
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
		openGraph: {
			title: movie.title,
			description: movie.description,
			images: movie.posterUrl ? [`${getImageUrl(movie.posterUrl)}`] : [],
		},
	}
}

export default async function MoviePage({ params }: PageProps) {
	const { id } = await params
	const movie = await getMovie(id)

	if (!movie) {
		notFound()
	}

	return (
		<>
			<main className='bg-custom-darker min-h-screen py-12'>
				<div className='container mx-auto px-4'>
					<ContentDetails content={movie} contentType='MOVIE' />
					<Comments contentId={movie.id} contentType='MOVIE' />
				</div>
			</main>
		</>
	)
}
