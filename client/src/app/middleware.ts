// client/middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const protectedRoutes = ['/profile', '/collections']

const adminRoutes = ['/admin']
const moderatorRoutes = ['/admin/comments', '/admin/reports']

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const token =
		request.cookies.get('accessToken')?.value ||
		localStorage.getItem('accessToken')

	const isProtectedRoute = protectedRoutes.some(route =>
		pathname.startsWith(route),
	)
	const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
	const isModeratorRoute = moderatorRoutes.some(route =>
		pathname.startsWith(route),
	)

	if (isProtectedRoute && !token) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/profile/:path*', '/collections/:path*', '/admin/:path*'],
}
