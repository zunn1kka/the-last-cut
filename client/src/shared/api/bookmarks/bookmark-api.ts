import { apiClient } from '../axios-instance'

export const bookmarksApi = {
	getBookmarks: () => apiClient.get('/bookmarks'),

	addBookmark: (contentId: string) => apiClient.post(`/bookmarks/${contentId}`),

	removeBookmark: (contentId: string) =>
		apiClient.delete(`/bookmarks/${contentId}`),

	checkBookmark: (contentId: string) =>
		apiClient.get(`/bookmarks/${contentId}/check`),
}
