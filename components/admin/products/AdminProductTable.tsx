import { Edit2, Trash2, Package, Image as ImageIcon, Barcode, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";

interface AdminProductTableProps {
    products: Product[];
    loading: boolean;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}

export default function AdminProductTable({
    products,
    loading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalItems,
    onEdit,
    onDelete
}: AdminProductTableProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm">สินค้า</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm text-center">หมวดหมู่</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm text-right">ราคาขาย</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm text-right">ต้นทุน</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm text-center">คงเหลือ</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={6} className="px-6 py-6 h-20 bg-slate-50/50"></td>
                                </tr>
                            ))
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <Package className="w-12 h-12 opacity-20" />
                                        <p>ไม่พบสินค้าที่ค้นหา</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{product.name}</div>
                                                {product.barcode && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                        <Barcode className="w-3 h-3" />
                                                        {product.barcode}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                                            {typeof product.category === 'object' ? product.category?.name : "Uncategorized"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                                        ฿{product.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 text-sm">
                                        ฿{product.cost.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stock <= 5
                                            ? 'bg-red-50 text-red-600 border border-red-100'
                                            : 'bg-green-50 text-green-600 border border-green-100'
                                            }`}>
                                            {product.stock} ชิ้น
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(product.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && totalItems > 0 && (
                <div className="flex items-center justify-between p-6 border-t border-slate-50 bg-slate-50/30">
                    <div className="text-sm text-slate-500 font-medium">
                        แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems.toLocaleString()} รายการ
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all group shadow-sm active:scale-95"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
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
                                            className={`w-9 h-9 rounded-xl font-bold transition-all duration-300 ${currentPage === page
                                                ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50"
                                                : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm active:scale-95"
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
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all group shadow-sm active:scale-95"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
