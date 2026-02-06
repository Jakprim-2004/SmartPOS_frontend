"use client";

import { X, Save, Wand2, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Product, Category } from "@/lib/types";
import toast from "react-hot-toast";
import { uploadProductImage } from "@/lib/api/upload";

interface ProductModalProps {
    show: boolean;
    product: CheckPartialProduct | null;
    categories: Category[];
    onClose: () => void;
    onSave: (product: Partial<Product>) => void;
}

// Helper type for form state since some fields might be empty initially
type CheckPartialProduct = Partial<Product> & {
    name?: string;
    barcode?: string;
    cost?: number | string;
    price?: number | string;
    categoryId?: number;
    unit?: string;
    detail?: string;
    imageUrl?: string;
};

export default function ProductModal({ show, product, categories, onClose, onSave }: ProductModalProps) {
    const [formData, setFormData] = useState<CheckPartialProduct>({});
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                setUploading(true);
                const file = e.target.files[0];
                const url = await uploadProductImage(file);
                handleChange("imageUrl", url);
                toast.success("อัพโหลดรูปภาพสำเร็จ");
            } catch (error) {
                console.error(error);
                toast.error("อัพโหลดรูปภาพล้มเหลว");
            } finally {
                setUploading(false);
            }
        }
    };

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                categoryId: product.categoryId || (typeof product.category === 'object' ? product.category.id : undefined)
            });
        } else {
            setFormData({});
        }
    }, [product, show]);

    if (!show) return null;

    const handleChange = (field: keyof CheckPartialProduct, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateBarcode = () => {
        // Mock generating random 13 digit barcode
        let digits = "";
        for (let i = 0; i < 12; i++) {
            digits += Math.floor(Math.random() * 10);
        }

        // Calculate check digit (EAN-13 logic mock)
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        const newBarcode = digits + checkDigit;

        handleChange("barcode", newBarcode);
        toast.success("สร้างบาร์โค้ดสำเร็จ: " + newBarcode);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.barcode || formData.barcode.length !== 13) {
            toast.error("บาร์โค้ดต้องมี 13 หลัก");
            return;
        }
        if (!formData.name) {
            toast.error("กรุณากรอกชื่อสินค้า");
            return;
        }
        if (!formData.cost) {
            toast.error("กรุณากรอกราคาทุน");
            return;
        }
        if (!formData.price) {
            toast.error("กรุณากรอกราคาขาย");
            return;
        }
        if (Number(formData.price) < Number(formData.cost)) {
            toast.error("ราคาขายต้องไม่ต่ำกว่าราคาทุน");
            return;
        }
        if (!formData.categoryId) {
            toast.error("กรุณาเลือกหมวดหมู่");
            return;
        }

        const payload: Partial<Product> = {
            ...formData,
            cost: Number(formData.cost),
            price: Number(formData.price),
            stock: Number(formData.stock || 0),
            categoryId: Number(formData.categoryId)
        };

        onSave(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">
                        {formData.id ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Image Upload */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-slate-700 mb-1">รูปสินค้า</label>
                            <div className="flex gap-4 items-start">
                                {formData.imageUrl ? (
                                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 group">
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => handleChange("imageUrl", "")}
                                                className="p-1 bg-white rounded-full text-red-500 hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                                        <ImageIcon className="w-8 h-8 opacity-50" />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="product-image-upload"
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="product-image-upload"
                                        className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        {uploading ? "กำลังอัพโหลด..." : "เลือกรูปภาพ"}
                                    </label>
                                    <p className="text-xs text-slate-400 mt-2">
                                        รองรับไฟล์ JPG, PNG. ระบบจะบีบอัดไฟล์อัตโนมัติก่อนบันทึก.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Barcode */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-slate-700 mb-1">บาร์โค้ด <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-slate-900"
                                    value={formData.barcode || ""}
                                    onChange={(e) => {
                                        if (/^\d{0,13}$/.test(e.target.value)) {
                                            handleChange("barcode", e.target.value);
                                        }
                                    }}
                                    placeholder="885..."
                                    maxLength={13}
                                />
                                <button
                                    type="button"
                                    onClick={generateBarcode}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Wand2 className="w-4 h-4" />
                                    สร้างอัตโนมัติ
                                </button>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                                value={formData.name || ""}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="เช่น กาแฟลาเต้เย็น"
                            />
                        </div>

                        {/* Cost */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ราคาทุน <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                                value={formData.cost || ""}
                                onChange={(e) => handleChange("cost", e.target.value)}
                                min="0"
                                step="any"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ราคาขาย <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                                value={formData.price || ""}
                                onChange={(e) => handleChange("price", e.target.value)}
                                min="0"
                                step="any"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                            <select
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                                value={formData.categoryId || ""}
                                onChange={(e) => handleChange("categoryId", Number(e.target.value))}
                            >
                                <option value="">เลือกหมวดหมู่...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Unit */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">หน่วยนับ</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                                value={formData.unit || ""}
                                onChange={(e) => handleChange("unit", e.target.value)}
                                placeholder="เช่น ชิ้น, แก้ว, กล่อง"
                            />
                        </div>

                        {/* Detail */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
                            <textarea
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-24 resize-none text-slate-900"
                                value={formData.detail || ""}
                                onChange={(e) => handleChange("detail", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
