"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    LogOut,
    ShoppingBag,
    History,
    Ticket,
    Store,
    Gift,
    Star
} from "lucide-react";
import { Customer } from "@/components/customer/types";
import MemberProfileCard from "@/components/member/MemberProfileCard";
import PromotionBanner from "@/components/member/PromotionBanner";
import CouponList from "@/components/member/CouponList";
import ProductCatalog from "@/components/member/ProductCatalog";
import CartDrawer, { CartItem } from "@/components/member/CartDrawer";
import MemberSidebar from "@/components/member/MemberSidebar";
import MobileNav from "@/components/member/MobileNav";
import { showConfirm } from "@/utils/confirmToast";
import { Product } from "@/components/product/types";
import CustomerProfileModal from "@/components/member/CustomerProfileModal";
import PurchaseDetailModal from "@/components/member/PurchaseDetailModal";
import MemberHistory from "@/components/member/MemberHistory";

// ... imports remain the same

// ... inside the component

// Mock Data Types for History
interface PurchaseHistory {
    id: string;
    date: string;
    total: number;
    items: number;
    pointsEarned: number;
    paymentMethod: string;
    rawItems?: any[];
    subtotal?: number;
    discount?: number;
}
interface PointHistory {
    id: string;
    date: string;
    type: 'EARN' | 'REDEEM' | 'ADJUST';
    points: number;
    description: string;
}

export default function MemberDashboardPage() {
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer & { membershipTier?: string; totalSpent: number; joinDate: string; points: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'store' | 'coupon' | 'history'>('store');
    const [historyTab, setHistoryTab] = useState<'purchase' | 'points'>('purchase');

    // Cart State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // History State
    const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseHistory | null>(null);
    const [pointsHistory, setPointsHistory] = useState<PointHistory[]>([]);

    // State for Promotions and Coupons
    const [promotions, setPromotions] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);

    useEffect(() => {
        // Authenticate
        const storedData = localStorage.getItem('customerData');
        if (!storedData) {
            toast.error("กรุณาเข้าสู่ระบบ");
            router.push('/member/login');
            return;
        }

        try {
            const parsed = JSON.parse(storedData);
            setCustomer({
                ...parsed,
                totalSpent: parsed.totalSpent || 0,
                joinDate: parsed.joinDate || new Date().toISOString(),
                points: parsed.points || 0
            });

            // Refresh Data in background to ensure shopId is up to date
            import("@/lib/api/customers").then(({ getCustomerById }) => {
                getCustomerById(parsed.id).then(freshData => {
                    if (freshData) {
                        const updated = { ...parsed, ...freshData };
                        localStorage.setItem('customerData', JSON.stringify(updated));
                        setCustomer((prev: any) => prev ? { ...prev, ...freshData } : updated);

                        // Refetch promos if shopId changed or just initially
                        fetchBannerData(updated.shopId);
                    }
                }).catch(e => console.warn("Background refresh failed", e));
            });

            // Initial fetch based on local data
            fetchBannerData(parsed.shopId);
            fetchCouponData(parsed.id, parsed.shopId);
            fetchHistoryData(parsed.id);

            function fetchBannerData(shopId?: string) {
                Promise.all([
                    import("@/lib/api/promotions").then(m => m.getActivePromotions(shopId)),
                    import("@/lib/api/news").then(m => m.getNews(shopId))
                ]).then(([promosData, newsDataResponse]) => {
                    const promos = (Array.isArray(promosData) ? promosData : (promosData as any).data || []);
                    const newsItems = (Array.isArray(newsDataResponse) ? newsDataResponse : (newsDataResponse as any).data || []);

                    const mappedPromos = promos.map((p: any) => ({
                        id: String(p.id),
                        title: p.title,
                        description: p.description || "",
                        imageUrl: p.image_url || "https://placehold.co/600x400?text=Promotion",
                        startDate: p.start_date || new Date().toISOString(),
                        endDate: p.end_date || new Date().toISOString()
                    }));

                    const mappedNews = newsItems.map((n: any) => ({
                        id: `news-${n.id}`,
                        title: n.title,
                        description: n.content,
                        imageUrl: n.imageUrl || n.image_url || "https://placehold.co/600x400?text=News",
                        startDate: n.created_at || new Date().toISOString(),
                        endDate: new Date((new Date(n.created_at || Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000)).toISOString() // Show as new for 1 week
                    }));

                    // Combine and sort by date (newest first)
                    const combined = [...mappedPromos, ...mappedNews].sort((a, b) =>
                        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                    );

                    setPromotions(combined);
                }).catch(err => {
                    console.error("Failed to load banner data", err);
                    setPromotions([]);
                });
            }

            function fetchHistoryData(customerId: number) {
                Promise.all([
                    import("@/lib/api/sales").then(m => m.getSalesByCustomer(customerId)),
                    import("@/lib/api/rewards").then(m => m.getCustomerRedemptions(customerId))
                ]).then(([salesResponse, redemptions]) => {
                    const sales = salesResponse.data || [];

                    // 1. Map Purchases
                    const mappedPurchases = sales.map((s: any) => ({
                        id: s.billNumber || `INV-${s.id}`,
                        date: s.createdAt,
                        total: s.total,
                        items: s.items?.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0) || 0,
                        pointsEarned: Math.floor(s.total / 100), // 100 Baht = 1 Pt
                        paymentMethod: s.paymentMethod,
                        rawItems: s.items,
                        subtotal: s.subtotal,
                        discount: s.discount
                    }));
                    setPurchases(mappedPurchases);

                    // 2. Map Points History (Combine Sales and Redemptions)
                    const salePoints = sales.map((s: any) => ({
                        id: `pt-sale-${s.id}`,
                        date: s.createdAt,
                        type: 'EARN' as const,
                        points: Math.floor(s.total / 100),
                        description: `ได้รับจากการซื้อสินค้า (${s.billNumber || s.id})`
                    }));

                    const redemptionPoints = redemptions.map((r: any) => ({
                        id: `pt-redeem-${r.id}`,
                        date: r.redeemedAt,
                        type: 'REDEEM' as const,
                        points: -(r.reward?.pointsRequired || 0),
                        description: `แลกของรางวัล: ${r.reward?.name}`
                    }));

                    const combinedPoints = [...salePoints, ...redemptionPoints]
                        .filter(p => p.points !== 0) // Hide 0 point transactions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    setPointsHistory(combinedPoints);
                }).catch(err => {
                    console.error("Failed to load history", err);
                });
            }

            function fetchCouponData(customerId: number, shopId?: string) {
                Promise.all([
                    // Fix: Set limit to 1000 to get all available coupons for checking
                    import("@/lib/api/coupons").then(m => m.getCoupons({ shopId, limit: 1000 })),
                    import("@/lib/api/rewards").then(m => m.getCustomerRedemptions(customerId)),
                    import("@/lib/api/sales").then(m => m.getSalesByCustomer(customerId))
                ]).then(([shopCouponsData, redemptions, salesResponse]) => {
                    const shopCoupons = (shopCouponsData as any).data || (Array.isArray(shopCouponsData) ? shopCouponsData : []);
                    const customerSales = salesResponse.data || [];

                    // Get all coupon codes used by this customer
                    const usedCouponCodes = new Set(
                        customerSales
                            .filter((s: any) => s.couponCode)
                            .map((s: any) => s.couponCode)
                    );

                    // Map Shop Coupons (Available to all) - Only show unused ones
                    const mappedShopCoupons = shopCoupons
                        .filter((c: any) => c.isActive && !usedCouponCodes.has(c.code))
                        .map(c => ({
                            id: `shop-${c.id}`,
                            code: c.code,
                            title: c.description || c.code,
                            description: `ใช้รหัส: ${c.code} เพื่อรับส่วนลด`,
                            discountType: (c.discountType === 'percentage' || c.discount_type === 'percentage') ? 'PERCENT' : ('FIXED' as const),
                            discountAmount: c.discountValue || c.discount_value,
                            imageUrl: "https://placehold.co/100x100?text=Coupon",
                            expiryDate: c.expiryDate || c.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                            isUsed: false
                        }));

                    // Map used coupons as history entries
                    const usedCouponEntries = customerSales
                        .filter((s: any) => s.couponCode)
                        .map((s: any) => {
                            const couponInfo = shopCoupons.find(c => c.code === s.couponCode);
                            return {
                                id: `used-${s.id}`,
                                code: s.couponCode,
                                title: couponInfo?.description || s.couponCode,
                                description: `ใช้เมื่อ ${new Date(s.createdAt).toLocaleDateString('th-TH')} ยอด ฿${s.total}`,
                                discountType: 'FIXED' as const,
                                discountAmount: couponInfo?.discountValue || couponInfo?.discount_value || 0,
                                imageUrl: "https://placehold.co/100x100?text=Used",
                                expiryDate: s.createdAt,
                                isUsed: true
                            };
                        });

                    // Map Redemptions (Owned by customer)
                    const mappedRedemptions = redemptions.map(r => ({
                        id: `redeem-${r.id}`,
                        code: `REWARD-${r.rewardId}`,
                        title: r.reward?.name || 'ของรางวัล',
                        description: r.reward?.description || 'แลกรับของรางวัลที่หน้าร้าน',
                        imageUrl: r.reward?.imageUrl || "https://placehold.co/100x100?text=Reward",
                        expiryDate: new Date(new Date(r.redeemedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                        isUsed: r.status === 'claimed' || r.status === 'completed',
                        discountType: 'FIXED' as const,
                        discountAmount: 0
                    }));

                    // Combine: active coupons + used history + redemptions
                    setCoupons([...mappedShopCoupons, ...usedCouponEntries, ...mappedRedemptions]);
                }).catch(err => {
                    console.error("Failed to load coupon data", err);
                    setCoupons([]);
                });
            }

        } catch (e) {
            localStorage.removeItem('customerData');
            router.push('/member/login');
        }
    }, [router]);

    // Cart Handlers
    const addToCart = (product: Product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: number) => {
        showConfirm("ต้องการลบสินค้านี้ออกจากตะกร้า?", () => {
            setCartItems(prev => prev.filter(item => item.id !== productId));
            toast.success("ลบสินค้าเรียบร้อย");
        }, "ลบสินค้า");
    };

    const handleLogout = () => {
        showConfirm("ต้องการออกจากระบบใช่หรือไม่?", () => {
            localStorage.removeItem('customerData');
            toast.success("ออกจากระบบเรียบร้อย");
            router.push('/member/login');
        }, "ออกจากระบบ");
    };

    const handleProfileUpdate = (updatedData: any) => {
        setCustomer((prev: any) => prev ? { ...prev, ...updatedData } : null);
    };

    if (!customer) return null;

    const cartTotalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-10">
            {/* Desktop Sidebar */}
            <MemberSidebar
                customer={customer}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                cartTotalItems={cartTotalItems}
                onOpenCart={() => setIsCartOpen(true)}
                onEditProfile={() => setIsEditProfileOpen(true)}
            />

            <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm transition-all duration-300">
                <div className="px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/smartpos-logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <span className="font-bold text-xl text-slate-800">Smart Member</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-red-500 p-2"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area (Shifted right on Desktop) */}
            <main className="md:pl-64 max-w-7xl mx-auto px-4 py-6 space-y-8 transition-all duration-300">

                {/* 1. Feature: Membership Tier Card */}
                {/* Show on Store or if mobile? Let's show always but maybe smaller on store? Keep standard. */}
                <MemberProfileCard customer={customer} onEditProfile={() => setIsEditProfileOpen(true)} />

                {/* 2. Feature: Promotions */}
                {activeTab === 'store' && <PromotionBanner shopId={(customer as any)?.shopId} />}


                {/* Tab Content */}
                <div className="min-h-[400px]">

                    {/* 4. Feature: Product Catalog */}
                    {activeTab === 'store' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                                <Store className="w-6 h-6 text-indigo-600" /> สินค้าแนะนำ
                            </h2>
                            {/* Pass addToCart to Catalog with ShopId */}
                            <ProductCatalog onAddToCart={addToCart} shopId={(customer as any)?.shopId} />
                        </div>
                    )}

                    {/* 3. Feature: Coupons */}
                    {activeTab === 'coupon' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                                <Ticket className="w-6 h-6 text-amber-500" /> คูปองส่วนลดของฉัน
                            </h2>
                            <CouponList coupons={coupons} />
                        </div>
                    )}

                    {/* History Section */}
                    {activeTab === 'history' && (
                        <MemberHistory
                            activeTab={historyTab}
                            onTabChange={setHistoryTab}
                            purchases={purchases}
                            pointsHistory={pointsHistory}
                            onSelectPurchase={setSelectedPurchase}
                        />
                    )}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                cartTotalItems={cartTotalItems}
                onOpenCart={() => setIsCartOpen(true)}
            />

            {/* Cart Drawer Component */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
            />

            <CustomerProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                customer={customer}
                onUpdate={handleProfileUpdate}
            />

            <PurchaseDetailModal
                purchase={selectedPurchase}
                onClose={() => setSelectedPurchase(null)}
            />
        </div>
    );
}
