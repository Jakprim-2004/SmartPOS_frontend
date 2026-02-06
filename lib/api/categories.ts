const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Category {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    created_at: string;
}

export async function getCategories(shopId?: string): Promise<Category[]> {
    const url = shopId ? `${BASE_URL}/categories?shopId=${shopId}` : `${BASE_URL}/categories`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        credentials: 'include',
        headers
    });
    if (!res.ok) return [];
    return res.json();
}

export async function createCategory(data: Partial<Category>) {
    const res = await fetch(`${BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('สร้างหมวดหมู่ไม่สำเร็จ');
    return res.json();
}

export async function updateCategory(id: number, data: Partial<Category>) {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update');
    return res.json();
}

export async function deleteCategory(id: number) {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('ลบหมวดหมู่ไม่สำเร็จ');
    return res.json();
}
