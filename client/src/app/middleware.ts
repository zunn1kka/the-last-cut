// client/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	// Используем refreshToken (он в cookies от бэкенда)
	const refreshToken = request.cookies.get('refreshToken')?.value
	const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
	const isAuthRoute =
		request.nextUrl.pathname.startsWith('/login') ||
		request.nextUrl.pathname.startsWith('/register')

	// Пропускаем статические файлы и API
	if (
		request.nextUrl.pathname.startsWith('/_next') ||
		request.nextUrl.pathname.startsWith('/api')
	) {
		return NextResponse.next()
	}

	// Для админ-маршрутов проверяем наличие refreshToken
	// Полная проверка роли будет на клиенте
	if (isAdminRoute && !refreshToken) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	if (isAuthRoute && refreshToken) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
