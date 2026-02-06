"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation"; // To handle customerId from URL
import {
    RewardHeader,
    CustomerSelector,
    RewardList,
    RedeemModal,
    Reward,
} from "@/components/reward";
import {
    Customer,
} from "@/components/customer";
import toast from "react-hot-toast";

import { getRewards, redeemReward } from "@/lib/api/rewards";
import { getCustomers } from "@/lib/api/customers";

function RewardContent() {
    const searchParams = useSearchParams();
    const initialCustomerId = searchParams.get('customerId');

    const [rewards, setRewards] = useState<Reward[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Redeem Modal State
    const [redeemRewardItem, setRedeemRewardItem] = useState<Reward | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [rewardsRes, customersRes] = await Promise.all([
                getRewards(),
                getCustomers({ limit: 1000 }) // Get more customers for the selector
            ]);
            setRewards(rewardsRes || []);
            setCustomers(customersRes?.data || []);
        } catch (error) {
            console.error("Failed to fetch rewards/customers:", error);
            toast.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-select customer from URL
    useEffect(() => {
        if (initialCustomerId && customers.length > 0) {
            const customer = customers.find(c => c.id === parseInt(initialCustomerId));
            if (customer) {
                setSelectedCustomer(customer);
            }
        }
    }, [initialCustomerId, customers]);

    const handleRedeemClick = (reward: Reward) => {
        if (!selectedCustomer) return;
        setRedeemRewardItem(reward);
    };

    const handleConfirmRedeem = async () => {
        if (!selectedCustomer || !redeemRewardItem) return;

        try {
            // Call API to redeem reward
            await redeemReward(redeemRewardItem.id!, selectedCustomer.id);

            const pointsCost = redeemRewardItem.pointsCost || redeemRewardItem.pointsRequired || redeemRewardItem.points_required || 0;

            // Update local state
            const updatedCustomer = {
                ...selectedCustomer,
                points: selectedCustomer.points - pointsCost
            };

            setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
            setSelectedCustomer(updatedCustomer);

            // Deduct stock from reward
            setRewards(prev => prev.map(r =>
                r.id === redeemRewardItem.id ? { ...r, stock: r.stock - 1 } : r
            ));

            toast.success(`แลกของรางวัลสำเร็จ! คงเหลือ ${updatedCustomer.points} แต้ม`);
        } catch (error: any) {
            toast.error(error.message || "ไม่สามารถแลกของรางวัลได้");
        } finally {
            setRedeemRewardItem(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header without add button (staff mode) */}
                <RewardHeader />

                <CustomerSelector
                    customers={customers}
                    selectedCustomer={selectedCustomer}
                    onSelect={setSelectedCustomer}
                />

                <RewardList
                    rewards={rewards}
                    selectedCustomer={selectedCustomer}
                    onRedeem={handleRedeemClick}
                // No onEdit/onDelete - staff can only redeem
                />
            </div>

            <RedeemModal
                show={!!redeemRewardItem}
                reward={redeemRewardItem}
                customer={selectedCustomer}
                onClose={() => setRedeemRewardItem(null)}
                onConfirm={handleConfirmRedeem}
            />
        </div>
    );
}

export default function RewardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RewardContent />
        </Suspense>
    );
}
