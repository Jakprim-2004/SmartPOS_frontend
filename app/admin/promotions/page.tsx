"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Search, Edit2, Trash2, Calendar, Loader2, Package, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { showConfirm } from "@/utils/confirmToast";
import {
    getPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    Promotion,
    getPromotionProducts,
    setPromotionProducts
} from "@/lib/api/promotions";
import { getProducts } from "@/lib/api/products";
import { Product } from "@/lib/types";

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 30;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Promotion>>({});
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [productSearchTerm, setProductSearchTerm] = useState("");

    // Infinite Scroll State
    const [modalProducts, setModalProducts] = useState<Product[]>([]);
    const [modalPage, setModalPage] = useState(1);
    const [hasMoreProducts, setHasMoreProducts] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const productListRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, searchTerm ? 500 : 0);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, statusFilter]);

    const loadData = async () => {
        try {
            setLoading(true);
            let shopId: string | undefined;
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const user = JSON.parse(storedUser);
                        shopId = user.shopId;
                    } catch (e) { }
                }
            }

            const result = await getPromotions({
                shopId,
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                status: statusFilter === 'all' ? undefined : statusFilter
            });

            // Robust data handling: works with both Array and Paginated Object
            if (Array.isArray(result)) {
                setPromotions(result);
                setTotalItems(result.length);
            } else if (result && result.data) {
                setPromotions(result.data);
                setTotalItems(result.total || 0);
            } else {
                setPromotions([]);
                setTotalItems(0);
            }
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    const fetchModalProducts = useCallback(async (page: number, search: string, reset: boolean = false) => {
        if (loadingProducts || (!hasMoreProducts && !reset)) return;

        setLoadingProducts(true);
        try {
            const result = await getProducts({
                page,
                limit: 20,
                search
            });

            const newProducts = result.data || [];
            setModalProducts(prev => reset ? newProducts : [...prev, ...newProducts]);
            setHasMoreProducts(newProducts.length === 20);
        } catch (error) {
            console.error("Failed to fetch modal products:", error);
        } finally {
            setLoadingProducts(false);
        }
    }, [loadingProducts, hasMoreProducts]);

    // Handle search debounce
    useEffect(() => {
        if (!isModalOpen) return;

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(() => {
            setModalPage(1);
            setHasMoreProducts(true);
            fetchModalProducts(1, productSearchTerm, true);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [productSearchTerm, isModalOpen]);

    // Handle scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMoreProducts && !loadingProducts) {
            const nextPage = modalPage + 1;
            setModalPage(nextPage);
            fetchModalProducts(nextPage, productSearchTerm);
        }
    };

    // Initialize products when modal opens
    useEffect(() => {
        if (isModalOpen) {
            setModalPage(1);
            setHasMoreProducts(true);
            setModalProducts([]);
            fetchModalProducts(1, "", true);
        }
    }, [isModalOpen]);

    const getStatus = (promo: Promotion) => {
        const now = new Date();
        const start = promo.start_date ? new Date(promo.start_date) : null;
        const end = promo.end_date ? new Date(promo.end_date) : null;

        if (!promo.is_active) return 'ปิดใช้งาน';
        if (end && now > end) return 'หมดอายุ';
        if (start && now < start) return 'กำลังจะเริ่ม';
        return 'ใช้งานอยู่';
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            image_url: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            is_active: true,
            discount_type: 'percentage',
            discount_value: 0
        });
        setSelectedProductIds([]);
        setProductSearchTerm("");
        setIsModalOpen(true);
    };

    const handleEdit = async (promo: Promotion) => {
        setEditingId(promo.id);
        setFormData({
            ...promo,
            start_date: promo.start_date?.split('T')[0],
            end_date: promo.end_date?.split('T')[0]
        });

        try {
            const productIds = await getPromotionProducts(promo.id);
            setSelectedProductIds(productIds);
        } catch (error) {
            console.error("Failed to load promotion products:", error);
            setSelectedProductIds([]);
        }

        setProductSearchTerm("");
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        showConfirm({
            title: "ลบโปรโมชั่น?",
            message: "คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้",
            onConfirm: async () => {
                try {
                    await deletePromotion(id);
                    setPromotions(prev => prev.filter(p => p.id !== id));
                    toast.success("ลบโปรโมชั่นเรียบร้อย");
                } catch (error) {
                    toast.error("ไม่สามารถลบโปรโมชั่นได้");
                }
            }
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            console.log("Saving promotion, editingId:", editingId);
            let savedPromo: Promotion;
            if (editingId) {
                savedPromo = await updatePromotion(editingId, formData);
                if (!savedPromo) throw new Error("Update failed: Promotion not returned");

                await setPromotionProducts(editingId, selectedProductIds);
                setPromotions(prev => prev.map(p => p.id === editingId ? savedPromo : p));
                toast.success("แก้ไขโปรโมชั่นเรียบร้อย");
            } else {
                savedPromo = await createPromotion(formData);
                await setPromotionProducts(savedPromo.id, selectedProductIds);
                setPromotions(prev => [savedPromo, ...prev]);
                toast.success("สร้างโปรโมชั่นใหม่เรียบร้อย");
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Save error:", error);
            // Check for 404 specifically
            if (error.message?.includes('404') || error.status === 404) {
                toast.error("ไม่พบโปรโมชั่นนี้ในระบบ อาจถูกลบไปแล้ว");
            } else {
                toast.error("ไม่สามารถบันทึกข้อมูลได้");
            }
        } finally {
            setSaving(false);
        }
    };

    const toggleProductSelection = (productId: number) => {
        const product = modalProducts.find(p => p.id === productId);

        // Auto-set image if selecting and product has image
        if (product?.imageUrl && !selectedProductIds.includes(productId)) {
            setFormData(prev => ({ ...prev, image_url: product.imageUrl }));
        }

        setSelectedProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p>กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">จัดการโปรโมชั่น</h2>
                    <p className="text-slate-500">สร้างและแก้ไขโปรโมชั่นสำหรับสินค้าในร้าน</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    สร้างโปรโมชั่นใหม่
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาโปรโมชั่น..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-slate-600 focus:outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">สถานะทั้งหมด</option>
                    <option value="ใช้งานอยู่">ใช้งานอยู่</option>
                    <option value="กำลังจะเริ่ม">กำลังจะเริ่ม</option>
                    <option value="หมดอายุ">หมดอายุ</option>
                    <option value="ปิดใช้งาน">ปิดใช้งาน</option>
                </select>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {promotions.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-slate-100 text-center text-slate-400">
                        ไม่พบข้อมูลโปรโมชั่น
                    </div>
                ) : (
                    promotions.map((promo) => {
                        const status = getStatus(promo);
                        return (
                            <div key={promo.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-indigo-100 transition-colors">
                                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative">
                                    <img src={promo.image_url || "https://placehold.co/400x300?text=No+Image"} alt={promo.title} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-800 text-lg">{promo.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${status === 'ใช้งานอยู่' ? 'bg-green-100 text-green-700' :
                                            status === 'กำลังจะเริ่ม' ? 'bg-blue-100 text-blue-700' :
                                                status === 'หมดอายุ' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {status}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm truncate">{promo.description || "ไม่มีรายละเอียด"}</p>

                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-medium text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {promo.start_date ? new Date(promo.start_date).toLocaleDateString('th-TH') : '-'} - {promo.end_date ? new Date(promo.end_date).toLocaleDateString('th-TH') : '-'}
                                        </div>
                                        <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                                            <Package className="w-3.5 h-3.5" />
                                            ส่วนลด: {promo.discount_value} {promo.discount_type === 'percentage' ? '%' : 'บาท'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 px-4">
                                    <button
                                        onClick={() => handleEdit(promo)}
                                        className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all active:scale-95"
                                        title="แก้ไข"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo.id)}
                                        className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all active:scale-95"
                                        title="ลบ"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && totalItems > 0 && (
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-800">
                                    {editingId ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
                            <form id="promo-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Left Side: Basic Info */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">ข้อมูลพื้นฐาน</h4>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อโปรโมชั่น <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 transition-all"
                                                placeholder="เช่น ลด 20% เฉพาะเมนูกาแฟ"
                                                value={formData.title || ''}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">รายละเอียดโปรโมชั่น</label>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[100px] resize-none text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                                                placeholder="ระบุเงื่อนไขหรือรายละเอียดเพิ่มเติม..."
                                                value={formData.description || ''}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">ส่วนลดและการตั้งค่า</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1.5">รูปแบบส่วนลด</label>
                                                <select
                                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-900"
                                                    value={formData.discount_type || 'percentage'}
                                                    onChange={e => setFormData({ ...formData, discount_type: e.target.value as any })}
                                                >
                                                    <option value="percentage">เปอร์เซ็นต์ (%)</option>
                                                    <option value="fixed_amount">จำนวนเงิน (บาท)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1.5">ค่าส่วนลด</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                                                    value={formData.discount_value || 0}
                                                    onChange={e => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1.5">เริ่มวันที่</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                                                    value={formData.start_date || ''}
                                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1.5">ถึงวันที่</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                                                    value={formData.end_date || ''}
                                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 py-2">
                                            <input
                                                type="checkbox"
                                                id="promo-active"
                                                checked={formData.is_active || false}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="promo-active" className="text-sm font-bold text-slate-700">เปิดใช้งานทันที</label>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">รูปภาพแบนเนอร์</h4>
                                        <div className="space-y-3">
                                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => setFormData({ ...formData, image_url: reader.result as string });
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                {formData.image_url ? (
                                                    <div className="relative h-40 w-full rounded-xl overflow-hidden shadow-inner">
                                                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-sm">เปลี่ยนรูปภาพ</div>
                                                    </div>
                                                ) : (
                                                    <div className="py-6">
                                                        <Plus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                        <div className="text-sm font-bold text-slate-500">อัปโหลดรูปภาพโปรโมชั่น</div>
                                                        <div className="text-xs text-slate-400 mt-1">PNG, JPG ขนาดแนะนำ 800x400px</div>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-900"
                                                placeholder="หรือวาง URL รูปภาพที่นี่..."
                                                value={formData.image_url?.startsWith('data:') ? '' : (formData.image_url || '')}
                                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Product Selection */}
                                <div className="space-y-6 flex flex-col h-full bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">เลือกสินค้าที่ร่วมรายการ</h4>
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                            เลือกแล้ว {selectedProductIds.length} รายการ
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="ค้นหารายชื่อสินค้าหรือ SKU..."
                                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-white text-sm text-slate-900"
                                            value={productSearchTerm}
                                            onChange={(e) => setProductSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div
                                        className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-[300px]"
                                        onScroll={handleScroll}
                                    >
                                        {modalProducts.length === 0 && !loadingProducts ? (
                                            <div className="text-center py-10 text-slate-400 text-sm">ไม่พบสินค้าที่ต้องการ</div>
                                        ) : (
                                            modalProducts.map(product => {
                                                const isSelected = selectedProductIds.includes(product.id);
                                                return (
                                                    <div
                                                        key={product.id}
                                                        onClick={() => toggleProductSelection(product.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${isSelected
                                                            ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100'
                                                            : 'bg-white border-slate-100 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 border ${isSelected ? 'border-white/20' : 'border-slate-100'}`}>
                                                            <img
                                                                src={product.imageUrl || "https://placehold.co/100"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                                                {product.name}
                                                            </div>
                                                            <div className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                                SKU: {product.barcode || 'N/A'} • ฿{product.price}
                                                            </div>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-300'
                                                            }`}>
                                                            {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        {loadingProducts && (
                                            <div className="flex justify-center py-4">
                                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedProductIds(modalProducts.map(p => p.id))}
                                            className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-all"
                                        >
                                            เลือกทั้งหมด
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedProductIds([])}
                                            className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-all"
                                        >
                                            ล้างทั้งหมด
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 font-extrabold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                            >
                                ยกเลิก
                            </button>
                            <button
                                form="promo-form"
                                type="submit"
                                disabled={saving}
                                className="flex-[2] py-4 bg-indigo-600 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>กำลังบันทึกข้อมูล...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>บันทึกโปรโมชั่น</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
