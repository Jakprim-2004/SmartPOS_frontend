"use client";

import { useState, useEffect } from "react";
import {
    RewardHeader,
    RewardList,
    RewardModal,
    Reward,
} from "@/components/reward";
import toast from "react-hot-toast";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import { getRewardsPaginated, createReward, updateReward, deleteReward } from "@/lib/api/rewards";

export default function AdminRewardsPage() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 10;

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);

    useEffect(() => {
        loadData();
    }, [currentPage]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const offset = (currentPage - 1) * itemsPerPage;
            const result = await getRewardsPaginated({ limit: itemsPerPage, offset });
            setRewards(result.data || []);
            setTotal(result.total || 0);
        } catch (error) {
            console.error("Failed to fetch rewards:", error);
            toast.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(total / itemsPerPage);

    const handleAddClick = () => {
        setEditingReward(null);
        setShowModal(true);
    };

    const handleEditClick = (reward: Reward) => {
        setEditingReward(reward);
        setShowModal(true);
    };

    const handleDeleteClick = async (reward: Reward) => {
        if (!window.confirm(`ยืนยันการลบของรางวัล "${reward.name}"?`)) return;

        try {
            await deleteReward(reward.id!);
            loadData(); // Reload after delete
            toast.success("ลบของรางวัลเรียบร้อย");
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถลบของรางวัลได้");
        }
    };

    const handleSaveReward = async (rewardData: Partial<Reward>) => {
        try {
            if (editingReward) {
                // Update
                await updateReward(editingReward.id!, rewardData);
                toast.success("แก้ไขของรางวัลเรียบร้อย");
            } else {
                // Create
                await createReward(rewardData);
                toast.success("เพิ่มของรางวัลเรียบร้อย");
            }
            setShowModal(false);
            loadData(); // Reload after save
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถบันทึกข้อมูลได้");
        }
    };

    // Dummy redeem function - admin doesn't redeem from this page
    const handleRedeem = () => { };

    if (isLoading && rewards.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header with Add button (admin mode) */}
            <RewardHeader onAddClick={handleAddClick} />

            <RewardList
                rewards={rewards}
                selectedCustomer={null}
                onRedeem={handleRedeem}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end gap-1 py-4">
                    {/* Previous Button */}
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-500"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    {(() => {
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

                        return pages.map((page, idx) => (
                            page === '...' ? (
                                <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page as number)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold transition-all ${currentPage === page
                                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ));
                    })()}

                    {/* Next Button */}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-500"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            <RewardModal
                show={showModal}
                reward={editingReward}
                onClose={() => setShowModal(false)}
                onSave={handleSaveReward}
            />
        </div>
    );
}
