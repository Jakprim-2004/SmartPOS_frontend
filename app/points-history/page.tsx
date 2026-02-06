"use client";

import { useState, useEffect, useMemo } from "react";
import { getCustomers } from "@/lib/api/customers";
import { getSales } from "@/lib/api/sales";
import {
    PointsHeader,
    PointsFilter,
    PointsTable,
    PointTransaction,
} from "@/components/points-history";

export default function PointsHistoryPage() {
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const [salesRes, customersRes] = await Promise.all([
                    getSales({ status: "completed", limit: 1000 }),
                    getCustomers({ limit: 1000 })
                ]);

                const sales = salesRes.data || [];
                const customers = customersRes.data || [];
                const customerMap = new Map(customers.map((c: any) => [c.id, c]));

                // Transform Sales to Point Transactions (Earned)
                // Note: Currently we infer points from sales (100 THB = 10 Points)
                // Real implementation should query a dedicated points_ledger table if available.
                const history: PointTransaction[] = sales
                    .filter((s: any) => s.customerId) // Only sales with members earn points
                    .map((s: any) => {
                        const customer = customerMap.get(s.customerId) || { name: 'Unknown', phone: '-' };
                        const earned = Math.floor(Number(s.total) / 10);

                        return {
                            id: s.id,
                            transactionDate: s.createdAt || s.created_at,
                            Customer: {
                                id: s.customerId,
                                name: customer.name,
                                phone: customer.phone
                            },
                            transactionType: "EARN",
                            points: earned,
                            description: `ได้รับแต้มจากการซื้อสินค้า #${s.id}` // Use ID as BillNo if plain Text
                        };
                    });

                // Sort by date desc
                history.sort((a, b) => new Date(b.transactionDate as string).getTime() - new Date(a.transactionDate as string).getTime());
                setTransactions(history);

            } catch (error) {
                console.error("Failed to fetch point history:", error);
            }
        };

        fetchHistory();
    }, []);

    const filteredTransactions = useMemo(() => {
        if (!searchQuery) return transactions;
        const lowerQuery = searchQuery.toLowerCase();
        return transactions.filter(tx =>
            tx.Customer?.name?.toLowerCase().includes(lowerQuery) ||
            tx.Customer?.phone?.includes(lowerQuery)
        );
    }, [transactions, searchQuery]);

    const totalPointsUsed = useMemo(() => {
        return filteredTransactions.reduce((sum, tx) => sum + tx.points, 0);
    }, [filteredTransactions]);

    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-purple-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <PointsHeader />

                <PointsFilter
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    totalPointsUsed={totalPointsUsed}
                />

                <PointsTable
                    transactions={paginatedTransactions}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredTransactions.length}
                />
            </div>
        </div>
    );
}
