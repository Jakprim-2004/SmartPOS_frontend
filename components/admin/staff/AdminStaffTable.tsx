"use client";

import { Edit2, Trash2 } from "lucide-react";
import { Staff } from "@/lib/api/staff";

interface AdminStaffTableProps {
    staffs: Staff[];
    loading: boolean;
    onEdit: (staff: Staff) => void;
    onDelete: (id: number) => void;
}

export default function AdminStaffTable({ staffs, loading, onEdit, onDelete }: AdminStaffTableProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm">ชื่อ-นามสกุล</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm">Username</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm">บทบาท</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm">วันที่ร่วมงาน</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-sm text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/50"></td>
                                </tr>
                            ))
                        ) : staffs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                                    ไม่พบข้อมูลพนักงาน
                                </td>
                            </tr>
                        ) : (
                            staffs.map((staff) => (
                                <tr key={staff.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-700">{staff.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{staff.username}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase">
                                            {staff.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {new Date(staff.created_at).toLocaleDateString('th-TH')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(staff)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(staff.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
