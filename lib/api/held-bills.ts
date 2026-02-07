const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getHeldBills() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/held-bills`, {
        credentials: 'include',
        headers
    });
    if (!res.ok) return [];
    return res.json();
}

export async function createHeldBill(data: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/held-bills`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('จัดเก็บใบเสร็จไม่สำเร็จ');
    return res.json();
}

export async function deleteHeldBill(id: number) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/held-bills/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
    });
    if (!res.ok) throw new Error('ลบใบเสร็จไม่สำเร็จ');
    return res.json();
}
