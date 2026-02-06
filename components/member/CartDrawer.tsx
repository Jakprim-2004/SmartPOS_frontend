"use client";

import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Product } from "@/components/product/types";

export interface CartItem extends Product {
    quantity: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateQuantity: (productId: number, delta: number) => void;
    onRemoveItem: (productId: number) => void;
}

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }: CartDrawerProps) {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-indigo-600" />
                        ตะกร้าของฉัน ({cartItems.reduce((a, b) => a + b.quantity, 0)})
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cartItems.length > 0 ? cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                            <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.mainImageUrl || "https://placehold.co/100x100?text=Product"}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                                    <div className="text-xs text-slate-500">฿{item.price}/{item.unit}</div>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                            className="p-1 hover:bg-slate-100 text-slate-600"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, 1)}
                                            className="p-1 hover:bg-slate-100 text-slate-600"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="font-bold text-indigo-600">฿{(item.price * item.quantity).toLocaleString()}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => onRemoveItem(item.id)}
                                className="text-slate-400 hover:text-red-500 self-start"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 opacity-20" />
                            </div>
                            <p>ยังไม่มีสินค้าในตะกร้า</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>ยอดรวมทั้งหมด</span>
                        <span className="text-indigo-600">฿{total.toLocaleString()}</span>
                    </div>
                    <button
                        disabled={cartItems.length === 0}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${cartItems.length > 0
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1 shadow-indigo-200'
                            : 'bg-slate-300 cursor-not-allowed'
                            }`}
                        onClick={() => {
                            // Mock checkout
                            alert(`สั่งซื้อเรียบร้อย! ยอดเงิน ฿${total.toLocaleString()}`);
                            onClose();
                        }}
                    >
                        ยืนยันการสั่งซื้อ
                    </button>
                </div>
            </div>
        </>
    );
}
