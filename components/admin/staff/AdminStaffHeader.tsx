"use client";

import { Users, Plus } from "lucide-react";

interface AdminStaffHeaderProps {
    onAddStaff: () => void;
}

export default function AdminStaffHeader({ onAddStaff }: AdminStaffHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-7 h-7 text-indigo-600" />
                    จัดการพนักงาน
                </h1>
                <p className="text-slate-500 text-sm mt-1">เพิ่มหรือแก้ไขข้อมูลพนักงานในร้านของคุณ</p>
            </div>
            <button
                onClick={onAddStaff}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
                <Plus className="w-5 h-5" />
                เพิ่มพนักงานใหม่
            </button>
        </div>
    );
}
