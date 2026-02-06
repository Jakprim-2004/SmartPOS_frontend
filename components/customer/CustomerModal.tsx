"use client";

import { X, Save, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Customer } from "./types";
import toast from "react-hot-toast";

interface CustomerModalProps {
    show: boolean;
    customer: Customer | null;
    onClose: () => void;
    onSave: (customer: Partial<Customer>) => void;
    isSaving?: boolean;
}

export default function CustomerModal({ show, customer, onClose, onSave, isSaving }: CustomerModalProps) {
    const [formData, setFormData] = useState<Partial<Customer>>({
        name: "",
        phone: "",
        birthday: ""
    });

    useEffect(() => {
        if (show) {
            if (customer) {
                setFormData(customer);
            } else {
                setFormData({
                    name: "",
                    phone: "",
                    birthday: ""
                });
            }
        }
    }, [show, customer]);

    if (!show) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.name?.trim()) {
            toast.error("กรุณาระบุชื่อลูกค้า");
            return;
        }
        if (!formData.phone?.match(/^\d{10}$/)) {
            toast.error("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก");
            return;
        }

        onSave(formData);
    };

    const handleChange = (field: keyof Customer, value: any) => {
        if (field === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }
        setFormData((prev: Partial<Customer>) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
            {/* Slide-over panel */}
            <div className={`w-full max-w-md h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${show ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <User className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {customer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
                            </h2>
                        </div>

                    </div>

                    {/* Body */}
                    <form id="customer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.name || ""}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    placeholder="ระบุชื่อลูกค้า"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    value={formData.phone || ""}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-slate-900 placeholder:text-slate-400"
                                    placeholder="0xxxxxxxxx"
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1">กรอกเฉพาะตัวเลข 10 หลัก</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">วัน/เดือน/ปี เกิด</label>
                                <input
                                    type="date"
                                    value={formData.birthday || ""}
                                    onChange={(e) => handleChange("birthday", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                                />
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            ยกเลิก
                        </button>
                        <button
                            form="customer-form"
                            type="submit"
                            disabled={isSaving}
                            className="flex-[2] py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    บันทึกข้อมูล
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
