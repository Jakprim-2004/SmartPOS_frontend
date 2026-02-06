const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getHeldBills() {
    const res = await fetch(`${BASE_URL}/held-bills`, {
        credentials: 'include'
    });
    if (!res.ok) return [];
    return res.json();
}

export async function createHeldBill(data: any) {
    const res = await fetch(`${BASE_URL}/held-bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('จัดเก็บใบเสร็จไม่สำเร็จ');
    return res.json();
}

export async function deleteHeldBill(id: number) {
    const res = await fetch(`${BASE_URL}/held-bills/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!res.ok) throw new Error('ลบใบเสร็จไม่สำเร็จ');
    return res.json();
}
