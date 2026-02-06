"use client";

import { useState, useEffect } from "react";
import {
    ProductHeader,
    ProductFilter,
    ProductTable,
    ProductModal,
    ProductImageModal,
} from "@/components/product";
import { Product } from "@/lib/types";
import toast from "react-hot-toast";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/api/products";
import { getCategories, Category } from "@/lib/api/categories";

export default function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(30);

    useEffect(() => {
        // Fetch categories once on mount
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadData(currentPage, searchTerm, itemsPerPage);
        }, searchTerm ? 500 : 0); // Delay search but not immediate page changes

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchTerm, itemsPerPage]);

    const loadData = async (page: number = 1, search: string = "", limit: number = 30) => {
        setLoading(true);
        try {
            const paginationResult = await getProducts({ page, limit, search });
            setProducts(paginationResult.data || []);
            setTotalItems(paginationResult.total || 0);
        } catch (error) {
            toast.error("โหลดข้อมูลล้มเหลว");
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setShowModal(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleDeleteProduct = async (product: Product) => {
        if (window.confirm(`คุณต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`)) {
            try {
                await deleteProduct(product.id);
                toast.success("ลบสินค้าเรียบร้อยแล้ว");
                loadData(currentPage, searchTerm);
            } catch (error) {
                toast.error("ลบไม่สำเร็จ");
            }
        }
    };

    const handleSaveProduct = async (productData: Partial<Product>) => {
        try {
            if (selectedProduct) {
                await updateProduct(selectedProduct.id, productData);
                toast.success("แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว");
            } else {
                await createProduct(productData);
                toast.success("เพิ่มสินค้าใหม่เรียบร้อยแล้ว");
            }
            setShowModal(false);
            loadData(currentPage, searchTerm);
        } catch (error: any) {
            toast.error(error.message || "บันทึกไม่สำเร็จ");
        }
    };

    const handleManageImages = (product: Product) => {
        setSelectedProduct(product);
        setShowImageModal(true);
    };

    const handleUpdateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setSelectedProduct(updatedProduct);
    };

    const handlePrintBarcode = (product: Product) => {
        const printWindow = window.open("", "_blank", "width=600,height=400");
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Print Barcode - ${product.name}</title>
                    <style>
                        body { text-align: center; font-family: sans-serif; padding-top: 50px; }
                        .barcode { font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 2px; }
                    </style>
                </head>
                <body>
                    <h2>${product.name}</h2>
                    <div class="barcode">${product.barcode}</div>
                    <p>${product.price.toLocaleString()} THB</p>
                    <script>
                        setTimeout(() => window.print(), 500);
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <ProductHeader />

                <ProductFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onAddProduct={handleAddProduct}
                />

                <ProductTable
                    products={products}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onManageImages={handleManageImages}
                    onPrintBarcode={handlePrintBarcode}
                />
            </div>

            <ProductModal
                show={showModal}
                product={selectedProduct}
                categories={categories}
                onClose={() => setShowModal(false)}
                onSave={handleSaveProduct}
            />

            <ProductImageModal
                show={showImageModal}
                product={selectedProduct}
                onClose={() => setShowImageModal(false)}
                onUpdateProduct={handleUpdateProduct}
            />
        </div>
    );
}
