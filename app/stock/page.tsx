"use client";

import { useState, useEffect, useCallback } from "react";
import {
    StockHeader,
    StockTabs,
    StockTable,
    BulkAddModal,
    AddStockModal,
} from "@/components/stock";
import toast from "react-hot-toast";
import { Product, StockTransaction } from "@/lib/types";
import { getProducts, addProductStock, getAllStockTransactions } from "@/lib/api/products";

const ITEMS_PER_PAGE = 30;

export default function StockPage() {
    const [activeTab, setActiveTab] = useState<'notInStock' | 'inStock' | 'lowStock' | 'history'>('notInStock');
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkModal, setShowBulkModal] = useState(false);

    // Data with pagination
    const [currentData, setCurrentData] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Tab counts (fetched once)
    const [tabCounts, setTabCounts] = useState({
        notInStock: 0,
        inStock: 0,
        lowStock: 0,
        history: 0
    });

    // For bulk selection - keep track of selected products
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    // Add Stock Modal State
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [selectedProductForAdd, setSelectedProductForAdd] = useState<Product | null>(null);

    // Fetch tab counts (only once or when data changes)
    const fetchTabCounts = useCallback(async () => {
        try {
            const [notInStockRes, inStockRes, lowStockRes, historyData] = await Promise.all([
                getProducts({ limit: 1, stockStatus: 'out_of_stock' }),
                getProducts({ limit: 1, stockStatus: 'in_stock' }),
                getProducts({ limit: 1, stockStatus: 'low_stock' }),
                getAllStockTransactions()
            ]);

            setTabCounts({
                notInStock: notInStockRes.total || 0,
                inStock: inStockRes.total || 0,
                lowStock: lowStockRes.total || 0,
                history: historyData?.length || 0
            });
        } catch (error) {
            console.error("Failed to fetch tab counts:", error);
        }
    }, []);

    // Fetch data for current tab with pagination
    const fetchData = useCallback(async (page: number = 1) => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * ITEMS_PER_PAGE;

            if (activeTab === 'history') {
                // History tab - fetch all transactions (could paginate later)
                const tData = await getAllStockTransactions();
                const sliced = tData.slice(offset, offset + ITEMS_PER_PAGE);
                setCurrentData(sliced);
                setTotalItems(tData.length);
            } else {
                // Product tabs with server-side pagination
                let stockStatus: string | undefined;
                switch (activeTab) {
                    case 'notInStock': stockStatus = 'out_of_stock'; break;
                    case 'inStock': stockStatus = 'in_stock'; break;
                    case 'lowStock': stockStatus = 'low_stock'; break;
                }

                const result = await getProducts({
                    limit: ITEMS_PER_PAGE,
                    offset,
                    stockStatus,
                    search: searchTerm || undefined
                });

                const products = result.data || [];
                // Add stockLeft property for display
                const productsWithStock = products.map((p: Product) => ({
                    ...p,
                    stockLeft: p.stock || 0
                }));

                setCurrentData(productsWithStock);
                setTotalItems(result.total || 0);
                setAllProducts(prev => {
                    // Merge with existing for bulk selection
                    const newIds = new Set(products.map((p: Product) => p.id));
                    const filtered = prev.filter(p => !newIds.has(p.id));
                    return [...filtered, ...products];
                });
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("ไม่สามารถโหลดข้อมูลได้");
            setCurrentData([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, searchTerm]);

    // Initial load
    useEffect(() => {
        fetchTabCounts();
    }, [fetchTabCounts]);

    // Fetch data when tab, page, or search changes
    useEffect(() => {
        setCurrentPage(1);
        fetchData(1);
    }, [activeTab, searchTerm]);

    // Fetch when page changes
    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, fetchData]);

    // Handle page change from StockTable
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Open Modal
    const handleAddStockClick = (product: Product) => {
        setSelectedProductForAdd(product);
        setShowAddStockModal(true);
    };

    // Confirm Logic
    const handleAddStockConfirm = async (qty: number) => {
        if (!selectedProductForAdd) return;

        try {
            await addProductStock(selectedProductForAdd.id, qty);
            toast.success(`เพิ่มสต็อก "${selectedProductForAdd.name}" จำนวน ${qty} เรียบร้อย`);
            setShowAddStockModal(false);

            // Refresh Data
            fetchTabCounts();
            fetchData(currentPage);
        } catch (error) {
            toast.error("บันทึกข้อมูลล้มเหลว");
        }
    };

    const handleDeleteHistory = (transaction: StockTransaction) => {
        if (window.confirm("ยืนยันการลบประวัติการเพิ่มสต็อก?")) {
            setCurrentData(prev => prev.filter(t => t.id !== transaction.id));
            setTotalItems(prev => prev - 1);
            toast.success("ลบประวัติเรียบร้อยแล้ว");
        }
    };

    const handleBulkSave = async (items: { productId: number, qty: number }[]) => {
        try {
            await Promise.all(items.map(item => addProductStock(item.productId, item.qty)));
            setSelectedIds([]);
            setShowBulkModal(false);
            toast.success(`เพิ่มสต็อก ${items.length} รายการเรียบร้อย`);
            fetchTabCounts();
            fetchData(currentPage);
        } catch (error) {
            toast.error("บันทึกข้อมูลล้มเหลว");
        }
    };

    const handleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Handle tab change
    const handleTabChange = (tab: 'notInStock' | 'inStock' | 'lowStock' | 'history') => {
        setActiveTab(tab);
        setSelectedIds([]);
        setSearchTerm("");
    };

    // Prepare products for bulk modal
    const selectedProductsForModal = allProducts.filter(p => selectedIds.includes(p.id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <StockHeader />

                <StockTabs
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                    counts={tabCounts}
                />

                {activeTab !== 'history' && selectedIds.length > 0 && (
                    <div className="bg-indigo-600 text-white p-3 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-200 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 px-2">
                            <span className="font-bold">{selectedIds.length}</span> รายการที่เลือก
                        </div>
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors"
                        >
                            เพิ่มสต็อกที่เลือก
                        </button>
                    </div>
                )}

                <StockTable
                    data={currentData}
                    tab={activeTab}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onAddStock={handleAddStockClick}
                    onDeleteStockHistory={handleDeleteHistory}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    // Server-side pagination props
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                />
            </div>

            <BulkAddModal
                show={showBulkModal}
                selectedProducts={selectedProductsForModal}
                onClose={() => setShowBulkModal(false)}
                onSave={handleBulkSave}
            />

            <AddStockModal
                show={showAddStockModal}
                product={selectedProductForAdd}
                onClose={() => setShowAddStockModal(false)}
                onConfirm={handleAddStockConfirm}
            />
        </div>
    );
}
