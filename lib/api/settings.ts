const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface StoreSettings {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    taxId?: string;
    logoUrl?: string;
    promptpayNumber?: string;
    promptpayName?: string;
}

export async function getSettings(): Promise<StoreSettings | null> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/settings`, {
        credentials: 'include',
        headers
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export async function updateSettings(data: Partial<StoreSettings>) {
    const res = await fetch(`${BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('อัปเดตตั้งค่าไม่สำเร็จ');
    }

    return res.json();
}
