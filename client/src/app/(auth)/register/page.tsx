// app/register/page.tsx
'use client'

import { Suspense } from 'react'
import RegisterContent from './RegisterContent'

export default function RegisterPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-custom-darker'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
				</div>
			}
		>
			<RegisterContent />
		</Suspense>
	)
}
