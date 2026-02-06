"use client";

import { useState, useEffect, useMemo } from "react";
import { getSales } from "@/lib/api/sales";
import {
    BillsHeader,
    BillsFilter,
    BillsTable,
    BillDetailModal,
    BillSale,
} from "@/components/bills";

export default function AdminBillsPage() {
    const [billSales, setBillSales] = useState<BillSale[]>([]);
    const [searchBillNo, setSearchBillNo] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedBill, setSelectedBill] = useState<BillSale | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [loading, setLoading] = useState(false);
    const [totalBills, setTotalBills] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBills();
        }, 500); // Debounce search/dates
        return () => clearTimeout(timer);
    }, [currentPage, searchBillNo, startDate, endDate]);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const result = await getSales({
                status: "completed",
                search: searchBillNo,
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                page: currentPage,
                limit: itemsPerPage
            });

            const bills: BillSale[] = result.data.map((sale: any) => ({
                id: sale.id,
                billNumber: sale.billNumber || sale.bill_number || `ID: ${sale.id}`,
                payDate: sale.createdAt || sale.created_at,
                totalAmount: Number(sale.total),
                paymentMethod: sale.paymentMethod || sale.payment_method,
                billSaleDetails: (sale.items || sale.sale_items || []).map((item: any) => ({
                    id: item.id,
                    price: Number(item.price),
                    qty: Number(item.quantity),
                    product: {
                        id: item.productId || item.product_id,
                        name: item.productName || item.product_name,
                    }
                }))
            }));

            setBillSales(bills);
            setTotalBills(result.total || 0);
        } catch (error) {
            console.error("Failed to fetch bills:", error);
        } finally {
            setLoading(false);
        }
    };

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchBillNo, startDate, endDate]);

    const handleViewBill = (bill: BillSale) => {
        setSelectedBill(bill);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-6">

                <BillsHeader />

                <BillsFilter
                    searchBillNo={searchBillNo}
                    setSearchBillNo={setSearchBillNo}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                />

                <BillsTable
                    bills={billSales}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalBills={totalBills}
                    onViewBill={handleViewBill}
                />

            </div>

            <BillDetailModal
                show={showModal}
                bill={selectedBill}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}
