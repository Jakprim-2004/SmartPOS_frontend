"use client";

import { PlusCircle, CheckCircle, AlertTriangle, History } from "lucide-react";

interface StockTabsProps {
    activeTab: 'notInStock' | 'inStock' | 'lowStock' | 'history';
    setActiveTab: (tab: 'notInStock' | 'inStock' | 'lowStock' | 'history') => void;
    counts: {
        notInStock: number;
        inStock: number;
        lowStock: number;
        history: number;
    };
}

export default function StockTabs({ activeTab, setActiveTab, counts }: StockTabsProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1 mb-6">
            <div className="flex items-center gap-1 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('notInStock')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'notInStock'
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <PlusCircle className="w-4 h-4" />
                    เพิ่มสต็อก ({counts.notInStock})
                </button>

                <button
                    onClick={() => setActiveTab('inStock')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'inStock'
                            ? 'bg-green-50 text-green-600 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <CheckCircle className="w-4 h-4" />
                    มีในสต็อก ({counts.inStock})
                </button>

                <button
                    onClick={() => setActiveTab('lowStock')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'lowStock'
                            ? 'bg-amber-50 text-amber-600 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    เหลือน้อย/หมด ({counts.lowStock})
                </button>

                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'history'
                            ? 'bg-slate-100 text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <History className="w-4 h-4" />
                    ประวัติ ({counts.history})
                </button>
            </div>
        </div>
    );
}
