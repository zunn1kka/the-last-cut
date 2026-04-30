'use client'

import { contentApi } from '@/shared/api/content/content-api'
import { ContentCarousel } from '@/widgets/content-carousel'
import { useEffect, useState } from 'react'

export function TopRatedSection() {
	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await contentApi.getTopRated(10)
				console.log('⭐ TopRatedSection response:', response.data)

				const data = response.data?.items || response.data || []
				setItems(data)
			} catch (error) {
				console.error('Failed to fetch top rated:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	if (loading) {
		return (
			<div className='mb-12'>
				<div className='h-8 bg-custom-darker rounded w-48 mb-6 animate-pulse' />
				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className='aspect-[2/3] bg-custom-darker rounded-lg animate-pulse'
						/>
					))}
				</div>
			</div>
		)
	}

	return (
		<ContentCarousel
			title='Лучшие по рейтингу'
			items={items}
			viewAllLink='/top-rated'
		/>
	)
}
