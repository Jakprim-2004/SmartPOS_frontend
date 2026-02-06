"use client";

import { useState, useEffect, useMemo } from "react";
import { getProducts } from "@/lib/api/products";
import { getSales } from "@/lib/api/sales";
import {
    StockReportHeader,
    StockReportFilter,
    StockReportTable,
    StockDetailModal,
    StockItem,
    StockDetail,
} from "@/components/stock-report";

export default function AdminStockReportPage() {
    const [stocks, setStocks] = useState<StockItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
    const [modalType, setModalType] = useState<"in" | "out">("in");
    const [showModal, setShowModal] = useState(false);
    const [stockDetails, setStockDetails] = useState<StockDetail[]>([]);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchStockData();
    }, []);

    const fetchStockData = async () => {
        try {
            const [productsRes, salesRes] = await Promise.all([
                getProducts({ limit: 1000 }),
                getSales({ status: "completed", limit: 1000 })
            ]);

            const products = productsRes?.data || productsRes || [];
            const sales = salesRes.data || [];

            // Calculate Stock Out per product
            const stockOutMap = new Map<number, number>();
            sales.forEach((sale: any) => {
                const items = sale.items || sale.sale_items || [];
                items.forEach((item: any) => {
                    const pid = item.productId || item.product_id;
                    const qty = Number(item.quantity) || 0;
                    stockOutMap.set(pid, (stockOutMap.get(pid) || 0) + qty);
                });
            });

            // Map to StockItem
            const stockItems: StockItem[] = products.map((p: any) => {
                const out = stockOutMap.get(p.id) || 0;
                // Assuming 'p.stock' is current remaining stock.
                // We can estimate 'Stock In' as Remaining + Out (Total Life time in) or just 0 if we only track current batch.
                // Let's assume Stock In = Remaining + Out for this report to show "Total handled".
                const remaining = p.stock || 0;
                const totalIn = remaining + out;

                return {
                    id: p.id,
                    barcode: p.barcode || "-",
                    name: p.name,
                    category: typeof p.category === 'object' ? p.category?.name : (p.category || "อื่นๆ"),
                    unit: p.unit || "ชิ้น",
                    stockIn: totalIn,
                    stockOut: out,
                    remaining: remaining
                };
            });

            // Sort by Name
            const collator = new Intl.Collator("th-TH", { numeric: true, caseFirst: "lower" });
            stockItems.sort((a, b) => collator.compare(a.name, b.name));

            setStocks(stockItems);

        } catch (error) {
            console.error("Failed to fetch stock data", error);
        }
    };

    // Filter stocks
    const filteredStocks = useMemo(() => {
        if (!searchTerm) return stocks;

        const term = searchTerm.toLowerCase();
        return stocks.filter(stock =>
            stock.name.toLowerCase().includes(term) ||
            stock.barcode.includes(term) ||
            stock.category.toLowerCase().includes(term)
        );
    }, [stocks, searchTerm]);

    // Pagination
    const paginatedStocks = filteredStocks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleViewStockIn = (stock: StockItem) => {
        setSelectedStock(stock);
        setModalType("in");
        // No API for Stock In History yet
        setStockDetails([]);
        setShowModal(true);
    };

    const handleViewStockOut = async (stock: StockItem) => {
        setSelectedStock(stock);
        setModalType("out");

        try {
            // Fetch sales to find details for this product
            const { data: sales } = await getSales({ status: "completed", limit: 1000 });
            const details: StockDetail[] = [];

            sales.forEach((sale: any) => {
                const items = sale.items || sale.sale_items || [];
                const item = items.find((i: any) => (i.productId || i.product_id) === stock.id);
                if (item) {
                    details.push({
                        id: sale.id,
                        barcode: stock.barcode,
                        name: stock.name,
                        qty: Number(item.quantity),
                        date: sale.createdAt || sale.created_at
                    });
                }
            });

            // Sort newer first
            details.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setStockDetails(details);

        } catch (error) {
            console.error("Failed to fetch details", error);
            setStockDetails([]);
        }
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-6">

                <StockReportHeader />

                <StockReportFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                <StockReportTable
                    stocks={paginatedStocks}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalStocks={filteredStocks.length}
                    onViewStockIn={handleViewStockIn}
                    onViewStockOut={handleViewStockOut}
                />

            </div>

            <StockDetailModal
                show={showModal}
                type={modalType}
                stock={selectedStock}
                details={stockDetails}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}
