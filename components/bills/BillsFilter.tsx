"use client";

import { Search, Calendar, X } from "lucide-react";
import { formatDateInput } from "./types";

interface BillsFilterProps {
    searchBillNo: string;
    setSearchBillNo: (value: string) => void;
    startDate: Date | null;
    setStartDate: (date: Date | null) => void;
    endDate: Date | null;
    setEndDate: (date: Date | null) => void;
}

export default function BillsFilter({
    searchBillNo,
    setSearchBillNo,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}: BillsFilterProps) {
    const hasFilters = searchBillNo || startDate || endDate;

    const clearFilters = () => {
        setSearchBillNo("");
        setStartDate(null);
        setEndDate(null);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาเลขบิล..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-700 placeholder:text-slate-400"
                        value={searchBillNo}
                        onChange={(e) => setSearchBillNo(e.target.value)}
                    />
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="date"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-700"
                            value={formatDateInput(startDate)}
                            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                        />
                    </div>
                    <span className="text-slate-400 font-medium">ถึง</span>
                    <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="date"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-700"
                            value={formatDateInput(endDate)}
                            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                        />
                    </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-center justify-end">
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            ล้างตัวกรอง
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
