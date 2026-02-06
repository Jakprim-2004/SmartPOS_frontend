"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, Link as LinkIcon, Upload, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { showConfirm } from "@/utils/confirmToast";
import toast from "react-hot-toast";
import { getNews, createNews, updateNews, deleteNews, NewsItem } from "@/lib/api/news";
import { uploadImage } from "@/lib/api/upload";

const ITEMS_PER_PAGE = 30;

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<NewsItem>>({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageInputMode, setImageInputMode] = useState<'link' | 'upload'>('link');

    const fetchNews = useCallback(async (page: number = 1) => {
        setIsLoading(true);
        try {
            const { data, total } = await getNews(undefined, { page, limit: ITEMS_PER_PAGE });
            const mapped = data.map(item => ({
                ...item,
                published: item.isPublished !== undefined ? item.isPublished : (item.published ?? true)
            }));
            setNews(mapped);
            setTotalItems(total);
        } catch (error) {
            console.error("Failed to fetch news:", error);
            toast.error("โหลดข้อมูลไม่สำเร็จ");
            setNews([]);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews(currentPage);
    }, [currentPage, fetchNews]);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            title: '',
            content: '',
            published: true,
            isPublished: true,
            imageUrl: ''
        });
        setUploadFile(null);
        setImagePreview(null);
        setImageInputMode('link');
        setIsModalOpen(true);
    };

    const handleEdit = (item: NewsItem) => {
        setEditingId(item.id);
        const imgUrl = item.imageUrl || item.image_url || '';
        setFormData({
            ...item,
            published: item.isPublished !== undefined ? item.isPublished : (item.published ?? true),
            imageUrl: imgUrl
        });
        setUploadFile(null);
        setImagePreview(imgUrl);
        setImageInputMode(imgUrl.startsWith('http') ? 'link' : 'upload');
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        showConfirm({
            title: "ลบประกาศ?",
            message: "คุณต้องการลบประกาศนี้ใช่หรือไม่",
            onConfirm: async () => {
                try {
                    await deleteNews(id);
                    toast.success("ลบเรียบร้อย");
                    fetchNews(currentPage);
                } catch (error: any) {
                    console.error("Failed to delete:", error);
                    toast.error(error.message || "ลบข้อมูลไม่สำเร็จ");
                }
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let finalImageUrl = formData.imageUrl;

            if (uploadFile) {
                try {
                    finalImageUrl = await uploadImage(uploadFile, 'news');
                } catch (uploadError) {
                    toast.error("อัปโหลดรูปภาพไม่สำเร็จ");
                    setIsUploading(false);
                    return;
                }
            }

            const payload = {
                title: formData.title,
                content: formData.content,
                isPublished: formData.published,
                imageUrl: finalImageUrl,
            };

            if (editingId) {
                await updateNews(editingId, payload);
                toast.success("แก้ไขเรียบร้อย");
            } else {
                await createNews(payload);
                toast.success("สร้างประกาศเรียบร้อย");
            }
            setIsModalOpen(false);
            fetchNews(currentPage);
        } catch (error: any) {
            console.error("Failed to save:", error);
            toast.error(error.message || "บันทึกไม่สำเร็จ");
        } finally {
            setIsUploading(false);
        }
    };

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // Generate page numbers
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">ข่าวสาร & ประกาศ</h2>
                    <p className="text-slate-500">จัดการเนื้อหาข่าวสารที่จะแจ้งเตือนลูกค้า</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    เขียนประกาศใหม่
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 font-bold text-slate-700 w-16 text-center">ลำดับ</th>
                                <th className="p-4 font-bold text-slate-700">หัวข้อข่าว</th>
                                <th className="p-4 font-bold text-slate-700">สถานะ</th>
                                <th className="p-4 font-bold text-slate-700">วันที่ลง</th>
                                <th className="p-4 font-bold text-slate-700 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                                            กำลังโหลด...
                                        </div>
                                    </td>
                                </tr>
                            ) : news.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">ไม่มีประกาศ</td></tr>
                            ) : news.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 text-center text-slate-500 font-medium">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            {(item.imageUrl || item.image_url) && (
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                    <img src={item.imageUrl || item.image_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-800">{item.title}</div>
                                                <div className="text-sm text-slate-500 truncate max-w-xs">{item.content}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${item.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            {item.published ? 'เผยแพร่' : 'แบบร่าง'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 text-sm align-middle">{new Date(item.created_at).toLocaleDateString('th-TH')}</td>
                                    <td className="p-4 text-right align-middle">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors active:scale-95"
                                                title="แก้ไข"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors active:scale-95"
                                                title="ลบ"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="text-sm text-slate-500 font-medium">
                            แสดง {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} จาก {totalItems} รายการ
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-500" />
                            </button>

                            {getPageNumbers().map((page, idx) => (
                                page === '...' ? (
                                    <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page as number)}
                                        disabled={isLoading}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${currentPage === page
                                                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || isLoading}
                                className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800">{editingId ? 'แก้ไขประกาศ' : 'เขียนประกาศใหม่'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">หัวข้อประกาศ</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                                    placeholder="เช่น แจ้งปิดปรับปรุงร้าน"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">เนื้อหา</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none text-slate-900 placeholder:text-slate-400"
                                    placeholder="รายละเอียดข่าวสาร..."
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700">รูปภาพประกอบ</label>

                                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setImageInputMode('link')}
                                        className={`flex-1 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${imageInputMode === 'link' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <LinkIcon className="w-4 h-4" /> วางลิงก์
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageInputMode('upload')}
                                        className={`flex-1 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${imageInputMode === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Upload className="w-4 h-4" /> อัปโหลดไฟล์
                                    </button>
                                </div>

                                {imageInputMode === 'link' ? (
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.imageUrl}
                                        onChange={e => {
                                            setFormData({ ...formData, imageUrl: e.target.value });
                                            setImagePreview(e.target.value);
                                        }}
                                    />
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-300 transition-colors bg-slate-50/50">
                                            <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500 font-medium">คลิกเพื่อเลือกไฟล์รูปภาพ</p>
                                        </div>
                                    </div>
                                )}

                                {imagePreview && (
                                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group">
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setUploadFile(null);
                                                setFormData({ ...formData, imageUrl: '' });
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="published"
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                    checked={formData.published}
                                    onChange={e => setFormData({ ...formData, published: e.target.checked })}
                                />
                                <label htmlFor="published" className="text-slate-700 font-medium">เผยแพร่ทันที</label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            กำลังบันทึก...
                                        </>
                                    ) : 'บันทึก'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
