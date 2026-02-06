"use client";

import { ChevronLeft, ChevronRight, Package, Medal, TicketPercent } from "lucide-react";
import { PointTransaction, formatDateTime } from "./types";

interface PointsTableProps {
    transactions: PointTransaction[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
}

export default function PointsTable({
    transactions,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalItems,
}: PointsTableProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getTransactionTypeInfo = (type: string) => {
        switch (type) {
            case 'REDEEM_REWARD':
                return { label: 'แลกของรางวัล', icon: <Medal className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700' };
            case 'DISCOUNT':
                return { label: 'ส่วนลด', icon: <TicketPercent className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' };
            default:
                return { label: type, icon: <Package className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700' };
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">วันที่</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">ชื่อลูกค้า</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">เบอร์โทร</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">ประเภท</th>
                            <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">แต้มที่ใช้</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">รายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((tx) => {
                                const typeInfo = getTransactionTypeInfo(tx.transactionType);
                                return (
                                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 text-slate-600 text-sm">
                                            {formatDateTime(tx.transactionDate)}
                                        </td>
                                        <td className="py-4 px-6 font-medium text-slate-800">
                                            {tx.Customer?.name || '-'}
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 font-mono text-sm">
                                            {tx.Customer?.phone || '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${typeInfo.color}`}>
                                                {typeInfo.icon}
                                                {typeInfo.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="font-bold text-red-600">
                                                -{tx.points}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 text-sm">
                                            {tx.description}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-16 text-center">
                                    <div className="text-slate-400">
                                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">ไม่พบรายการ</p>
                                        <p className="text-sm mt-1">ลองค้นหาด้วยชื่อหรือเบอร์โทรอื่น</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalItems > itemsPerPage && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100">
                    <div className="text-sm text-slate-500">
                        แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems} รายการ
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                            .map((page, idx, arr) => (
                                <div key={page} className="flex items-center">
                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                        <span className="px-2 text-slate-400">...</span>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                                            ? "bg-purple-600 text-white"
                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                </div>
                            ))}

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
