const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Staff {
    id: number;
    username: string;
    role: string;
    shop_name: string;
    name: string;
    created_at: string;
}

export async function getStaffs(): Promise<any> {
    const res = await fetch(`${API_URL}/staff`, {
        credentials: 'include'
    });
    if (!res.ok) throw new Error('ดึงบุคลากรไม่สำเร็จ');
    return res.json();
}

export async function createStaff(data: any) {
    const res = await fetch(`${API_URL}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'สร้างบุคลากรไม่สำเร็จ');
    }
    return res.json();
}

export async function updateStaff(id: number, data: any) {
    const res = await fetch(`${API_URL}/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'อัปเดตบุคลากรไม่สำเร็จ');
    }
    return res.json();
}

export async function deleteStaff(id: number) {
    const res = await fetch(`${API_URL}/staff/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('ลบบุคลากรไม่สำเร็จ');
    return res.json();
}
