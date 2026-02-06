const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface DashboardStats {
    customerCount: number;
    promoCount: number;
    totalSales: number;
    totalCost: number;
    totalProfit: number;
    couponCount: number;
    recentActivities: any[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/stats/dashboard`, {
        credentials: 'include',
        headers
    });
    if (!res.ok) throw new Error('ดึงข้อมูลขายไม่สำเร็จ');
    return res.json();
}
