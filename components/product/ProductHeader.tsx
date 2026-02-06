"use client";

import { ShoppingBag } from "lucide-react";

export default function ProductHeader() {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                        จัดการสินค้า
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">เพิ่ม แก้ไข และจัดการรายการสินค้าทั้งหมด</p>
                </div>
            </div>
        </div>
    );
}
