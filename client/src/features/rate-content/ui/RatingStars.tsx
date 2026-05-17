'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { ratingsApi } from '@/shared/api/ratings/ratings-api'
import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'

interface RatingStarsProps {
	contentId: string
	initialRating?: number | null
	size?: 'sm' | 'md' | 'lg'
	onRate?: (rating: number) => void
}

export function RatingStars({
	contentId,
	initialRating,
	size = 'md',
	onRate,
}: RatingStarsProps) {
	const { user } = useAuth()
	const [rating, setRating] = useState<number | null>(initialRating || null)
	const [hoverRating, setHoverRating] = useState<number | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6',
	}

	useEffect(() => {
		setRating(initialRating || null)
	}, [initialRating])

	const handleRate = async (value: number, e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (!user) {
			window.location.href = '/login'
			return
		}

		setIsLoading(true)
		try {
			await ratingsApi.rateContent(contentId, value)
			setRating(value)
			onRate?.(value)
		} catch (error) {
			console.error('Failed to rate:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleRemove = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		setIsLoading(true)
		try {
			await ratingsApi.deleteRating(contentId)
			setRating(null)
			onRate?.(0)
		} catch (error) {
			console.error('Failed to remove rating:', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div
			className='flex flex-col items-start gap-1'
			onClick={e => e.preventDefault()}
		>
			<div className='flex items-center gap-0.5'>
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
					<button
						key={value}
						onClick={e => handleRate(value, e)}
						onMouseEnter={() => setHoverRating(value)}
						onMouseLeave={() => setHoverRating(null)}
						disabled={isLoading}
						className='focus:outline-none transition-transform hover:scale-110'
					>
						<Star
							className={`${sizes[size]} transition-colors ${
								(
									hoverRating !== null
										? value <= hoverRating
										: value <= (rating || 0)
								)
									? 'fill-yellow-400 text-yellow-400'
									: 'text-gray-600 hover:text-gray-500'
							}`}
						/>
					</button>
				))}
			</div>

			{rating && (
				<div className='flex items-center gap-2 mt-1'>
					<span className='text-xs text-gray-400'>
						Ваша оценка:{' '}
						<span className='font-bold text-yellow-400'>{rating}</span>
					</span>
					<button
						onClick={handleRemove}
						disabled={isLoading}
						className='text-xs text-gray-500 hover:text-red-400 transition-colors'
					>
						Удалить
					</button>
				</div>
			)}
		</div>
	)
}
