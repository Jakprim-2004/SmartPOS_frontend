const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Category {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    created_at: string;
}

export async function getCategories(params?: { shopId?: string; page?: number; limit?: number } | string): Promise<any> {
    let url = `${BASE_URL}/categories`;
    const queryParams = new URLSearchParams();

    if (typeof params === 'string') {
        queryParams.append('shopId', params);
    } else if (typeof params === 'object') {
        if (params.shopId) queryParams.append('shopId', params.shopId);

        // Convert page to offset for backend
        if (params.page && params.limit) {
            const offset = (params.page - 1) * params.limit;
            queryParams.append('offset', offset.toString());
            queryParams.append('limit', params.limit.toString());
        } else if (params.limit) {
            queryParams.append('limit', params.limit.toString());
        }
    }

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;

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
