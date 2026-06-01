'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import { DataTable } from '@/widgets/admin/data-table'
import { Filter, Shield, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface User {
	id: string
	username: string
	email: string
	role: 'ADMIN' | 'USER' | 'MODERATOR'
	emailVerified: boolean
	avatarUrl?: string
	createdAt: string
}

interface Filters {
	username: string
	email: string
	role: string
	emailVerified: string
}

export default function AdminUsersPage() {
	const { user: currentUser } = useAuth()
	const [users, setUsers] = useState<User[]>([])
	const [filteredUsers, setFilteredUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [showFilters, setShowFilters] = useState(false)
	const [filters, setFilters] = useState<Filters>({
		username: '',
		email: '',
		role: '',
		emailVerified: '',
	})

	useEffect(() => {
		fetchUsers()
	}, [])

	const fetchUsers = async () => {
		try {
			const response = await adminApi.getUsers()
			const usersData = response.data || []
			setUsers(usersData)
			setFilteredUsers(usersData)
		} catch (error) {
			console.error('Failed to fetch users:', error)
			setUsers([])
			setFilteredUsers([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let result = [...users]

		if (filters.username.trim()) {
			const query = filters.username.toLowerCase()
			result = result.filter(user =>
				user.username.toLowerCase().includes(query),
			)
		}

		if (filters.email.trim()) {
			const query = filters.email.toLowerCase()
			result = result.filter(user => user.email.toLowerCase().includes(query))
		}

		if (filters.role) {
			result = result.filter(user => user.role === filters.role)
		}

		if (filters.emailVerified === 'verified') {
			result = result.filter(user => user.emailVerified === true)
		} else if (filters.emailVerified === 'notVerified') {
			result = result.filter(user => user.emailVerified === false)
		}

		setFilteredUsers(result)
	}, [users, filters])

	const handleFilterChange = (key: keyof Filters, value: string) => {
		setFilters(prev => ({ ...prev, [key]: value }))
	}

	const resetFilters = () => {
		setFilters({
			username: '',
			email: '',
			role: '',
			emailVerified: '',
		})
	}

	const handleRoleChange = async (id: string, newRole: string) => {
		const targetUser = users.find(u => u.id === id)

		// Проверка: нельзя менять роль другого администратора
		if (targetUser?.role === 'ADMIN' && targetUser.id !== currentUser?.id) {
			alert('❌ Нельзя изменять роль другого администратора')
			return
		}

		// Проверка: нельзя понижать самого себя
		if (id === currentUser?.id && newRole !== 'ADMIN') {
			alert('❌ Нельзя понизить свою роль')
			return
		}

		if (
			confirm(
				`Изменить роль пользователя "${targetUser?.username}" на "${newRole}"?`,
			)
		) {
			try {
				await adminApi.updateUserRole(id, newRole)
				setUsers(
					users.map(u => (u.id === id ? { ...u, role: newRole as any } : u)),
				)
				alert(`✅ Роль пользователя успешно изменена на "${newRole}"`)
			} catch (error: any) {
				console.error('Failed to update role:', error)
				alert(error.response?.data?.message || '❌ Ошибка при изменении роли')
			}
		}
	}

	const handleDelete = async (id: string) => {
		const targetUser = users.find(u => u.id === id)

		// Проверка: нельзя удалять другого администратора
		if (targetUser?.role === 'ADMIN' && targetUser.id !== currentUser?.id) {
			alert('❌ Нельзя удалять другого администратора')
			return
		}

		// Проверка: нельзя удалять самого себя
		if (id === currentUser?.id) {
			alert('❌ Нельзя удалить самого себя')
			return
		}

		if (
			confirm(
				`Вы уверены, что хотите удалить пользователя "${targetUser?.username}"?`,
			)
		) {
			try {
				await adminApi.deleteUser(id)
				setUsers(users.filter(u => u.id !== id))
				alert('✅ Пользователь успешно удален')
			} catch (error: any) {
				console.error('Failed to delete user:', error)
				alert(
					error.response?.data?.message ||
						'❌ Ошибка при удалении пользователя',
				)
			}
		}
	}

	// Проверка, может ли текущий пользователь изменять роль
	const canChangeRole = (user: User) => {
		// Нельзя менять роль другого администратора
		if (user.role === 'ADMIN' && user.id !== currentUser?.id) {
			return false
		}
		// Нельзя менять свою роль
		if (user.id === currentUser?.id) {
			return false
		}
		return true
	}

	// Проверка, может ли текущий пользователь удалять
	const canDelete = (user: User) => {
		// Нельзя удалять другого администратора
		if (user.role === 'ADMIN' && user.id !== currentUser?.id) {
			return false
		}
		// Нельзя удалять самого себя
		if (user.id === currentUser?.id) {
			return false
		}
		return true
	}

	// Получить стиль для select в зависимости от роли
	const getRoleSelectStyle = (role: string, isDisabled: boolean) => {
		if (isDisabled) {
			return 'px-2 py-1 rounded text-sm font-medium bg-gray-500 text-gray-300 cursor-not-allowed'
		}
		switch (role) {
			case 'ADMIN':
				return 'px-2 py-1 rounded text-sm font-medium bg-red-500/20 text-red-400 cursor-pointer border border-red-500/50'
			case 'MODERATOR':
				return 'px-2 py-1 rounded text-sm font-medium bg-yellow-500/20 text-yellow-400 cursor-pointer border border-yellow-500/50'
			default:
				return 'px-2 py-1 rounded text-sm font-medium bg-green-500/20 text-green-400 cursor-pointer border border-green-500/50'
		}
	}

	const getRoleBadge = (role: string) => {
		switch (role) {
			case 'ADMIN':
				return 'bg-red-500/20 text-red-400 border border-red-500/50'
			case 'MODERATOR':
				return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
			default:
				return 'bg-green-500/20 text-green-400 border border-green-500/50'
		}
	}

	const columns = [
		{ key: 'avatarUrl', label: 'Аватар', type: 'image', sortable: true },
		{ key: 'username', label: 'Имя пользователя', sortable: true },
		{ key: 'email', label: 'Email', sortable: true },
		{
			key: 'role',
			label: 'Роль',
			sortable: true,
			render: (item: User) => {
				const roles = ['USER', 'MODERATOR', 'ADMIN']
				const isDisabled = !canChangeRole(item)

				return (
					<div className='flex items-center gap-2'>
						<select
							value={item.role}
							onChange={e => handleRoleChange(item.id, e.target.value)}
							disabled={isDisabled}
							className={getRoleSelectStyle(item.role, isDisabled)}
							title={
								isDisabled ? 'Нельзя изменить роль этого пользователя' : ''
							}
						>
							{roles.map(role => (
								<option key={role} value={role}>
									{role === 'ADMIN'
										? 'Администратор'
										: role === 'MODERATOR'
											? 'Модератор'
											: 'Пользователь'}
								</option>
							))}
						</select>
						{item.role === 'ADMIN' && item.id !== currentUser?.id && (
							<Shield
								className='w-4 h-4 text-red-500'
								title='Защищенный администратор'
							/>
						)}
					</div>
				)
			},
		},

		{
			key: 'actions',
			label: 'Действия',
			render: (item: User) => {
				const canDeleteUser = canDelete(item)

				return (
					<div className='flex gap-2'>
						{canDeleteUser ? (
							<button
								onClick={() => handleDelete(item.id)}
								className='px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition'
							>
								Удалить
							</button>
						) : (
							<button
								disabled
								className='px-3 py-1 text-sm bg-gray-600 cursor-not-allowed text-gray-300 rounded transition'
								title={
									item.role === 'ADMIN' && item.id !== currentUser?.id
										? 'Нельзя удалить другого администратора'
										: 'Нельзя удалить самого себя'
								}
							>
								Удалить
							</button>
						)}
					</div>
				)
			},
		},
	]

	const roleOptions = [
		{ value: '', label: 'Все роли' },
		{ value: 'ADMIN', label: 'Администраторы' },
		{ value: 'MODERATOR', label: 'Модераторы' },
		{ value: 'USER', label: 'Пользователи' },
	]

	return (
		<AdminGuard requiredRole='ADMIN'>
			<div>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold flex items-center'>
						<Users className='w-8 h-8 mr-3' />
						Управление пользователями
					</h1>
					<div className='text-sm text-gray-500'>
						Всего пользователей: {users.length}
					</div>
				</div>

				{/* Панель фильтрации */}
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-4 mb-6'>
					<div className='flex items-center justify-between mb-4'>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className='flex items-center gap-2 text-gray-300 hover:text-white transition-colors'
						>
							<Filter className='w-5 h-5' />
							<span>Фильтры</span>
							{(filters.username || filters.email || filters.role) && (
								<span className='ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full'>
									Активны
								</span>
							)}
						</button>
						{(filters.username || filters.email || filters.role) && (
							<button
								onClick={resetFilters}
								className='flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors'
							>
								<X className='w-4 h-4' />
								Сбросить все
							</button>
						)}
					</div>

					{showFilters && (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-800'>
							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Имя пользователя
								</label>
								<input
									type='text'
									value={filters.username}
									onChange={e => handleFilterChange('username', e.target.value)}
									placeholder='Поиск по имени...'
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Email
								</label>
								<input
									type='email'
									value={filters.email}
									onChange={e => handleFilterChange('email', e.target.value)}
									placeholder='Поиск по email...'
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Роль
								</label>
								<select
									value={filters.role}
									onChange={e => handleFilterChange('role', e.target.value)}
									className='w-full px-3 py-2 bg-custom-darker border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
								>
									{roleOptions.map(option => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						</div>
					)}

					{(filters.username ||
						filters.email ||
						filters.role ||
						filters.emailVerified) && (
						<div className='mt-4 text-sm text-gray-400'>
							Найдено: {filteredUsers.length} из {users.length} пользователей
						</div>
					)}
				</div>

				<DataTable
					data={filteredUsers}
					columns={columns}
					loading={loading}
					searchFields={['username', 'email']}
				/>
			</div>
		</AdminGuard>
	)
}
