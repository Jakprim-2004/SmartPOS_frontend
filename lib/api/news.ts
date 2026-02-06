const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface NewsItem {
    id: number;
    title: string;
    content: string;
    image_url?: string;
    imageUrl?: string;
    published?: boolean;
    isPublished?: boolean;
    created_at: string;
    shop_id?: string;
}

function getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

export async function getNews(
    shopId?: string,
    params?: { page?: number; limit?: number }
): Promise<{ data: NewsItem[]; total: number }> {
    const limit = params?.limit || 10;
    const page = params?.page || 1;
    const offset = (page - 1) * limit;

    let url = `${BASE_URL}/news?limit=${limit}&offset=${offset}`;
    if (shopId) url += `&shopId=${shopId}`;

    const headers = getHeaders();
    const res = await fetch(url, { headers, credentials: 'include' });

    if (!res.ok) {
        return { data: [], total: 0 };
    }

    const result = await res.json();
    if (Array.isArray(result)) {
        return { data: result, total: result.length };
    } else {
        return { data: result.data || [], total: result.total || 0 };
    }
}

export async function getAllNews(shopId?: string): Promise<NewsItem[]> {
    const url = shopId ? `${BASE_URL}/news?shopId=${shopId}&limit=1000` : `${BASE_URL}/news?limit=1000`;
    const headers = getHeaders();
    const res = await fetch(url, { headers, credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch news');
    const result = await res.json();
    return Array.isArray(result) ? result : (result.data || []);
}

export async function createNews(data: Partial<NewsItem>) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/news`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('สร้างข่าวใหม่ไม่สำเร็จ');
    return res.json();
}

export async function updateNews(id: number, data: Partial<NewsItem>) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/news/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('อัปเดตข่าวไม่สำเร็จ');
    return res.json();
}

export async function deleteNews(id: number) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/news/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete news');
    return res.json();
}
