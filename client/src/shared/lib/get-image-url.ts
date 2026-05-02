export const getImageUrl = (url: string | null | undefined): string => {
	if (!url) return '/placeholder.jpg'

	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url
	}

	if (url.startsWith('/uploads/')) {
		return `${process.env.NEXT_PUBLIC_API_URL}${url}`
	}

	return '/placeholder.jpg'
}
