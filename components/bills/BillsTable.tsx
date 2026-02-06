"use client";

import { FileText, Package, ChevronLeft, ChevronRight, Banknote, QrCode } from "lucide-react";
import { BillSale, formatThaiDate } from "./types";

interface BillsTableProps {
    bills: BillSale[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalBills: number;
    onViewBill: (bill: BillSale) => void;
}

export default function BillsTable({
    bills,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalBills,
    onViewBill,
}: BillsTableProps) {
    const totalPages = Math.ceil(totalBills / itemsPerPage);

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'Cash':
            case 'Cash ':
                return <Banknote className="w-4 h-4" />;
            case 'PromptPay':
                return <QrCode className="w-4 h-4" />;
            default:
                return <Banknote className="w-4 h-4" />;
        }
    };

    const getPaymentMethodText = (method: string) => {
        switch (method) {
            case 'Cash':
            case 'Cash ':
                return 'เงินสด';
            case 'PromptPay':
                return 'พร้อมเพย์';
            default:
                return 'เงินสด';
        }
    };

    const getPaymentMethodColor = (method: string) => {
        switch (method) {
            case 'Cash':
            case 'Cash ':
                return 'text-green-600 bg-green-50';
            case 'PromptPay':
                return 'text-blue-600 bg-blue-50';
            default:
                return 'text-green-600 bg-green-50';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">ลำดับ</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">เลขบิล</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">วันที่</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">ยอดรวม</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">ช่องทางชำระ</th>
                            <th className="text-center py-4 px-6 font-semibold text-slate-600 text-sm">รายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.length > 0 ? (
                            bills.map((bill, index) => (
                                <tr key={bill.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6 text-slate-500 font-medium">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-bold text-indigo-600 truncate block max-w-[150px]" title={bill.billNumber}>
                                            {bill.billNumber}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-600">
                                        {formatThaiDate(bill.payDate)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-bold text-slate-800">฿{bill.totalAmount.toLocaleString()}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${getPaymentMethodColor(bill.paymentMethod)}`}>
                                            {getPaymentMethodIcon(bill.paymentMethod)}
                                            {getPaymentMethodText(bill.paymentMethod)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button
                                            onClick={() => onViewBill(bill)}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-medium text-sm hover:bg-indigo-100 transition-colors inline-flex items-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            ดูรายการ
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-16 text-center">
                                    <div className="text-slate-400">
                                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">ไม่พบข้อมูล</p>
                                        <p className="text-sm mt-1">ลองปรับตัวกรองเพื่อค้นหาใหม่</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalBills > itemsPerPage && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100">
                    <div className="text-sm text-slate-500">
                        แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, totalBills)} - {Math.min(currentPage * itemsPerPage, totalBills)} จาก {totalBills} รายการ
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
                                            ? "bg-indigo-600 text-white"
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
