// client/middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const protectedRoutes = ['/profile', '/collections']

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	const accessToken = request.cookies.get('accessToken')?.value
	const refreshToken = request.cookies.get('refreshToken')?.value
	const isAuthenticated = !!accessToken || !!refreshToken

	console.log('🔍 [Middleware]', {
		pathname,
		isAuthenticated,
		hasAccessToken: !!accessToken,
		hasRefreshToken: !!refreshToken,
	})

	// ✅ Главная страница - доступна всем, НЕ редиректим
	if (pathname === '/') {
		console.log('🏠 Главная страница - пропускаем')
		return NextResponse.next()
	}

	const isProtectedRoute = protectedRoutes.some(route =>
		pathname.startsWith(route),
	)

	if (isProtectedRoute && !isAuthenticated) {
		console.log('🔒 Редирект на логин:', pathname)
		return NextResponse.redirect(new URL('/login', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
