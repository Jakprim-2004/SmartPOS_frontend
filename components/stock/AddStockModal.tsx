"use client";

import { X, Save, PackagePlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Product } from "@/lib/types";
import toast from "react-hot-toast";

interface AddStockModalProps {
    show: boolean;
    product: Product | null;
    onClose: () => void;
    onConfirm: (qty: number) => void;
}

export default function AddStockModal({ show, product, onClose, onConfirm }: AddStockModalProps) {
    const [qty, setQty] = useState<string>("1");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (show && product) {
            setQty("1"); // Reset default
            // Focus input shortly after open
            const timer = setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [show, product]);

    if (!show || !product) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const quantity = parseInt(qty);

        if (isNaN(quantity) || quantity <= 0) {
            toast.error("กรุณาระบุจำนวนที่ถูกต้อง (มากกว่า 0)");
            return;
        }

        onConfirm(quantity);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 p-6 flex flex-col items-center justify-center text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <PackagePlus className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-center">เพิ่มสินค้าเข้าสต็อก</h3>
                    <p className="text-indigo-100 text-sm mt-1 text-center opacity-90">ระบุจำนวนสินค้าที่ต้องการเพิ่ม</p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="text-center mb-6">
                        <div className="text-sm text-slate-500 mb-1">สินค้า</div>
                        <div className="font-bold text-lg text-slate-800">{product.name}</div>
                        <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded inline-block mt-1">
                            {product.barcode}
                        </div>
                    </div>

                    <div className="max-w-[200px] mx-auto mb-8">
                        <label className="block text-sm font-medium text-slate-700 mb-2 text-center">จำนวนที่รับเข้า</label>
                        <div className="relative flex items-center">
                            <button
                                type="button"
                                onClick={() => setQty(Math.max(1, parseInt(qty || "0") - 1).toString())}
                                className="w-10 h-10 bg-slate-100 rounded-l-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 transition-all text-xl font-bold"
                            >
                                -
                            </button>
                            <input
                                ref={inputRef}
                                type="number"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                className="w-full h-10 border-y border-slate-200 text-center font-bold text-lg focus:outline-none focus:border-indigo-500 z-10 text-slate-900 bg-white"
                                min="1"
                            />
                            <button
                                type="button"
                                onClick={() => setQty((parseInt(qty || "0") + 1).toString())}
                                className="w-10 h-10 bg-slate-100 rounded-r-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 transition-all text-xl font-bold"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            ยืนยัน
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
