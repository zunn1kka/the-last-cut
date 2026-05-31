'use client'

import { authApi } from '@/shared/api/auth/auth-api'
import Button from '@/shared/ui/Button'
import { Camera, Film, Lock, Mail, User, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function RegisterContent() {
	const router = useRouter()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	})

	const [errors, setErrors] = useState<{
		username?: string
		email?: string
		password?: string
		confirmPassword?: string
		general?: string
	}>({})

	const [touched, setTouched] = useState({
		username: false,
		email: false,
		password: false,
		confirmPassword: false,
	})

	const [avatar, setAvatar] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	// Валидация имени пользователя
	const validateUsername = (username: string): string => {
		if (!username) return 'Имя пользователя обязательно'
		if (username.length < 3)
			return 'Имя пользователя должно содержать минимум 3 символа'
		if (username.length > 50)
			return 'Имя пользователя не должно превышать 50 символов'
		if (!/^[a-zA-Z0-9_]+$/.test(username)) {
			return 'Только латинские буквы, цифры и символ "_"'
		}
		return ''
	}

	// Валидация email
	const validateEmail = (email: string): string => {
		if (!email) return 'Email обязателен'
		const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
		if (!emailRegex.test(email))
			return 'Введите корректный email (пример: name@domain.com)'
		return ''
	}

	// Валидация пароля
	const validatePassword = (password: string): string => {
		if (!password) return 'Пароль обязателен'
		if (password.length < 8) return 'Пароль должен содержать минимум 8 символов'
		if (password.length > 32) return 'Пароль не должен превышать 32 символа'
		if (!/[A-Z]/.test(password)) {
			return 'Пароль должен содержать хотя бы одну заглавную букву (A-Z)'
		}
		if (!/[a-z]/.test(password)) {
			return 'Пароль должен содержать хотя бы одну строчную букву (a-z)'
		}
		if (!/[0-9]/.test(password)) {
			return 'Пароль должен содержать хотя бы одну цифру (0-9)'
		}
		return ''
	}

	// Получение силы пароля
	const getPasswordStrength = (
		password: string,
	): { strength: number; label: string; color: string } => {
		let strength = 0
		if (password.length >= 8) strength++
		if (password.length >= 12) strength++
		if (/[A-Z]/.test(password)) strength++
		if (/[a-z]/.test(password)) strength++
		if (/[0-9]/.test(password)) strength++
		if (/[^A-Za-z0-9]/.test(password)) strength++

		if (strength <= 2) return { strength, label: 'Слабый', color: 'bg-red-500' }
		if (strength <= 4)
			return { strength, label: 'Средний', color: 'bg-yellow-500' }
		return { strength, label: 'Сильный', color: 'bg-green-500' }
	}

	// Валидация подтверждения пароля
	const validateConfirmPassword = (
		password: string,
		confirmPassword: string,
	): string => {
		if (!confirmPassword) return 'Подтверждение пароля обязательно'
		if (password !== confirmPassword) return 'Пароли не совпадают'
		return ''
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))

		let error = ''
		switch (name) {
			case 'username':
				error = validateUsername(value)
				break
			case 'email':
				error = validateEmail(value)
				break
			case 'password':
				error = validatePassword(value)
				if (touched.confirmPassword) {
					const confirmError = validateConfirmPassword(
						value,
						formData.confirmPassword,
					)
					setErrors(prev => ({ ...prev, confirmPassword: confirmError }))
				}
				break
			case 'confirmPassword':
				error = validateConfirmPassword(formData.password, value)
				break
		}
		setErrors(prev => ({ ...prev, [name]: error }))
	}

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const { name } = e.target
		setTouched(prev => ({ ...prev, [name]: true }))

		let error = ''
		switch (name) {
			case 'username':
				error = validateUsername(formData.username)
				break
			case 'email':
				error = validateEmail(formData.email)
				break
			case 'password':
				error = validatePassword(formData.password)
				break
			case 'confirmPassword':
				error = validateConfirmPassword(
					formData.password,
					formData.confirmPassword,
				)
				break
		}
		setErrors(prev => ({ ...prev, [name]: error }))
	}

	const handleAvatarClick = () => {
		fileInputRef.current?.click()
	}

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				setErrors(prev => ({
					...prev,
					general: 'Размер файла не должен превышать 5MB',
				}))
				return
			}
			if (!file.type.startsWith('image/')) {
				setErrors(prev => ({
					...prev,
					general: 'Можно загружать только изображения',
				}))
				return
			}
			setAvatar(file)
			const reader = new FileReader()
			reader.onloadend = () => {
				setAvatarPreview(reader.result as string)
			}
			reader.readAsDataURL(file)
			setErrors(prev => ({ ...prev, general: undefined }))
		}
	}

	const clearAvatar = () => {
		setAvatar(null)
		setAvatarPreview(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const usernameError = validateUsername(formData.username)
		const emailError = validateEmail(formData.email)
		const passwordError = validatePassword(formData.password)
		const confirmPasswordError = validateConfirmPassword(
			formData.password,
			formData.confirmPassword,
		)

		setErrors({
			username: usernameError,
			email: emailError,
			password: passwordError,
			confirmPassword: confirmPasswordError,
		})

		setTouched({
			username: true,
			email: true,
			password: true,
			confirmPassword: true,
		})

		if (usernameError || emailError || passwordError || confirmPasswordError) {
			return
		}

		setLoading(true)

		try {
			// Отправляем запрос на регистрацию
			await authApi.register(formData, avatar || undefined)

			// НЕМЕДЛЕННЫЙ РЕДИРЕКТ - не ждем очистки формы
			// Используем window.location.href для мгновенного перехода
			window.location.href = '/login?registered=true'
		} catch (err: any) {
			console.error('Registration error:', err)
			const message = err.response?.data?.message || 'Ошибка регистрации'
			if (typeof message === 'string') {
				setErrors({ general: message })
			} else if (Array.isArray(message)) {
				setErrors({ general: message.join(', ') })
			} else {
				setErrors({ general: 'Ошибка регистрации' })
			}
			setLoading(false)
		}
	}

	const passwordStrength = getPasswordStrength(formData.password)

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

					{errors.general && (
						<div className='bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6'>
							{errors.general}
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

						{/* Остальные поля формы... (они такие же как и были) */}
						{/* Имя пользователя */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Имя пользователя <span className='text-red-400'>*</span>
							</label>
							<div className='relative'>
								<User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
								<input
									name='username'
									type='text'
									value={formData.username}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`w-full pl-10 pr-4 py-3 bg-custom-darker border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
										touched.username && errors.username
											? 'border-red-500'
											: 'border-gray-700'
									}`}
									placeholder='johndoe'
								/>
							</div>
							{touched.username && errors.username && (
								<p className='text-red-400 text-xs mt-1'>{errors.username}</p>
							)}
							<p className='text-gray-500 text-xs mt-1'>
								Только латинские буквы, цифры и "_"
							</p>
						</div>

						{/* Email */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Электронная почта <span className='text-red-400'>*</span>
							</label>
							<div className='relative'>
								<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
								<input
									name='email'
									type='email'
									value={formData.email}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`w-full pl-10 pr-4 py-3 bg-custom-darker border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
										touched.email && errors.email
											? 'border-red-500'
											: 'border-gray-700'
									}`}
									placeholder='john@example.com'
								/>
							</div>
							{touched.email && errors.email && (
								<p className='text-red-400 text-xs mt-1'>{errors.email}</p>
							)}
						</div>

						{/* Пароль */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Пароль <span className='text-red-400'>*</span>
							</label>
							<div className='relative'>
								<Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
								<input
									name='password'
									type='password'
									value={formData.password}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`w-full pl-10 pr-4 py-3 bg-custom-darker border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
										touched.password && errors.password
											? 'border-red-500'
											: 'border-gray-700'
									}`}
									placeholder='Минимум 8 символов'
								/>
							</div>
							{touched.password && errors.password && (
								<p className='text-red-400 text-xs mt-1'>{errors.password}</p>
							)}

							{/* Индикатор силы пароля */}
							{formData.password.length > 0 && (
								<div className='mt-2'>
									<div className='flex items-center gap-2'>
										<div className='flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden'>
											<div
												className={`h-full ${passwordStrength.color} rounded-full transition-all duration-300`}
												style={{
													width: `${(passwordStrength.strength / 6) * 100}%`,
												}}
											/>
										</div>
										<span
											className={`text-xs ${passwordStrength.color === 'bg-red-500' ? 'text-red-400' : passwordStrength.color === 'bg-yellow-500' ? 'text-yellow-400' : 'text-green-400'}`}
										>
											{passwordStrength.label}
										</span>
									</div>
								</div>
							)}

							{/* Требования к паролю */}
							<div className='text-gray-500 text-xs mt-2 space-y-1'>
								<p
									className={
										formData.password.length >= 8 ? 'text-green-400' : ''
									}
								>
									✓ Минимум 8 символов
								</p>
								<p
									className={
										/[A-Z]/.test(formData.password) ? 'text-green-400' : ''
									}
								>
									✓ Заглавная буква (A-Z)
								</p>
								<p
									className={
										/[a-z]/.test(formData.password) ? 'text-green-400' : ''
									}
								>
									✓ Строчная буква (a-z)
								</p>
								<p
									className={
										/[0-9]/.test(formData.password) ? 'text-green-400' : ''
									}
								>
									✓ Цифра (0-9)
								</p>
							</div>
						</div>

						{/* Подтверждение пароля */}
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Подтверждение пароля <span className='text-red-400'>*</span>
							</label>
							<div className='relative'>
								<Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500' />
								<input
									name='confirmPassword'
									type='password'
									value={formData.confirmPassword}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`w-full pl-10 pr-4 py-3 bg-custom-darker border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
										touched.confirmPassword && errors.confirmPassword
											? 'border-red-500'
											: 'border-gray-700'
									}`}
									placeholder='Введите пароль еще раз'
								/>
							</div>
							{touched.confirmPassword && errors.confirmPassword && (
								<p className='text-red-400 text-xs mt-1'>
									{errors.confirmPassword}
								</p>
							)}
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

						<p className='text-center mt-6 text-sm text-gray-400'>
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
