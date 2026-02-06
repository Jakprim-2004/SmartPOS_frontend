"use client";

import { X, Upload, Trash2, Star, Image as ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Product } from "@/lib/types";
import { getProductImages, addProductImage, removeProductImage, setMainProductImage } from "@/lib/api/products";
import toast from "react-hot-toast";
import Image from "next/image";

interface ProductImageModalProps {
    show: boolean;
    product: Product | null;
    onClose: () => void;
    onUpdateProduct: (updatedProduct: Product) => void;
}

interface ProductImage {
    id: number;
    url: string;
    isMain: boolean;
}

export default function ProductImageModal({ show, product, onClose, onUpdateProduct }: ProductImageModalProps) {
    // Mock existing images state (in real app, fetch from API)
    const [images, setImages] = useState<ProductImage[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch images when product changes or modal opens
    useEffect(() => {
        if (show && product) {
            fetchImages();
        }
    }, [show, product]);

    const fetchImages = async () => {
        if (!product) return;
        setLoading(true);
        try {
            const data = await getProductImages(product.id);
            setImages(data.map((img: any) => ({
                id: img.id,
                url: img.url,
                isMain: img.is_main
            })));
        } catch (error) {
            console.error("Failed to fetch images:", error);
            toast.error("โหลดรูปภาพล้มเหลว");
        } finally {
            setLoading(false);
        }
    };

    if (!show || !product) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && product) {
            const { uploadProductImage } = await import("@/lib/api/upload");
            const toastId = toast.loading("กำลังอัปโหลดรูปภาพ...");

            try {
                // 1. Upload to storage
                const imageUrl = await uploadProductImage(file);

                // 2. Save to DB
                await addProductImage(product.id, imageUrl, images.length === 0);

                // 3. Refresh list
                await fetchImages();

                // 4. If first image, update product in parent
                if (images.length === 0) {
                    onUpdateProduct({ ...product, imageUrl: imageUrl });
                }

                toast.success("อัปโหลดรูปภาพเรียบร้อยแล้ว", { id: toastId });
            } catch (error) {
                console.error(error);
                toast.error("อัปโหลดล้มเหลว", { id: toastId });
            }
        }
    };

    const handleSetMain = async (image: ProductImage) => {
        if (!product) return;
        try {
            await setMainProductImage(product.id, image.id);
            await fetchImages();
            onUpdateProduct({ ...product, imageUrl: image.url });
            toast.success("ตั้งค่ารูปหลักเรียบร้อยแล้ว");
        } catch (error) {
            toast.error("ตั้งค่ารูปหลักล้มเหลว");
        }
    };

    const handleDelete = async (image: ProductImage) => {
        if (window.confirm("ต้องการลบรูปภาพนี้ใช่หรือไม่?")) {
            try {
                await removeProductImage(image.id);
                // If we deleted the main, the parent product might need update (the API handles unsetting in DB but we need to refresh UI)
                await fetchImages();

                // If it was the main, we should notify the parent
                if (image.isMain) {
                    // Fetch images again and pick new main if exists
                    const data = await getProductImages(product.id);
                    const newMain = data.find((img: any) => img.is_main);
                    onUpdateProduct({ ...product, imageUrl: newMain ? newMain.url : null });
                }

                toast.success("ลบรูปภาพเรียบร้อยแล้ว");
            } catch (error) {
                toast.error("ลบรูปภาพล้มเหลว");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0 bg-white z-10">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-indigo-500" />
                            จัดการรูปภาพ
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">สินค้า: <span className="font-medium text-slate-700">{product.name}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">

                    {/* Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 mb-8 flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all cursor-pointer group"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-white group-hover:scale-110 transition-transform shadow-sm">
                            <Upload className="w-8 h-8" />
                        </div>
                        <p className="font-medium">คลิกเพื่ออัปโหลดรูปภาพ</p>
                        <p className="text-sm opacity-75 mt-1">รองรับไฟล์ JPG, PNG</p>
                    </div>

                    {/* Image Grid */}
                    {images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((img) => (
                                <div key={img.id} className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${img.isMain ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-100 hover:border-slate-300'}`}>
                                    <Image
                                        src={img.url}
                                        alt="Product"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100">
                                        <div className="flex gap-2 justify-center">
                                            {!img.isMain && (
                                                <button
                                                    onClick={() => handleSetMain(img)}
                                                    className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-lg backdrop-blur-sm transition-colors shadow-lg"
                                                    title="ตั้งเป็นรูปหลัก"
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(img)}
                                                className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-colors shadow-lg"
                                                title="ลบรูปภาพ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Main Badge */}
                                    {img.isMain && (
                                        <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            รูปหลัก
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>ยังไม่มีรูปภาพสำหรับสินค้านี้</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
}
