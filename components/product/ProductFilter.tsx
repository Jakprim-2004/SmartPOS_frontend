"use client";

import { Search, X, Plus, Tags } from "lucide-react";
import Link from "next/link";

interface ProductFilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    onAddProduct: () => void;
}

export default function ProductFilter({
    searchTerm,
    setSearchTerm,
    onAddProduct,
}: ProductFilterProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={onAddProduct}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        เพิ่มสินค้า
                    </button>
                    <Link
                        href="/product/category"
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-3 rounded-xl font-medium transition-colors"
                    >
                        <Tags className="w-5 h-5 text-slate-500" />
                        จัดการหมวดหมู่
                    </Link>
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า, บาร์โค้ด..."
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-700 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
