"use client";

import { X, Receipt, Banknote, QrCode } from "lucide-react";
import { BillSale, formatThaiDate } from "./types";

interface BillDetailModalProps {
    show: boolean;
    bill: BillSale | null;
    onClose: () => void;
}

export default function BillDetailModal({ show, bill, onClose }: BillDetailModalProps) {
    if (!show || !bill) return null;

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'Cash':
            case 'Cash ':
                return <Banknote className="w-4 h-4" />;
            case 'PromptPay':
                return <QrCode className="w-4 h-4" />;
            default:
                return <Banknote className="w-4 h-4" />;
        }
    };

    const getPaymentMethodText = (method: string) => {
        switch (method) {
            case 'Cash':
            case 'Cash ':
                return 'เงินสด';
            case 'PromptPay':
                return 'พร้อมเพย์';
            default:
                return 'เงินสด';
        }
    };

    const getPaymentMethodColor = (method: string) => {
        switch (method) {
            case 'Cash':
            case 'Cash ':
                return 'text-green-600';
            case 'PromptPay':
                return 'text-blue-600';
            default:
                return 'text-green-600';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <Receipt className="w-5 h-5 text-indigo-600" />
                        </div>
                        รายละเอียดบิล #{bill.id}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Bill Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-sm text-slate-500 mb-1">วันที่ออกบิล</p>
                            <p className="font-semibold text-slate-800">{formatThaiDate(bill.payDate)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-sm text-slate-500 mb-1">ชำระโดย</p>
                            <p className={`font-semibold inline-flex items-center gap-2 ${getPaymentMethodColor(bill.paymentMethod)}`}>
                                {getPaymentMethodIcon(bill.paymentMethod)}
                                {getPaymentMethodText(bill.paymentMethod)}
                            </p>
                        </div>
                        <div className="bg-indigo-600 rounded-xl p-4 text-white">
                            <p className="text-sm text-indigo-200 mb-1">ยอดรวมทั้งสิ้น</p>
                            <p className="text-2xl font-bold">฿{bill.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>



                    {/* Items Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">#</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">รายการสินค้า</th>
                                    <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">ราคา/หน่วย</th>
                                    <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">จำนวน</th>
                                    <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">รวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.billSaleDetails.map((item, index) => (
                                    <tr key={item.id} className="border-t border-slate-100">
                                        <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-slate-800">{item.product.name}</p>
                                            <p className="text-xs text-slate-400">ID: {item.product.id}</p>
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-600">฿{item.price.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-right text-slate-600">{item.qty}</td>
                                        <td className="py-3 px-4 text-right font-semibold text-slate-800">
                                            ฿{(item.price * item.qty).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
