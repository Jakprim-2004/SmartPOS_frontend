const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://smartpos-backend-7ee9.onrender.com/api';
const BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
import { Product } from '@/lib/types';

function getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

export async function getProducts(params?: {
    search?: string;
    categoryId?: number;
    page?: number;
    limit?: number;
    offset?: number;
    shopId?: string;
    stockStatus?: string;
}): Promise<{ data: Product[], total: number, limit: number, offset: number, nextPage: number | null }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.shopId) queryParams.append('shopId', params.shopId);
    if (params?.stockStatus) queryParams.append('stockStatus', params.stockStatus);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

    // getHeaders already includes token
    const headers = getHeaders();

    const res = await fetch(url, {
        credentials: 'include',
        headers
    });
    if (!res.ok) throw new Error('ดึงสินค้าไม่สำเร็จ');
    return res.json();
}

export async function createProduct(data: Partial<Product>) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'สร้างสินค้าไม่สำเร็จ');
    }
    return res.json();
}

export async function updateProduct(id: number, data: Partial<Product>) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'อัปเดตสินค้าไม่สำเร็จ');
    }
    return res.json();
}

export async function deleteProduct(id: number) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    });
    if (!res.ok) throw new Error('ลบสินค้าไม่สำเร็จ');
    return res.json();
}

// Image Management
export async function getProductImages(productId: number) {
    const res = await fetch(`${BASE_URL}/products/${productId}/images`);
    if (!res.ok) throw new Error('ดึงรูปสินค้าไม่สำเร็จ');
    return res.json();
}

export async function addProductImage(productId: number, url: string, isMain: boolean = false) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/products/${productId}/images`, {
        method: 'POST',
        headers, // Includes Auth and Content-Type
        body: JSON.stringify({ url, isMain }),
    });
    if (!res.ok) throw new Error('เพิ่มรูปสินค้าไม่สำเร็จ');
    return res.json();
}

export async function removeProductImage(imageId: number) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/products/images/${imageId}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) throw new Error('ลบรูปสินค้าไม่สำเร็จ');
    return res.json();
}

export async function setMainProductImage(productId: number, imageId: number) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/products/${productId}/images/${imageId}/main`, {
        method: 'PATCH',
        headers,
    });
    if (!res.ok) throw new Error('ตั้งรูปสินค้าหลักไม่สำเร็จ');
    return res.json();
}

export async function addProductStock(id: number, qty: number) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/products/${id}/stock`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ qty }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add stock');
    }
    return res.json();
}

export async function getAllStockTransactions() {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/products/stock/transactions`, {
        headers,
        credentials: 'include'
    });
    if (!res.ok) return [];
    return res.json();
}
