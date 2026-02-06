"use client";

import { X, TrendingUp, TrendingDown } from "lucide-react";
import { StockItem, StockDetail, formatDateTime } from "./types";

interface StockDetailModalProps {
    show: boolean;
    type: "in" | "out";
    stock: StockItem | null;
    details: StockDetail[];
    onClose: () => void;
}

export default function StockDetailModal({ show, type, stock, details, onClose }: StockDetailModalProps) {
    if (!show || !stock) return null;

    const isStockIn = type === "in";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className={`flex items-center justify-between p-6 ${isStockIn ? 'bg-green-50' : 'bg-red-50'}`}>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isStockIn ? 'bg-green-100' : 'bg-red-100'}`}>
                            {isStockIn ? (
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                        {isStockIn ? 'ข้อมูลการรับเข้าสต๊อก' : 'ข้อมูลการขาย'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/80 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Product Info */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-800 text-lg">{stock.name}</p>
                            <p className="text-sm text-slate-500">บาร์โค้ด: {stock.barcode}</p>
                        </div>
                        <div className={`text-right px-4 py-2 rounded-xl ${isStockIn ? 'bg-green-100' : 'bg-red-100'}`}>
                            <p className="text-xs text-slate-500">{isStockIn ? 'รวมรับเข้า' : 'รวมขายออก'}</p>
                            <p className={`text-2xl font-bold ${isStockIn ? 'text-green-600' : 'text-red-600'}`}>
                                {isStockIn ? stock.stockIn.toLocaleString() : stock.stockOut.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">บาร์โค้ด</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">รายการ</th>
                                    <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">จำนวน</th>
                                    <th className="text-center py-3 px-4 font-semibold text-slate-600 text-sm">วันที่</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.length > 0 ? (
                                    details.map((item) => (
                                        <tr key={item.id} className="border-t border-slate-100">
                                            <td className="py-3 px-4 font-mono text-sm text-slate-600">{item.barcode}</td>
                                            <td className="py-3 px-4 font-medium text-slate-800">{item.name}</td>
                                            <td className={`py-3 px-4 text-right font-bold ${isStockIn ? 'text-green-600' : 'text-red-600'}`}>
                                                {isStockIn ? '+' : '-'}{item.qty.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-center text-slate-600 text-sm">
                                                {formatDateTime(item.date)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-400">
                                            ไม่มีข้อมูล
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-6 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}
