'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AdminGuardProps {
	children: React.ReactNode
	requiredRole?: 'ADMIN' | 'MODERATOR' | 'both'
}

export function AdminGuard({
	children,
	requiredRole = 'ADMIN',
}: AdminGuardProps) {
	const { user, isLoading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading) {
			if (!user) {
				router.push('/login')
			} else if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
				router.push('/')
			} else if (
				requiredRole === 'MODERATOR' &&
				user.role !== 'ADMIN' &&
				user.role !== 'MODERATOR'
			) {
				router.push('/')
			} else if (
				requiredRole === 'both' &&
				user.role !== 'ADMIN' &&
				user.role !== 'MODERATOR'
			) {
				router.push('/')
			}
		}
	}, [user, isLoading, router, requiredRole])

	if (isLoading) {
		return (
			<div className='flex justify-center py-12'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
			</div>
		)
	}

	if (!user) return null

	// Проверка доступа
	const hasAccess =
		requiredRole === 'ADMIN'
			? user.role === 'ADMIN'
			: requiredRole === 'MODERATOR'
				? user.role === 'ADMIN' || user.role === 'MODERATOR'
				: requiredRole === 'both'
					? user.role === 'ADMIN' || user.role === 'MODERATOR'
					: false

	if (!hasAccess) return null

	return <>{children}</>
}
