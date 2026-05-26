'use client'

import { Comments } from '@/widgets/comments'
import { ContentDetails } from '@/widgets/content-details'

export function MovieClient({ movie }: { movie: any }) {
	return (
		<main className='bg-custom-darker min-h-screen py-12'>
			<div className='container mx-auto px-4'>
				<ContentDetails content={movie} contentType='MOVIE' />
				<Comments contentId={movie.id} contentType='MOVIE' />
			</div>
		</main>
	)
}
