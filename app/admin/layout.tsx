"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Store } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [storeName, setStoreName] = useState("Smart POS");

    useEffect(() => {
        const loadStoreName = async () => {
            // 1. Try from localStorage first (Fastest)
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.shop_name && user.shop_name !== "Smart POS") {
                        setStoreName(user.shop_name);
                        return;
                    }
                } catch (e) { console.error(e); }
            }

            // 2. Fetch from Database (Reliable)
            try {
                // Try fetching from admins table (taking the first one or current user context if available)
                const { data: adminData } = await supabase
                    .from('admins')
                    .select('shop_name')
                    .limit(1)
                    .single();

                if (adminData?.shop_name) {
                    setStoreName(adminData.shop_name);
                    // Update local storage if possible to sync
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        user.shop_name = adminData.shop_name;
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch store name", err);
            }
        };

        loadStoreName();
    }, []);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex-1 ml-64 flex flex-col">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
                    <h1 className="font-bold text-slate-800">ระบบจัดการหลังบ้าน</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                            <Store className="w-5 h-5" />
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-slate-700">{storeName}</div>
                            <div className="text-xs text-slate-500">ร้านค้าของคุณ</div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
