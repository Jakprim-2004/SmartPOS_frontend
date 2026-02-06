"use client";

import { Gift, Plus } from "lucide-react";

interface RewardHeaderProps {
    onAddClick?: () => void; // Optional - only shown for admin
}

export default function RewardHeader({ onAddClick }: RewardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                        <Gift className="w-6 h-6 text-indigo-600" />
                    </div>
                    แลกของรางวัล
                </h1>
                <p className="text-slate-500 text-sm mt-1 ml-11">
                    {onAddClick ? "จัดการของรางวัลและแลกคะแนนสะสม" : "ใช้แต้มสะสมแลกของรางวัล"}
                </p>
            </div>

            {onAddClick && (
                <button
                    onClick={onAddClick}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    เพิ่มของรางวัล
                </button>
            )}
        </div>
    );
}
