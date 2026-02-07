const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://smartpos-backend-7ee9.onrender.com/api';
const BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export interface Customer {
    id: number;
    name: string;
    phone: string;
    email?: string;
    points: number;
    birthday?: string;
    totalSpent: number;
    joinDate: string;
    createdAt?: string;
}

export async function getCustomers(params?: { limit?: number; offset?: number; search?: string }): Promise<{ data: Customer[]; total: number, limit: number, offset: number, nextPage: number | null }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/customers${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
        credentials: 'include',
        headers
    });
    if (!res.ok) throw new Error('ดึงลูกค้าไม่สำเร็จ');
    const result = await res.json();

    // Ensure data is mapped correctly if needed, but let's assume backend matches mostly
    // We map joinDate from createdAt if needed
    const mappedData = (result.data || []).map((c: any) => ({
        ...c,
        joinDate: c.joinDate || c.createdAt || new Date().toISOString()
    }));

    return {
        data: mappedData,
        total: result.total || 0,
        limit: result.limit || params?.limit || 10,
        offset: result.offset || 0,
        nextPage: result.nextPage ?? null
    };
}

export async function lookupCustomerByPhone(phone: string): Promise<Customer | null> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/customers/phone/${phone}`, {
        credentials: 'include',
        headers
    });
    if (!res.ok) return null;
    try {
        const c = await res.json();
        return {
            ...c,
            joinDate: c.joinDate || c.createdAt || new Date().toISOString()
        };
    } catch (e) {
        return null;
    }
}

export async function getCustomerById(id: number): Promise<Customer | null> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/customers/${id}`, {
        credentials: 'include',
        headers
    });
    if (!res.ok) return null;
    try {
        const c = await res.json();
        return {
            ...c,
            joinDate: c.joinDate || c.createdAt || new Date().toISOString()
        };
    } catch (e) {
        return null;
    }
}

export async function searchCustomers(query: string): Promise<Customer[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/customers?search=${encodeURIComponent(query)}`, {
        credentials: 'include',
        headers
    });
    if (!res.ok) return [];
    try {
        const result = await res.json();
        const data = result.data || result; // Fallback if it's still an array
        return (Array.isArray(data) ? data : []).map((c: any) => ({
            ...c,
            joinDate: c.joinDate || c.createdAt || new Date().toISOString()
        }));
    } catch (e) {
        return [];
    }
}

export async function memberLogin(phone: string, birthday: string): Promise<Customer> {
    const res = await fetch(`${BASE_URL}/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, birthday }),
    });
    if (!res.ok) throw new Error('เข้าสู่ระบบไม่สำเร็จ');
    return res.json();
}

export async function registerMember(data: { name: string; phone: string; birthday: string }): Promise<Customer> {
    const res = await fetch(`${BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'ลงทะเบียนไม่สำเร็จ');
    }
    return res.json();
}

export async function updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/customers/${id}`, {
        method: 'PUT',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'อัปเดตลูกค้าไม่สำเร็จ');
    }
    return res.json();
}

export async function deleteCustomer(id: number): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/customers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
    });
    if (!res.ok) {
        throw new Error('ลบลูกค้าไม่สำเร็จ');
    }
}
