import { ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'danger'
	size?: 'sm' | 'md' | 'lg'
	isLoading?: boolean
}
