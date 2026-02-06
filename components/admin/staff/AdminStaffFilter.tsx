"use client";

import { Search } from "lucide-react";

interface AdminStaffFilterProps {
    search: string;
    setSearch: (value: string) => void;
}

export default function AdminStaffFilter({ search, setSearch }: AdminStaffFilterProps) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="ค้นหาพนักงานตามชื่อ หรือ Username..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
    );
}
