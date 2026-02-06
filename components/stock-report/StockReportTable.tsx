"use client";

import { Package, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { StockItem } from "./types";

interface StockReportTableProps {
    stocks: StockItem[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalStocks: number;
    onViewStockIn: (stock: StockItem) => void;
    onViewStockOut: (stock: StockItem) => void;
}

export default function StockReportTable({
    stocks,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalStocks,
    onViewStockIn,
    onViewStockOut,
}: StockReportTableProps) {
    const totalPages = Math.ceil(totalStocks / itemsPerPage);

    const getStockStatus = (remaining: number) => {
        if (remaining === 0) return { label: "หมดสต๊อก", color: "bg-red-100 text-red-700", rowColor: "bg-red-50" };
        if (remaining <= 10) return { label: "เหลือน้อย", color: "bg-amber-100 text-amber-700", rowColor: "bg-amber-50" };
        return { label: "ปกติ", color: "bg-green-100 text-green-700", rowColor: "" };
    };

    const getRemainingBadgeColor = (remaining: number) => {
        if (remaining === 0) return "bg-red-500 text-white";
        if (remaining <= 10) return "bg-amber-500 text-white";
        return "bg-green-500 text-white";
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm w-16">ลำดับ</th>
                            <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm">บาร์โค้ด</th>
                            <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm">รายการ</th>
                            <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm">หน่วย</th>
                            <th className="text-right py-4 px-4 font-semibold text-slate-600 text-sm">รับเข้า</th>
                            <th className="text-right py-4 px-4 font-semibold text-slate-600 text-sm">ขายออก</th>
                            <th className="text-right py-4 px-4 font-semibold text-slate-600 text-sm">คงเหลือ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.length > 0 ? (
                            stocks.map((stock, index) => {
                                const status = getStockStatus(stock.remaining);
                                return (
                                    <tr key={stock.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${status.rowColor}`}>
                                        <td className="py-3 px-4 text-slate-500 font-medium text-center">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-600 text-sm">
                                            {stock.barcode}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800">{stock.name}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-400">
                                                        {typeof stock.category === 'object' ? (stock.category as any).name : stock.category}
                                                    </span>
                                                    {stock.remaining === 0 && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">หมดสต๊อก</span>
                                                    )}
                                                    {stock.remaining > 0 && stock.remaining <= 10 && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white">เหลือน้อย</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">{stock.unit}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => onViewStockIn(stock)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg font-semibold transition-colors"
                                            >
                                                <TrendingUp className="w-4 h-4" />
                                                {stock.stockIn.toLocaleString()}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => onViewStockOut(stock)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                                            >
                                                <TrendingDown className="w-4 h-4" />
                                                {stock.stockOut.toLocaleString()}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-sm ${getRemainingBadgeColor(stock.remaining)}`}>
                                                {stock.remaining.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-16 text-center">
                                    <div className="text-slate-400">
                                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">ไม่พบข้อมูล</p>
                                        <p className="text-sm mt-1">ลองค้นหาด้วยคำอื่น</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalStocks > itemsPerPage && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100">
                    <div className="text-sm text-slate-500 font-medium">
                        แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, totalStocks)} - {Math.min(currentPage * itemsPerPage, totalStocks)} จาก {totalStocks} รายการ
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-500" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                            .map((page, idx, arr) => (
                                <div key={page} className="flex items-center gap-1.5">
                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                        <span className="px-2 text-slate-400">...</span>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === page
                                            ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200"
                                            : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                </div>
                            ))}

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
