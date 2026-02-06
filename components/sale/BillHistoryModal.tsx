"use client";

import { X, History, Printer, Search, Calendar, ArrowUpRight } from "lucide-react";

interface BillHistory {
    id: number | string;
    billNumber?: string;
    createdAt: Date | string;
    cart: any[];
    customer: any | null;
    total: number;
    paymentMethod: string;
    cashReceived?: string;
    staff?: {
        name: string;
    };
}

interface BillHistoryModalProps {
    show: boolean;
    bills: BillHistory[];
    onPrint: (bill: BillHistory) => void;
    onClose: () => void;
}

export default function BillHistoryModal({
    show,
    bills,
    onPrint,
    onClose,
}: BillHistoryModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-600" />
                        ประวัติการขาย ({bills.length})
                    </h3>
                    <button onClick={onClose}>
                        <X className="text-slate-400 hover:text-slate-600" />
                    </button>
                </div>

                {/* Search & Filter (Mock) */}
                <div className="p-3 border-b border-slate-100 bg-white flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาตามเลขที่บิล, ชื่อลูกค้า..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>
                    <button className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200">
                        <Calendar className="w-4 h-4" />
                        วันนี้
                    </button>
                </div>

                {/* Bill List */}
                <div className="flex-1 overflow-y-auto p-0 bg-slate-50/50">
                    {bills.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                            <History className="w-12 h-12 opacity-20" />
                            <p>ยังไม่มีประวัติการขาย</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-100/80 sticky top-0 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-3">เลขบิล / เวลา</th>
                                    <th className="px-6 py-3">ลูกค้า</th>
                                    <th className="px-6 py-3">ผู้ขาย</th>
                                    <th className="px-6 py-3 text-right">ยอดรวม</th>
                                    <th className="px-6 py-3 text-center">วิธีชำระ</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {bills.map((bill) => (
                                    <tr key={bill.id} className="bg-white hover:bg-indigo-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700 flex flex-col">
                                            <span className="font-bold text-indigo-700">
                                                {bill.billNumber || `ID: #${bill.id}`}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {(() => {
                                                    const date = bill.createdAt instanceof Date ? bill.createdAt : new Date(bill.createdAt);
                                                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });
                                                })()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {bill.customer ? (
                                                <div className="font-bold text-slate-700">{bill.customer.name}</div>
                                            ) : (
                                                <span className="text-slate-400 italic">ลูกค้าทั่วไป</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-500">{bill.staff?.name || 'Admin'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                                            ฿{bill.total.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${bill.paymentMethod === 'cash'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                {bill.paymentMethod === 'cash' ? 'เงินสด' : 'สแกนจ่าย'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onPrint(bill)}
                                                className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-100 rounded-full transition-colors"
                                                title="พิมพ์ใบเสร็จ"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
