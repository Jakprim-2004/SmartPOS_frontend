"use client";

import { Gift, X, Check } from "lucide-react";
import { Reward } from "./types";
import { Customer } from "@/components/customer/types";

interface RedeemModalProps {
    show: boolean;
    reward: Reward | null;
    customer: Customer | null;
    onClose: () => void;
    onConfirm: () => void;
}

export default function RedeemModal({ show, reward, customer, onClose, onConfirm }: RedeemModalProps) {
    if (!show || !reward || !customer) return null;

    const remainingPoints = customer.points - reward.pointsCost;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
                {/* Decorative Background */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-indigo-500 to-purple-600"></div>

                <div className="relative pt-10 px-6 pb-6 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-lg mx-auto flex items-center justify-center text-indigo-600 mb-4 ring-4 ring-indigo-50/20">
                        <Gift className="w-10 h-10" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-1">ยืนยันการแลกของรางวัล</h3>
                    <p className="text-slate-500 text-sm mb-6">คุณต้องการแลกรางวัลนี้ใช่หรือไม่?</p>

                    {/* Receipt Card */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                        <div className="text-lg font-bold text-slate-800 mb-2">{reward.name}</div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>แต้มปัจจุบัน</span>
                                <span className="font-mono">{customer.points.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500 font-medium">
                                <span>ใช้แต้มแลก</span>
                                <span className="font-mono">-{reward.pointsCost.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-slate-200 my-2"></div>
                            <div className="flex justify-between items-center font-bold text-indigo-600 text-base">
                                <span>แต้มคงเหลือ</span>
                                <span className="font-mono">{remainingPoints.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            ยืนยันแลกเลย
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
