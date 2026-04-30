import { apiClient } from '../axios-instance'

export const personRolesApi = {
	getAll: () => apiClient.get('/persons-roles'),
	getById: (id: string) => apiClient.get(`/persons-roles/${id}`),
	create: (data: any) => apiClient.post('/admin/person-roles', data),
	update: (id: string, data: any) =>
		apiClient.put(`/admin/person-roles/${id}`, data),
	delete: (id: string) => apiClient.delete(`/admin/person-roles/${id}`),
}
