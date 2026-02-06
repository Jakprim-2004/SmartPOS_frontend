"use client";

import { X, Save, Layers } from "lucide-react";
import toast from "react-hot-toast";

interface BulkAddModalProps {
    show: boolean;
    selectedProducts: any[];
    onClose: () => void;
    onSave: (items: { productId: number, qty: number }[]) => void;
}

export default function BulkAddModal({ show, selectedProducts, onClose, onSave }: BulkAddModalProps) {
    if (!show) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const items = selectedProducts.map(p => ({
            productId: p.id,
            qty: parseInt(formData.get(`qty-${p.id}`) as string) || 0
        }));

        if (items.some(i => i.qty <= 0)) {
            toast.error("กรุณาระบุจำนวนสินค้าให้ถูกต้อง (มากกว่า 0)");
            return;
        }

        onSave(items);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 p-6 flex flex-col items-center justify-center text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Layers className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-center">เพิ่มสต็อกหลายรายการ ({selectedProducts.length})</h3>
                    <p className="text-indigo-100 text-sm mt-1 text-center opacity-90">ระบุจำนวนสินค้าที่ต้องการเพิ่มสำหรับรายการที่เลือก</p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {selectedProducts.map((p, index) => (
                            <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-800 truncate">{p.name}</div>
                                    <div className="text-xs text-slate-500 font-mono">{p.barcode}</div>
                                </div>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        name={`qty-${p.id}`}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right font-mono text-slate-900 bg-white"
                                        placeholder="จำนวน"
                                        min="1"
                                        defaultValue="1"
                                        required
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            ยืนยันการเพิ่ม
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
