"use client";

import { X, ShoppingBag, Calendar, CreditCard, Gift, Hash } from "lucide-react";

interface PurchaseDetailModalProps {
    purchase: any;
    onClose: () => void;
}

export default function PurchaseDetailModal({ purchase, onClose }: PurchaseDetailModalProps) {
    if (!purchase) return null;

    const date = new Date(purchase.date);
    const formattedDate = date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">รายละเอียดคำสั่งซื้อ</h3>
                            <p className="text-indigo-100 text-xs mt-0.5">{purchase.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> วันที่ทำรายการ
                            </label>
                            <p className="text-sm font-semibold text-slate-700">{formattedDate}</p>
                            <p className="text-xs text-slate-500">{formattedTime} น.</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 justify-end">
                                <CreditCard className="w-3 h-3" /> วิธีชำระเงิน
                            </label>
                            <p className="text-sm font-semibold text-slate-700">
                                {purchase.paymentMethod === 'cash' ? 'เงินสด' :
                                    purchase.paymentMethod === 'scan' || purchase.paymentMethod === 'promptpay' ? 'สแกนจ่าย' : 'อื่นๆ'}
                            </p>
                            <p className="text-xs text-green-600 font-bold">สำเร็จ</p>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">รายการสินค้า</label>
                        <div className="space-y-2">
                            {purchase.rawItems?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex-1 pr-4">
                                        <p className="text-sm font-bold text-slate-800 leading-tight">{item.productName || item.name}</p>
                                        <p className="text-xs text-slate-500">{item.quantity || item.qty} x ฿{item.price.toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">
                                        ฿{((item.price) * (item.quantity || item.qty)).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">ยอดรวม</span>
                            <span className="text-slate-700 font-medium">฿{(purchase.subtotal || 0).toLocaleString()}</span>
                        </div>
                        {purchase.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">ส่วนลด</span>
                                <span className="text-orange-600 font-medium">-฿{purchase.discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                            <span className="font-bold text-slate-800">ยอดสุทธิ</span>
                            <span className="text-xl font-bold text-indigo-600">฿{purchase.total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Points Earned */}
                    <div className="flex items-center justify-between bg-green-50 border border-green-100 p-4 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 text-green-600 p-2 rounded-xl">
                                <Gift className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-green-600 font-bold">คะแนนที่ได้รับ</p>
                                <p className="text-xs text-green-700">จากคำสั่งซื้อนี้</p>
                            </div>
                        </div>
                        <p className="text-xl font-bold text-green-600">+{purchase.pointsEarned} <span className="text-xs">แต้ม</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
