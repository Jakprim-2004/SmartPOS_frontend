"use client";

import { PlusCircle, CheckCircle, AlertTriangle, History, LayoutGrid } from "lucide-react";

interface StockTabsProps {
    activeTab: 'all' | 'notInStock' | 'inStock' | 'lowStock' | 'history';
    setActiveTab: (tab: 'all' | 'notInStock' | 'inStock' | 'lowStock' | 'history') => void;
    counts: {
        all: number;
        notInStock: number;
        inStock: number;
        lowStock: number;
        history: number;
    };
}

export default function StockTabs({ activeTab, setActiveTab, counts }: StockTabsProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1 mb-6 overflow-hidden">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'all'
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    ทั้งหมด ({counts.all})
                </button>

                <button
                    onClick={() => setActiveTab('notInStock')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'notInStock'
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <PlusCircle className="w-4 h-4" />
                    เพิ่มสต็อก ({counts.notInStock})
                </button>

                <button
                    onClick={() => setActiveTab('inStock')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'inStock'
                        ? 'bg-green-50 text-green-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <CheckCircle className="w-4 h-4" />
                    มีในสต็อก ({counts.inStock})
                </button>

                <button
                    onClick={() => setActiveTab('lowStock')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'lowStock'
                        ? 'bg-amber-50 text-amber-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    เหลือน้อย/หมด ({counts.lowStock})
                </button>

                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'history'
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
