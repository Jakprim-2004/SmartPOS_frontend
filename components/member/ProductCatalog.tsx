"use client";

import { Search, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/api/products";
import { getCategories, Category } from "@/lib/api/categories";

interface ProductCatalogProps {
    onAddToCart: (product: Product) => void;
    shopId?: string;
}

const ITEMS_PER_PAGE = 30;

export default function ProductCatalog({ onAddToCart, shopId }: ProductCatalogProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [products, setProducts] = useState<Product[]>([]);

    // Categories state with 'All' option
    const [categories, setCategories] = useState<{ id: number | null, name: string }[]>([
        { id: null, name: "ทั้งหมด" }
    ]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // Fetch products with pagination and filters
    const fetchProducts = useCallback(async (page: number = 1) => {
        if (!shopId) return;
        setIsLoading(true);

        try {
            const offset = (page - 1) * ITEMS_PER_PAGE;
            const result = await getProducts({
                shopId,
                limit: ITEMS_PER_PAGE,
                offset,
                search: searchTerm || undefined,
                categoryId: selectedCategoryId || undefined // Send categoryId to backend
            });

            if (result && result.data) {
                setProducts(result.data);
                setTotalItems(result.total || 0);
            } else {
                setProducts([]);
                setTotalItems(0);
            }
        } catch (err) {
            console.error("Failed to load products:", err);
            setProducts([]);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    }, [shopId, searchTerm, selectedCategoryId]);

    // Fetch categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            if (!shopId) return;
            try {
                const cats = await getCategories(shopId);
                setCategories([
                    { id: null, name: "ทั้งหมด" },
                    ...cats.map((c: Category) => ({ id: c.id, name: c.name }))
                ]);
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        loadCategories();
    }, [shopId]);

    // Fetch when page changes or filters change
    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage, fetchProducts]);

    // Reset page when search or category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategoryId]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top of catalog
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
            {/* Search & Category */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors placeholder:text-slate-400 text-slate-800"
                    />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat.id ?? 'all'}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategoryId === cat.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="relative min-h-[200px]">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-2xl">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="aspect-square relative overflow-hidden bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={product.imageUrl || "https://placehold.co/300x300?text=Product"}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Quick Add Button */}
                                <button
                                    onClick={() => onAddToCart(product)}
                                    className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-indigo-600 shadow-lg translate-y-10 group-hover:translate-y-0 transition-transform duration-300 hover:bg-indigo-600 hover:text-white"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-3">
                                <div className="text-xs text-slate-400 mb-1">
                                    {typeof product.category === 'object' && product.category !== null ? (product.category as any).name : product.category}
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{product.name}</h4>
                                <div className="flex items-end justify-between mt-2">
                                    <div className="font-bold text-indigo-600">฿{product.price}</div>
                                    <div className="text-[10px] text-slate-400">/{product.unit || 'ชิ้น'}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {!isLoading && products.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>ไม่พบสินค้า</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-sm text-slate-500 font-medium">
                        แสดง {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} จาก {totalItems} รายการ
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                                    onClick={() => handlePageChange(page as number)}
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
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || isLoading}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
