"use client";

import { X, User, Shield, Lock, Loader2 } from "lucide-react";
import { Staff } from "@/lib/api/staff";

interface AdminStaffModalProps {
    show: boolean;
    onClose: () => void;
    editingStaff: Staff | null;
    formData: any;
    setFormData: (data: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
    saving: boolean;
}

export default function AdminStaffModal({
    show,
    onClose,
    editingStaff,
    formData,
    setFormData,
    handleSubmit,
    saving
}: AdminStaffModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">
                        {editingStaff ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
                    </h3>
                    <button onClick={onClose}>
                        <X className="w-6 h-6 text-slate-400 hover:text-slate-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">ชื่อ-นามสกุล</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                placeholder="เช่น สมชาย ใจดี"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Username (ใช้ล็อกอิน)</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                required
                                disabled={!!editingStaff}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-slate-900"
                                placeholder="ภาษาอังกฤษเท่านั้น"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                            Password {editingStaff && "(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)"}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                required={!editingStaff}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                placeholder="รหัสผ่านอย่างน้อย 6 ตัว"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl mt-4 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "บันทึกข้อมูล"}
                    </button>
                </form>
            </div>
        </div>
    );
}
