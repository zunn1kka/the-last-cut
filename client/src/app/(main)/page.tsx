'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { getImageUrl } from '@/shared/lib/get-image-url'
import { MoviesSection } from '@/widgets/content-sections/movies-section'
import { NewReleasesSection } from '@/widgets/content-sections/new-releases-section'
import { PopularSection } from '@/widgets/content-sections/popular-section'
import { SeriesSection } from '@/widgets/content-sections/series-section'
import { TopRatedSection } from '@/widgets/content-sections/top-rated-section'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
	const { user } = useAuth()
	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50)
		}
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<>
			{/* Основной контент */}
			<main className='bg-custom-darker min-h-screen'>
				<div className='container mx-auto px-4 py-8'>
					{/* Приветствие для авторизованных */}
					{user && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							className='mb-8 p-5 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm'
						>
							<div className='flex items-center justify-between flex-wrap gap-4'>
								<div className='flex items-center gap-3'>
									{/* Аватар пользователя */}
									<div className='relative w-10 h-10 rounded-full overflow-hidden bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center'>
										{user.avatarUrl ? (
											<Image
												src={getImageUrl(user.avatarUrl)}
												alt={user.username}
												fill
												className='object-cover'
												unoptimized={true}
											/>
										) : (
											<span className='text-white font-bold text-lg'>
												{user.username.charAt(0).toUpperCase()}
											</span>
										)}
									</div>
									<div>
										<p className='text-gray-300'>
											👋 Добро пожаловать,{' '}
											<span className='font-semibold text-white'>
												{user.username}
											</span>
											!
										</p>
										<p className='text-sm text-gray-400'>
											Готов поделиться мнением о фильме?
										</p>
									</div>
								</div>
								<Link
									href='/profile'
									className='group inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all'
								>
									<span>Перейти в профиль</span>
									<ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
								</Link>
							</div>
						</motion.div>
					)}

					{/* Секции с контентом */}
					<div className='space-y-20'>
						<motion.div
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						>
							<PopularSection />
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.1 }}
						>
							<NewReleasesSection />
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<MoviesSection />
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.3 }}
						>
							<SeriesSection />
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.4 }}
						>
							<TopRatedSection />
						</motion.div>
					</div>

					{/* CTA секция */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className='mt-20 p-12 bg-linear-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl border border-white/10 text-center'
					>
						<h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
							Готовы начать своё кино-путешествие?
						</h2>
						<p className='text-gray-300 mb-8 max-w-2xl mx-auto'>
							Присоединяйтесь к сообществу киноманов. Оценивайте фильмы,
							делитесь мнениями и открывайте для себя новые шедевры.
						</p>
						<Link
							href={user ? '/movies' : '/register'}
							className='inline-flex items-center gap-2 bg-white text-custom-dark px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl'
						>
							{user ? 'Начать смотреть' : 'Создать аккаунт'}
							<ArrowRight className='w-5 h-5' />
						</Link>
					</motion.div>
				</div>
			</main>
		</>
	)
}
