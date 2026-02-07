
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Promotion {
    id: number;
    title: string;
    description?: string;
    image_url?: string;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    discount_type?: 'percentage' | 'fixed_amount';
    discount_value?: number;
    created_at?: string;
}

export async function getPromotions(params?: {
    shopId?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}): Promise<{ total: number, limit: number, offset: number, nextPage: number | null, data: Promotion[] }> {
    const queryParams = new URLSearchParams();
    if (params?.shopId) queryParams.append('shopId', params.shopId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/promotions${queryString ? `?${queryString}` : ''}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        credentials: 'include',
        headers
    });
    if (!res.ok) throw new Error('ดึงโปรโมชั่นไม่สำเร็จ');
    return res.json();
}

export async function getActivePromotions(shopId?: string): Promise<Promotion[]> {
    const url = shopId
        ? `${BASE_URL}/promotions/active?shopId=${shopId}`
        : `${BASE_URL}/promotions/active`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        credentials: 'include',
        headers
    });
    if (!res.ok) throw new Error('ดึงโปรโมชั่นไม่สำเร็จ');
    return res.json();
}

export async function createPromotion(data: Partial<Promotion>): Promise<Promotion> {
    const res = await fetch(`${BASE_URL}/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('สร้างโปรโมชั่นไม่สำเร็จ');
    return res.json();
}

export async function updatePromotion(id: number, data: Partial<Promotion>): Promise<Promotion> {
    const res = await fetch(`${BASE_URL}/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('อัปเดตโปรโมชั่นไม่สำเร็จ');
    return res.json();
}

export async function deletePromotion(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/promotions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('ลบโปรโมชั่นไม่สำเร็จ');
}

// Promotion Products APIs
export async function getPromotionProducts(promotionId: number): Promise<number[]> {
    const res = await fetch(`${BASE_URL}/promotions/${promotionId}/products`, { credentials: 'include' });
    if (!res.ok) throw new Error('ดึงสินค้าโปรโมชั่นไม่สำเร็จ');
    return res.json();
}

export async function setPromotionProducts(promotionId: number, productIds: number[]): Promise<void> {
    const res = await fetch(`${BASE_URL}/promotions/${promotionId}/products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ product_ids: productIds }),
    });
    if (!res.ok) throw new Error('อัปเดตสินค้าโปรโมชั่นไม่สำเร็จ');
}

export interface ProductPromotion {
    id: number;
    title: string;
    description?: string;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    start_date?: string;
    end_date?: string;
}

export async function getPromotionsByProduct(productId: number): Promise<ProductPromotion[]> {
    const res = await fetch(`${BASE_URL}/promotions/by-product/${productId}`);
    if (!res.ok) throw new Error('ดึงโปรโมชั่นสินค้าไม่สำเร็จ');
    return res.json();
}
