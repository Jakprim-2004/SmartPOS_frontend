"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";

interface ProductListProps {
    products: Product[];
    search: string;
    setSearch: (search: string) => void;
    addToCart: (product: any) => void;
    cart?: any[];
}

export default function ProductList({
    products,
    search,
    setSearch,
    addToCart,
    cart = [],
}: ProductListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Reset to page 1 when search changes
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    // Pagination calculations
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return products.slice(start, start + itemsPerPage);
    }, [products, currentPage]);

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
        <div className="flex-1 flex flex-col min-w-0 p-2 md:pr-4 md:pt-4 md:pb-4 md:pl-4 gap-2 md:gap-4">
            {/* Header / Search */}
            <div className="flex items-center gap-4 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm md:text-base"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
                {/* Product count */}
                <div className="hidden md:block text-sm text-slate-500 font-medium whitespace-nowrap">
                    {products.length} รายการ
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 pb-4">
                    {
                        paginatedProducts.map((product) => {
                            const cartItem = cart.find(item => item.id === product.id);
                            const qtyInCart = cartItem ? cartItem.qty : 0;
                            const displayStock = product.stock - qtyInCart;
                            const isOutOfStock = displayStock <= 0;

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => !isOutOfStock && addToCart(product)}
                                    className={`bg-white rounded-2xl p-3 shadow-sm border border-slate-100 transition-all flex flex-col gap-2 h-full relative
                                    ${isOutOfStock
                                            ? "opacity-60 cursor-not-allowed grayscale"
                                            : "hover:shadow-md hover:border-indigo-100 cursor-pointer group"
                                        }`}
                                >
                                    {/* Out of stock overlay */}
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                                            <div className="bg-red-600 text-white font-bold text-lg px-4 py-2 rounded-xl shadow-lg transform -rotate-12">
                                                หมด
                                            </div>
                                        </div>
                                    )}

                                    <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative">
                                        <div className={`w-full h-full flex items-center justify-center bg-slate-100 overflow-hidden relative transition-transform duration-300 ${!isOutOfStock && "group-hover:scale-105"}`}>
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full flex items-center justify-center text-slate-300 font-bold text-3xl select-none absolute inset-0 bg-slate-100 ${product.imageUrl ? 'hidden' : ''}`}>
                                                {product.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-bold text-indigo-600 shadow-sm">
                                            ฿{product.price}
                                        </div>
                                        {displayStock > 0 && displayStock < 1000 && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-[10px] text-center py-0.5">
                                                เหลือ {displayStock}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className={`font-semibold text-slate-700 text-sm line-clamp-1 transition-colors ${!isOutOfStock && "group-hover:text-indigo-600"}`}>
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            {typeof product.category === 'object' ? product.category.name : product.category}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
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
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <span className="ml-3 text-sm text-slate-500 hidden sm:block">
                        หน้า {currentPage}/{totalPages}
                    </span>
                </div>
            )}
        </div>
    );
}
