"use client";

import { Edit, Trash2, Gift, Ban } from "lucide-react";
import { Reward } from "./types";
import { Customer } from "@/components/customer/types";

interface RewardListProps {
    rewards: Reward[];
    selectedCustomer: Customer | null;
    onRedeem: (reward: Reward) => void;
    onEdit?: (reward: Reward) => void; // Optional - admin only
    onDelete?: (reward: Reward) => void; // Optional - admin only
}

export default function RewardList({ rewards, selectedCustomer, onRedeem, onEdit, onDelete }: RewardListProps) {
    const isAdminMode = onEdit && onDelete;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rewards.map(reward => {
                const pointsCost = reward.pointsCost || reward.points_required || reward.pointsRequired || 0;
                const isOutOfStock = reward.stock <= 0;
                const canRedeem = selectedCustomer && selectedCustomer.points >= pointsCost && !isOutOfStock;
                const notEnoughPoints = selectedCustomer && selectedCustomer.points < pointsCost;

                return (
                    <div key={reward.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group relative">
                        {/* Status Badge */}
                        {isOutOfStock && (
                            <div className="absolute top-3 right-3 px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200">
                                สินค้าหมด
                            </div>
                        )}

                        <div className="p-5 flex-1 flex flex-col">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 text-amber-600 group-hover:scale-110 transition-transform duration-300">
                                <Gift className="w-6 h-6" />
                            </div>

                            <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1" title={reward.name}>{reward.name}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{reward.description}</p>

                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-end justify-between">
                                <div>
                                    <div className="text-xs text-slate-400 mb-1">ใช้แต้มแลก</div>
                                    <div className="text-xl font-bold text-indigo-600">{pointsCost.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 mb-1">คงเหลือ</div>
                                    <div className={`font-mono font-medium ${isOutOfStock ? 'text-red-500' : 'text-slate-700'}`}>
                                        {reward.stock.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                            {selectedCustomer ? (
                                <button
                                    onClick={() => canRedeem && onRedeem(reward)}
                                    disabled={!canRedeem}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${canRedeem
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isOutOfStock ? (
                                        <>สินค้าหมด</>
                                    ) : notEnoughPoints ? (
                                        <>แต้มไม่พอ</>
                                    ) : (
                                        <><Gift className="w-4 h-4" /> แลกเลย</>
                                    )}
                                </button>
                            ) : (
                                <div className="flex-1 text-center py-2 text-xs text-slate-400 font-medium">
                                    เลือกลูกค้าเพื่อแลก
                                </div>
                            )}

                            {/* Admin Actions - only shown when onEdit/onDelete are provided */}
                            {isAdminMode && (
                                <div className="flex gap-1 border-l border-slate-200 pl-2 ml-1">
                                    <button
                                        onClick={() => onEdit(reward)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(reward)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
