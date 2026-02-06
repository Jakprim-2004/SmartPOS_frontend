"use client";

import { Search, Plus, Trash2, CheckSquare, Square, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Product } from "@/lib/types";
import Image from "next/image";

interface StockTableProps {
    data: any[];
    tab: 'notInStock' | 'inStock' | 'lowStock' | 'history';
    selectedIds: number[];
    onSelect: (id: number) => void;
    onAddStock: (item: any) => void;
    onDeleteStockHistory: (item: any) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    // Server-side pagination props
    currentPage?: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
    isLoading?: boolean;
}

export default function StockTable({
    data,
    tab,
    selectedIds,
    onSelect,
    onAddStock,
    onDeleteStockHistory,
    searchTerm,
    setSearchTerm,
    // Server-side pagination
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 30,
    onPageChange,
    isLoading = false
}: StockTableProps) {
    const isHistory = tab === 'history';
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Generate page numbers
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อสินค้า, บาร์โค้ด..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{totalItems} รายการ</span>
                    {!isHistory && (
                        <span>เลือกแล้ว <span className="font-semibold text-indigo-600">{selectedIds.length}</span> รายการ</span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1 relative">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                )}

                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
                        <tr>
                            {!isHistory && (
                                <th className="py-3 px-4 w-12 text-center">เลือก</th>
                            )}
                            <th className="py-3 px-4 w-16 text-center">ลำดับ</th>
                            <th className="py-3 px-4">บาร์โค้ด</th>
                            <th className="py-3 px-4">สินค้า</th>
                            <th className="py-3 px-4">หมวดหมู่</th>
                            {!isHistory ? (
                                <>
                                    <th className="py-3 px-4 text-right">ราคา</th>
                                    {tab !== 'notInStock' && <th className="py-3 px-4 text-center">สถานะสต็อก</th>}
                                    <th className="py-3 px-4 text-center">จัดการ</th>
                                </>
                            ) : (
                                <>
                                    <th className="py-3 px-4 text-right">จำนวนที่เพิ่ม</th>
                                    <th className="py-3 px-4">วันที่เพิ่ม</th>
                                    <th className="py-3 px-4 text-center">จัดการ</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((item, index) => {
                                const product = isHistory ? item.Product : item;
                                const isSelected = selectedIds.includes(product?.id);
                                const rowIndex = (currentPage - 1) * itemsPerPage + index + 1;

                                if (!product) return null;

                                return (
                                    <tr key={isHistory ? item.id : product.id} className="hover:bg-slate-50 transition-colors">
                                        {!isHistory && (
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => onSelect(product.id)}
                                                    className={`p-1 rounded-md transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}
                                                >
                                                    {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                </button>
                                            </td>
                                        )}
                                        <td className="py-3 px-4 text-center text-slate-500">{rowIndex}</td>
                                        <td className="py-3 px-4 font-mono text-slate-600">{product.barcode}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                {product.mainImageUrl || product.imageUrl ? (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={product.mainImageUrl || product.imageUrl}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-medium flex-shrink-0">
                                                        No Img
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-slate-800">{product.name}</div>
                                                    {isHistory && <div className="text-xs text-slate-500">Lot ID: {item.id}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {typeof product.category === 'object' ? product.category?.name : product.category}
                                        </td>

                                        {!isHistory ? (
                                            <>
                                                <td className="py-3 px-4 text-right font-medium text-slate-700">฿{(product.price || 0).toLocaleString()}</td>
                                                {tab !== 'notInStock' && (
                                                    <td className="py-3 px-4 text-center">
                                                        {tab === 'lowStock' || (item.stockLeft <= 10) ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                ต่ำกว่าเกณฑ์
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                ปกติ
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => onAddStock(product)}
                                                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-1 shadow-sm shadow-indigo-200"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        เพิ่มสต็อก
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-3 px-4 text-right font-medium text-indigo-600">+{item.qty}</td>
                                                <td className="py-3 px-4 text-slate-500 text-sm">
                                                    {new Date(item.createdAt).toLocaleString('th-TH')}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => onDeleteStockHistory(item)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="ลบประวัติ"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={isHistory ? 7 : 8} className="py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                            <Search className="w-6 h-6 opacity-30" />
                                        </div>
                                        <p>ไม่พบข้อมูลรายการสินค้า</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="text-sm text-slate-500 font-medium">
                        แสดง {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems} รายการ
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </button>

                        {getPageNumbers().map((page, idx) => (
                            page === '...' ? (
                                <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400">...</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page as number)}
                                    disabled={isLoading}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${currentPage === page
                                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}

                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || isLoading}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
