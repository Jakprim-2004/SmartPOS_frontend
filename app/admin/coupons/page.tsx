"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Tag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { showConfirm } from "@/utils/confirmToast";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, Coupon } from "@/lib/api/coupons";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Coupon>>({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 30;

    useEffect(() => {
        const timer = setTimeout(() => {
            loadCoupons();
        }, searchQuery ? 500 : 0);
        return () => clearTimeout(timer);
    }, [currentPage, searchQuery]);

    const loadCoupons = async () => {
        try {
            setIsLoading(true);
            const result = await getCoupons({
                page: currentPage,
                limit: itemsPerPage,
                search: searchQuery
            });

            // Robust data handling for both legacy and paginated responses
            if (Array.isArray(result)) {
                setCoupons(result);
                setTotalItems(result.length);
            } else if (result && result.data) {
                setCoupons(result.data);
                setTotalItems(result.total || 0);
            }
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถโหลดข้อมูลคูปองได้");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            code: '',
            description: '',
            discountType: 'fixed_amount',
            discountValue: 0,
            minSpend: 0,
            maxUsage: 100,
            isActive: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingId(coupon.id!);
        setFormData(coupon);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        showConfirm({
            title: "ลบคูปอง?",
            message: "คุณต้องการลบคูปองนี้ใช่หรือไม่",
            onConfirm: async () => {
                try {
                    await deleteCoupon(id);
                    setCoupons(prev => prev.filter(c => c.id !== id));
                    toast.success("ลบคูปองเรียบร้อย");
                } catch (error: any) {
                    toast.error(error.message || "ไม่สามารถลบคูปองได้");
                }
            }
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingId) {
                const updated = await updateCoupon(editingId, formData);
                setCoupons(prev => prev.map(c => c.id === editingId ? updated : c));
                toast.success("อัปเดตคูปองเรียบร้อย");
            } else {
                const created = await createCoupon(formData);
                setCoupons(prev => [created, ...prev]);
                toast.success("สร้างคูปองเรียบร้อย");
            }
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setIsSaving(false);
        }
    };

    // Format discount display
    const formatDiscount = (coupon: Coupon) => {
        const type = coupon.discountType || coupon.discount_type;
        const value = coupon.discountValue || coupon.discount_value || 0;
        return type === 'percentage' ? `${value}%` : `฿${value}`;
    };

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">จัดการคูปอง</h2>
                    <p className="text-slate-500">สร้างคูปองส่วนลดและของรางวัลแลกแต้ม</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    สร้างคูปองใหม่
                </button>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาคูปอง..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Empty State */}
            {coupons.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Tag className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">ยังไม่มีคูปอง</h3>
                    <p className="text-slate-500 mb-4">เริ่มต้นสร้างคูปองส่วนลดให้ลูกค้าของคุณ</p>
                    <button
                        onClick={handleOpenCreate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        สร้างคูปองแรก
                    </button>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="h-3 bg-gradient-to-r from-amber-400 to-orange-500" />
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${(coupon.isActive || coupon.is_active)
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {(coupon.isActive || coupon.is_active) ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="text-xs font-mono text-slate-400 mb-1">{coupon.code}</div>
                            <h3 className="font-bold text-lg text-slate-800 mb-1">{coupon.description || 'ไม่มีรายละเอียด'}</h3>
                            <div className="text-3xl font-bold text-indigo-600 mb-4">{formatDiscount(coupon)}</div>

                            <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-50 pt-4">
                                <div>ขั้นต่ำ: <span className="font-bold text-slate-700">฿{coupon.minSpend || coupon.min_spend || 0}</span></div>
                                <div>ใช้ไป: <span className="font-bold text-slate-700">{coupon.usedCount || coupon.currentUsage || coupon.current_usage || 0}/{coupon.maxUsage || coupon.max_usage || '∞'}</span></div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 flex gap-2 border-t border-slate-100">
                            <button
                                onClick={() => handleEdit(coupon)}
                                className="flex-1 py-2.5 bg-white text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Edit2 className="w-4 h-4" /> แก้ไข
                            </button>
                            <button
                                onClick={() => handleDelete(coupon.id!)}
                                className="flex-1 py-2.5 bg-white text-sm font-bold text-slate-600 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Trash2 className="w-4 h-4" /> ลบ
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {!isLoading && totalItems > 0 && (
                <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-white rounded-2xl shadow-sm">
                    <div className="text-sm text-slate-500 font-medium">
                        แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems.toLocaleString()} รายการ
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all group shadow-sm active:scale-95"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                        </button>

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1)
                                .filter(page => page === 1 || page === Math.ceil(totalItems / itemsPerPage) || Math.abs(page - currentPage) <= 1)
                                .map((page, idx, arr) => (
                                    <div key={page} className="flex items-center gap-1.5">
                                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                                            <span className="text-slate-300 font-black px-1 select-none">...</span>
                                        )}
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-9 h-9 rounded-xl font-bold transition-all duration-300 ${currentPage === page
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50"
                                                : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm active:scale-95"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    </div>
                                ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(Math.min(Math.ceil(totalItems / itemsPerPage), currentPage + 1))}
                            disabled={currentPage === Math.ceil(totalItems / itemsPerPage) || totalItems === 0}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all group shadow-sm active:scale-95"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                        </button>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800">{editingId ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}</h3>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">รหัสคูปอง</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400 font-mono uppercase"
                                    placeholder="เช่น SAVE100"
                                    value={formData.code || ''}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">รายละเอียด</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                                    placeholder="เช่น ส่วนลด 100 บาท"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">ประเภทส่วนลด</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                        value={formData.discountType || 'fixed_amount'}
                                        onChange={e => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed_amount' })}
                                    >
                                        <option value="fixed_amount">จำนวนเงิน (฿)</option>
                                        <option value="percentage">เปอร์เซ็นต์ (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">มูลค่าส่วนลด</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                                        placeholder="100"
                                        value={formData.discountValue || ''}
                                        onChange={e => setFormData({ ...formData, discountValue: +e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">ยอดขั้นต่ำ</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                                        placeholder="0"
                                        value={formData.minSpend || ''}
                                        onChange={e => setFormData({ ...formData, minSpend: +e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">จำนวนสิทธิ์</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                                        placeholder="100"
                                        value={formData.maxUsage || ''}
                                        onChange={e => setFormData({ ...formData, maxUsage: +e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                                    disabled={isSaving}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
                                    disabled={isSaving}
                                >
                                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
