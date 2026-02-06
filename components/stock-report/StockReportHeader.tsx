"use client";

import { BarChart3 } from "lucide-react";

export default function StockReportHeader() {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-emerald-600" />
                        </div>
                        รายงาน Stock
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">ดูสถานะสต๊อกสินค้าทั้งหมด</p>
                </div>
            </div>
        </div>
    );
}
