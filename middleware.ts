import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    const protectedPaths = [
        '/sale',
        '/admin',
        '/dashboard',
        '/stock',
        '/product',
        '/customer',
        '/bills',
        '/reports',
        '/reward',
        '/stock-report',
        '/points-history',
        '/customer-display'
    ];

    const isProtectedPath = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

    // 1. Redirect unauthenticated users to staff login
    // Temporarily disabled mandatory redirect to handle cross-site cookie propagation issues
    /*
    if (isProtectedPath && !token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }
    */

    // 2. Redirect authenticated users away from login page to their dashboard
    if ((pathname === '/login' || pathname === '/') && token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === 'admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
            return NextResponse.redirect(new URL('/sale', request.url));
        } catch (e) {
            // If token decode fails, just continue
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
}
