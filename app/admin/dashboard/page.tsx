"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getDashboardStats } from "@/lib/api/sales";
import { getDashboardStats as getAdminStats, DashboardStats } from "@/lib/api/stats";
import {
    Users,
    Megaphone,
    TrendingUp,
    ArrowUpRight,
    Ticket
} from "lucide-react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import TopSellingSection from "@/components/dashboard/TopSellingSection";
import SummaryCards from "@/components/dashboard/SummaryCards";
import SalesChart from "@/components/dashboard/SalesChart";
import ProductDetails from "@/components/dashboard/ProductDetails";

// Types
interface DashboardData {
    totalSales: number;
    totalProfit: number;
    totalCost: number;
}

interface TodaySalesData {
    date: Date;
    totalAmount: number;
    billCount: number;
    averagePerBill: number;
    hourlyData: any[];
    topProducts: any[];
    growthRate: number;
    yesterdayTotal: number;
    yesterdayBillCount: number;
    yesterdayAveragePerBill: number;
}

export default function AdminDashboardPage() {
    const myDate = new Date();
    const [year, setYear] = useState(myDate.getFullYear());
    const [month, setMonth] = useState(myDate.getMonth() + 1);
    const [viewType, setViewType] = useState("daily");
    const [dailyViewMode, setDailyViewMode] = useState<"today" | "yesterday">("today");

    const [dashboardData, setDashboardData] = useState<DashboardData>({
        totalSales: 0,
        totalProfit: 0,
        totalCost: 0,
    });

    const [todaySales, setTodaySales] = useState<TodaySalesData>({
        date: new Date(),
        totalAmount: 0,
        billCount: 0,
        averagePerBill: 0,
        hourlyData: [],
        topProducts: [],
        growthRate: 0,
        yesterdayTotal: 0,
        yesterdayBillCount: 0,
        yesterdayAveragePerBill: 0,
    });

    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const [paymentStats, setPaymentStats] = useState([]);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [topSellingCategories, setTopSellingCategories] = useState([]);
    const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        fetchDashboardData();
        fetchAdminStats();
    }, [viewType, year, month]);

    const fetchAdminStats = async () => {
        try {
            const data = await getAdminStats();
            setAdminStats(data);
        } catch (error) {
            console.error("Failed to fetch admin stats:", error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const data = await getDashboardStats(viewType, year, month);

            // 1. Dashboard Data
            setDashboardData(data.dashboardData);

            // 2. Today Sales
            setTodaySales(data.todaySales);

            // 3. Payment Stats
            setPaymentStats(data.paymentStats || []);

            // 4. Top Selling
            setTopSellingProducts(data.topSellingProducts || []);
            setTopSellingCategories(data.topSellingCategories || []);

            // 5. Chart Data
            const labels = data.chartData.map((d: any) => {
                if (viewType === 'monthly') {
                    const [m, y] = d.date.split('/');
                    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                    return months[parseInt(m) - 1];
                }
                return d.date;
            });
            const salesValues = data.chartData.map((d: any) => d.total);
            const costValues = data.chartData.map((d: any) => d.cost || 0);
            const profitValues = data.chartData.map((d: any) => d.profit || 0);

            setChartData({
                labels,
                datasets: [
                    {
                        label: "ยอดขาย",
                        data: salesValues,
                        backgroundColor: "rgba(14, 165, 233, 0.1)", // Sky-500
                        borderColor: "rgba(14, 165, 233, 1)",
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                    },
                    {
                        label: "ต้นทุน",
                        data: costValues,
                        backgroundColor: "rgba(251, 191, 36, 0.1)", // Amber-400
                        borderColor: "rgba(251, 191, 36, 1)",
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                    },
                    {
                        label: "กำไร",
                        data: profitValues,
                        backgroundColor: "rgba(244, 63, 94, 0.1)", // Rose-500
                        borderColor: "rgba(244, 63, 94, 1)",
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                    }
                ],
            });

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
        }
    };

    // Admin Stats Cards
    const adminStatItems = [
        { label: 'สมาชิกทั้งหมด', value: adminStats?.customerCount.toLocaleString() || '0', sub: 'คน', icon: Users, color: 'bg-blue-500' },
        { label: 'คูปองทั้งหมด', value: adminStats?.couponCount?.toLocaleString() || '0', sub: 'ใบ', icon: Ticket, color: 'bg-amber-500' },
        { label: 'โปรโมชั่น Active', value: adminStats?.promoCount.toLocaleString() || '0', sub: 'รายการ', icon: Megaphone, color: 'bg-emerald-500' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <DashboardHeader
                dailyViewMode={dailyViewMode}
                setDailyViewMode={setDailyViewMode}
            />

            <StatsGrid
                todaySales={todaySales}
                dailyViewMode={dailyViewMode}
            />

            {/* Admin Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {adminStatItems.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-all hover:-translate-y-1">
                        <div>
                            <div className="text-slate-500 text-sm font-medium mb-1">{stat.label}</div>
                            <div className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</div>
                            <div className="text-xs text-slate-400 font-medium">{stat.sub}</div>
                        </div>
                        <div className={`p-3 rounded-xl text-white shadow-lg ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            <TopSellingSection
                topSellingProducts={topSellingProducts}
                topSellingCategories={topSellingCategories}
                paymentStats={paymentStats}
            />

            <SummaryCards
                data={dashboardData}
            />

            <SalesChart
                chartData={chartData}
                viewType={viewType}
                setViewType={setViewType}
                year={year}
                setYear={setYear}
                month={month}
                setMonth={setMonth}
            />



            <ProductDetails />
        </div>
    );
}
