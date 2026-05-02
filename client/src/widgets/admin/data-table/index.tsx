'use client'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { DataTableProps } from './data-table-props.interface'

export function DataTable({
	data = [],
	columns,
	loading,
	onEdit,
	onDelete,
	itemsPerPage = 10,
}: DataTableProps) {
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedItems, setSelectedItems] = useState<string[]>([])

	if (loading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-custom-darker' />
			</div>
		)
	}

	if (!data || data.length === 0) {
		return (
			<div className='text-center py-12 bg-custom-darker/50 rounded-lg'>
				<p className='text-gray-400'>Нет данных для отображения</p>
			</div>
		)
	}
	const totalPages = Math.ceil(data.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

	const toggleSelectAll = () => {
		if (selectedItems.length === paginatedData.length) {
			setSelectedItems([])
		} else {
			setSelectedItems(paginatedData.map(item => item.id))
		}
	}

	const toggleSelectItem = (id: string) => {
		setSelectedItems(prev =>
			prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id],
		)
	}

	return (
		<div className='bg-custom-dark rounded-lg shadow-xl overflow-hidden border border-gray-800'>
			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-800'>
					<thead className='bg-custom-darker'>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-10'>
								<input
									type='checkbox'
									checked={selectedItems.length === paginatedData.length}
									onChange={toggleSelectAll}
									className='rounded border-gray-600 bg-custom-dark text-blue-500 focus:ring-blue-500 focus:ring-offset-custom-dark'
								/>
							</th>
							{columns.map(column => (
								<th
									key={column.key}
									className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'
								>
									{column.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody className='bg-custom-dark divide-y divide-gray-800'>
						{paginatedData.map(item => (
							<tr
								key={item.id}
								className='hover:bg-custom-darker/50 transition-colors'
							>
								<td className='px-6 py-4 whitespace-nowrap'>
									<input
										type='checkbox'
										checked={selectedItems.includes(item.id)}
										onChange={() => toggleSelectItem(item.id)}
										className='rounded border-gray-600 bg-custom-dark text-blue-500 focus:ring-blue-500 focus:ring-offset-custom-dark'
									/>
								</td>
								{columns.map(column => {
									if (column.render) {
										return (
											<td
												key={column.key}
												className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'
											>
												{column.render(item)}
											</td>
										)
									}

									if (column.type === 'image') {
										return (
											<td
												key={column.key}
												className='px-6 py-4 whitespace-nowrap'
											>
												{item[column.key] ? (
													<div className='relative w-10 h-14'>
														<Image
															src={getImageUrl(item[column.key])}
															alt={item.title || item.fullname || 'Изображение'}
															unoptimized={true}
															fill
															className='object-cover rounded'
														/>
													</div>
												) : (
													<div className='w-10 h-14 bg-custom-darker rounded flex items-center justify-center'>
														<span className='text-xs text-gray-500'>Нет</span>
													</div>
												)}
											</td>
										)
									}

									if (column.type === 'actions') {
										return (
											<td
												key={column.key}
												className='px-6 py-4 whitespace-nowrap'
											>
												<div className='flex items-center space-x-2'>
													{onEdit && (
														<Link href={onEdit(item.id)}>
															<Button variant='outline' size='sm'>
																<Edit className='w-4 h-4 text-gray-400' />
															</Button>
														</Link>
													)}
													{onDelete && (
														<Button
															variant='danger'
															size='sm'
															onClick={() => onDelete(item.id)}
														>
															<Trash2 className='w-4 h-4' />
														</Button>
													)}
												</div>
											</td>
										)
									}

									return (
										<td
											key={column.key}
											className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'
										>
											{item[column.key]}
										</td>
									)
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{totalPages > 1 && (
				<div className='bg-custom-darker px-4 py-3 flex items-center justify-between border-t border-gray-800 sm:px-6'>
					<div className='flex-1 flex justify-between sm:hidden'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
						>
							Назад
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={() =>
								setCurrentPage(prev => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
						>
							Вперед
						</Button>
					</div>
					<div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
						<div>
							<p className='text-sm text-gray-400'>
								Показано{' '}
								<span className='font-medium text-gray-300'>
									{startIndex + 1}
								</span>{' '}
								-{' '}
								<span className='font-medium text-gray-300'>
									{Math.min(startIndex + itemsPerPage, data.length)}
								</span>{' '}
								из{' '}
								<span className='font-medium text-gray-300'>{data.length}</span>{' '}
								результатов
							</p>
						</div>
						<div>
							<nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
									className='rounded-l-md border-gray-700 text-gray-400 hover:bg-custom-darker'
								>
									<ChevronLeft className='w-4 h-4' />
								</Button>
								{[...Array(totalPages)].map((_, i) => (
									<Button
										key={i + 1}
										variant={currentPage === i + 1 ? 'primary' : 'outline'}
										size='sm'
										onClick={() => setCurrentPage(i + 1)}
										className='rounded-none border-gray-700'
									>
										{i + 1}
									</Button>
								))}
								<Button
									variant='outline'
									size='sm'
									onClick={() =>
										setCurrentPage(prev => Math.min(prev + 1, totalPages))
									}
									disabled={currentPage === totalPages}
									className='rounded-r-md border-gray-700 text-gray-400 hover:bg-custom-darker'
								>
									<ChevronRight className='w-4 h-4' />
								</Button>
							</nav>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
