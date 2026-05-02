export const formatDate = (dateString: string | null | undefined): string => {
	if (!dateString) return '—'

	try {
		const date = new Date(dateString)

		if (isNaN(date.getTime())) {
			const parts = dateString.match(
				/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
			)
			if (parts) {
				const [, year, month, day, hour, minute, second] = parts
				return new Date(
					parseInt(year),
					parseInt(month) - 1,
					parseInt(day),
					parseInt(hour),
					parseInt(minute),
					parseInt(second),
				).toLocaleDateString('ru-RU', {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})
			}
			return '—'
		}

		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	} catch (error) {
		console.error('Date formatting error:', error)
		return '—'
	}
}

// Только дата (без времени)
export const formatDateOnly = (
	dateString: string | null | undefined,
): string => {
	if (!dateString) return '—'

	try {
		const date = new Date(dateString)
		if (isNaN(date.getTime())) {
			const parts = dateString.match(/(\d{4})-(\d{2})-(\d{2})/)
			if (parts) {
				const [, year, month, day] = parts
				return `${day}.${month}.${year}`
			}
			return '—'
		}
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	} catch {
		return '—'
	}
}

// Для отображения относительного времени (например, "5 минут назад")
export const formatRelativeTime = (
	dateString: string | null | undefined,
): string => {
	if (!dateString) return '—'

	try {
		let date: Date
		const parts = dateString.match(
			/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
		)
		if (parts) {
			const [, year, month, day, hour, minute, second] = parts
			date = new Date(
				parseInt(year),
				parseInt(month) - 1,
				parseInt(day),
				parseInt(hour),
				parseInt(minute),
				parseInt(second),
			)
		} else {
			date = new Date(dateString)
		}

		if (isNaN(date.getTime())) return '—'

		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffMins = Math.floor(diffMs / 60000)
		const diffHours = Math.floor(diffMs / 3600000)
		const diffDays = Math.floor(diffMs / 86400000)

		if (diffMins < 1) return 'только что'
		if (diffMins < 60) return `${diffMins} мин назад`
		if (diffHours < 24) return `${diffHours} ч назад`
		if (diffDays === 1) return 'вчера'
		if (diffDays < 7) return `${diffDays} дня назад`

		return formatDateOnly(dateString)
	} catch {
		return '—'
	}
}
