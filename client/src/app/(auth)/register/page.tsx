'use client'
import { authApi } from '@/shared/api/auth/auth-api'
import Button from '@/shared/ui/Button'
import { Camera, User } from 'lucide-react'
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
		telegramId: '',
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
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md'>
				<div>
					<h1 className='text-3xl font-bold text-center text-gray-900'>
						Регистрация
					</h1>
					<p className='mt-2 text-center text-sm text-gray-600'>
						Присоединяйтесь к The Last Cut
					</p>
				</div>

				{error && (
					<div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm'>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Аватар */}
					<div className='flex justify-center'>
						<div className='relative'>
							<div
								onClick={handleAvatarClick}
								className='relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity border-2 border-dashed border-gray-300 hover:border-blue-500'
							>
								{avatarPreview ? (
									<Image
										src={avatarPreview}
										alt='Avatar preview'
										fill
										className='object-cover'
									/>
								) : (
									<div className='w-full h-full flex items-center justify-center'>
										<User className='w-8 h-8 text-gray-400' />
									</div>
								)}
							</div>
							<button
								type='button'
								onClick={handleAvatarClick}
								className='absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors'
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
						<label
							htmlFor='username'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Имя пользователя
						</label>
						<input
							id='username'
							name='username'
							type='text'
							required
							value={formData.username}
							onChange={handleChange}
							className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							placeholder='johndoe'
						/>
					</div>

					{/* Email */}
					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Электронная почта
						</label>
						<input
							id='email'
							name='email'
							type='email'
							required
							value={formData.email}
							onChange={handleChange}
							className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							placeholder='john@example.com'
						/>
					</div>

					{/* Пароль */}
					<div>
						<label
							htmlFor='password'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Пароль
						</label>
						<input
							id='password'
							name='password'
							type='password'
							required
							value={formData.password}
							onChange={handleChange}
							className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							placeholder='Минимум 8 символов'
						/>
					</div>

					{/* Подтверждение пароля */}
					<div>
						<label
							htmlFor='confirmPassword'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Подтверждение пароля
						</label>
						<input
							id='confirmPassword'
							name='confirmPassword'
							type='password'
							required
							value={formData.confirmPassword}
							onChange={handleChange}
							className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							placeholder='Введите пароль еще раз'
						/>
					</div>

					{/* Кнопка регистрации */}
					<Button type='submit' className='w-full' disabled={loading}>
						{loading ? 'Регистрация...' : 'Зарегистрироваться'}
					</Button>

					<p className='text-center text-sm text-gray-600'>
						Уже есть аккаунт?{' '}
						<Link
							href='/login'
							className='text-blue-600 hover:underline font-medium'
						>
							Войти
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}
