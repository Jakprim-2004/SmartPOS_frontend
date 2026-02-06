"use client";

import { Search, X, Gift } from "lucide-react";

interface PointsFilterProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    totalPointsUsed: number;
}

export default function PointsFilter({
    searchQuery,
    setSearchQuery,
    totalPointsUsed,
}: PointsFilterProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อหรือเบอร์โทรลูกค้า..."
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium text-slate-700 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Total Points Used Summary */}
                <div className="bg-purple-50 px-6 py-3 rounded-xl flex items-center gap-3 border border-purple-100">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Gift className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">รวมแต้มที่ใช้ทั้งหมด</p>
                        <p className="text-xl font-bold text-purple-700">{totalPointsUsed.toLocaleString()} แต้ม</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
