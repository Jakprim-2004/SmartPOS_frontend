"use client";

import { Search, Filter } from "lucide-react";
import { Category } from "@/lib/api/categories";

interface AdminProductFilterProps {
    search: string;
    setSearch: (value: string) => void;
    selectedCategory: string;
    setSelectedCategory: (value: string) => void;
    categories: Category[];
}

export default function AdminProductFilter({
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    categories
}: AdminProductFilterProps) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="ค้นหาชื่อสินค้า หรือบาร์โค้ด..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 min-w-[200px]"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="all">ทุกหมวดหมู่</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id.toString()}>{c.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
