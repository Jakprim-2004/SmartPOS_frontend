"use client";

import {
    Store,
    Ticket,
    History,
    ShoppingBag
} from "lucide-react";

interface MobileNavProps {
    activeTab: string;
    setActiveTab: (tab: 'store' | 'coupon' | 'history') => void;
    cartTotalItems: number;
    onOpenCart: () => void;
}

export default function MobileNav({
    activeTab,
    setActiveTab,
    cartTotalItems,
    onOpenCart
}: MobileNavProps) {

    const navItems = [
        { id: 'store', label: 'ร้านค้า', icon: Store },
        { id: 'coupon', label: 'คูปอง', icon: Ticket },
        { id: 'history', label: 'ประวัติ', icon: History },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] px-6 py-2 z-40 flex items-center justify-between pb-safe">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === item.id
                            ? 'text-indigo-600'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                </button>
            ))}

            <button
                onClick={onOpenCart}
                className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-600 relative"
            >
                <div className="relative">
                    <ShoppingBag className="w-6 h-6" />
                    {cartTotalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full border border-white">
                            {cartTotalItems}
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-medium">ตะกร้า</span>
            </button>
        </div>
    );
}
