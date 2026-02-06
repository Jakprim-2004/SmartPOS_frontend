'use client';

import { useState, useEffect } from 'react';
import { getStaffLogs, StaffLog } from '@/lib/api/staff-logs';
import { getStaffs } from '@/lib/api/staff';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
    History,
    Search,
    User,
    Filter,
    ChevronLeft,
    ChevronRight,
    Tag,
    ShoppingBag,
    Gift,
    Plus,
    Edit,
    Trash,
    Package
} from 'lucide-react';

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<StaffLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState<any[]>([]);

    // Filters
    const [selectedStaff, setSelectedStaff] = useState<string>('');
    const [selectedAction, setSelectedAction] = useState<string>('');

    const limit = 15;

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [page, selectedStaff, selectedAction]);

    const fetchStaff = async () => {
        try {
            const result = await getStaffs();
            // Handle paginated response { data: [] } or plain array
            const data = result?.data || result || [];
            setStaffList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getStaffLogs({
                page,
                limit,
                staffId: selectedStaff ? +selectedStaff : undefined,
                action: selectedAction || undefined
            });
            setLogs(data.data);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        if (action.includes('CREATE')) return <Plus className="w-4 h-4 text-green-500" />;
        if (action.includes('UPDATE')) return <Edit className="w-4 h-4 text-blue-500" />;
        if (action.includes('DELETE')) return <Trash className="w-4 h-4 text-red-500" />;
        if (action.includes('SALE')) return <ShoppingBag className="w-4 h-4 text-purple-500" />;
        if (action.includes('REDEEM')) return <Gift className="w-4 h-4 text-orange-500" />;
        if (action.includes('STOCK')) return <Package className="w-4 h-4 text-indigo-500" />;
        return <Tag className="w-4 h-4 text-gray-500" />;
    };

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            'CREATE_PRODUCT': 'เพิ่มสินค้าใหม่',
            'UPDATE_PRODUCT': 'แก้ไขข้อมูลสินค้า',
            'DELETE_PRODUCT': 'ลบสินค้า',
            'ADD_STOCK': 'เพิ่มสต็อกสินค้า',
            'CREATE_CATEGORY': 'เพิ่มหมวดหมู่',
            'UPDATE_CATEGORY': 'แก้ไขหมวดหมู่',
            'DELETE_CATEGORY': 'ลบคู่หมวดหมู่',
            'CREATE_SALE': 'บันทึกรายการขาย',
            'REDEEM_REWARD': 'แลกของรางวัล',
        };
        return labels[action] || action;
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <History className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">ประวัติการทำงานพนักงาน</h1>
                        <p className="text-gray-500">ตรวจสอบความเคลื่อนไหวทั้งหมดในระบบ</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium"
                        value={selectedStaff}
                        onChange={(e) => { setSelectedStaff(e.target.value); setPage(1); }}
                    >
                        <option value="">พนักงานทั้งหมด</option>
                        {staffList.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.username})</option>
                        ))}
                    </select>
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium"
                        value={selectedAction}
                        onChange={(e) => { setSelectedAction(e.target.value); setPage(1); }}
                    >
                        <option value="">กิจกรรมทั้งหมด</option>
                        <option value="PRODUCT">จัดการสินค้า</option>
                        <option value="CATEGORY">จัดการหมวดหมู่</option>
                        <option value="SALE">รายการขาย</option>
                        <option value="REDEEM">แลกของรางวัล</option>
                        <option value="STOCK">จัดการสต็อก</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">เวลา</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">พนักงาน</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">การกระทำ</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">รายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-4 mr-2"><div className="h-10 bg-gray-100 rounded"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">ไม่พบข้อมูลประวัติการทำงาน</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: th })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {log.Staff?.name?.charAt(0) || 'S'}
                                                </div>
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-800">{log.Staff?.name || 'Unknown'}</div>
                                                    <div className="text-gray-500 text-xs">@{log.Staff?.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit border ${log.action.includes('CREATE') ? 'bg-green-50 text-green-700 border-green-100' :
                                                log.action.includes('UPDATE') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    log.action.includes('DELETE') ? 'bg-red-50 text-red-700 border-red-100' :
                                                        log.action.includes('SALE') ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                            log.action.includes('REDEEM') ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                                log.action.includes('STOCK') ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                                    'bg-gray-50 text-gray-700 border-gray-100'
                                                }`}>
                                                {getActionIcon(log.action)}
                                                {getActionLabel(log.action)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div className="line-clamp-2 max-w-md">
                                                {log.action === 'CREATE_SALE' && `บิลเลขที่ #${log.details.billNumber} ยอดรวม ${log.details.total}฿`}
                                                {log.action === 'ADD_STOCK' && `เพิ่ม ${log.details.addedQty} ชิ้น ให้กับ ${log.details.productName}`}
                                                {log.action === 'CREATE_PRODUCT' && `เพิ่มสินค้า: ${log.details.productName}`}
                                                {log.action === 'UPDATE_PRODUCT' && `แก้ไขสินค้า ID: ${log.details.productId}`}
                                                {log.action === 'DELETE_PRODUCT' && `ลบสินค้า: ${log.details.productName}`}
                                                {log.action === 'REDEEM_REWARD' && `แลกของรางวัล: ${log.details.rewardTitle} (ลูกค้า ID: ${log.details.customerId})`}
                                                {log.action.includes('CATEGORY') && `${getActionLabel(log.action)}: ${log.details.categoryName || log.details.categoryId}`}
                                                {!['CREATE_SALE', 'ADD_STOCK', 'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'REDEEM_REWARD'].includes(log.action) && !log.action.includes('CATEGORY') && JSON.stringify(log.details)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            แสดง {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} จากทั้งหมด {total} รายการ
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium px-4">หน้า {page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
