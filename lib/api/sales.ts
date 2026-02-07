const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://smartpos-backend-7ee9.onrender.com/api';
const BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export async function getSales(params?: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    customerId?: number;
}): Promise<{ data: any[], total: number, limit: number, offset: number, nextPage: number | null }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.customerId) queryParams.append('customerId', params.customerId.toString());

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/sales${queryString ? `?${queryString}` : ''}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        credentials: 'include',
        headers
    });
    if (!res.ok) return { data: [], total: 0, limit: 10, offset: 0, nextPage: null };
    return res.json();
}

export async function getSalesByCustomer(customerId: number): Promise<{ data: any[], total: number }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/sales/customer/${customerId}`, {
        credentials: 'include',
        headers
    });
    if (!res.ok) return { data: [], total: 0 };
    return res.json();
}

export async function getDashboardStats(viewType?: string, year?: number, month?: number) {
    let url = `${BASE_URL}/sales/dashboard`;
    const params = new URLSearchParams();
    if (viewType) params.append('viewType', viewType);
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        credentials: 'include',
        headers
    });
    if (!res.ok) throw new Error('ดึงข้อมูลขายไม่สำเร็จ');
    return res.json();
}

export async function getProductSalesStats(params?: {
    dateRange?: string;
    limit?: number;
    offset?: number;
}): Promise<{
    data: Array<{
        id: number;
        barcode: string;
        name: string;
        soldQty: number;
        totalAmount: number;
        netProfit: number;
    }>;
    total: number;
    limit: number;
    offset: number;
    nextPage: number | null;
}> {
    const queryParams = new URLSearchParams();
    if (params?.dateRange) queryParams.append('dateRange', params.dateRange);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/sales/product-stats${queryString ? `?${queryString}` : ''}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        credentials: 'include',
        headers
    });
    if (!res.ok) {
        return { data: [], total: 0, limit: 50, offset: 0, nextPage: null };
    }
    return res.json();
}

export async function createSale(data: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/sales`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'สร้างขายไม่สำเร็จ');
    }
    return res.json();
}

export async function updateSale(id: number, data: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/sales/${id}`, {
        method: 'PUT',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'อัปเดตขายไม่สำเร็จ');
    }
    return res.json();
}

export async function deleteSale(id: number) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/sales/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'ลบขายไม่สำเร็จ');
    }
    return res.json();
}
