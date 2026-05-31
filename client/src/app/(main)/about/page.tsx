'use client'

import { Film, MessageCircle, Star, TrendingUp, Users } from 'lucide-react'

export default function AboutPage() {
	return (
		<main className='bg-custom-darker min-h-screen py-12'>
			<div className='container mx-auto px-4 max-w-4xl'>
				{/* Заголовок */}
				<div className='text-center mb-12'>
					<div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4'>
						<Film className='w-8 h-8 text-white' />
					</div>
					<h1 className='text-3xl md:text-4xl font-bold text-white mb-3'>
						О проекте
					</h1>
					<p className='text-gray-400 text-lg'>
						The Last Cut — современный кино-портал для ценителей кино
					</p>
				</div>

				{/* Описание проекта */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-6 md:p-8 mb-8'>
					<h2 className='text-xl font-semibold text-white mb-4'>
						Что такое The Last Cut?
					</h2>
					<p className='text-gray-300 leading-relaxed mb-4'>
						The Last Cut — это информационный кино-портал, созданный для того,
						чтобы помочь зрителям ориентироваться в огромном мире кинематографа.
						Здесь вы можете найти подробную информацию о фильмах и сериалах,
						оценивать просмотренное, делиться мнениями и открывать для себя
						новые шедевры.
					</p>
					<p className='text-gray-300 leading-relaxed'>
						Проект разработан в рамках дипломной работы и представляет собой
						полнофункциональный веб-сайт с современным дизайном, адаптивным
						интерфейсом и широкими возможностями для взаимодействия с контентом.
					</p>
				</div>

				{/* Возможности */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-6 md:p-8 mb-8'>
					<h2 className='text-xl font-semibold text-white mb-6'>
						Возможности сайта
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='flex gap-3'>
							<Star className='w-6 h-6 text-yellow-500 flex-shrink-0 mt-1' />
							<div>
								<h3 className='font-semibold text-white mb-1'>
									Рейтинги и оценки
								</h3>
								<p className='text-gray-400 text-sm'>
									Оценивайте фильмы и сериалы по 10-балльной шкале, смотрите
									средний рейтинг сайта, а также оценки IMDb и Кинопоиска.
								</p>
							</div>
						</div>

						<div className='flex gap-3'>
							<MessageCircle className='w-6 h-6 text-blue-400 flex-shrink-0 mt-1' />
							<div>
								<h3 className='font-semibold text-white mb-1'>Комментарии</h3>
								<p className='text-gray-400 text-sm'>
									Обсуждайте фильмы с другими зрителями, оставляйте отзывы,
									отвечайте на комментарии и ставьте лайки.
								</p>
							</div>
						</div>

						<div className='flex gap-3'>
							<TrendingUp className='w-6 h-6 text-green-400 flex-shrink-0 mt-1' />
							<div>
								<h3 className='font-semibold text-white mb-1'>
									Статусы просмотра
								</h3>
								<p className='text-gray-400 text-sm'>
									Отслеживайте прогресс просмотра: отмечайте фильмы как «В
									планах», «Смотрю», «Просмотрено» или «Брошено».
								</p>
							</div>
						</div>

						<div className='flex gap-3'>
							<Users className='w-6 h-6 text-purple-400 flex-shrink-0 mt-1' />
							<div>
								<h3 className='font-semibold text-white mb-1'>Сборники</h3>
								<p className='text-gray-400 text-sm'>
									Создавайте собственные подборки фильмов, делитесь ими с
									другими или оставляйте приватными.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Для кого этот сайт */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-6 md:p-8 mb-8'>
					<h2 className='text-xl font-semibold text-white mb-4'>
						Для кого этот сайт
					</h2>
					<p className='text-gray-300 leading-relaxed mb-4'>
						Этот сайт создан для всех, кто любит кино. Независимо от того,
						являетесь ли вы заядлым киноманом, смотрящим десятки фильмов в
						месяц, или обычным зрителем, который хочет найти хороший фильм для
						вечернего просмотра — The Last Cut будет полезным помощником.
					</p>
					<p className='text-gray-300 leading-relaxed'>
						Здесь вы найдёте информацию о фильмах и сериалах на любой вкус,
						сможете поделиться своими впечатлениями и узнать мнение других. Сайт
						подходит для использования как с компьютера, так и с мобильного
						устройства — адаптивный дизайн обеспечивает комфортный просмотр на
						любом экране.
					</p>
				</div>

				{/* Технологии */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-6 md:p-8 mb-8'>
					<h2 className='text-xl font-semibold text-white mb-4'>Технологии</h2>
					<div className='flex flex-wrap gap-2'>
						<span className='px-3 py-1 bg-custom-darker border border-gray-700 rounded-full text-sm text-gray-300'>
							Next.js
						</span>
						<span className='px-3 py-1 bg-custom-darker border border-gray-700 rounded-full text-sm text-gray-300'>
							TypeScript
						</span>
						<span className='px-3 py-1 bg-custom-darker border border-gray-700 rounded-full text-sm text-gray-300'>
							NestJS
						</span>
						<span className='px-3 py-1 bg-custom-darker border border-gray-700 rounded-full text-sm text-gray-300'>
							PostgreSQL
						</span>
						<span className='px-3 py-1 bg-custom-darker border border-gray-700 rounded-full text-sm text-gray-300'>
							Prisma
						</span>
						<span className='px-3 py-1 bg-custom-darker border border-gray-700 rounded-full text-sm text-gray-300'>
							TailwindCSS
						</span>
					</div>
				</div>

				{/* Контакты и ссылки */}
				<div className='text-center text-gray-500 text-sm'>
					<p>© 2026 The Last Cut. Дипломный проект.</p>
					<p className='mt-2'>
						По всем вопросам:{' '}
						<a
							href='mailto:support@thelastcut.ru'
							className='text-blue-400 hover:text-blue-300'
						>
							thelastcut.notifications@gmail.com
						</a>
					</p>
				</div>
			</div>
		</main>
	)
}
