"use client";

import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, QrCode, CheckCircle, Store, Coins, Loader2 } from "lucide-react";
import { GiftBoxIcon, PriceTagIcon, StarBadgeIcon } from "@/components/icons/PromotionIcons";
import { supabase } from "@/lib/supabase";

interface Promotion {
    id: number;
    name: string;
    description?: string;
    discount_type: string;
    discount_value: number;
    is_active: boolean;
}

export default function CustomerDisplayPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [total, setTotal] = useState(0);
    const [amountReceived, setAmountReceived] = useState(0);
    const [change, setChange] = useState(0);
    const [status, setStatus] = useState<'idle' | 'paying' | 'success'>('idle');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [phoneInput, setPhoneInput] = useState("");
    const [foundCustomer, setFoundCustomer] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);
    const [storeName, setStoreName] = useState("Smart POS");

    const broadcastChannel = useMemo(() => typeof window !== 'undefined' ? new BroadcastChannel('customer-display') : null, []);

    // Load active promotions from database
    useEffect(() => {
        const loadPromotions = async () => {
            try {
                // 1. Try Load Store Name from admins (User's preference)
                const { data: adminData } = await supabase
                    .from('admins')
                    .select('shop_name')
                    .limit(1);

                if (adminData && adminData.length > 0 && adminData[0].shop_name) {
                    setStoreName(adminData[0].shop_name);
                } else {
                    // 2. Fallback to store_settings
                    const { data: storeData } = await supabase
                        .from('store_settings')
                        .select('name')
                        .limit(1);

                    if (storeData && storeData.length > 0 && storeData[0].name) {
                        setStoreName(storeData[0].name);
                    }
                }

                const now = new Date().toISOString();

                const { data, error } = await supabase
                    .from('promotions')
                    .select('*')
                    .eq('is_active', true)
                    .or(`end_date.is.null,end_date.gte.${now}`)  // Not expired
                    .or(`start_date.is.null,start_date.lte.${now}`)  // Already started
                    .limit(3);

                if (error) throw error;

                // Additional client-side filter for complex date logic
                const validPromotions = (data || []).filter(promo => {
                    const now = new Date();
                    const startDate = promo.start_date ? new Date(promo.start_date) : null;
                    const endDate = promo.end_date ? new Date(promo.end_date) : null;

                    // Must have started (or no start date)
                    if (startDate && startDate > now) return false;
                    // Must not be expired (or no end date)
                    if (endDate && endDate < now) return false;

                    return true;
                });

                setPromotions(validPromotions);
            } catch (err) {
                console.error("Failed to load promotions:", err);
            } finally {
                setIsLoadingPromotions(false);
            }
        };

        loadPromotions();
    }, []);

    useEffect(() => {
        // Initial load: Fetch latest held bill to be in sync with Sale page
        const restoreSession = async () => {
            try {
                const { getSales } = await import("@/lib/api/sales");
                const hData = await getSales('held');
                if (hData.data && hData.data.length > 0) {
                    const latest = hData.data[0];
                    setCart(latest.items.map((item: any) => ({
                        id: item.productId,
                        name: item.productName,
                        price: item.price,
                        qty: item.quantity
                    })));
                    setSubtotal(latest.subtotal);
                    setDiscount(latest.discount);
                    setTotal(latest.total);
                    setStatus('idle');
                }
            } catch (err) {
                console.error("Failed to restore customer display session:", err);
            }
        };

        restoreSession();

        if (!broadcastChannel) return;

        broadcastChannel.onmessage = (event) => {
            const data = event.data;
            if (data.type === 'UPDATE_CART') {
                setCart(data.cart);
                setSubtotal(data.subtotal || data.total);
                setDiscount(data.discount || 0);
                setTotal(data.total);
                if (data.status) setStatus(data.status);
            }
            if (data.type === 'PAYMENT_START') {
                setStatus('paying');
                setTotal(data.total);
                setPaymentMethod(data.method || 'cash');
            }
            if (data.type === 'PAYMENT_SUCCESS') {
                setStatus('success');
                setAmountReceived(data.received || 0);
                setChange(data.change || 0);
                setTimeout(() => {
                    setStatus('idle');
                    setCart([]);
                    setTotal(0);
                    setFoundCustomer(null);
                    setPointsToUse(0);
                }, 5000);
            }
            if (data.type === 'RESET') {
                setStatus('idle');
                setCart([]);
                setTotal(0);
                setFoundCustomer(null);
                setPointsToUse(0);
            }
        };

        return () => {
            broadcastChannel?.close();
        };
    }, [broadcastChannel]);

    const handleKeypadPress = (val: string) => {
        if (val === "clear") {
            setPhoneInput("");
            setFoundCustomer(null);
            setPointsToUse(0);
            broadcastChannel?.postMessage({ type: 'CUSTOMER_CLEAR' });
        } else if (val === "back") {
            setPhoneInput(prev => prev.slice(0, -1));
        } else if (phoneInput.length < 10) {
            setPhoneInput(prev => prev + val);
        }
    };

    const searchMember = async () => {
        if (phoneInput.length < 10) return;
        setIsSearching(true);
        try {
            const { lookupCustomerByPhone } = await import("@/lib/api/customers");
            const customer = await lookupCustomerByPhone(phoneInput);
            if (customer) {
                setFoundCustomer(customer);
                broadcastChannel?.postMessage({ type: 'CUSTOMER_FOUND', customer });
            } else {
                setFoundCustomer(null);
                alert("ไม่พบข้อมูลสมาชิก");
            }
        } catch (error) {
            console.error("Member search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleUsePoints = () => {
        if (!foundCustomer) return;
        const maxPoints = Math.floor(foundCustomer.points / 1000) * 1000;
        const newPoints = pointsToUse > 0 ? 0 : maxPoints;
        setPointsToUse(newPoints);
        broadcastChannel?.postMessage({ type: 'SET_POINTS', points: newPoints });
    };

    // Helper to get promotion display info
    const getPromotionDisplay = (promo: Promotion, index: number) => {
        const colors = [
            "from-pink-500 to-rose-500",
            "from-amber-500 to-orange-500",
            "from-indigo-500 to-purple-500"
        ];
        const icons = [GiftBoxIcon, PriceTagIcon, StarBadgeIcon];

        const discountText = promo.discount_type === 'percentage'
            ? `ลด ${promo.discount_value}%`
            : `ลด ฿${promo.discount_value}`;

        return {
            title: discountText,
            description: promo.name,
            color: colors[index % colors.length],
            Icon: icons[index % icons.length]
        };
    };

    // Fallback promotions if database is empty
    const displayPromotions = promotions.length > 0
        ? promotions.map((promo, index) => ({
            id: promo.id,
            ...getPromotionDisplay(promo, index)
        }))
        : [
            { id: 1, title: "ยินดีต้อนรับ", description: "Smart POS", color: "from-indigo-500 to-purple-500" }
        ];

    if (status === 'idle' && cart.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-8">
                {/* Logo */}
                <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Store className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>

                {/* Welcome Text */}
                <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-2">ยินดีต้อนรับ</h1>
                <p className="text-lg md:text-xl text-slate-500 mb-12">{storeName} ยินดีให้บริการค่ะ</p>

                {/* Promotions */}
                {promotions.length > 0 && (
                    <div className="w-full max-w-4xl">
                        <h3 className="text-center text-slate-400 font-medium mb-6 text-sm uppercase tracking-wider">โปรโมชั่นวันนี้</h3>
                        {isLoadingPromotions ? (
                            <div className="flex justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                {promotions.slice(0, 3).map((promo, index) => {
                                    const colors = [
                                        "bg-indigo-50 border-indigo-100 text-indigo-600",
                                        "bg-amber-50 border-amber-100 text-amber-600",
                                        "bg-emerald-50 border-emerald-100 text-emerald-600"
                                    ];
                                    const discountText = promo.discount_type === 'percentage'
                                        ? `ลด ${promo.discount_value}%`
                                        : `ลด ฿${promo.discount_value}`;

                                    return (
                                        <div
                                            key={promo.id}
                                            className={`flex-1 p-6 rounded-2xl border-2 ${colors[index % 3]} text-center`}
                                        >
                                            <div className="text-2xl md:text-3xl font-bold mb-1">{discountText}</div>
                                            <div className="text-sm opacity-70">{promo.name}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer hint */}
                <p className="absolute bottom-8 text-slate-300 text-sm">กรุณาสแกนสินค้าเพื่อเริ่มต้น</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left: Cart Items */}
            <div className="flex-1 p-6 flex flex-col h-screen overflow-hidden">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 bg-slate-900 text-white">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <ShoppingCart className="w-6 h-6" />
                            รายการสินค้า ({cart.reduce((sum, item) => sum + item.qty, 0)})
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {cart.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                                <ShoppingCart className="w-16 h-16 mb-4" />
                                <p className="text-xl font-bold">ไม่มีสินค้าในตะกร้า</p>
                            </div>
                        ) : (
                            cart.map((item, index) => (
                                <div key={index} className="flex gap-5 p-5 bg-white rounded-2xl border border-slate-100 items-center shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-50">
                                        <img
                                            src={item.image || "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=200"}
                                            alt={item.name}
                                            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-2xl font-bold text-slate-800 leading-tight mb-1">{item.name}</div>
                                        <div className="text-slate-500 text-lg font-medium">฿{item.price.toLocaleString()} x {item.qty}</div>
                                    </div>
                                    <div className="text-3xl font-black text-indigo-600 tracking-tight">
                                        ฿{(item.price * item.qty).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <div className="space-y-2">
                            {discount > 0 && (
                                <>
                                    <div className="flex justify-between text-slate-500 text-lg font-bold">
                                        <span>ยอดรวม</span>
                                        <span>฿{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-rose-500 text-lg font-bold">
                                        <span>ส่วนลด</span>
                                        <span>-฿{discount.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between items-end border-t border-slate-200 pt-2">
                                <div className="text-slate-500 text-xl font-bold">ยอดเงินสุทธิ</div>
                                <div className="text-6xl font-extrabold text-slate-900 tracking-tight">
                                    ฿{total.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Payment / Status / Member */}
            <div className={`w-[480px] p-6 bg-slate-100 transition-all duration-500`}>
                <div className="h-full bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden border-2 border-indigo-100 relative">
                    {status === 'paying' ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in slide-in-from-right fade-in duration-500">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">กรุณาชำระเงิน</h2>
                            <p className="text-slate-500 text-lg mb-8">ยอดเงินที่ต้องชำระ</p>
                            <div className="bg-indigo-600 text-white px-8 py-4 rounded-3xl text-5xl font-bold mb-12 shadow-lg shadow-indigo-300">
                                ฿{total.toLocaleString()}
                            </div>
                            <div className="w-full space-y-4">
                                {paymentMethod === 'PromptPay' && (
                                    <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 flex flex-col items-center gap-4">
                                        <div className="w-64 h-64 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                            <QrCode className="w-32 h-32" />
                                        </div>
                                        <p className="font-bold text-slate-600">สแกน QR Code เพื่อชำระเงิน</p>
                                    </div>
                                )}
                                {paymentMethod === 'cash' && (
                                    <div className="bg-green-50 p-8 rounded-3xl border-2 border-green-100 flex flex-col items-center gap-4 text-green-700">
                                        <Coins className="w-16 h-16" />
                                        <p className="font-bold text-2xl">รับเงินสด</p>
                                        <p>กรุณารอเงินทอน</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : status === 'success' ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-green-500 text-white animate-in zoom-in fade-in duration-300">
                            <div className="w-32 h-32 bg-white text-green-500 rounded-full flex items-center justify-center mb-8 shadow-xl">
                                <CheckCircle className="w-20 h-20" />
                            </div>
                            <h2 className="text-4xl font-bold mb-4">ขอบคุณค่ะ</h2>
                            <p className="text-xl opacity-90 mb-12">การชำระเงินเรียบร้อยแล้ว</p>
                            <div className="bg-white/10 rounded-2xl p-6 w-full max-w-sm backdrop-blur-sm">
                                <div className="flex justify-between text-lg mb-2">
                                    <span>รับเงินมา</span>
                                    <span className="font-bold">฿{amountReceived.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg text-yellow-300 font-bold border-t border-white/20 pt-2 mt-2">
                                    <span className="text-2xl">เงินทอน</span>
                                    <span className="text-2xl">฿{change.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col p-6 overflow-hidden">
                            {!foundCustomer ? (
                                <div className="flex flex-col h-full">
                                    <div className="text-center mb-6">

                                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">ใส่เบอร์โทรศัพท์เพื่อสะสมแต้ม</h3>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-6">
                                        <div className="text-center text-3xl font-mono tracking-[0.2em] font-bold text-indigo-600 h-10 flex items-center justify-center">
                                            {phoneInput ? phoneInput.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : "___-___-____"}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 flex-1">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "clear", 0, "back"].map((val) => (
                                            <button key={val} onClick={() => handleKeypadPress(val.toString())} className={`flex items-center justify-center rounded-2xl text-2xl font-bold transition-all active:scale-95 ${val === "clear" ? "bg-rose-50 text-rose-500 text-base" : val === "back" ? "bg-slate-100 text-slate-500" : "bg-white border border-slate-200 text-slate-700 shadow-sm hover:border-indigo-300"}`}>
                                                {val === "clear" ? "ล้าง" : val === "back" ? "←" : val}
                                            </button>
                                        ))}
                                    </div>

                                    <button onClick={searchMember} disabled={phoneInput.length < 10 || isSearching} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl mt-4 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all hover:bg-indigo-700 active:scale-95">
                                        {isSearching ? "กำลังค้นหา..." : "ตรวจสอบข้อมูลสมาชิก"}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">

                                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{foundCustomer.name}</h3>
                                    <p className="text-slate-500 mb-4">แต้มปัจจุบัน: <span className="text-amber-600 font-bold">{foundCustomer.points.toLocaleString()} แต้ม</span></p>

                                    {/* Points to earn from this purchase */}
                                    {total > 0 && (
                                        <div className="w-full mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100">
                                            <div className="flex items-center justify-center gap-2 text-green-600">
                                                <span className="font-bold">รับแต้มจากการซื้อครั้งนี้</span>
                                            </div>
                                            <div className="text-3xl font-extrabold text-green-600 mt-2">
                                                +{Math.floor(total / 100).toLocaleString()} แต้ม
                                            </div>
                                            <p className="text-xs text-green-500 mt-1">(ทุก ฿100 = 1 แต้ม)</p>
                                        </div>
                                    )}

                                    {foundCustomer.points >= 1000 ? (
                                        <div className="w-full space-y-4">
                                            <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-100">
                                                <p className="text-amber-800 font-bold">✨ คุณมีสิทธิ์ใช้แต้มลดราคา!</p>
                                                <p className="text-sm text-amber-600 mt-1">1,000 แต้ม = ลด 10 บาท</p>
                                            </div>
                                            <button onClick={handleUsePoints} className={`w-full py-5 rounded-3xl font-bold text-xl transition-all shadow-lg active:scale-95 ${pointsToUse > 0 ? "bg-rose-500 text-white shadow-rose-200" : "bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600"}`}>
                                                {pointsToUse > 0 ? "❌ ยกเลิกการใช้แต้ม" : "🛒 กดเพื่อใช้แต้มลดราคา"}
                                            </button>
                                            {pointsToUse > 0 && (
                                                <div className="animate-bounce mt-4 text-rose-500 font-bold text-lg">
                                                    ลดราคาให้แล้ว ฿{(Math.floor(pointsToUse / 1000) * 10).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 bg-slate-50 rounded-3xl border-2 border-slate-100 text-slate-500 w-full">
                                            <p className="font-medium">ยอดแต้มยังไม่ถึงกำหนดแลกส่วนลด</p>
                                            <p className="text-xs mt-2 text-slate-400">(ต้องการอย่างน้อย 1,000 แต้ม)</p>
                                        </div>
                                    )}

                                    <button onClick={() => handleKeypadPress("clear")} className="text-slate-400 font-medium mt-12 hover:text-rose-500 transition-colors underline decoration-dotted">
                                        ออกจากระบบ / สลับบัญชี
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
