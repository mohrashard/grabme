import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    if (
      pathname.startsWith('/admin') &&
      pathname !== '/admin/login'
    ) {
      const token = request.cookies.get('grabme_admin_token')

      if (!token?.value) {
        return NextResponse.redirect(
          new URL('/admin/login', request.url)
        )
      }
    }

    return NextResponse.next()

  } catch (error) {
    // Any error — malformed cookie, unexpected input —
    // must fail CLOSED, never fail open
    // If this is an admin route, redirect to login
    const { pathname } = request.nextUrl
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(
        new URL('/admin/login', request.url)
      )
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
