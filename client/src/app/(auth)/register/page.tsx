'use client'

import { authApi } from '@/shared/api/auth/auth-api'
import Button from '@/shared/ui/Button'
import { Camera, Film, Lock, Mail, User, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function RegisterPage() {
	const router = useRouter()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	})

	const [avatar, setAvatar] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleAvatarClick = () => {
		fileInputRef.current?.click()
	}

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setAvatar(file)
			const reader = new FileReader()
			reader.onloadend = () => {
				setAvatarPreview(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const clearAvatar = () => {
		setAvatar(null)
		setAvatarPreview(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (formData.password !== formData.confirmPassword) {
			setError('Пароли не совпадают')
			return
		}

		if (formData.password.length < 8) {
			setError('Пароль должен содержать минимум 8 символов')
			return
		}

		if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(formData.password)) {
			setError(
				'Пароль должен содержать заглавную букву, строчную букву и цифру',
			)
			return
		}

		setLoading(true)

		try {
			await authApi.register(formData, avatar || undefined)
			router.push('/login?registered=true')
		} catch (err: any) {
			setError(err.response?.data?.message || 'Ошибка регистрации')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-custom-darker px-4 py-12'>
			{/* Фоновые декоративные элементы */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl' />
				<div className='absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl' />
			</div>

			<div className='relative max-w-md w-full'>
				{/* Логотип */}
				<div className='flex justify-center mb-6'>
					<div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg'>
						<Film className='w-8 h-8 text-white' />
					</div>
				</div>

				<div className='bg-custom-dark rounded-2xl shadow-2xl border border-gray-800 p-8'>
					<div className='text-center mb-6'>
						<h1 className='text-2xl font-bold text-white'>Регистрация</h1>
						<p className='text-gray-400 text-sm mt-1'>
							Создайте аккаунт в The Last Cut
						</p>
					</div>

					{error && (
						<div className='bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6'>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-5'>
						{/* Аватар */}
						<div className='flex justify-center'>
							<div className='relative'>
								<div
									onClick={handleAvatarClick}
									className='relative w-24 h-24 rounded-full overflow-hidden bg-custom-darker cursor-pointer group ring-2 ring-gray-700 hover:ring-blue-500 transition-all'
								>
									{avatarPreview ? (
										<>
											<Image
												src={avatarPreview}
												alt='Avatar preview'
												fill
												className='object-cover'
											/>
											<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
												<Camera className='w-6 h-6 text-white' />
											</div>
										</>
									) : (
										<div className='w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600'>
											<User className='w-8 h-8 text-white/80' />
										</div>
									)}
								</div>
								{avatarPreview && (
									<button
										type='button'
										onClick={clearAvatar}
										className='absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors'
									>
										<X className='w-4 h-4' />
									</button>
								)}
								<button
									type='button'
									onClick={handleAvatarClick}
									className='absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full transition-colors shadow-lg'
								>
									<Camera className='w-4 h-4' />
								</button>
								<input
									ref={fileInputRef}
									type='file'
									accept='image/*'
									onChange={handleAvatarChange}
									className='hidden'
								/>
							</div>
						</div>

						{/* Имя пользователя */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Имя пользователя
							</label>
							<div className='relative'>
								<User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
								<input
									name='username'
									type='text'
									required
									value={formData.username}
									onChange={handleChange}
									className='w-full pl-10 pr-4 py-3 bg-custom-darker border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
									placeholder='johndoe'
								/>
							</div>
						</div>

						{/* Email */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Электронная почта
							</label>
							<div className='relative'>
								<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
								<input
									name='email'
									type='email'
									required
									value={formData.email}
									onChange={handleChange}
									className='w-full pl-10 pr-4 py-3 bg-custom-darker border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
									placeholder='john@example.com'
								/>
							</div>
						</div>

						{/* Пароль */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Пароль
							</label>
							<div className='relative'>
								<Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
								<input
									name='password'
									type='password'
									required
									value={formData.password}
									onChange={handleChange}
									className='w-full pl-10 pr-4 py-3 bg-custom-darker border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
									placeholder='Минимум 8 символов'
								/>
							</div>
							<p className='text-xs text-gray-500 mt-1'>
								Пароль должен содержать заглавную букву, строчную букву и цифру
							</p>
						</div>

						{/* Подтверждение пароля */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Подтверждение пароля
							</label>
							<div className='relative'>
								<Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
								<input
									name='confirmPassword'
									type='password'
									required
									value={formData.confirmPassword}
									onChange={handleChange}
									className='w-full pl-10 pr-4 py-3 bg-custom-darker border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
									placeholder='Введите пароль еще раз'
								/>
							</div>
						</div>

						{/* Кнопка регистрации */}
						<Button
							type='submit'
							className='w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25'
							disabled={loading}
						>
							{loading ? (
								<span className='flex items-center justify-center gap-2'>
									<div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
									Регистрация...
								</span>
							) : (
								'Зарегистрироваться'
							)}
						</Button>

						<p className='text-center text-sm text-gray-400'>
							Уже есть аккаунт?{' '}
							<Link
								href='/login'
								className='text-blue-400 hover:text-blue-300 font-medium transition-colors'
							>
								Войти
							</Link>
						</p>
					</form>
				</div>
			</div>
		</div>
	)
}
