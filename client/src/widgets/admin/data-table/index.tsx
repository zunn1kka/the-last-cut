'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

interface Column {
	key: string
	label: string
	render?: (item: any) => React.ReactNode
}

interface DataTableProps {
	data: any[]
	columns: Column[]
	onDelete?: (id: string) => void
	onEdit?: (item: any) => void
	searchPlaceholder?: string
	searchFields?: string[]
}

export function DataTable({
	data,
	columns,
	onDelete,
	onEdit,
	searchPlaceholder = 'Поиск...',
	searchFields = ['title', 'name', 'username', 'email'],
}: DataTableProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10

	// Фильтрация данных
	const filteredData = data.filter(item => {
		if (!searchQuery) return true
		const query = searchQuery.toLowerCase()
		return searchFields.some(field => {
			const value = field.split('.').reduce((obj, key) => obj?.[key], item)
			return value?.toString().toLowerCase().includes(query)
		})
	})

	// Пагинация
	const totalPages = Math.ceil(filteredData.length / itemsPerPage)
	const paginatedData = filteredData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	)

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
		setCurrentPage(1)
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
									className='text-left py-3 px-4 text-gray-400 font-medium'
								>
									{column.label}
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
										{column.render ? column.render(item) : item[column.key]}
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
				Найдено: {filteredData.length} из {data.length}
			</div>
		</div>
	)
}
