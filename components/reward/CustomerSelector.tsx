"use client";

import { useState } from "react";
import { Search, User, X, Phone, Star } from "lucide-react";
import { Customer } from "@/components/customer/types";

interface CustomerSelectorProps {
    customers: Customer[];
    selectedCustomer: Customer | null;
    onSelect: (customer: Customer | null) => void;
}

export default function CustomerSelector({ customers, selectedCustomer, onSelect }: CustomerSelectorProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);

    const filteredCustomers = searchTerm
        ? customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm)
        ).slice(0, 5)
        : [];

    if (selectedCustomer) {
        return (
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Star className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8" />
                </div>

                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <h3 className="text-indigo-100 font-medium mb-1 flex items-center gap-2">
                            <User className="w-4 h-4" /> ข้อมูลลูกค้า
                        </h3>
                        <div className="text-2xl font-bold mb-1">{selectedCustomer.name}</div>
                        <div className="flex items-center gap-2 text-indigo-100/80 text-sm font-mono mb-4">
                            <Phone className="w-3.5 h-3.5" />
                            {selectedCustomer.phone}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                                <div className="text-xs text-indigo-100 mb-0.5">แต้มสะสม</div>
                                <div className="text-xl font-bold">{selectedCustomer.points.toLocaleString()} คะแนน</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                                <div className="text-xs text-indigo-100 mb-0.5">ระดับสมาชิก</div>
                                <div className="text-lg font-bold">ทั่วไป</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onSelect(null)}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors backdrop-blur-sm"
                        title="เปลี่ยนลูกค้า"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center relative z-20">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <User className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">ค้นหาลูกค้า</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                ค้นหาด้วยชื่อหรือเบอร์โทรศัพท์เพื่อตรวจสอบแต้มสะสมและแลกของรางวัล
            </p>

            <div className="max-w-md mx-auto relative">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาลูกค้า..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-base"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    />
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                        {filteredCustomers.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {filteredCustomers.map(customer => (
                                    <button
                                        key={customer.id}
                                        onClick={() => onSelect(customer)}
                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-indigo-50 transition-colors text-left group"
                                    >
                                        <div>
                                            <div className="font-bold text-slate-800 group-hover:text-indigo-700">{customer.name}</div>
                                            <div className="text-xs text-slate-400 font-mono">{customer.phone}</div>
                                        </div>
                                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                                            {customer.points} แต้ม
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-slate-400 text-sm">
                                ไม่พบข้อมูลลูกค้า
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
