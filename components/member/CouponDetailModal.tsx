"use client";

import { useEffect, useRef } from "react";
import { X, Clock, Tag, Info } from "lucide-react";
import bwipjs from "bwip-js";
import { Coupon } from "./types";

interface CouponDetailModalProps {
    coupon: Coupon;
    onClose: () => void;
}

export default function CouponDetailModal({ coupon, onClose }: CouponDetailModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            try {
                bwipjs.toCanvas(canvasRef.current, {
                    bcid: "code128",
                    text: coupon.code,
                    scale: 3,
                    height: 10,
                    includetext: false,
                    textxalign: "center",
                    backgroundcolor: "ffffff",
                });
            } catch (e) {
                console.error("Barcode Generation error", e);
            }
        }
    }, [coupon.code]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 pb-0 flex justify-between items-start">
                    <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-2xl">
                        <Tag className="w-6 h-6" />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{coupon.title}</h3>
                    <p className="text-slate-500 text-sm mb-6">{coupon.description}</p>

                    {/* Barcode Area */}
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 mb-6 flex flex-col items-center justify-center">
                        <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 w-full flex justify-center overflow-hidden">
                            <canvas ref={canvasRef} className="max-w-full h-auto"></canvas>
                        </div>
                        <div className="font-mono font-bold text-lg text-indigo-600 tracking-widest uppercase">
                            {coupon.code}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">แสดงบาร์โค้ดนี้ให้พนักงานเพื่อรับสิทธิ์</p>
                    </div>

                    {/* Meta */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="flex-1 text-left">ใช้ได้ถึง: <span className="font-bold">{new Date(coupon.expiryDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}</span></span>
                        </div>
                        <div className="flex items-start gap-3 text-xs text-slate-400 p-3">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <p className="text-left leading-relaxed">คูปองนี้สามารถใช้ได้เพียงครั้งเดียวเท่านั้น กรุณาแสดงให้พนักงานสแกนเพื่อรับส่วนลดตอนชำระเงินที่หน้าร้าน</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
