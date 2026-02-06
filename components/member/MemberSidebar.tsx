
import {
    Store,
    Ticket,
    History,
    LogOut,
    ShoppingBag,
    Edit2
} from "lucide-react";
import { Customer } from "@/lib/types";

interface MemberSidebarProps {
    customer: Customer & { image_url?: string };
    activeTab: string;
    setActiveTab: (tab: 'store' | 'coupon' | 'history') => void;
    onLogout: () => void;
    cartTotalItems: number;
    onOpenCart: () => void;
    onEditProfile: () => void;
}

export default function MemberSidebar({
    customer,
    activeTab,
    setActiveTab,
    onLogout,
    cartTotalItems,
    onOpenCart,
    onEditProfile
}: MemberSidebarProps) {
    const menuItems = [
        { id: 'store', label: 'ร้านค้า', icon: Store },
        { id: 'coupon', label: 'คูปองของฉัน', icon: Ticket },
        { id: 'history', label: 'ประวัติการใช้งาน', icon: History },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 hidden md:flex flex-col z-40 shadow-sm">
            {/* Logo Area */}
            <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/smartpos-logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                <span className="font-bold text-xl text-slate-800">Smart Member</span>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id
                            ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-50 space-y-2">
                <button
                    onClick={onOpenCart}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                >
                    <div className="flex items-center gap-3 font-medium">
                        <ShoppingBag className="w-5 h-5" />
                        ตะกร้าสินค้า
                    </div>
                    {cartTotalItems > 0 && (
                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {cartTotalItems}
                        </span>
                    )}
                </button>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    ออกจากระบบ
                </button>
            </div>
        </aside>
    );
}
