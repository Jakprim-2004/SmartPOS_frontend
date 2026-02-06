"use client";

import { Search, Edit, Trash2, Gift, Phone, Mail, FileText, Cake } from "lucide-react";
import { Customer } from "./types";
import { useState } from "react";

interface CustomerTableProps {
    customers: Customer[];
    onEdit: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
    onReward: (customer: Customer) => void;
    isLoading?: boolean;
}

export default function CustomerTable({ customers, onEdit, onDelete, onReward, isLoading }: CustomerTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Filter Logic
    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        (c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const displayedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm shadow-sm"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset page on search
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
                        <tr>
                            <th className="py-3 px-4 w-16 text-center">#</th>
                            <th className="py-3 px-4">ข้อมูลลูกค้า</th>
                            <th className="py-3 px-4">ติดต่อ</th>
                            <th className="py-3 px-4 text-center">แต้มสะสม</th>
                            <th className="py-3 px-4 text-right">ยอดใช้จ่ายรวม</th>
                            <th className="py-3 px-4 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {displayedCustomers.length > 0 ? (
                            displayedCustomers.map((customer, index) => (
                                <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="py-3 px-4 text-center text-slate-500">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-slate-800">{customer.name}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                            <FileText className="w-3 h-3" />
                                            Member since {new Date(customer.joinDate).toLocaleDateString('th-TH')}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="font-mono">{customer.phone}</span>
                                            </div>
                                            {customer.birthday && (
                                                <div className="flex items-center gap-2 text-pink-500 text-xs font-medium">
                                                    <Cake className="w-3.5 h-3.5 opacity-70" />
                                                    {new Date(customer.birthday).toLocaleDateString('th-TH', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            )}
                                            {customer.email && (
                                                <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    {customer.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                            {customer.points.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                                        ฿{customer.totalSpent.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onReward(customer)}
                                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="แลกรางวัล"
                                            >
                                                <Gift className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(customer)}
                                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="แก้ไข"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(customer)}
                                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ลบ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                    ไม่พบข้อมูลลูกค้า
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="text-sm text-slate-500">
                        แสดง {((currentPage - 1) * itemsPerPage) + 1} ถึง {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} จาก {filteredCustomers.length} รายการ
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            ก่อนหน้า
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = i + 1;
                            if (totalPages > 5) {
                                if (currentPage > 3) pageNum = currentPage - 2 + i;
                                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                            }
                            if (pageNum > totalPages || pageNum < 1) return null; // Safety

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === pageNum
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'text-slate-600 hover:bg-white'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            ถัดไป
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
