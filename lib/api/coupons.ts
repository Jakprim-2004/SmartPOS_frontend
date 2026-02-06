const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Coupon {
    id?: number;
    code: string;
    description?: string;
    discount_type?: 'percentage' | 'fixed_amount';
    discountType?: 'percentage' | 'fixed_amount';
    discount_value?: number;
    discountValue?: number;
    min_spend?: number;
    minSpend?: number;
    max_usage?: number;
    maxUsage?: number;
    current_usage?: number;
    currentUsage?: number;
    is_active?: boolean;
    isActive?: boolean;
    expiry_date?: string;
    expiryDate?: string;
    startDate?: string;
    endDate?: string;
    usedCount?: number;
}

function getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

// Get all coupons for admin or specific shop with pagination and search
export async function getCoupons(params?: {
    shopId?: string;
    page?: number;
    limit?: number;
    search?: string;
}): Promise<{ total: number, limit: number, offset: number, nextPage: number | null, data: Coupon[] }> {
    const queryParams = new URLSearchParams();
    if (params?.shopId) queryParams.append('shopId', params.shopId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', (params.limit || 30).toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/coupons${queryString ? `?${queryString}` : ''}`;
    const headers = getHeaders();

    const res = await fetch(url, {
        headers,
        credentials: 'include'
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'ดึงคูปองไม่สำเร็จ');
    }

    return res.json();
}

// Create new coupon
export async function createCoupon(coupon: Partial<Coupon>) {
    const headers = getHeaders();
    // Map Frontend fields to Backend DTO
    const payload = {
        code: coupon.code,
        title: coupon.description || coupon.code, // Fallback title
        description: coupon.description,
        discountType: coupon.discountType || coupon.discount_type,
        discountValue: coupon.discountValue || coupon.discount_value,
        minPurchase: coupon.minSpend || coupon.min_spend || 0,
        maxUses: coupon.maxUsage || coupon.max_usage || 100,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        isActive: coupon.isActive ?? true,
    };

    const res = await fetch(`${BASE_URL}/coupons`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'สร้างคูปองไม่สำเร็จ');
    }
    return res.json();
}

// Update coupon
export async function updateCoupon(id: number, coupon: Partial<Coupon>) {
    const headers = getHeaders();
    const payload: any = {};
    if (coupon.code) payload.code = coupon.code;
    if (coupon.description) {
        payload.description = coupon.description;
        payload.title = coupon.description;
    }
    if (coupon.discountType) payload.discountType = coupon.discountType;
    if (coupon.discountValue !== undefined) payload.discountValue = coupon.discountValue;
    if (coupon.minSpend !== undefined) payload.minPurchase = coupon.minSpend;
    if (coupon.maxUsage !== undefined) payload.maxUses = coupon.maxUsage;
    if (coupon.isActive !== undefined) payload.isActive = coupon.isActive;

    const res = await fetch(`${BASE_URL}/coupons/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'อัปเดตคูปองไม่สำเร็จ');
    }
    return res.json();
}

// Delete coupon
export async function deleteCoupon(id: number) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'ลบคูปองไม่สำเร็จ');
    }
}

// Validate coupon for checkout (Public/Member)
export async function validateCoupon(code: string, subtotal: number, customerId?: number, shopId?: string) {
    const headers = getHeaders();

    // Fallback: Get shopId from localStorage if not provided
    if (!shopId && typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                shopId = user.shopId;
            } catch (e) { }
        }
    }

    // If still no shopId, we might fail, but let backend handle the 400 or try without?
    // Backend strictly requires it now.

    const res = await fetch(`${BASE_URL}/coupons/validate?shopId=${shopId || ''}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ code, purchaseAmount: subtotal }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'คูปองไม่ถูกต้อง');
    }
    return res.json();
}

// Get coupon usage history
export async function getCouponUsageHistory(couponCode: string) {
    return [];
}
