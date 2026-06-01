'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { genreApi } from '@/shared/api/genres/genre-api'
import { personRolesApi } from '@/shared/api/person-roles/person-roles-api'
import { personsApi } from '@/shared/api/persons/persons-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import { Image as ImageIcon, Plus, Search, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface SeriesFormProps {
	initialData?: any
	isEditing?: boolean
	movieId?: string
}

export function SeriesForm({
	initialData,
	isEditing,
	movieId,
}: SeriesFormProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [uploadingPoster, setUploadingPoster] = useState(false)
	const [uploadingBackdrop, setUploadingBackdrop] = useState(false)

	const posterInputRef = useRef<HTMLInputElement>(null)
	const backdropInputRef = useRef<HTMLInputElement>(null)

	const [genres, setGenres] = useState<any[]>([])
	const [persons, setPersons] = useState<any[]>([])
	const [roles, setRoles] = useState<any[]>([])
	const [searchPerson, setSearchPerson] = useState('')
	const [searchResults, setSearchResults] = useState<any[]>([])
	const [showPersonSearch, setShowPersonSearch] = useState(false)
	const [selectedPersonsData, setSelectedPersonsData] = useState<
		Record<string, any>
	>({})

	const [posterFile, setPosterFile] = useState<File | null>(null)
	const [posterPreview, setPosterPreview] = useState<string | null>(
		initialData?.posterUrl ? `${getImageUrl(initialData.posterUrl)}` : null,
	)
	const [backdropFile, setBackdropFile] = useState<File | null>(null)
	const [backdropPreview, setBackdropPreview] = useState<string | null>(
		initialData?.backdropUrl ? `${getImageUrl(initialData.backdropUrl)}` : null,
	)

	const [formData, setFormData] = useState({
		title: initialData?.title || '',
		originalTitle: initialData?.originalTitle || '',
		description: initialData?.description || '',
		releaseYear: initialData?.releaseYear || new Date().getFullYear(),
		seasonsCount: initialData?.series?.seasonsCount || 1,
		episodesCount: initialData?.series?.episodesCount || 0,
		ageRating: initialData?.ageRating || '',
		imdbRating: initialData?.imdbRating || '',
		kinopoiskRating: initialData?.kinopoiskRating || '',
		genreIds:
			initialData?.genres?.map((g: any) => g.genre?.id || g.genreId) || [],
		persons:
			initialData?.persons?.map((p: any) => ({
				personId: p.person?.id || p.personId,
				roleId: p.role?.id || p.roleId,
				roleName: p.roleName || '',
				importance: p.importance || 5,
			})) || [],
	})

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [genresRes, rolesRes] = await Promise.all([
					genreApi.getAll(),
					personRolesApi.getAll(),
				])
				setGenres(genresRes.data)
				setRoles(rolesRes.data)
			} catch (error) {
				console.error('Failed to fetch data:', error)
			}
		}
		fetchData()
	}, [])

	useEffect(() => {
		const searchTimeout = setTimeout(async () => {
			if (searchPerson.length > 2) {
				try {
					const response = await personsApi.search({ query: searchPerson })
					setSearchResults(response.data?.items || response.data || [])
				} catch (error) {
					console.error('Search failed:', error)
				}
			} else {
				setSearchResults([])
			}
		}, 300)
		return () => clearTimeout(searchTimeout)
	}, [searchPerson])

	const getYear = (dateString: string | null | undefined): string => {
		if (!dateString) return ''
		try {
			const date = new Date(dateString)
			return isNaN(date.getTime()) ? '?' : date.getFullYear().toString()
		} catch {
			return '?'
		}
	}

	const handlePosterClick = () => posterInputRef.current?.click()
	const handleBackdropClick = () => backdropInputRef.current?.click()

	const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setPosterFile(file)
			const reader = new FileReader()
			reader.onloadend = () => setPosterPreview(reader.result as string)
			reader.readAsDataURL(file)
		}
	}

	const handleBackdropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setBackdropFile(file)
			const reader = new FileReader()
			reader.onloadend = () => setBackdropPreview(reader.result as string)
			reader.readAsDataURL(file)
		}
	}

	const removePoster = () => {
		setPosterFile(null)
		setPosterPreview(null)
		if (posterInputRef.current) posterInputRef.current.value = ''
	}

	const removeBackdrop = () => {
		setBackdropFile(null)
		setBackdropPreview(null)
		if (backdropInputRef.current) backdropInputRef.current.value = ''
	}

	const addPerson = (person: any) => {
		if (!formData.persons.some(p => p.personId === person.id)) {
			setFormData({
				...formData,
				persons: [
					...formData.persons,
					{ personId: person.id, roleId: '', roleName: '', importance: 5 },
				],
			})
			setSelectedPersonsData(prev => ({
				...prev,
				[person.id]: {
					fullname: person.fullname,
					photoUrl: person.photoUrl,
					birthDate: person.birthDate,
					deathDate: person.deathDate,
					biography: person.biography,
				},
			}))
		}
		setShowPersonSearch(false)
		setSearchPerson('')
		setSearchResults([])
	}

	const removePerson = (personId: string) => {
		setFormData({
			...formData,
			persons: formData.persons.filter(p => p.personId !== personId),
		})
	}

	const updatePersonRole = (personId: string, roleId: string) => {
		setFormData({
			...formData,
			persons: formData.persons.map(p =>
				p.personId === personId ? { ...p, roleId } : p,
			),
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			if (!formData.title) throw new Error('Название обязательно')
			if (!formData.seasonsCount || formData.seasonsCount < 1)
				throw new Error('Количество сезонов должно быть больше 0')
			if (formData.genreIds.length === 0)
				throw new Error('Выберите хотя бы один жанр')

			const dataToSend = {
				...formData,
				imdbRating: formData.imdbRating
					? parseFloat(formData.imdbRating)
					: undefined,
				kinopoiskRating: formData.kinopoiskRating
					? parseFloat(formData.kinopoiskRating)
					: undefined,
				seasonsCount: Number(formData.seasonsCount) || 1,
				episodesCount: Number(formData.episodesCount) || 0,
				releaseYear: Number(formData.releaseYear) || new Date().getFullYear(),
			}

			let response
			let newMovieId = movieId

			if (isEditing && movieId) {
				response = await adminApi.updateSeries(movieId, dataToSend)
			} else {
				response = await adminApi.createSeries(dataToSend)
				newMovieId = response.data.id
			}

			if (posterFile && newMovieId) {
				setUploadingPoster(true)
				await adminApi.uploadContentPoster(newMovieId, posterFile)
			}

			if (backdropFile && newMovieId) {
				setUploadingBackdrop(true)
				await adminApi.uploadContentBackdrop(newMovieId, backdropFile)
			}

			router.push('/admin/series')
			router.refresh()
		} catch (error: any) {
			console.error('Failed to save series:', error)
			alert(
				error.response?.data?.message ||
					error.message ||
					'Ошибка при сохранении сериала',
			)
		} finally {
			setLoading(false)
			setUploadingPoster(false)
			setUploadingBackdrop(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-8'>
			{/* Изображения */}
			<div className='bg-custom-dark rounded-lg shadow-xl border border-gray-800 p-6'>
				<h2 className='text-xl font-bold text-white mb-4'>Изображения</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					{/* Постер */}
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Постер
						</label>
						<div
							onClick={handlePosterClick}
							className='relative aspect-[2/3] w-full max-w-[200px] bg-custom-darker rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors'
						>
							{posterPreview ? (
								<>
									<Image
										src={posterPreview}
										alt='Poster preview'
										fill
										className='object-cover'
									/>
									<button
										type='button'
										onClick={e => {
											e.stopPropagation()
											removePoster()
										}}
										className='absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600'
									>
										<X className='w-4 h-4' />
									</button>
								</>
							) : (
								<div className='absolute inset-0 flex flex-col items-center justify-center text-gray-500'>
									<ImageIcon className='w-8 h-8 mb-2' />
									<span className='text-sm'>Нажмите для загрузки</span>
								</div>
							)}
						</div>
						<input
							ref={posterInputRef}
							type='file'
							accept='image/*'
							onChange={handlePosterChange}
							className='hidden'
						/>
					</div>

					{/* Backdrop */}
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Фоновое изображение
						</label>
						<div
							onClick={handleBackdropClick}
							className='relative aspect-video w-full max-w-[400px] bg-custom-darker rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors'
						>
							{backdropPreview ? (
								<>
									<Image
										src={backdropPreview}
										alt='Backdrop preview'
										fill
										className='object-cover'
									/>
									<button
										type='button'
										onClick={e => {
											e.stopPropagation()
											removeBackdrop()
										}}
										className='absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600'
									>
										<X className='w-4 h-4' />
									</button>
								</>
							) : (
								<div className='absolute inset-0 flex flex-col items-center justify-center text-gray-500'>
									<ImageIcon className='w-8 h-8 mb-2' />
									<span className='text-sm'>Нажмите для загрузки</span>
								</div>
							)}
						</div>
						<input
							ref={backdropInputRef}
							type='file'
							accept='image/*'
							onChange={handleBackdropChange}
							className='hidden'
						/>
					</div>
				</div>
			</div>

			{/* Основная информация */}
			<div className='bg-custom-dark rounded-lg shadow-xl border border-gray-800 p-6'>
				<h2 className='text-xl font-bold text-white mb-4'>
					Основная информация
				</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Название <span className='text-red-500'>*</span>
						</label>
						<input
							type='text'
							value={formData.title}
							onChange={e =>
								setFormData({ ...formData, title: e.target.value })
							}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Оригинальное название
						</label>
						<input
							type='text'
							value={formData.originalTitle}
							onChange={e =>
								setFormData({ ...formData, originalTitle: e.target.value })
							}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Год выпуска <span className='text-red-500'>*</span>
						</label>
						<input
							type='number'
							min='1888'
							max={new Date().getFullYear() + 5}
							value={formData.releaseYear || ''}
							onChange={e =>
								setFormData({
									...formData,
									releaseYear: parseInt(e.target.value) || 0,
								})
							}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Количество сезонов <span className='text-red-500'>*</span>
						</label>
						<input
							type='number'
							min='1'
							max='50'
							value={formData.seasonsCount || ''}
							onChange={e =>
								setFormData({
									...formData,
									seasonsCount: parseInt(e.target.value) || 1,
								})
							}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Количество серий
						</label>
						<input
							type='number'
							min='0'
							value={formData.episodesCount || ''}
							onChange={e =>
								setFormData({
									...formData,
									episodesCount: parseInt(e.target.value) || 0,
								})
							}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Возрастной рейтинг
						</label>
						<select
							value={formData.ageRating}
							onChange={e =>
								setFormData({ ...formData, ageRating: e.target.value })
							}
							className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						>
							<option value=''>Не указан</option>
							<option value='G'>G (0+)</option>
							<option value='PG'>PG (6+)</option>
							<option value='PG-13'>PG-13 (13+)</option>
							<option value='R'>R (17+)</option>
							<option value='NC-17'>NC-17 (18+)</option>
						</select>
					</div>
				</div>

				<div className='mt-6'>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Описание <span className='text-red-500'>*</span>
					</label>
					<textarea
						value={formData.description}
						onChange={e =>
							setFormData({ ...formData, description: e.target.value })
						}
						rows={5}
						className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-25'
						required
					/>
				</div>
			</div>

			{/* Рейтинги */}
			<div className='bg-custom-dark rounded-lg shadow-xl border border-gray-800 p-6'>
				<h2 className='text-xl font-bold text-white mb-4'>Рейтинги</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							IMDb рейтинг
						</label>
						<input
							type='text'
							value={formData.imdbRating}
							onChange={e =>
								setFormData({ ...formData, imdbRating: e.target.value })
							}
							placeholder='8.5'
							className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Кинопоиск рейтинг
						</label>
						<input
							type='text'
							value={formData.kinopoiskRating}
							onChange={e =>
								setFormData({ ...formData, kinopoiskRating: e.target.value })
							}
							placeholder='8.2'
							className='w-full px-3 py-2 bg-custom-darker border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
					</div>
				</div>
			</div>

			{/* Жанры */}
			<div className='bg-custom-dark rounded-lg shadow-xl border border-gray-800 p-6'>
				<h2 className='text-xl font-bold text-white mb-4'>
					Жанры <span className='text-red-500'>*</span>
				</h2>
				<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3'>
					{genres.map(genre => (
						<label
							key={genre.id}
							className='flex items-center space-x-2 text-gray-300'
						>
							<input
								type='checkbox'
								checked={formData.genreIds.includes(genre.id)}
								onChange={e => {
									if (e.target.checked) {
										setFormData({
											...formData,
											genreIds: [...formData.genreIds, genre.id],
										})
									} else {
										setFormData({
											...formData,
											genreIds: formData.genreIds.filter(id => id !== genre.id),
										})
									}
								}}
								className='rounded border-gray-600 bg-custom-darker text-blue-500 focus:ring-blue-500 focus:ring-offset-custom-dark'
							/>
							<span className='text-sm'>{genre.name}</span>
						</label>
					))}
				</div>
			</div>

			{/* Персоны */}
			<div className='bg-custom-dark rounded-lg shadow-xl border border-gray-800 p-6'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-xl font-bold text-white'>Актеры и создатели</h2>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={() => setShowPersonSearch(true)}
					>
						<Plus className='w-4 h-4 mr-2' /> Добавить персону
					</Button>
				</div>

				{showPersonSearch && (
					<div className='mb-6 p-4 bg-custom-darker border border-gray-700 rounded-lg'>
						<div className='flex justify-between items-center mb-4'>
							<h3 className='font-medium text-white'>Поиск персоны</h3>
							<button
								type='button'
								onClick={() => {
									setShowPersonSearch(false)
									setSearchPerson('')
									setSearchResults([])
								}}
							>
								<X className='w-4 h-4 text-gray-400 hover:text-white' />
							</button>
						</div>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
							<input
								type='text'
								value={searchPerson}
								onChange={e => setSearchPerson(e.target.value)}
								placeholder='Введите имя актера или создателя...'
								className='w-full pl-10 pr-3 py-2 bg-custom-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
								autoFocus
							/>
						</div>
						{searchResults.length > 0 && (
							<div className='mt-4 space-y-2 max-h-60 overflow-y-auto'>
								{searchResults.map(person => (
									<button
										key={person.id}
										type='button'
										onClick={() => addPerson(person)}
										className='w-full text-left p-3 hover:bg-custom-dark rounded-lg transition-colors'
									>
										<div className='font-medium text-white'>
											{person.fullname}
										</div>
										{person.birthDate && (
											<div className='text-sm text-gray-400'>
												{new Date(person.birthDate).getFullYear()}
											</div>
										)}
									</button>
								))}
							</div>
						)}
					</div>
				)}

				{formData.persons.length > 0 && (
					<div className='space-y-4'>
						{formData.persons.map(person => {
							const personData = selectedPersonsData[person.personId] || {
								fullname: 'Загрузка...',
							}
							return (
								<div
									key={person.personId}
									className='flex items-center gap-4 p-4 bg-custom-darker border border-gray-700 rounded-lg'
								>
									<div className='relative w-8 h-8 rounded-full overflow-hidden bg-custom-dark flex-shrink-0'>
										{personData.photoUrl ? (
											<img
												src={`${process.env.NEXT_PUBLIC_API_URL}${personData.photoUrl}`}
												alt={personData.fullname}
												className='w-full h-full object-cover'
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center bg-blue-600 text-white text-xs font-medium'>
												{personData.fullname?.charAt(0)?.toUpperCase() || '?'}
											</div>
										)}
									</div>

									<div className='flex-1'>
										<div className='font-medium text-white'>
											{personData.fullname}
										</div>
										{(personData.birthDate || personData.deathDate) && (
											<div className='text-xs text-gray-400 mt-1'>
												{personData.birthDate
													? getYear(personData.birthDate)
													: ''}
												{personData.deathDate &&
													` — ${getYear(personData.deathDate)}`}
												{!personData.deathDate &&
													personData.birthDate &&
													' — н.в.'}
											</div>
										)}
									</div>

									<select
										value={person.roleId}
										onChange={e =>
											updatePersonRole(person.personId, e.target.value)
										}
										className='px-3 py-2 bg-custom-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]'
									>
										<option value=''>Выберите роль</option>
										{roles.map(role => (
											<option key={role.id} value={role.id}>
												{role.name}
											</option>
										))}
									</select>

									<input
										type='number'
										min='1'
										max='10'
										value={person.importance}
										onChange={e => {
											const importance = parseInt(e.target.value) || 0
											setFormData({
												...formData,
												persons: formData.persons.map(p =>
													p.personId === person.personId
														? { ...p, importance }
														: p,
												),
											})
										}}
										className='w-20 px-3 py-2 bg-custom-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
										placeholder='Важность'
									/>

									<button
										type='button'
										onClick={() => removePerson(person.personId)}
										className='text-red-500 hover:text-red-400'
									>
										<X className='w-5 h-5' />
									</button>
								</div>
							)
						})}
					</div>
				)}
			</div>

			<div className='flex justify-end space-x-4'>
				<Button
					type='button'
					variant='outline'
					onClick={() => router.push('/admin/series')}
				>
					Отмена
				</Button>
				<Button
					type='submit'
					disabled={loading || uploadingPoster || uploadingBackdrop}
				>
					{loading
						? 'Сохранение...'
						: uploadingPoster
							? 'Загрузка постера...'
							: uploadingBackdrop
								? 'Загрузка фона...'
								: isEditing
									? 'Сохранить изменения'
									: 'Создать сериал'}
				</Button>
			</div>
		</form>
	)
}
