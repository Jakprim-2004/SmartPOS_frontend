"use client";

import { useState } from "react";
import { Pencil, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, Package, Printer } from "lucide-react";
import { Product } from "@/lib/types";
import Image from "next/image";
import toast from "react-hot-toast";

interface ProductTableProps {
    products: Product[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onManageImages: (product: Product) => void;
    onPrintBarcode: (product: Product) => void;
}

export default function ProductTable({
    products,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalItems,
    onEdit,
    onDelete,
    onManageImages,
    onPrintBarcode,
}: ProductTableProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="text-center py-4 px-4 font-semibold text-slate-600 text-sm w-24">ลำดับ/รูป</th>
                            <th className="px-4 py-4 font-semibold text-slate-600 text-sm">บาร์โค้ด</th>
                            <th className="px-4 py-4 font-semibold text-slate-600 text-sm">ชื่อสินค้า</th>
                            <th className="text-right px-4 py-4 font-semibold text-slate-600 text-sm">ราคาทุน</th>
                            <th className="text-right px-4 py-4 font-semibold text-slate-600 text-sm">ราคาขาย</th>
                            <th className="px-4 py-4 font-semibold text-slate-600 text-sm">หมวดหมู่</th>
                            <th className="px-4 py-4 font-semibold text-slate-600 text-sm">หน่วย</th>
                            <th className="text-center px-4 py-4 font-semibold text-slate-600 text-sm w-40">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-800">
                        {products.length > 0 ? (
                            products.map((product, index) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </span>
                                            <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-mono text-slate-600 text-sm">
                                        {product.barcode}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                        {product.name}
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-600">
                                        ฿{product.cost?.toLocaleString() ?? "0"}
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold text-blue-600">
                                        ฿{product.price?.toLocaleString() ?? "0"}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                                            {typeof product.category === 'object' ? product.category.name : product.category}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                        {product.unit}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => onManageImages(product)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="จัดการรูปภาพ"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onPrintBarcode(product)}
                                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                title="พิมพ์บาร์โค้ด"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="แก้ไข"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(product)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ลบ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-16 text-center">
                                    <div className="text-slate-400">
                                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">ไม่พบสินค้า</p>
                                        <p className="text-sm mt-1">ลองค้นหาด้วยคำอื่น หรือเพิ่มสินค้าใหม่</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            {totalItems > 0 && (
                <div className="p-6 bg-white border-t border-slate-100">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* 1. Status Text */}
                        <div className="text-sm text-slate-500 font-medium bg-slate-50 px-4 py-2 rounded-full border border-slate-100 shadow-sm whitespace-nowrap">
                            แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems.toLocaleString()} รายการ
                        </div>

                        {/* 2. Controls Area */}
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {/* Pagination Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-200 group shadow-sm active:scale-95"
                                >
                                    <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-orange-600" />
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                                        .map((page, idx, arr) => (
                                            <div key={page} className="flex items-center gap-1.5">
                                                {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                    <span className="text-slate-300 font-black px-1 select-none">...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 ${currentPage === page
                                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200 ring-2 ring-orange-100 ring-offset-2 scale-110"
                                                        : "bg-white border border-slate-200 text-slate-600 hover:border-orange-200 hover:text-orange-600 hover:shadow-md hover:bg-orange-50 active:scale-95"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            </div>
                                        ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-200 group shadow-sm active:scale-95"
                                >
                                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
