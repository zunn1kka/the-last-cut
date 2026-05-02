'use client'

import { personsApi } from '@/shared/api/persons/persons-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import { Loader2, Search, User, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Person {
	id: string
	fullname: string
	photoUrl: string | null
	birthDate: string | null
	biography: string | null
}

export default function ActorsPage() {
	const [actors, setActors] = useState<Person[]>([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)

	// Вспомогательная функция для безопасного получения года
	const getBirthYear = (birthDate: string | null) => {
		if (!birthDate) return null
		try {
			const year = new Date(birthDate).getFullYear()
			return isNaN(year) ? null : year
		} catch {
			return null
		}
	}

	useEffect(() => {
		fetchActors()
	}, [searchQuery, page])

	const fetchActors = async () => {
		setLoading(true)
		try {
			const response = await personsApi.getAll({
				query: searchQuery || undefined,
				page,
				limit: 24,
			})
			setActors(response.data?.items || [])
			setTotalPages(response.data?.totalPages || 1)
		} catch (error) {
			console.error('Failed to fetch actors:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleSearch = () => {
		setPage(1)
		fetchActors()
	}

	return (
		<main className='bg-custom-darker min-h-screen py-8'>
			<div className='container mx-auto px-4'>
				{/* Заголовок */}
				<div className='flex items-center gap-3 mb-8'>
					<Users className='w-8 h-8 text-blue-400' />
					<h1 className='text-3xl font-bold text-white'>Актеры</h1>
				</div>

				{/* Поиск */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-4 mb-8'>
					<div className='flex flex-col md:flex-row gap-4'>
						<div className='flex-1 relative'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
							<input
								type='text'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && handleSearch()}
								placeholder='Поиск актеров...'
								className='w-full pl-10 pr-4 py-3 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>
						<Button onClick={handleSearch}>Найти</Button>
					</div>
				</div>

				{/* Результаты */}
				{loading ? (
					<div className='flex justify-center py-12'>
						<Loader2 className='w-8 h-8 text-blue-400 animate-spin' />
					</div>
				) : actors.length === 0 ? (
					<div className='text-center py-12'>
						<User className='w-16 h-16 text-gray-600 mx-auto mb-4' />
						<p className='text-gray-500'>Актеры не найдены</p>
					</div>
				) : (
					<>
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
							{actors.map(actor => {
								const birthYear = getBirthYear(actor.birthDate)
								return (
									<Link
										key={actor.id}
										href={`/actors/${actor.id}`}
										className='group bg-custom-dark rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all duration-300'
									>
										<div className='relative aspect-[3/4] overflow-hidden bg-custom-darker'>
											{actor.photoUrl ? (
												<Image
													src={getImageUrl(actor.photoUrl)}
													alt={actor.fullname}
													fill
													unoptimized={true}
													className='object-cover group-hover:scale-105 transition-transform duration-300'
												/>
											) : (
												<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600'>
													<User className='w-12 h-12 text-white/50' />
												</div>
											)}
										</div>
										<div className='p-3 text-center'>
											<h3 className='font-semibold text-white text-sm line-clamp-1'>
												{actor.fullname}
											</h3>
											{birthYear && (
												<p className='text-xs text-gray-500 mt-1'>
													{birthYear}
												</p>
											)}
										</div>
									</Link>
								)
							})}
						</div>

						{/* Пагинация */}
						{totalPages > 1 && (
							<div className='flex justify-center gap-2 mt-8'>
								<Button
									variant='outline'
									onClick={() => setPage(p => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									Назад
								</Button>
								<span className='px-4 py-2 text-gray-400'>
									{page} / {totalPages}
								</span>
								<Button
									variant='outline'
									onClick={() => setPage(p => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
								>
									Вперед
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</main>
	)
}
