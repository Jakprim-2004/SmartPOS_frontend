"use client";

import { useState } from "react";
import { ShoppingBag, History as HistoryIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface PurchaseHistory {
    id: string;
    date: string;
    total: number;
    items: number;
    pointsEarned: number;
    paymentMethod: string;
    rawItems?: any[];
    subtotal?: number;
    discount?: number;
}

interface PointHistory {
    id: string;
    date: string;
    type: 'EARN' | 'REDEEM' | 'ADJUST';
    points: number;
    description: string;
}

interface MemberHistoryProps {
    activeTab: 'purchase' | 'points';
    onTabChange: (tab: 'purchase' | 'points') => void;
    purchases: PurchaseHistory[];
    pointsHistory: PointHistory[];
    onSelectPurchase: (purchase: PurchaseHistory) => void;
}

export default function MemberHistory({
    activeTab,
    onTabChange,
    purchases,
    pointsHistory,
    onSelectPurchase
}: MemberHistoryProps) {
    const [purchasePage, setPurchasePage] = useState(1);
    const [pointsPage, setPointsPage] = useState(1);
    const itemsPerPage = 10;

    // Pagination for purchases
    const totalPurchasePages = Math.ceil(purchases.length / itemsPerPage);
    const paginatedPurchases = purchases.slice(
        (purchasePage - 1) * itemsPerPage,
        purchasePage * itemsPerPage
    );

    // Pagination for points
    const totalPointsPages = Math.ceil(pointsHistory.length / itemsPerPage);
    const paginatedPoints = pointsHistory.slice(
        (pointsPage - 1) * itemsPerPage,
        pointsPage * itemsPerPage
    );

    const handleTabChange = (tab: 'purchase' | 'points') => {
        onTabChange(tab);
        // Reset pages when switching tabs
        if (tab === 'purchase') setPurchasePage(1);
        else setPointsPage(1);
    };

    const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
        if (totalPages <= 1) return null;

        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }

        return (
            <div className="flex items-center justify-center gap-1 pt-4 border-t border-slate-100 mt-4">
                <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>

                {pages.map((page, idx) => (
                    page === '...' ? (
                        <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => setPage(page as number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${currentPage === page
                                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
                                }`}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                <HistoryIcon className="w-6 h-6 text-indigo-600" /> ประวัติการใช้งาน
            </h2>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => handleTabChange('purchase')}
                        className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'purchase' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        ประวัติการซื้อ ({purchases.length})
                    </button>
                    <button
                        onClick={() => handleTabChange('points')}
                        className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'points' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        ประวัติคะแนน ({pointsHistory.length})
                    </button>
                </div>

                <div className="p-4">
                    {activeTab === 'purchase' ? (
                        <div className="space-y-3">
                            {paginatedPurchases.length > 0 ? (
                                <>
                                    {paginatedPurchases.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => onSelectPurchase(item)}
                                            className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50 cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                                    <ShoppingBag className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.id}</div>
                                                    <div className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString('th-TH')}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-indigo-600">฿{item.total.toLocaleString()}</div>
                                                <div className="text-xs text-green-600">+{item.pointsEarned} pt</div>
                                            </div>
                                        </div>
                                    ))}
                                    {renderPagination(purchasePage, totalPurchasePages, setPurchasePage)}
                                </>
                            ) : (
                                <div className="py-12 text-center text-slate-400">ยังไม่มีประวัติการซื้อ</div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paginatedPoints.length > 0 ? (
                                <>
                                    {paginatedPoints.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50">
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{item.description}</div>
                                                <div className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString('th-TH')}</div>
                                            </div>
                                            <div className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {item.points > 0 ? '+' : ''}{item.points}
                                            </div>
                                        </div>
                                    ))}
                                    {renderPagination(pointsPage, totalPointsPages, setPointsPage)}
                                </>
                            ) : (
                                <div className="py-12 text-center text-slate-400">ยังไม่มีประวัติคะแนน</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
