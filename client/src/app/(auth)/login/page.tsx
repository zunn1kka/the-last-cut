'use client'

import { Suspense } from 'react'
import { LoginForm } from './LoginContent'

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-custom-darker'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
				</div>
			}
		>
			<LoginForm />
		</Suspense>
	)
}
