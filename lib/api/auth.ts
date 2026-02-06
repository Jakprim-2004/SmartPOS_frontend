
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface LoginResponse {
    message?: string;
    access_token?: string; // Added access_token
    user: {
        id: number;
        username: string;
        role: string;
    };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // credentails: 'include' is not strictly needed for the login request itself to set cookie,
        // but good practice. The set-cookie header will be handled by browser.
        credentials: 'include',
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('ล็อกอินไม่สำเร็จ');
    }

    // Response might not contain access_token anymore in body, or maybe it does for redundancy.
    // Our backend sends { user, message }.
    // We adjust the interface locally or assume backend still sends access_token if we kept it?
    // In auth.controller.ts, I just returned { user: result.user, message: ... }.
    // So access_token is NOT in body.

    return response.json();
}

export async function logout() {
    // First, call Next.js API route to clear cookies on the frontend domain
    await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
    });

    // Also notify the backend (optional, for any server-side session cleanup)
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        // Backend logout is optional - cookies are already cleared
        console.warn('ออกจากระบบไม่สำเร็จ:', error);
    }
}

export async function register(username: string, pass: string, shopName?: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass, shopName }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'ลงทะเบียนไม่สำเร็จ');
    }

    return res.json();
}
