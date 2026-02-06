"use client";

import { History } from "lucide-react";

export default function PointsHeader() {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl">
                            <History className="w-6 h-6 text-purple-600" />
                        </div>
                        ประวัติการใช้คะแนนสะสม
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">รายการการแลกคะแนนและส่วนลดทั้งหมด</p>
                </div>
            </div>
        </div>
    );
}
