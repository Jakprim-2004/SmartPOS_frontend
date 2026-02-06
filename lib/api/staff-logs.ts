const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface StaffLog {
    id: number;
    staff_id: number;
    action: string;
    details: any;
    created_at: string;
    Staff?: {
        name: string;
        username: string;
    };
}

export const getStaffLogs = async (params: {
    page?: number;
    limit?: number;
    staffId?: number;
    action?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.staffId) queryParams.append('staffId', params.staffId.toString());
    if (params.action) queryParams.append('action', params.action);

    const res = await fetch(`${BASE_URL}/staff-logs?${queryParams.toString()}`, {
        credentials: 'include'
    });

    if (!res.ok) throw new Error('ดึงบันทึกบุคลากรไม่สำเร็จ');
    return res.json();
};
