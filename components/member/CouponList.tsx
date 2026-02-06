"use client";

import { useState, useEffect } from "react";
import { Coupon } from "./types";
import { Ticket, Search, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import CouponDetailModal from "./CouponDetailModal";

interface CouponListProps {
    coupons: Coupon[];
}

export default function CouponList({ coupons }: CouponListProps) {
    const [filter, setFilter] = useState<'active' | 'used'>('active');
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    const filteredCoupons = coupons.filter(c =>
        filter === 'active' ? (!c.isUsed && new Date(c.expiryDate) > new Date()) : (c.isUsed || new Date(c.expiryDate) <= new Date())
    );

    const handleUseCoupon = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
    };

    // Client-side pagination logic
    const ITEMS_PER_PAGE = 30;
    const [currentPage, setCurrentPage] = useState(1);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE);
    const paginatedCoupons = filteredCoupons.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-4">
            {selectedCoupon && (
                <CouponDetailModal
                    coupon={selectedCoupon}
                    onClose={() => setSelectedCoupon(null)}
                />
            )}
            {/* Filter Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'active'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    ใช้งานได้ ({coupons.filter(c => !c.isUsed).length})
                </button>
                <button
                    onClick={() => setFilter('used')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'used'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    ประวัติ ({coupons.filter(c => c.isUsed).length})
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedCoupons.length > 0 ? paginatedCoupons.map((coupon) => (
                    <div
                        key={coupon.id}
                        className={`bg-white rounded-2xl border flex overflow-hidden relative group ${filter === 'active' ? 'border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300' : 'border-slate-100 opacity-70 grayscale'
                            }`}
                    >
                        {/* Left Side (Image) */}
                        <div className="w-24 bg-slate-100 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={coupon.imageUrl || "https://placehold.co/100x100?text=Coupon"}
                                alt={coupon.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Perforated Line Decoration */}
                            <div className="absolute right-0 top-0 bottom-0 w-[4px] border-r-2 border-dashed border-white flex flex-col justify-between -mr-[2px]"></div>
                        </div>

                        {/* Right Side (Content) */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800">{coupon.title}</h4>
                                <p className="text-sm text-slate-500 line-clamp-2 mt-1">{coupon.description}</p>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> หมดอายุ: {new Date(coupon.expiryDate).toLocaleDateString('th-TH')}
                                </div>
                                {filter === 'active' ? (
                                    <button
                                        onClick={() => handleUseCoupon(coupon)}
                                        className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        ใช้ทันที
                                    </button>
                                ) : (
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                        {coupon.isUsed ? 'ใช้แล้ว' : 'หมดอายุ'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Top/Bottom Circles for ticket look */}
                        <div className="absolute top-0 right-1/4 -mt-2 w-4 h-4 bg-slate-50 rounded-full"></div>
                        <div className="absolute bottom-0 right-1/4 -mb-2 w-4 h-4 bg-slate-50 rounded-full"></div>
                    </div>
                )) : (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>ไม่มีคูปอง{filter === 'active' ? 'ที่ใช้งานได้' : 'ในประวัติ'}</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ก่อนหน้า
                    </button>
                    <span className="text-sm text-slate-600 font-medium">
                        หน้า {currentPage} จาก {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ถัดไป
                    </button>
                </div>
            )}
        </div>
    );
}
