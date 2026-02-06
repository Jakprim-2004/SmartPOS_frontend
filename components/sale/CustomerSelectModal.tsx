"use client";

import { useState, useEffect } from "react";
import { X, Search, User, Phone } from "lucide-react";
import { Customer, searchCustomers } from "@/lib/api/customers";
import { useDebounce } from "@/hooks/useDebounce"; // Ensure this hook exists or implement debounce manually

// If hooks/useDebounce doesn't exist, I'll implement simple debounce inside.
// For safety, I'll use setTimeout inside useEffect for debounce.

interface CustomerSelectModalProps {
    show: boolean;
    // customers prop is no longer needed as we fetch internally
    onSelect: (customer: Customer) => void;
    onClose: () => void;
}

export default function CustomerSelectModal({ show, onSelect, onClose }: CustomerSelectModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);

    // simple debounce
    useEffect(() => {
        if (!searchTerm.trim()) {
            setCustomers([]);
            setLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            if (show) {
                setLoading(true);
                try {
                    const results = await searchCustomers(searchTerm);
                    setCustomers(results);
                } catch (error) {
                    console.error("Failed to search customers:", error);
                    setCustomers([]);
                } finally {
                    setLoading(false);
                }
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <User className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">เลือกลูกค้า</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Customer List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-12 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : customers.length > 0 ? (
                        <div className="space-y-2">
                            {customers.map((customer) => (
                                <button
                                    key={customer.id}
                                    onClick={() => onSelect(customer)}
                                    className="w-full p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {customer.name}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span className="font-mono">{customer.phone}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400">แต้มสะสม</div>
                                            <div className="text-lg font-bold text-amber-600">
                                                {customer.points?.toLocaleString() || 0}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            {searchTerm ? 'ไม่พบข้อมูลลูกค้า' : 'พิมพ์เพื่อค้นหาลูกค้า'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
