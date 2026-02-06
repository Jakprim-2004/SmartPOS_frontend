"use client";

import { X, Clock, User, Trash2, RotateCcw } from "lucide-react";

interface HeldBill {
    id: number;
    billNumber: string;
    items: any[];
    customerId: number | null;
    total: number;
    createdAt: Date;
    [key: string]: any;
}

interface HeldBillModalProps {
    show: boolean;
    heldBills: HeldBill[];
    onRestore: (bill: HeldBill) => void;
    onDelete: (id: number) => void;
    onClose: () => void;
}

export default function HeldBillModal({
    show,
    heldBills,
    onRestore,
    onDelete,
    onClose,
}: HeldBillModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        รายการพักบิล ({heldBills.length})
                    </h3>
                    <button onClick={onClose}>
                        <X className="text-slate-400 hover:text-slate-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {heldBills.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <p>ไม่มีรายการที่พักไว้</p>
                        </div>
                    ) : (
                        heldBills.map((bill) => (
                            <div
                                key={bill.id}
                                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:border-indigo-300 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-800 text-lg">
                                                ฿{bill.total.toLocaleString()}
                                            </p>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{bill.id}</span>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {new Date(bill.createdAt).toLocaleTimeString("th-TH", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}{" "}
                                            • {bill.items?.length || 0} รายการ
                                        </p>
                                    </div>
                                    {bill.customerId && (
                                        <div className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            สมาชิก #{bill.customerId}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => onRestore(bill)}
                                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        เรียกคืน
                                    </button>
                                    <button
                                        onClick={() => onDelete(bill.id)}
                                        className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-bold hover:bg-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
