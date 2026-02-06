const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Reward {
    id?: number;
    name: string;
    description?: string;
    pointsCost?: number;
    points_required?: number;
    pointsRequired?: number;
    imageUrl?: string;
    image_url?: string;
    stock: number;
    active?: boolean;
    isActive?: boolean;
}

function getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

export async function getRewards(shopId?: string) {
    const url = shopId ? `${BASE_URL}/rewards?shopId=${shopId}` : `${BASE_URL}/rewards`;
    const headers = getHeaders();
    const res = await fetch(url, { headers, credentials: 'include' });

    if (!res.ok) {
        throw new Error('ดึงของรางวัลไม่สำเร็จ');
    }

    const result = await res.json();
    // Handle both paginated response { data: [] } and plain array []
    const data = result.data || result;

    // Map backend isActive to frontend active
    return (Array.isArray(data) ? data : []).map((r: any) => ({
        ...r,
        name: r.title,
        pointsCost: r.pointsRequired,
        pointsRequired: r.pointsRequired,
        imageUrl: r.imageUrl,
        active: r.isActive,
        isActive: r.isActive
    }));
}

export async function getRewardsPaginated(params?: { limit?: number; offset?: number; shopId?: string }): Promise<{
    data: Reward[];
    total: number;
    limit: number;
    offset: number;
    nextPage: number | null;
}> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.shopId) queryParams.append('shopId', params.shopId);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/rewards${queryString ? `?${queryString}` : ''}`;

    const headers = getHeaders();
    const res = await fetch(url, { headers, credentials: 'include' });

    if (!res.ok) {
        return { data: [], total: 0, limit: 10, offset: 0, nextPage: null };
    }

    const result = await res.json();
    const rawData = result.data || result;

    // Map backend fields to frontend
    const data = (Array.isArray(rawData) ? rawData : []).map((r: any) => ({
        ...r,
        name: r.title,
        pointsCost: r.pointsRequired,
        pointsRequired: r.pointsRequired,
        imageUrl: r.imageUrl,
        active: r.isActive,
        isActive: r.isActive
    }));

    return {
        data,
        total: result.total || data.length,
        limit: result.limit || params?.limit || 10,
        offset: result.offset || 0,
        nextPage: result.nextPage ?? null
    };
}

export async function createReward(reward: Partial<Reward>) {
    const payload = {
        title: reward.name,
        description: reward.description,
        pointsRequired: reward.pointsCost || reward.pointsRequired || reward.points_required || 0,
        stock: reward.stock || 0,
        imageUrl: reward.imageUrl || reward.image_url,
        isActive: true
    };

    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/rewards`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('สร้างของรางวัลไม่สำเร็จ');
    const data = await res.json();
    return {
        ...data,
        name: data.title,
        pointsCost: data.pointsRequired,
        active: data.isActive
    };
}

export async function updateReward(id: number, reward: Partial<Reward>) {
    const payload: any = {};
    if (reward.name !== undefined) payload.title = reward.name;
    if (reward.description !== undefined) payload.description = reward.description;
    if (reward.pointsCost !== undefined || reward.pointsRequired !== undefined || reward.points_required !== undefined) {
        payload.pointsRequired = reward.pointsCost || reward.pointsRequired || reward.points_required;
    }
    if (reward.stock !== undefined) payload.stock = reward.stock;
    if (reward.imageUrl !== undefined || reward.image_url !== undefined) {
        payload.imageUrl = reward.imageUrl || reward.image_url;
    }
    if (reward.active !== undefined) payload.isActive = reward.active;
    if (reward.isActive !== undefined) payload.isActive = reward.isActive;

    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/rewards/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('อัปเดตของรางวัลไม่สำเร็จ');
    const data = await res.json();
    return {
        ...data,
        name: data.title,
        pointsCost: data.pointsRequired,
        active: data.isActive
    };
}

export async function deleteReward(id: number) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/rewards/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    });
    if (!res.ok) throw new Error('ลบของรางวัลไม่สำเร็จ');
}

export async function redeemReward(rewardId: number, customerId: number) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/rewards/redeem`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ rewardId, customerId }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'การแลกของรางวัลไม่สำเร็จ');
    }
    return res.json();
}

export async function getCustomerRedemptions(customerId: number) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/rewards/redemptions/${customerId}`, {
        headers,
        credentials: 'include',
    });

    if (!res.ok) {
        console.error('ดึงการแลกของรางวัลไม่สำเร็จ');
        return [];
    }

    const data = await res.json();
    return data.map((redemption: any) => ({
        id: redemption.id,
        rewardId: redemption.rewardId,
        redeemedAt: redemption.createdAt,
        status: redemption.status,
    }));
}
