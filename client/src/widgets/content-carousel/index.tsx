'use client'

import { ContentCard } from '@/entities/content/ui/content-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ContentCarouselProps {
	title: string
	items: any[]
	viewAllLink?: string
}

export function ContentCarousel({
	title,
	items,
	viewAllLink,
}: ContentCarouselProps) {
	const [currentPage, setCurrentPage] = useState(0)
	const [itemsPerPage, setItemsPerPage] = useState(5)
	const [touchStart, setTouchStart] = useState(0)
	const [touchEnd, setTouchEnd] = useState(0)

	useEffect(() => {
		const updateItemsPerPage = () => {
			const width = window.innerWidth
			if (width < 640) setItemsPerPage(2)
			else if (width < 768) setItemsPerPage(3)
			else if (width < 1024) setItemsPerPage(4)
			else setItemsPerPage(5)
		}

		updateItemsPerPage()
		window.addEventListener('resize', updateItemsPerPage)
		return () => window.removeEventListener('resize', updateItemsPerPage)
	}, [])

	const totalPages = Math.ceil(items.length / itemsPerPage)
	const startIndex = currentPage * itemsPerPage
	const visibleItems = items.slice(startIndex, startIndex + itemsPerPage)

	const next = () => {
		if (currentPage < totalPages - 1) {
			setCurrentPage(currentPage + 1)
		}
	}

	const prev = () => {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1)
		}
	}

	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStart(e.targetTouches[0].clientX)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		setTouchEnd(e.targetTouches[0].clientX)
	}

	const handleTouchEnd = () => {
		if (!touchStart || !touchEnd) return

		const distance = touchStart - touchEnd
		const isLeftSwipe = distance > 50
		const isRightSwipe = distance < -50

		if (isLeftSwipe && currentPage < totalPages - 1) next()
		if (isRightSwipe && currentPage > 0) prev()

		setTouchStart(0)
		setTouchEnd(0)
	}

	if (!items || items.length === 0) return null

	return (
		<section className='mb-12'>
			<div className='flex items-center justify-between mb-6 px-4'>
				<h2 className='text-2xl font-bold text-white'>{title}</h2>
				{viewAllLink && (
					<a
						href={viewAllLink}
						className='text-blue-400 hover:text-blue-300 text-sm transition-colors'
					>
						Смотреть все →
					</a>
				)}
			</div>

			<div
				className='relative group px-4'
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
					{visibleItems.map(item => (
						<div key={item.id} className='w-full'>
							<ContentCard content={item} />
						</div>
					))}
				</div>

				{totalPages > 1 && (
					<>
						<button
							onClick={prev}
							disabled={currentPage === 0}
							className='absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-r-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0'
						>
							<ChevronLeft className='w-6 h-6' />
						</button>
						<button
							onClick={next}
							disabled={currentPage === totalPages - 1}
							className='absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-l-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0'
						>
							<ChevronRight className='w-6 h-6' />
						</button>
					</>
				)}

				{totalPages > 1 && (
					<div className='flex justify-center gap-2 mt-6'>
						{Array.from({ length: totalPages }).map((_, i) => (
							<button
								key={i}
								onClick={() => setCurrentPage(i)}
								className={`h-2 rounded-full transition-all ${
									currentPage === i
										? 'w-6 bg-blue-500'
										: 'w-2 bg-gray-600 hover:bg-gray-500'
								}`}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	)
}
