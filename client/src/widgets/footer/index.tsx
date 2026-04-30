import { Film, Github, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className='bg-custom-dark text-white mt-auto'>
			<div className='container mx-auto px-4 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
					{/* О проекте */}
					<div>
						<div className='flex items-center space-x-2 mb-4'>
							<Film className='w-6 h-6 text-blue-400' />
							<span className='text-lg font-bold'>The Last Cut</span>
						</div>
						<p className='text-gray-400 text-sm leading-relaxed'>
							Киноинформационный портал. Тысячи фильмов и сериалов с рейтингами,
							отзывами и подробной информацией об актерах и создателях.
						</p>
					</div>

					{/* Навигация */}
					<div>
						<h3 className='text-sm font-semibold uppercase tracking-wider mb-4'>
							Навигация
						</h3>
						<ul className='space-y-2'>
							<li>
								<Link
									href='/movies'
									className='text-gray-400 hover:text-white transition-colors'
								>
									Фильмы
								</Link>
							</li>
							<li>
								<Link
									href='/series'
									className='text-gray-400 hover:text-white transition-colors'
								>
									Сериалы
								</Link>
							</li>
							<li>
								<Link
									href='/actors'
									className='text-gray-400 hover:text-white transition-colors'
								>
									Актеры
								</Link>
							</li>
							<li>
								<Link
									href='/top'
									className='text-gray-400 hover:text-white transition-colors'
								>
									Топ-250
								</Link>
							</li>
						</ul>
					</div>

					{/* Информация */}
					<div>
						<h3 className='text-sm font-semibold uppercase tracking-wider mb-4'>
							Информация
						</h3>
						<ul className='space-y-2'>
							<li>
								<Link
									href='/about'
									className='text-gray-400 hover:text-white transition-colors'
								>
									О проекте
								</Link>
							</li>
							<li>
								<Link
									href='/contact'
									className='text-gray-400 hover:text-white transition-colors'
								>
									Контакты
								</Link>
							</li>
							<li>
								<Link
									href='/privacy'
									className='text-gray-400 hover:text-white transition-colors'
								>
									Политика конфиденциальности
								</Link>
							</li>
							<li>
								<Link
									href='/terms'
									className='text-gray-400 hover:text-white transition-colors'
								>
									Условия использования
								</Link>
							</li>
						</ul>
					</div>

					{/* Контакты */}
					<div>
						<h3 className='text-sm font-semibold uppercase tracking-wider mb-4'>
							Контакты
						</h3>
						<ul className='space-y-3'>
							<li className='flex items-center space-x-3 text-gray-400'>
								<Mail className='w-4 h-4' />
								<span>info@thelastcut.ru</span>
							</li>
							<li className='flex items-center space-x-3 text-gray-400'>
								<Phone className='w-4 h-4' />
								<span>+7 (999) 123-45-67</span>
							</li>
							<li className='pt-2'>
								<a
									href='https://github.com'
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors'
								>
									<Github className='w-5 h-5' />
									<span>GitHub</span>
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Копирайт */}
				<div className='border-t border-gray-800 mt-8 pt-8 text-center'>
					<p className='text-gray-400 text-sm'>
						© {currentYear} The Last Cut. Все права защищены.
					</p>
				</div>
			</div>
		</footer>
	)
}
