'use client'

import { adminApi } from '@/shared/api/admin/admin-api'
import { AdminGuard } from '@/shared/components/admin/AdminGuard'
import { DataTable } from '@/widgets/admin/data-table'
import { CheckCircle, Users, XCircle } from 'lucide-react'
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
		if (confirm(`Изменить роль пользователя на "${newRole}"?`)) {
			try {
				await adminApi.updateUserRole(id, newRole)
				setUsers(
					users.map(u => (u.id === id ? { ...u, role: newRole as any } : u)),
				)
			} catch (error) {
				console.error('Failed to update role:', error)
			}
		}
	}

	const handleDelete = async (id: string) => {
		if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
			try {
				await adminApi.deleteUser(id)
				setUsers(users.filter(u => u.id !== id))
			} catch (error) {
				console.error('Failed to delete user:', error)
			}
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU')
	}

	const columns = [
		{ key: 'avatarUrl', label: 'Аватар', type: 'image' },
		{ key: 'username', label: 'Имя пользователя' },
		{ key: 'email', label: 'Email' },
		{
			key: 'role',
			label: 'Роль',
			render: (item: User) => {
				const roles = ['USER', 'MODERATOR', 'ADMIN']
				return (
					<select
						value={item.role}
						onChange={e => handleRoleChange(item.id, e.target.value)}
						className={`px-2 py-1 rounded text-sm font-medium ${
							item.role === 'ADMIN'
								? 'bg-red-100 text-red-800'
								: item.role === 'MODERATOR'
									? 'bg-yellow-100 text-yellow-800'
									: 'bg-green-100 text-green-800'
						}`}
					>
						{roles.map(role => (
							<option key={role} value={role}>
								{role}
							</option>
						))}
					</select>
				)
			},
		},
		{
			key: 'emailVerified',
			label: 'Email',
			render: (item: User) => (
				<span
					className={`flex items-center ${item.emailVerified ? 'text-green-600' : 'text-red-600'}`}
				>
					{item.emailVerified ? (
						<>
							<CheckCircle className='w-4 h-4 mr-1' /> Подтвержден
						</>
					) : (
						<>
							<XCircle className='w-4 h-4 mr-1' /> Не подтвержден
						</>
					)}
				</span>
			),
		},
		{
			key: 'createdAt',
			label: 'Дата регистрации',
			render: (item: User) => formatDate(item.createdAt),
		},
		{ key: 'actions', label: 'Действия', type: 'actions' },
	]

	return (
		<AdminGuard requiredRole='ADMIN'>
			<div>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold flex items-center'>
						<Users className='w-8 h-8 mr-3' />
						Управление пользователями
					</h1>
				</div>

				<DataTable
					data={users}
					columns={columns}
					loading={loading}
					onEdit={id => `/admin/users/${id}`}
					onDelete={handleDelete}
				/>
			</div>
		</AdminGuard>
	)
}
