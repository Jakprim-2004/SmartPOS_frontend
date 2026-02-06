"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, FolderTree, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from "@/lib/api/categories";

export default function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to load categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || "" });
        } else {
            setEditingCategory(null);
            setFormData({ name: "", description: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
                toast.success("อัปเดตหมวดหมู่เรียบร้อย");
            } else {
                await createCategory(formData);
                toast.success("เพิ่มหมวดหมู่เรียบร้อย");
            }
            setIsModalOpen(false);
            loadCategories();
        } catch (error) {
            toast.error("ดำเนินการไม่สำเร็จ");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("ยืนยันการลบหมวดหมู่นี้?")) return;
        try {
            await deleteCategory(id);
            toast.success("ลบหมวดหมู่เรียบร้อย");
            loadCategories();
        } catch (error) {
            toast.error("ไม่สามารถลบได้ (อาจมีสินค้าที่ใช้งานหมวดหมู่นี้อยู่)");
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 font-sans">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/product" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <FolderTree className="w-8 h-8 text-indigo-600" />
                            จัดการหมวดหมู่สินค้า
                        </h1>
                        <p className="text-slate-500 text-sm">จัดการประเภทและกลุ่มของรายการสินค้า</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 flex items-center gap-2 font-medium shadow-md shadow-indigo-100 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    เพิ่มหมวดหมู่
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
                <Search className="text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="ค้นหาหมวดหมู่..."
                    className="flex-1 outline-none text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600">ชื่อหมวดหมู่</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600">คำอธิบาย</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                        {loading ? (
                            <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400">กำลังโหลด...</td></tr>
                        ) : filteredCategories.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400">ไม่มีข้อมูลหมวดหมู่</td></tr>
                        ) : filteredCategories.map((category) => (
                            <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold">{category.name}</td>
                                <td className="px-6 py-4 text-slate-500">{category.description || "-"}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenModal(category)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="แก้ไข"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="ลบ"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">{editingCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อหมวดหมู่</label>
                                <input
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 bg-slate-50 focus:bg-white transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="เช่น กาแฟ, ขนม, ฯลฯ"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">คำอธิบาย (ถ้ามี)</label>
                                <textarea
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 bg-slate-50 focus:bg-white transition-all"
                                    rows={3}
                                    placeholder="รายละเอียดหมวดหมู่..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 border border-slate-200 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                                >
                                    {editingCategory ? "อัปเดต" : "เพิ่มหมวดหมู่"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
