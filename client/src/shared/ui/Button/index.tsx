'use client'

import { cn } from '@/shared/lib/helpers'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode
	variant?: 'primary' | 'outline' | 'ghost' | 'danger'
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

export default function Button({
	children,
	variant = 'primary',
	size = 'md',
	className,
	...props
}: ButtonProps) {
	const variants = {
		primary:
			'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25',
		outline:
			'border border-gray-600 text-gray-300 hover:bg-custom-darker hover:text-white',
		ghost: 'text-gray-400 hover:text-white hover:bg-custom-darker',
		danger: 'bg-red-600 hover:bg-red-700 text-white',
	}

	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg',
	}

	return (
		<button
			className={cn(
				'rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
				variants[variant],
				sizes[size],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	)
}
