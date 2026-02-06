"use client";

import { Receipt } from "lucide-react";

export default function BillsHeader() {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <Receipt className="w-6 h-6 text-indigo-600" />
                        </div>
                        รายงานบิลขาย
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">ดูประวัติการขายและรายละเอียดบิลทั้งหมด</p>
                </div>
            </div>
        </div>
    );
}
