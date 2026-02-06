"use client";

import { CreditCard, QrCode, Smartphone, X, Tag } from "lucide-react";

import { useState, useEffect } from "react";
import bwipjs from "bwip-js";

interface Customer {
    id: number;
    name: string;
    phone: string;
    points: number;
}

interface PaymentModalProps {
    show: boolean;
    total: number;
    cartLength: number;
    selectedCustomer: Customer | null;
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    cashReceived: string;
    setCashReceived: (amount: string) => void;
    onConfirm: (pointsRedeemed: number, finalTotal: number, couponCode?: string) => void;
    onClose: () => void;
    pointsRedeemed: number;
    setPointsRedeemed: (points: number) => void;
}

export default function PaymentModal({
    show,
    total,
    cartLength,
    selectedCustomer,
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    onConfirm,
    onClose,
    pointsRedeemed,
    setPointsRedeemed
}: PaymentModalProps) {
    const [storeSettings, setStoreSettings] = useState<any>(null);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Calculate discount: 1000 points = 10 Baht
    const discountFromPoints = Math.floor(pointsRedeemed / 1000) * 10;

    // Calculate Coupon Discount
    let couponDiscount = 0;
    if (appliedCoupon && appliedCoupon.valid) {
        if (typeof appliedCoupon.discount === 'number') {
            couponDiscount = appliedCoupon.discount;
        } else {
            // Fallback if full coupon object provided
            if (appliedCoupon.discountType === 'percentage' || appliedCoupon.discount_type === 'percentage') {
                couponDiscount = (total * (appliedCoupon.discountValue || 0)) / 100;
            } else {
                couponDiscount = appliedCoupon.discountValue || appliedCoupon.discount_value || 0;
            }
        }
    }

    const finalTotal = Number(Math.max(0, total - discountFromPoints - couponDiscount).toFixed(2));

    const handleApplyCoupon = async () => {
        if (!couponCode) return;

        // Ensure customer is selected
        if (!selectedCustomer) {
            import('react-hot-toast').then(m => m.default.error("กรุณาเลือกสมาชิกก่อนใช้คูปอง"));
            return;
        }

        setIsValidatingCoupon(true);
        try {
            const { validateCoupon } = await import('@/lib/api/coupons');
            // Ensure shopId is handled by the updated api function (auto-fallback)
            const coupon = await validateCoupon(couponCode, total, selectedCustomer?.id);

            if (!coupon.valid) {
                throw new Error(coupon.message || "คูปองไม่สามารถใช้งานได้");
            }

            setAppliedCoupon(coupon);
            setCashReceived(""); // Reset cash input to force re-entry/re-calculation based on new total
            import('react-hot-toast').then(m => m.default.success("ใช้คูปองสำเร็จ!"));
        } catch (e: any) {
            import('react-hot-toast').then(m => m.default.error(e.message || "รหัสคูปองไม่ถูกต้อง"));
            setAppliedCoupon(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    useEffect(() => {
        // Load settings to get PromptPay number
        import('@/lib/api/settings').then(m => m.getSettings().then(setStoreSettings));
    }, []);

    // Reset state when modal closes
    useEffect(() => {
        if (!show) {
            setCouponCode("");
            setAppliedCoupon(null);
            setCashReceived("");
            setPaymentMethod("cash");
            setIsValidatingCoupon(false);
        }
    }, [show]);

    useEffect(() => {
        if (show && paymentMethod === "scan") {
            try {
                const targetNumber = storeSettings?.promptpayNumber || "0888888888"; // Fallback
                const { generatePromptPayPayload } = require('@/lib/utils/payment-utils');
                const text = generatePromptPayPayload(targetNumber, finalTotal);

                bwipjs.toCanvas("qr-code-canvas", {
                    bcid: "qrcode",
                    text: text,
                    scale: 6,
                    includetext: false,
                    textxalign: "center",
                    backgroundcolor: "ffffff",
                    paddingwidth: 4,
                    paddingheight: 4
                });
            } catch (e) {
                console.error("QR Generation Error:", e);
            }
        }
    }, [show, paymentMethod, finalTotal, storeSettings]);
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]">
                {/* Summary Side */}
                <div className="bg-indigo-600 text-white p-6 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/2 -translate-y-1/4">
                        <CreditCard className="w-48 h-48" />
                    </div>
                    <div>
                        <h3 className="text-indigo-200 font-medium mb-1">
                            ยอดชำระสุทธิ
                        </h3>
                        <h2 className="text-4xl font-bold">฿{finalTotal.toLocaleString()}</h2>
                        {(discountFromPoints > 0 || couponDiscount > 0) && (
                            <p className="text-indigo-200 text-xs mt-1 line-through opacity-60">
                                ฿{total.toLocaleString()}
                            </p>
                        )}
                        {cartLength > 0 && (
                            <p className="text-indigo-200 text-sm mt-4">
                                {cartLength} รายการสินค้า
                            </p>
                        )}
                    </div>
                    <div className="space-y-2 relative z-10">
                        {selectedCustomer && (
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                                <p className="text-xs text-indigo-100 mb-1">สมาชิก</p>
                                <div className="flex justify-between items-center">
                                    <p className="font-bold">{selectedCustomer.name}</p>
                                    <p className="text-xs bg-amber-500 px-2 py-0.5 rounded-full">{(selectedCustomer.points || 0).toLocaleString()} แต้ม</p>
                                </div>

                                {selectedCustomer.points >= 1000 && (
                                    <div className="mt-3 pt-3 border-t border-white/20">
                                        <button
                                            onClick={() => setPointsRedeemed(pointsRedeemed > 0 ? 0 : Math.floor(selectedCustomer.points / 1000) * 1000)}
                                            className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${pointsRedeemed > 0 ? 'bg-amber-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                                                }`}
                                        >
                                            {pointsRedeemed > 0 ? `คืนแต้ม (ใช้ไป ${pointsRedeemed})` : 'ใช้แต้มลดราคา'}
                                        </button>
                                        {pointsRedeemed > 0 && (
                                            <p className="text-[10px] text-indigo-100 mt-1 text-center">
                                                ลดไป ฿{discountFromPoints.toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Method Side */}
                <div className="p-6 md:w-2/3 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl text-slate-800">
                            เลือกวิธีชำระเงิน
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="text-slate-400 hover:text-slate-600 w-5 h-5" />
                        </button>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            onClick={() => setPaymentMethod("cash")}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "cash"
                                ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                                : "border-slate-100 text-slate-500 hover:border-slate-200"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold">เงินสด</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod("scan")}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "scan"
                                ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                                : "border-slate-100 text-slate-500 hover:border-slate-200"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <QrCode className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold">สแกนจ่าย</span>
                        </button>
                    </div>

                    {/* Payment Details */}
                    <div className="flex-1 space-y-4">
                        {paymentMethod === "cash" && (
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700">
                                    รับเงินมา
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {[100, 500, 1000].map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => setCashReceived(amt.toString())}
                                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-sm transition-colors"
                                        >
                                            {amt}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCashReceived(finalTotal.toString())}
                                        className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 font-bold text-sm transition-colors"
                                    >
                                        พอดี
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    placeholder="ระบุจำนวนเงิน..."
                                    className="w-full text-3xl font-bold p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right text-slate-800"
                                    value={cashReceived}
                                    onChange={(e) => setCashReceived(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <span className="text-slate-500 font-medium">เงินทอน</span>
                                    <span
                                        className={`text-2xl font-bold ${Number(cashReceived) - finalTotal < 0
                                            ? "text-slate-300"
                                            : "text-green-600"
                                            }`}
                                    >
                                        ฿{Math.max(0, Number(cashReceived) - finalTotal).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}
                        {paymentMethod === "scan" && (
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-100 mb-3 flex items-center justify-center">
                                    <canvas id="qr-code-canvas" style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '180px' }}></canvas>
                                </div>
                                <p className="text-slate-500 text-sm font-medium">
                                    สแกน PromptPay เพื่อชำระเงิน
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Coupon Section - Moved below payment details for better flow */}
                    <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-amber-600" />
                            <label className="text-xs font-bold text-amber-700 uppercase tracking-wide">คูปองส่วนลด / รหัสรางวัล</label>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="ใส่รหัสคูปอง..."
                                className="flex-1 px-4 py-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-mono uppercase text-slate-800 placeholder:text-slate-400"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                disabled={!!appliedCoupon || isValidatingCoupon}
                            />
                            {appliedCoupon ? (
                                <button
                                    onClick={() => {
                                        setAppliedCoupon(null);
                                        setCouponCode("");
                                        setCashReceived(""); // Reset cash when coupon removed
                                    }}
                                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                            ) : (
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode || isValidatingCoupon}
                                    className="px-5 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {isValidatingCoupon ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : "ใช้"}
                                </button>
                            )}
                        </div>
                        {appliedCoupon && appliedCoupon.valid && (
                            <div className="mt-3 flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-3 py-2 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                ส่วนลด ฿{couponDiscount.toLocaleString()} ถูกนำไปใช้
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onConfirm(pointsRedeemed, finalTotal, appliedCoupon ? couponCode : undefined)}
                        disabled={paymentMethod === "cash" && Number(cashReceived) < finalTotal}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                    >
                        ยืนยันการชำระเงิน
                    </button>
                </div>
            </div>
        </div>
    );
}
