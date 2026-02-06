"use client";

import { X, Save, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { Reward } from "./types";
import toast from "react-hot-toast";

interface RewardModalProps {
    show: boolean;
    reward: Reward | null;
    onClose: () => void;
    onSave: (reward: Partial<Reward>) => void;
}

export default function RewardModal({ show, reward, onClose, onSave }: RewardModalProps) {
    const [formData, setFormData] = useState<Partial<Reward>>({
        name: "",
        description: "",
        pointsCost: 0,
        stock: 0
    });

    useEffect(() => {
        if (show) {
            if (reward) {
                setFormData(reward);
            } else {
                setFormData({
                    name: "",
                    description: "",
                    pointsCost: 0,
                    stock: 0
                });
            }
        }
    }, [show, reward]);

    if (!show) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            toast.error("กรุณาระบุชื่อของรางวัล");
            return;
        }
        if (!formData.pointsCost || formData.pointsCost <= 0) {
            toast.error("แต้มที่ใช้ต้องมากกว่า 0");
            return;
        }

        onSave(formData);
    };

    const handleChange = (field: keyof Reward, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Gift className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {reward ? 'แก้ไขของรางวัล' : 'เพิ่มของรางวัลใหม่'}
                        </h2>
                    </div>
                </div>

                {/* Body */}
                <form id="reward-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อของรางวัล <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name || ""}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                placeholder="ระบุชื่อของรางวัล"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
                            <textarea
                                value={formData.description || ""}
                                onChange={(e) => handleChange("description", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[80px] resize-none text-slate-900 placeholder:text-slate-400"
                                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">แต้มที่ใช้แลก <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={formData.pointsCost || ""}
                                    onChange={(e) => handleChange("pointsCost", parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono font-bold text-indigo-600"
                                    min="1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนคงเหลือ <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={formData.stock || ""}
                                    onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-slate-900"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                        ยกเลิก
                    </button>
                    <button
                        form="reward-form"
                        type="submit"
                        className="flex-[2] py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        บันทึกข้อมูล
                    </button>
                </div>
            </div>
        </div>
    );
}
