'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import { BookOpen, Calendar, Image as ImageIcon, User, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface PersonFormProps {
	initialData?: any
	isEditing?: boolean
	personId?: string
}

export function PersonForm({
	initialData,
	isEditing,
	personId,
}: PersonFormProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [uploadingPhoto, setUploadingPhoto] = useState(false)

	const photoInputRef = useRef<HTMLInputElement>(null)

	const [photoFile, setPhotoFile] = useState<File | null>(null)
	const [photoPreview, setPhotoPreview] = useState<string | null>(
		initialData?.photoUrl
			? `${process.env.NEXT_PUBLIC_API_URL}${initialData.photoUrl}`
			: null,
	)

	const formatDateToYMD = (date: any): string => {
		if (!date) return ''
		if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}/)) {
			return date.split('T')[0]
		}
		if (typeof date === 'string' && date.includes('T')) {
			return date.split('T')[0]
		}
		if (date instanceof Date) {
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			return `${year}-${month}-${day}`
		}
		return ''
	}

	const [formData, setFormData] = useState({
		fullname: initialData?.fullname || '',
		biography: initialData?.biography || '',
		birthDate: formatDateToYMD(initialData?.birthDate),
		deathDate: formatDateToYMD(initialData?.deathDate),
	})

	useEffect(() => {
		if (initialData) {
			setFormData({
				fullname: initialData.fullname || '',
				biography: initialData.biography || '',
				birthDate: formatDateToYMD(initialData.birthDate),
				deathDate: formatDateToYMD(initialData.deathDate),
			})
			if (initialData.photoUrl) {
				setPhotoPreview(
					`${process.env.NEXT_PUBLIC_API_URL}${initialData.photoUrl}`,
				)
			}
		}
	}, [initialData])

	const handlePhotoClick = () => photoInputRef.current?.click()

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setPhotoFile(file)
			const reader = new FileReader()
			reader.onloadend = () => setPhotoPreview(reader.result as string)
			reader.readAsDataURL(file)
		}
	}

	const removePhoto = () => {
		setPhotoFile(null)
		setPhotoPreview(null)
		if (photoInputRef.current) photoInputRef.current.value = ''
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			if (!formData.fullname) throw new Error('Имя обязательно')

			const formDataToSend = new FormData()
			formDataToSend.append('fullname', formData.fullname)
			if (formData.biography)
				formDataToSend.append('biography', formData.biography)
			if (formData.birthDate)
				formDataToSend.append('birthDate', formData.birthDate)
			if (formData.deathDate)
				formDataToSend.append('deathDate', formData.deathDate)
			if (photoFile) formDataToSend.append('personPhoto', photoFile)

			if (isEditing && personId) {
				await adminApi.updatePerson(personId, formDataToSend)
			} else {
				await adminApi.createPerson(formDataToSend)
			}

			router.push('/admin/persons')
			router.refresh()
		} catch (error: any) {
			console.error('Failed to save person:', error)
			alert(
				error.response?.data?.message ||
					error.message ||
					'Ошибка при сохранении персоны',
			)
		} finally {
			setLoading(false)
			setUploadingPhoto(false)
		}
	}

	const getYear = (dateString: string) => {
		if (!dateString) return ''
		try {
			return new Date(dateString).getFullYear()
		} catch {
			return ''
		}
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-8'>
			{/* Фото */}
			<div className='bg-custom-dark rounded-lg shadow-xl border border-gray-800 p-6'>
				<h2 className='text-xl font-bold text-white mb-4'>Фото персоны</h2>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Фото
					</label>
					<div
						onClick={handlePhotoClick}
						className='relative w-32 h-32 rounded-full overflow-hidden bg-custom-darker cursor-pointer border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors'
					>
						{photoPreview ? (
							<>
								<Image
									src={getImageUrl(photoPreview)}
									alt='Photo preview'
									fill
									className='object-cover'
								/>
								<button
									type='button'
									onClick={e => {
										e.stopPropagation()
										removePhoto()
									}}
									className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10'
								>
									<X className='w-4 h-4' />
								</button>
							</>
						) : (
							<div className='absolute inset-0 flex flex-col items-center justify-center text-gray-500'>
								<ImageIcon className='w-8 h-8 mb-2' />
								<span className='text-xs text-center px-2'>
									Нажмите для загрузки
								</span>
							</div>
						)}
					</div>
					<input
						ref={photoInputRef}
						type='file'
						accept='image/*'
						onChange={handlePhotoChange}
						className='hidden'
					/>
					<p className='text-xs text-gray-500 mt-2'>
						Рекомендуемый размер: 400x400px. Форматы: JPG, PNG, WEBP
					</p>
				</div>
			</div>

			{/* Основная информация */}
			<div className='bg-custom-dark rounded-lg shadow-xl border border-gray-800 p-6'>
				<h2 className='text-xl font-bold text-white mb-4'>
					Основная информация
				</h2>
				<div className='space-y-6'>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Полное имя <span className='text-red-500'>*</span>
						</label>
						<div className='relative'>
							<User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
							<input
								type='text'
								value={formData.fullname}
								onChange={e =>
									setFormData({ ...formData, fullname: e.target.value })
								}
								className='w-full pl-10 pr-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
								placeholder='Например: Кристофер Нолан'
								required
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Биография
						</label>
						<div className='relative'>
							<BookOpen className='absolute left-3 top-3 w-4 h-4 text-gray-500' />
							<textarea
								value={formData.biography}
								onChange={e =>
									setFormData({ ...formData, biography: e.target.value })
								}
								rows={6}
								className='w-full pl-10 pr-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
								placeholder='Расскажите о персоне...'
							/>
						</div>
						<p className='text-xs text-gray-500 mt-1'>
							{formData.biography.length} / 5000 символов
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Дата рождения
							</label>
							<div className='relative'>
								<Calendar className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
								<input
									type='date'
									value={formData.birthDate}
									onChange={e =>
										setFormData({ ...formData, birthDate: e.target.value })
									}
									className='w-full pl-10 pr-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
								/>
							</div>
							{formData.birthDate && (
								<p className='text-xs text-gray-500 mt-1'>
									Год: {getYear(formData.birthDate)}
								</p>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Дата смерти
							</label>
							<div className='relative'>
								<Calendar className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
								<input
									type='date'
									value={formData.deathDate}
									onChange={e =>
										setFormData({ ...formData, deathDate: e.target.value })
									}
									className='w-full pl-10 pr-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
									min={formData.birthDate}
								/>
							</div>
							{formData.birthDate && formData.deathDate && (
								<p className='text-xs text-gray-500 mt-1'>
									Прожил:{' '}
									{getYear(formData.deathDate) - getYear(formData.birthDate)}{' '}
									лет
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{isEditing && initialData?.contentPersons?.length > 0 && (
				<div className='bg-custom-dark rounded-lg shadow-xl border border-gray-800 p-6'>
					<h2 className='text-xl font-bold text-white mb-4'>Фильмография</h2>
					<div className='space-y-2 max-h-60 overflow-y-auto'>
						{initialData.contentPersons.map((cp: any) => (
							<div
								key={cp.id}
								className='flex items-center justify-between p-3 bg-custom-darker border border-gray-700 rounded'
							>
								<div className='flex items-center space-x-3'>
									<div className='relative w-10 h-14 rounded overflow-hidden bg-custom-dark'>
										{cp.content?.posterUrl ? (
											<Image
												src={getImageUrl(cp.content.posterUrl)}
												alt={cp.content.title}
												fill
												className='object-cover'
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center text-gray-500 text-xs'>
												Нет
											</div>
										)}
									</div>
									<div>
										<div className='font-medium text-white'>
											{cp.content?.title}
										</div>
										<div className='text-sm text-gray-400'>
											{cp.role?.name || cp.roleName} • {cp.content?.releaseYear}
										</div>
									</div>
								</div>
								<div className='text-sm text-gray-400'>
									Важность: {cp.importance}/10
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className='flex justify-end space-x-4'>
				<Button
					type='button'
					variant='outline'
					onClick={() => router.push('/admin/persons')}
				>
					Отмена
				</Button>
				<Button type='submit' disabled={loading || uploadingPhoto}>
					{loading
						? 'Сохранение...'
						: uploadingPhoto
							? 'Загрузка фото...'
							: isEditing
								? 'Сохранить изменения'
								: 'Создать персону'}
				</Button>
			</div>
		</form>
	)
}
