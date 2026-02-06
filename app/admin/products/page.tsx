"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/api/products";
import { getCategories, Category } from "@/lib/api/categories";
import { Product } from "@/lib/types";

// Components
import AdminProductHeader from "@/components/admin/products/AdminProductHeader";
import AdminProductFilter from "@/components/admin/products/AdminProductFilter";
import AdminProductTable from "@/components/admin/products/AdminProductTable";
import AdminProductModal from "@/components/admin/products/AdminProductModal";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        cost: "",
        stock: "",
        categoryId: "",
        barcode: "",
        imageUrl: ""
    });

    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData(currentPage, search, selectedCategory);
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPage, search, selectedCategory]);

    const loadData = async (page: number = 1, searchTerm: string = "", category: string = "all") => {
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

            const categoriesData = await getCategories(shopId);
            setCategories(categoriesData || []);

            const paginationResult = await getProducts({
                page,
                limit: itemsPerPage,
                search: searchTerm,
                categoryId: category === "all" ? undefined : parseInt(category),
                shopId
            });

            setProducts(paginationResult.data || []);
            setTotalItems(paginationResult.total || 0);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                price: product.price.toString(),
                cost: product.cost.toString(),
                stock: product.stock.toString(),
                categoryId: (typeof product.category === 'object' ? product.category?.id?.toString() : product.categoryId?.toString()) || "",
                barcode: product.barcode || "",
                imageUrl: product.imageUrl || ""
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                price: "",
                cost: "",
                stock: "0",
                categoryId: categories.length > 0 ? categories[0].id.toString() : "",
                barcode: "",
                imageUrl: ""
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                price: parseFloat(formData.price),
                cost: parseFloat(formData.cost),
                stock: parseInt(formData.stock),
                categoryId: parseInt(formData.categoryId),
                barcode: formData.barcode,
                imageUrl: formData.imageUrl
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
                toast.success("อัปเดตสินค้าเรียบร้อย");
            } else {
                await createProduct(payload);
                toast.success("เพิ่มสินค้าใหม่เรียบร้อย");
            }
            setShowModal(false);
            loadData(currentPage, search, selectedCategory);
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message || "ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("คุณแน่ใจว่าต้องการลบสินค้านี้?")) return;
        try {
            await deleteProduct(id);
            toast.success("ลบสินค้าเรียบร้อย");
            loadData(currentPage, search, selectedCategory);
        } catch (error) {
            toast.error("ไม่สามารถลบสินค้าได้");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <AdminProductHeader onAddProduct={() => handleOpenModal()} />

            <AdminProductFilter
                search={search}
                setSearch={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                selectedCategory={selectedCategory}
                setSelectedCategory={(val) => {
                    setSelectedCategory(val);
                    setCurrentPage(1);
                }}
                categories={categories}
            />

            <AdminProductTable
                products={products}
                loading={loading}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <AdminProductModal
                show={showModal}
                onClose={() => setShowModal(false)}
                editingProduct={editingProduct}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                saving={saving}
                categories={categories}
            />
        </div>
    );
}
