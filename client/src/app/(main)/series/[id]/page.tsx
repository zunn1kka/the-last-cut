import { apiClient } from '@/shared/api/axios-instance'
import { Comments } from '@/widgets/comments'
import { ContentDetails } from '@/widgets/content-details'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ id: string }>
}

async function getSeries(id: string) {
	try {
		const response = await apiClient.get(`/content/series/${id}`)
		return response.data
	} catch (error) {
		return null
	}
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params
	const series = await getSeries(id)

	if (!series) {
		return { title: 'Сериал не найден' }
	}

	return {
		title: `${series.title} | The Last Cut`,
		description: series.description,
		openGraph: {
			title: series.title,
			description: series.description,
			images: series.posterUrl
				? [`${process.env.NEXT_PUBLIC_API_URL}${series.posterUrl}`]
				: [],
		},
	}
}

export default async function SeriesPage({ params }: PageProps) {
	const { id } = await params
	const series = await getSeries(id)

	if (!series) {
		notFound()
	}

	return (
		<>
			<main className='bg-custom-darker min-h-screen py-12'>
				<div className='container mx-auto px-4'>
					{/* ContentDetails теперь отвечает за всё: основную информацию, актёров, эпизоды и жанры */}
					<ContentDetails content={series} contentType='SERIES' />
					<Comments contentId={series.id} contentType='SERIES' />
				</div>
			</main>
		</>
	)
}
