// src/shared/config/routes.ts
export const ROUTES = {
	HOME: '/',
	LOGIN: '/login',
	REGISTER: '/register',
	MOVIES: '/movies',
	MOVIE_DETAILS: (id: string) => `/movies/${id}`,
	SERIES: '/series',
	SERIES_DETAILS: (id: string) => `/series/${id}`,
	ACTORS: '/actors',
	ACTOR_DETAILS: (id: string) => `/actors/${id}`,
	PROFILE: '/profile',

	ADMIN: {
		ROOT: '/admin',
		DASHBOARD: '/admin',
		MOVIES: '/admin/movies',
		MOVIE_CREATE: '/admin/movies/create',
		MOVIE_EDIT: (id: string) => `/admin/movies/${id}`,
		SERIES: '/admin/series',
		SERIES_CREATE: '/admin/series/create',
		SERIES_EDIT: (id: string) => `/admin/series/${id}`,
		PERSONS: '/admin/persons',
		PERSON_CREATE: '/admin/persons/create',
		PERSON_EDIT: (id: string) => `/admin/persons/${id}`,
		GENRES: '/admin/genres',
		USERS: '/admin/users',
		USER_DETAILS: (id: string) => `/admin/users/${id}`,
		COMMENTS: '/admin/comments',
		REPORTS: '/admin/reports',
		//	SETTINGS: '/admin/settings',
	},
} as const

export type RouteKeys = keyof typeof ROUTES
export type AdminRouteKeys = keyof typeof ROUTES.ADMIN
