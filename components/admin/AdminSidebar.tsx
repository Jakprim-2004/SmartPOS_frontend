"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Megaphone,
    Ticket,
    Newspaper,
    LogOut,
    Percent,
    Package,
    ShoppingCart,
    Users,
    Gift,
    History
} from "lucide-react";

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
    const pathname = usePathname();

    const menuItems = [

        { href: '/admin/promotions', icon: Megaphone, label: 'จัดการโปรโมชั่น' },
        { href: '/admin/coupons', icon: Ticket, label: 'จัดการคูปอง' },
        { href: '/admin/news', icon: Newspaper, label: 'ข่าวสาร & ประกาศ' },
        { href: '/admin/products', icon: Package, label: 'จัดการสินค้า' },
        { href: '/admin/rewards', icon: Gift, label: 'จัดการของรางวัล' },
        { href: '/admin/staff', icon: Users, label: 'จัดการพนักงาน' },
    ];

    const handleLinkClick = () => {
        // Auto-close sidebar on mobile when a menu item is clicked
        if (onClose && window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`w-64 bg-white text-slate-600 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto border-r border-slate-200 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                {/* Header */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-indigo-200">A</div>
                    <span className="font-bold text-xl text-slate-800">Smart Admin</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-2">เมนูหลัก</div>
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Reports Navigation */}
                <div className="px-4 pb-4 space-y-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-4">รายงาน</div>
                    {[
                        { href: '/admin/dashboard', icon: LayoutDashboard, label: 'แดชบอร์ดภาพรวม' },
                        { href: '/admin/bills', icon: Newspaper, label: 'รายงานบิลขาย' },
                        { href: '/admin/stock-report', icon: Package, label: 'รายงาน Stock' },
                        { href: '/admin/points-history', icon: Ticket, label: 'ประวัติแต้มสะสม' },
                        { href: '/admin/logs', icon: History, label: 'ประวัติการทำงาน' },
                    ].map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 space-y-2">
                    <Link
                        href="/sale"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors w-full font-bold border-2 border-transparent hover:border-indigo-100"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        เปิดหน้าขาย
                    </Link>
                    <button
                        onClick={async () => {
                            try {
                                localStorage.removeItem("user");
                                await fetch('/api/auth/logout', { method: 'POST' });
                                window.location.href = "/login";
                            } catch (e) {
                                window.location.href = "/login";
                            }
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors w-full text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        ออกจากระบบ
                    </button>
                </div>
            </aside>
        </>
    );
}
