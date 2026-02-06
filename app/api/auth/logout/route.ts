import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    // Clear the access_token cookie (same name as set by backend)
    const cookieStore = await cookies();

    // Delete access_token - this is what middleware checks
    cookieStore.delete('access_token');

    // Also clear any legacy cookie names just in case
    cookieStore.delete('token');
    cookieStore.delete('auth-token');

    return NextResponse.json({ message: 'Logged out successfully' });
}
