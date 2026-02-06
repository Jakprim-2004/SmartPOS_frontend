"use client";

import { Users, UserPlus } from "lucide-react";

interface CustomerHeaderProps {
    totalCustomers: number;
    onAddClick: () => void;
}

export default function CustomerHeader({ totalCustomers, onAddClick }: CustomerHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                        <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    จัดการข้อมูลลูกค้า
                </h1>
                <p className="text-slate-500 text-sm mt-1 ml-11">
                    สมาชิกทั้งหมด <span className="font-bold text-indigo-600">{totalCustomers}</span> คน
                </p>
            </div>

            <button
                onClick={onAddClick}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95"
            >
                <UserPlus className="w-5 h-5" />
                เพิ่มลูกค้าใหม่
            </button>
        </div>
    );
}
