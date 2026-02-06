import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // ปล่อยผ่านทุกอย่าง 100% เพื่อแก้ปัญหาการ Redirect วนลูปบน Production
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
}
