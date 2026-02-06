"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    CustomerHeader,
    CustomerTable,
    CustomerModal,
    Customer,
} from "@/components/customer";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getCustomers, registerMember, updateCustomer, deleteCustomer } from "@/lib/api/customers";

export default function CustomerPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const loadCustomers = async (page: number = 1) => {
        try {
            setIsLoading(true);
            const offset = (page - 1) * itemsPerPage;
            const result = await getCustomers({ limit: itemsPerPage, offset });
            setCustomers(result.data || []);
            setTotal(result.total || 0);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            toast.error("ไม่สามารถดึงข้อมูลลูกค้าได้");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers(currentPage);
    }, [currentPage]);

    const handleAddClick = () => {
        setSelectedCustomer(null);
        setShowModal(true);
    };

    const handleEditClick = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowModal(true);
    };

    const handleDeleteClick = async (customer: Customer) => {
        if (window.confirm(`คุณต้องการลบข้อมูลลูกค้า "${customer.name}" ใช่หรือไม่?`)) {
            try {
                await deleteCustomer(customer.id);
                setCustomers(prev => prev.filter(c => c.id !== customer.id));
                toast.success("ลบข้อมูลลูกค้าเรียบร้อย");
            } catch (error) {
                console.error("Failed to delete customer:", error);
                toast.error("ไม่สามารถลบข้อมูลลูกค้าได้");
            }
        }
    };

    const handleRewardClick = (customer: Customer) => {
        router.push(`/reward?customerId=${customer.id}`);
    };

    const handleSave = async (customerData: Partial<Customer>) => {
        setIsSaving(true);
        try {
            if (selectedCustomer) {
                // Edit existing customer
                const updated = await updateCustomer(selectedCustomer.id, customerData);
                setCustomers(prev => prev.map(c =>
                    c.id === selectedCustomer.id ? { ...c, ...updated } : c
                ));
                toast.success("แก้ไขข้อมูลเรียบร้อย");
            } else {
                // Add new customer
                const newCustomer = await registerMember({
                    name: customerData.name || "",
                    phone: customerData.phone || "",
                    birthday: customerData.birthday || ""
                });
                setCustomers(prev => [{ ...newCustomer, joinDate: newCustomer.createdAt || new Date().toISOString() }, ...prev]);
                toast.success("เพิ่มลูกค้าใหม่เรียบร้อย");
            }
            setShowModal(false);
        } catch (error: any) {
            console.error("Failed to save customer:", error);
            toast.error(error.message || "ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <CustomerHeader
                    totalCustomers={total}
                    onAddClick={handleAddClick}
                />

                <CustomerTable
                    customers={customers}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onReward={handleRewardClick}
                    isLoading={isLoading}
                />

                {/* Pagination */}
                {(() => {
                    const totalPages = Math.ceil(total / itemsPerPage);
                    if (totalPages <= 1) return null;

                    const pages: (number | string)[] = [];
                    if (totalPages <= 7) {
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

                    return (
                        <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="text-sm text-gray-600 font-medium">
                                แสดง {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, total)} จาก {total} รายการ
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                                </button>

                                {pages.map((page, idx) => (
                                    page === '...' ? (
                                        <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === page
                                                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                    : 'border border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </div>

            <CustomerModal
                show={showModal}
                customer={selectedCustomer}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                isSaving={isSaving}
            />
        </div>
    );
}
