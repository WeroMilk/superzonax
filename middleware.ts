import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}

