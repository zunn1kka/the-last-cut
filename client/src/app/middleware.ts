import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	const token = request.cookies.get('accessToken')?.value
	const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
	const isAuthRoute =
		request.nextUrl.pathname.startsWith('/login') ||
		request.nextUrl.pathname.startsWith('/register')

	if (isAdminRoute && !token) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	if (isAuthRoute && token) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return NextResponse.next()
}
export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
