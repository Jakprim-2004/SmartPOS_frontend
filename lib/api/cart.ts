const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getCart(staffId?: string) {
    const url = staffId ? `${BASE_URL}/cart?staffId=${staffId}` : `${BASE_URL}/cart`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        credentials: 'include',
        headers
    });
    if (!res.ok) return null;
    return res.json();
}

export async function updateCart(data: { items: any[], customerId?: number }, staffId?: string) {
    const url = staffId ? `${BASE_URL}/cart?staffId=${staffId}` : `${BASE_URL}/cart`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('อัปเดตตะกร้าไม่สำเร็จ');
    return res.json();
}

export async function clearCart(staffId?: string) {
    const url = staffId ? `${BASE_URL}/cart?staffId=${staffId}` : `${BASE_URL}/cart`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers
    });
    if (!res.ok) throw new Error('ล้างตะกร้าไม่สำเร็จ');
    return res.json();
}
