'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import { DataTable } from '@/widgets/admin/data-table'
import { Shield, Users } from 'lucide-react'
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

export default function AdminUsersPage() {
	const { user: currentUser } = useAuth()
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchUsers()
	}, [])

	const fetchUsers = async () => {
		try {
			const response = await adminApi.getUsers()
			setUsers(response.data || [])
		} catch (error) {
			console.error('Failed to fetch users:', error)
		} finally {
			setLoading(false)
		}
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

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU')
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
			return 'px-2 py-1 rounded text-sm font-medium bg-gray-100 text-gray-500 cursor-not-allowed'
		}
		switch (role) {
			case 'ADMIN':
				return 'px-2 py-1 rounded text-sm font-medium bg-red-100 text-red-800 cursor-pointer'
			case 'MODERATOR':
				return 'px-2 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800 cursor-pointer'
			default:
				return 'px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800 cursor-pointer'
		}
	}

	const columns = [
		{ key: 'avatarUrl', label: 'Аватар', type: 'image' },
		{ key: 'username', label: 'Имя пользователя' },
		{
			key: 'role',
			label: 'Роль',
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
								className='px-3 py-1 text-sm bg-gray-400 cursor-not-allowed text-white rounded transition'
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

				<DataTable data={users} columns={columns} loading={loading} />
			</div>
		</AdminGuard>
	)
}
