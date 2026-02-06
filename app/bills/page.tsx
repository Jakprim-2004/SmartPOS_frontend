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

export default function BillsPage() {
    const [billSales, setBillSales] = useState<BillSale[]>([]);
    const [searchBillNo, setSearchBillNo] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedBill, setSelectedBill] = useState<BillSale | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const { data } = await getSales({ status: "completed", limit: 1000 });
            // Map API response to BillSale type
            const bills: BillSale[] = data.map((sale: any) => ({
                id: sale.id,
                billNumber: sale.billNumber || sale.bill_number || `BILL-${sale.id}`,
                payDate: sale.createdAt || sale.created_at, // Handle both cases
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

            // Sort by Date Desc (Newest first)
            bills.sort((a, b) => new Date(b.payDate as string).getTime() - new Date(a.payDate as string).getTime());

            setBillSales(bills);
        } catch (error) {
            console.error("Failed to fetch bills:", error);
        }
    };

    // Filter bills
    const filteredBills = useMemo(() => {
        let filtered = [...billSales];

        // Filter by bill number
        if (searchBillNo) {
            filtered = filtered.filter(bill =>
                bill.id.toString().includes(searchBillNo)
            );
        }

        // Filter by date range
        if (startDate && endDate) {
            filtered = filtered.filter(bill => {
                const billDate = new Date(bill.payDate);
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                return billDate >= start && billDate <= end;
            });
        }

        return filtered;
    }, [billSales, searchBillNo, startDate, endDate]);

    // Pagination
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchBillNo, startDate, endDate]);

    const handleViewBill = (bill: BillSale) => {
        setSelectedBill(bill);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

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
                    bills={paginatedBills}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalBills={filteredBills.length}
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
