'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import {
	WatchStatus,
	watchStatusApi,
} from '@/shared/api/watch-status/watch-status-api'
import { CheckCircle, Clock, Eye, PlayCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WatchStatusProps {
	contentId: string
	contentType?: 'MOVIE' | 'SERIES'
	onStatusChange?: (status: WatchStatus | null) => void
}

const statusOptions: {
	value: WatchStatus
	label: string
	icon: React.ReactNode
	color: string
}[] = [
	{
		value: 'planned',
		label: 'В планах',
		icon: <Clock className='w-4 h-4' />,
		color: 'text-yellow-400 border-yellow-400 hover:bg-yellow-400/10',
	},
	{
		value: 'watching',
		label: 'Смотрю',
		icon: <PlayCircle className='w-4 h-4' />,
		color: 'text-blue-400 border-blue-400 hover:bg-blue-400/10',
	},
	{
		value: 'completed',
		label: 'Просмотрено',
		icon: <CheckCircle className='w-4 h-4' />,
		color: 'text-green-400 border-green-400 hover:bg-green-400/10',
	},
	{
		value: 'dropped',
		label: 'Брошено',
		icon: <XCircle className='w-4 h-4' />,
		color: 'text-red-400 border-red-400 hover:bg-red-400/10',
	},
]

export function WatchStatus({
	contentId,
	contentType,
	onStatusChange,
}: WatchStatusProps) {
	const { user } = useAuth()
	const [currentStatus, setCurrentStatus] = useState<WatchStatus | null>(null)
	const [loading, setLoading] = useState(false)
	const [showDropdown, setShowDropdown] = useState(false)

	useEffect(() => {
		if (user) {
			fetchStatus()
		}
	}, [user, contentId])

	const fetchStatus = async () => {
		try {
			const response = await watchStatusApi.getStatus(contentId)
			setCurrentStatus(response.data.status)
		} catch (error) {
			setCurrentStatus(null)
		}
	}

	const handleStatusChange = async (status: WatchStatus) => {
		if (!user) {
			window.location.href = '/login'
			return
		}

		setLoading(true)
		try {
			if (currentStatus === status) {
				// Если выбран тот же статус - удаляем
				await watchStatusApi.deleteStatus(contentId)
				setCurrentStatus(null)
				onStatusChange?.(null)
			} else {
				// Иначе обновляем статус
				await watchStatusApi.setStatus(contentId, status)
				setCurrentStatus(status)
				onStatusChange?.(status)
			}
		} catch (error) {
			console.error('Failed to change watch status:', error)
		} finally {
			setLoading(false)
			setShowDropdown(false)
		}
	}

	if (!user) {
		return (
			<button
				onClick={() => (window.location.href = '/login')}
				className='px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all duration-300 flex items-center gap-2'
			>
				<Eye className='w-4 h-4' />
				<span className='text-sm'>Войдите, чтобы отметить статус</span>
			</button>
		)
	}

	const currentStatusOption = statusOptions.find(
		opt => opt.value === currentStatus,
	)

	return (
		<div className='relative'>
			<button
				onClick={() => setShowDropdown(!showDropdown)}
				disabled={loading}
				className={`px-4 py-2 rounded-lg border transition-all duration-300 flex items-center gap-2 ${
					currentStatusOption
						? `${currentStatusOption.color} bg-opacity-10`
						: 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400'
				}`}
			>
				{currentStatusOption ? (
					<>
						{currentStatusOption.icon}
						<span className='text-sm'>{currentStatusOption.label}</span>
					</>
				) : (
					<>
						<Eye className='w-4 h-4' />
						<span className='text-sm'>Статус просмотра</span>
					</>
				)}
			</button>

			{showDropdown && (
				<>
					<div
						className='fixed inset-0 z-10'
						onClick={() => setShowDropdown(false)}
					/>
					<div className='absolute top-full left-0 mt-2 w-48 bg-custom-dark rounded-xl border border-gray-700 shadow-xl z-20 overflow-hidden'>
						{statusOptions.map(option => (
							<button
								key={option.value}
								onClick={() => handleStatusChange(option.value)}
								className={`w-full px-4 py-2 flex items-center gap-2 transition-colors ${
									currentStatus === option.value
										? `${option.color} bg-opacity-10`
										: 'text-gray-400 hover:bg-custom-darker hover:text-white'
								}`}
							>
								{option.icon}
								<span className='text-sm'>{option.label}</span>
								{currentStatus === option.value && (
									<CheckCircle className='w-4 h-4 ml-auto text-green-400' />
								)}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	)
}
