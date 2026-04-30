'use client'

import { contentApi } from '@/shared/api/content/content-api'
import { Info, Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

export function HeroSection() {
	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await contentApi.getPopular(5)
				setItems(response.data || [])
			} catch (error) {
				console.error('Failed to fetch hero items:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	if (loading || items.length === 0) {
		return <div className='relative h-[70vh] bg-custom-darker animate-pulse' />
	}

	return (
		<section className='relative h-[70vh] mb-12 overflow-hidden'>
			<Swiper
				modules={[Navigation, Pagination, Autoplay, EffectFade]}
				effect='fade'
				navigation
				pagination={{ clickable: true }}
				autoplay={{ delay: 5000, disableOnInteraction: false }}
				loop
				className='h-full'
			>
				{items.map((item: any) => (
					<SwiperSlide key={item.id}>
						<div className='relative w-full h-full'>
							{/* Фоновое изображение */}
							<div className='absolute inset-0'>
								{item.backdropUrl ? (
									<Image
										src={`${process.env.NEXT_PUBLIC_API_URL}${item.backdropUrl}`}
										alt={item.title}
										fill
										unoptimized={true}
										className='object-cover'
										priority
									/>
								) : item.posterUrl ? (
									<Image
										src={`${process.env.NEXT_PUBLIC_API_URL}${item.posterUrl}`}
										alt={item.title}
										fill
										unoptimized={true}
										className='object-cover'
										priority
									/>
								) : null}
								<div className='absolute inset-0 bg-gradient-to-t from-custom-dark via-custom-dark/70 to-transparent' />
							</div>

							{/* Контент */}
							<div className='absolute bottom-0 left-0 right-0 p-8 md:p-12'>
								<div className='container mx-auto'>
									<div className='max-w-2xl'>
										<span className='inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full mb-4'>
											{item.contentType === 'MOVIE' ? 'Фильм' : 'Сериал'}
										</span>
										<h1 className='text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4'>
											{item.title}
										</h1>
										<div className='flex items-center gap-4 mb-4 text-gray-300 text-sm'>
											<span>{item.releaseYear}</span>
											{item.movie?.duration && (
												<span>{item.movie.duration} мин</span>
											)}
											{item.series?.seasonsCount && (
												<span>{item.series.seasonsCount} сезонов</span>
											)}
											{item.siteRating && (
												<span className='flex items-center'>
													<span className='text-yellow-400 mr-1'>★</span>
													{item.siteRating}
												</span>
											)}
										</div>
										<p className='text-gray-300 line-clamp-3 mb-6'>
											{item.description}
										</p>
										<div className='flex gap-4'>
											<Link
												href={`/${item.contentType === 'MOVIE' ? 'movies' : 'series'}/${item.id}`}
												className='inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
											>
												<Play className='w-5 h-5 mr-2' />
												Смотреть
											</Link>
											<Link
												href={`/${item.contentType === 'MOVIE' ? 'movies' : 'series'}/${item.id}`}
												className='inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors'
											>
												<Info className='w-5 h-5 mr-2' />
												Подробнее
											</Link>
										</div>
									</div>
								</div>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>

			{/* Стили для кнопок навигации Swiper */}
			<style jsx>{`
				:global(.swiper-button-prev),
				:global(.swiper-button-next) {
					color: white;
					background: rgba(0, 0, 0, 0.5);
					width: 40px;
					height: 40px;
					border-radius: 50%;
					transition: all 0.3s;
				}
				:global(.swiper-button-prev:hover),
				:global(.swiper-button-next:hover) {
					background: rgba(0, 0, 0, 0.8);
				}
				:global(.swiper-button-prev:after),
				:global(.swiper-button-next:after) {
					font-size: 18px;
				}
				:global(.swiper-pagination-bullet) {
					background: white;
					opacity: 0.5;
				}
				:global(.swiper-pagination-bullet-active) {
					background: #3b82f6;
					opacity: 1;
				}
			`}</style>
		</section>
	)
}
