'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { DataTableProps } from './data-table-props.interface'

export function DataTable({
	data,
	columns,
	onDelete,
	onEdit,
	searchPlaceholder = 'Поиск...',
	searchFields = ['title', 'name', 'username', 'email'],
	loading = false,
}: DataTableProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortColumn, setSortColumn] = useState<string | null>(null)
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
	const itemsPerPage = 10

	// Сортировка данных
	const sortData = (data: any[]) => {
		if (!sortColumn) return data

		return [...data].sort((a, b) => {
			let aValue = a[sortColumn]
			let bValue = b[sortColumn]

			// Если значение undefined или null, заменяем на пустую строку
			if (aValue === undefined || aValue === null) aValue = ''
			if (bValue === undefined || bValue === null) bValue = ''

			// Сравнение в зависимости от типа
			let comparison = 0

			// Если это числа
			if (typeof aValue === 'number' && typeof bValue === 'number') {
				comparison = aValue - bValue
			}
			// Если это даты
			else if (aValue instanceof Date || bValue instanceof Date) {
				comparison = new Date(aValue).getTime() - new Date(bValue).getTime()
			}
			// Если это строки
			else {
				comparison = String(aValue).localeCompare(String(bValue))
			}

			return sortDirection === 'asc' ? comparison : -comparison
		})
	}

	// Фильтрация данных
	const filteredData = data.filter(item => {
		if (!searchQuery) return true
		const query = searchQuery.toLowerCase()
		return searchFields.some(field => {
			const value = field.split('.').reduce((obj, key) => obj?.[key], item)
			return value?.toString().toLowerCase().includes(query)
		})
	})

	// Сортировка отфильтрованных данных
	const sortedData = sortData(filteredData)

	// Пагинация
	const totalPages = Math.ceil(sortedData.length / itemsPerPage)
	const paginatedData = sortedData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	)

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
		setCurrentPage(1)
	}

	const handleSort = (columnKey: string) => {
		if (sortColumn === columnKey) {
			// Если уже сортируем по этой колонке, меняем направление
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			// Новая колонка - сортируем по возрастанию
			setSortColumn(columnKey)
			setSortDirection('asc')
		}
	}

	// Функция для рендера значения ячейки в зависимости от типа
	const renderCellValue = (item: any, column: any) => {
		// Если есть кастомный render, используем его
		if (column.render) {
			return column.render(item)
		}

		const value = item[column.key]

		// Обработка разных типов
		switch (column.type) {
			case 'image':
				if (!value) return <span className='text-gray-500'>—</span>
				return (
					<img
						src={value}
						alt={item.title || 'image'}
						className='w-12 h-16 object-cover rounded'
						onError={e => {
							;(e.target as HTMLImageElement).src = '/placeholder-image.jpg'
						}}
					/>
				)
			case 'actions':
				return null // Действия обрабатываются отдельно
			default:
				return value?.toString() || '—'
		}
	}

	// Получить иконку сортировки
	const getSortIcon = (columnKey: string) => {
		if (sortColumn !== columnKey) {
			return <span className='ml-1 text-gray-500'>↕️</span>
		}
		return sortDirection === 'asc' ? (
			<span className='ml-1 text-blue-400'>↑</span>
		) : (
			<span className='ml-1 text-blue-400'>↓</span>
		)
	}

	if (loading) {
		return <div className='text-center py-12 text-gray-500'>Загрузка...</div>
	}

	if (data.length === 0) {
		return (
			<div className='text-center py-12 text-gray-500'>
				Нет данных для отображения
			</div>
		)
	}

	return (
		<div>
			{/* Поиск */}
			<div className='mb-4'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
					<input
						type='text'
						value={searchQuery}
						onChange={handleSearch}
						placeholder={searchPlaceholder}
						className='w-full md:w-80 pl-9 pr-4 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
					/>
				</div>
			</div>

			{/* Таблица */}
			<div className='overflow-x-auto'>
				<table className='w-full'>
					<thead className='border-b border-gray-800'>
						<tr>
							{columns.map(column => (
								<th
									key={column.key}
									onClick={() =>
										column.type !== 'actions' && handleSort(column.key)
									}
									className={`text-left py-3 px-4 text-gray-400 font-medium ${
										column.type !== 'actions'
											? 'cursor-pointer hover:text-white transition-colors'
											: ''
									}`}
								>
									<div className='flex items-center'>
										{column.label}
										{column.type !== 'actions' && getSortIcon(column.key)}
									</div>
								</th>
							))}
							{(onEdit || onDelete) && (
								<th className='text-left py-3 px-4 text-gray-400 font-medium'>
									Действия
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{paginatedData.map((item, index) => (
							<tr
								key={item.id || index}
								className='border-b border-gray-800 hover:bg-custom-darker'
							>
								{columns.map(column => (
									<td key={column.key} className='py-3 px-4 text-white'>
										{column.type === 'actions'
											? null
											: renderCellValue(item, column)}
									</td>
								))}
								{(onEdit || onDelete) && (
									<td className='py-3 px-4'>
										<div className='flex gap-2'>
											{onEdit && (
												<button
													onClick={() => onEdit(item)}
													className='px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition'
												>
													Редактировать
												</button>
											)}
											{onDelete && (
												<button
													onClick={() => onDelete(item.id)}
													className='px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition'
												>
													Удалить
												</button>
											)}
										</div>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Пагинация */}
			{totalPages > 1 && (
				<div className='flex justify-center gap-2 mt-6'>
					<button
						onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
						disabled={currentPage === 1}
						className='px-3 py-1 bg-gray-800 rounded disabled:opacity-50 text-white'
					>
						Назад
					</button>
					<span className='px-3 py-1 text-gray-400'>
						{currentPage} / {totalPages}
					</span>
					<button
						onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages}
						className='px-3 py-1 bg-gray-800 rounded disabled:opacity-50 text-white'
					>
						Вперед
					</button>
				</div>
			)}

			{/* Информация о количестве */}
			<div className='text-center text-sm text-gray-500 mt-4'>
				Найдено: {sortedData.length} из {data.length}
			</div>
		</div>
	)
}
