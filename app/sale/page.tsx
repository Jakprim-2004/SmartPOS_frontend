"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

// Components
import ProductList from "@/components/sale/ProductList";
import CartSection from "@/components/sale/CartSection";
import PaymentModal from "@/components/sale/PaymentModal";
import HeldBillModal from "@/components/sale/HeldBillModal";
import BillHistoryModal from "@/components/sale/BillHistoryModal";
import { Receipt } from "@/components/sale/Receipt";
import CustomerSelectModal from "@/components/sale/CustomerSelectModal";

// Types
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/api/products";
import { getSales, createSale, updateSale } from "@/lib/api/sales";
import { Category, getCategories } from "@/lib/api/categories";
import { getHeldBills, createHeldBill, deleteHeldBill } from "@/lib/api/held-bills";
import { getCart, updateCart, clearCart as clearRemoteCart } from "@/lib/api/cart";
import { getActivePromotions, getPromotionProducts } from "@/lib/api/promotions";

export default function SalePage() {
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activePromotions, setActivePromotions] = useState<any[]>([]);
    const [promotionProductsMap, setPromotionProductsMap] = useState<Record<number, number[]>>({});
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
    const [cart, setCart] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash"); // cash, scan, transfer
    const [cashReceived, setCashReceived] = useState<string>("");
    const [pointsRedeemed, setPointsRedeemed] = useState(0);
    const [showHeldBillsModal, setShowHeldBillsModal] = useState(false);
    const [heldBills, setHeldBills] = useState<any[]>([]);

    const [lastBill, setLastBill] = useState<any>(null);
    const [recentBills, setRecentBills] = useState<any[]>([]);
    const [showBillHistoryModal, setShowBillHistoryModal] = useState(false);
    const syncingRef = useRef(false);

    const [billToPrint, setBillToPrint] = useState<any>(null);
    const componentRef = useRef<HTMLDivElement>(null);



    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    // Fetch Initial Data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Products and Categories are essential
                const [pDataRaw, cData, promoData] = await Promise.all([
                    getProducts({ limit: 1000 }), // Fetch more for POS but still structured
                    getCategories(),
                    getActivePromotions().catch(() => [])
                ]);
                const pData = pDataRaw.data || [];
                setProducts(pData);
                setCategories(cData);
                setActivePromotions(promoData);

                // Fetch products for each active promotion
                const map: Record<number, number[]> = {};
                await Promise.all(promoData.map(async (p: any) => {
                    const productIds = await getPromotionProducts(p.id).catch(() => []);
                    map[p.id] = productIds;
                }));
                setPromotionProductsMap(map);

                // Sales, Held Bills, and Cart can fail gracefully
                try {
                    const [sData, hData, remoteCart] = await Promise.all([
                        getSales().catch(() => ({ data: [], total: 0 })),
                        getHeldBills().catch(() => []),
                        getCart().catch(() => null)
                    ]);

                    const sales = sData?.data || [];
                    setRecentBills(sales);
                    if (sales.length > 0) setLastBill(sales[0]);

                    const held = hData || [];
                    setHeldBills(held);

                    // Restore Cart
                    if (remoteCart && remoteCart.active_cart_items?.length > 0) {
                        setCart(remoteCart.active_cart_items.map((item: any) => ({
                            id: item.product_id,
                            name: item.products?.name || 'Unknown',
                            price: item.products?.price || 0,
                            qty: item.quantity,
                            image: item.products?.image_url
                        })));
                        setSelectedCustomer(remoteCart.customer_id ? { id: remoteCart.customer_id } : null);
                    } else {
                        const savedCart = localStorage.getItem('pos_cart');
                        const savedCustomer = localStorage.getItem('pos_customer');
                        if (savedCart) setCart(JSON.parse(savedCart));
                        if (savedCustomer) setSelectedCustomer(JSON.parse(savedCustomer));
                    }
                } catch (e) {
                    console.warn("Non-essential data failed to load:", e);
                }
            } catch (error) {
                console.error("Critical initial data load failed:", error);
                toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
            }
        };
        loadInitialData();
    }, []);

    // Effect to print when billToPrint changes
    useEffect(() => {
        if (billToPrint) {
            handlePrint();
            setBillToPrint(null); // Reset after printing
        }
    }, [billToPrint, handlePrint]);

    const handlePrintLastBill = () => {
        if (!lastBill) return;
        setBillToPrint(lastBill);
    };

    const handlePrintBill = (bill: any) => {
        setBillToPrint(bill);
    };

    // Derived State
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search));
            const matchesCategory =
                activeCategory === "ทั้งหมด" || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [search, activeCategory, products]);

    // Helper: Find best promotion for a product
    const getBestPromotionForProduct = (productId: number) => {
        const applicablePromos = activePromotions.filter(p =>
            promotionProductsMap[p.id]?.includes(productId)
        );

        if (applicablePromos.length === 0) return null;

        // Choose the one with highest discount or just the first active one
        return applicablePromos.sort((a, b) => (b.discount_value || 0) - (a.discount_value || 0))[0];
    };

    // Handlers
    const addToCart = (product: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }

            const promo = getBestPromotionForProduct(product.id);

            return [...prev, {
                ...product,
                qty: 1,
                promotion: promo ? {
                    id: promo.id,
                    title: promo.title,
                    discount_type: promo.discount_type,
                    discount_value: promo.discount_value
                } : null
            }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQty = item.qty + delta;
                    return newQty > 0 ? { ...item, qty: newQty } : item;
                }
                return item;
            })
        );
    };

    const removeItem = (id: number) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = async () => {
        setCart([]);
        setSelectedCustomer(null);
        setPointsRedeemed(0);

        localStorage.removeItem('pos_cart');
        localStorage.removeItem('pos_customer');

        try {
            await clearRemoteCart();
            toast.success("ล้างตะกร้าเรียบร้อย");
        } catch (err) {
            console.error("Failed to clear remote cart:", err);
        }
    };

    // --- Customer Display Logic ---
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        channelRef.current = new BroadcastChannel('customer-display');

        channelRef.current.onmessage = (event) => {
            const data = event.data;
            if (data.type === 'CUSTOMER_FOUND') {
                setSelectedCustomer(data.customer);
                setPointsRedeemed(0); // Reset points when new customer found
                toast.success(`พบสมาชิก: ${data.customer.name}`);
            }
            if (data.type === 'CUSTOMER_CLEAR') {
                setSelectedCustomer(null);
                setPointsRedeemed(0);
            }
            if (data.type === 'SET_POINTS') {
                setPointsRedeemed(data.points);
                if (data.points > 0) {
                    toast.success(`ใช้แต้มลดราคา ฿${(Math.floor(data.points / 1000) * 10).toLocaleString()}`);
                }
            }
        };

        return () => channelRef.current?.close();
    }, []);

    // Derived values
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const pointDiscount = Math.floor(pointsRedeemed / 1000) * 10;

    // Calculate total promotion discount from items
    const promoDiscount = cart.reduce((sum, item) => {
        if (!item.promotion) return sum;
        let itemDiscount = 0;
        if (item.promotion.discount_type === 'percentage') {
            itemDiscount = (item.price * item.qty * item.promotion.discount_value) / 100;
        } else {
            itemDiscount = item.promotion.discount_value * item.qty;
        }
        return sum + itemDiscount;
    }, 0);

    const discount = promoDiscount; // Total discount is primarily from promotions now
    const total = Math.max(0, subtotal - discount - pointDiscount);

    // Sync Cart & Total to Customer Display and LocalStorage
    useEffect(() => {
        // Customer Display
        channelRef.current?.postMessage({
            type: 'UPDATE_CART',
            cart: cart.map(item => {
                let currentItemDiscount = 0;
                if (item.promotion) {
                    if (item.promotion.discount_type === 'percentage') {
                        currentItemDiscount = (item.price * item.qty * item.promotion.discount_value) / 100;
                    } else {
                        currentItemDiscount = item.promotion.discount_value * item.qty;
                    }
                }
                return {
                    ...item,
                    discountedPrice: (item.price * item.qty - currentItemDiscount) / item.qty
                };
            }),
            subtotal,
            discount: discount + pointDiscount,
            total,
            status: 'idle',
            customer: selectedCustomer
        });

        // LocalStorage for persistence
        if (cart.length > 0) {
            localStorage.setItem('pos_cart', JSON.stringify(cart));
            if (selectedCustomer) {
                localStorage.setItem('pos_customer', JSON.stringify(selectedCustomer));
            } else {
                localStorage.removeItem('pos_customer');
            }
        } else {
            localStorage.removeItem('pos_cart');
            localStorage.removeItem('pos_customer');
        }
        // Sync to Database periodically (Active Cart)
        const syncTimeout = setTimeout(async () => {
            if (cart.length === 0) return;
            try {
                await updateCart({
                    customerId: selectedCustomer?.id,
                    items: cart.map(item => ({
                        productId: item.id,
                        quantity: item.qty
                    }))
                });
            } catch (err) {
                console.error("Cart sync failed:", err);
            }
        }, 2000);

        return () => {
            clearTimeout(syncTimeout);
        };
    }, [cart, total, subtotal, discount, pointDiscount, selectedCustomer]);

    // Sync Payment Start
    useEffect(() => {
        if (showPaymentModal) {
            channelRef.current?.postMessage({
                type: 'PAYMENT_START',
                total,
                method: paymentMethod
            });
        } else {
            // If closed without success (handled in handlePayment for success), reset to idle/cart
            if (cart.length > 0) {
                channelRef.current?.postMessage({
                    type: 'UPDATE_CART',
                    cart,
                    total
                });
            }
        }
    }, [showPaymentModal, paymentMethod, total, cart]);

    const handlePayment = async (pointsRedeemed: number = 0, finalTotal?: number, couponCode?: string) => {
        try {
            const currentTotal = finalTotal !== undefined ? finalTotal : total;
            const pointsDiscount = Math.floor(pointsRedeemed / 1000) * 10;

            // Prepare Sale DTO
            const saleData = {
                customerId: selectedCustomer?.id,
                items: cart.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    price: item.price,
                    quantity: item.qty
                })),
                subtotal,
                discount: discount + pointsDiscount,
                total: currentTotal,
                paymentMethod,
                amountReceived: Number(cashReceived) || currentTotal,
                changeAmount: (Number(cashReceived) || currentTotal) - currentTotal,
                pointsRedeemed: pointsRedeemed,
                couponCode: couponCode
            };

            let newSale = await createSale({ ...saleData, status: 'completed' });

            setLastBill(newSale);
            setRecentBills(prev => [newSale, ...prev]);
            setBillToPrint(newSale); // Auto-print receipt

            // Sync Success to Customer Display
            channelRef.current?.postMessage({
                type: 'PAYMENT_SUCCESS',
                received: Number(cashReceived) || currentTotal,
                change: (Number(cashReceived) || currentTotal) - currentTotal,
                pointsRedeemed: pointsRedeemed
            });

            toast.success("บันทึกการขายเรียบร้อย!");
            setShowPaymentModal(false);
            setCart([]);
            setSelectedCustomer(null);
            setPointsRedeemed(0);
            setCashReceived("");
            localStorage.removeItem('pos_cart');
            localStorage.removeItem('pos_customer');
            await clearRemoteCart();

        } catch (error) {
            console.error("Payment failed:", error);
            toast.error("บันทึกการขายล้มเหลว");
        }
    };

    const handleHoldBill = async () => {
        if (cart.length === 0) return;

        try {
            const billData = {
                customerId: selectedCustomer?.id,
                items: cart.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    price: item.price,
                    quantity: item.qty
                })),
                subtotal,
                discount: discount + pointDiscount,
                total,
                notes: ""
            };

            await createHeldBill(billData);

            // Refresh held bills
            const hData = await getHeldBills();
            setHeldBills(hData);

            // Clear Cart
            setCart([]);
            setSelectedCustomer(null);
            setPointsRedeemed(0);
            localStorage.removeItem('pos_cart');
            localStorage.removeItem('pos_customer');
            await clearRemoteCart();

            toast.success("พักบิลเรียบร้อย!");
            channelRef.current?.postMessage({ type: 'RESET' });
        } catch (err) {
            console.error("Hold bill failed:", err);
            toast.error("ไม่สามารถพักบิลได้");
        }
    };

    const handleRestoreBill = async (bill: any) => {
        // Load item data from bill
        setCart(bill.held_bill_items.map((item: any) => ({
            id: item.product_id,
            name: item.product_name,
            price: item.price,
            qty: item.quantity
        })));
        setSelectedCustomer(bill.customer_id ? { id: bill.customer_id } : null);

        // Remove from held bills
        await deleteHeldBill(bill.id);
        const hData = await getHeldBills();
        setHeldBills(hData);

        setShowHeldBillsModal(false);
        toast.success("เรียกคืนบิลเรียบร้อย!");
    };

    const handleDeleteHeldBill = async (id: number) => {
        try {
            await deleteHeldBill(id);
            const hData = await getHeldBills();
            setHeldBills(hData);
            toast.success("ลบบิลที่พักไว้แล้ว");
        } catch (err) {
            toast.error("ไม่สามารถลบบิลได้");
        }
    };

    const [showMobileCart, setShowMobileCart] = useState(false);

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
            {/* Product List Component */}
            <ProductList
                products={filteredProducts}
                search={search}
                setSearch={setSearch}
                addToCart={addToCart}
                cart={cart}
            />

            {/* Cart Section Component - Hidden on mobile, shown as sidebar on desktop */}
            <div className="hidden md:flex">
                <CartSection
                    cart={cart}
                    subtotal={subtotal}
                    discount={discount}
                    total={total}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    setShowCustomerModal={setShowCustomerModal}
                    updateQty={updateQty}
                    removeItem={removeItem}
                    clearCart={() => {
                        clearCart();
                        channelRef.current?.postMessage({ type: 'RESET' });
                    }}
                    onHoldBill={handleHoldBill}
                    setShowPaymentModal={setShowPaymentModal}
                    heldBillsCount={heldBills.length}
                    onOpenHeldBills={() => setShowHeldBillsModal(true)}
                    lastBill={lastBill}
                    onPrintLastBill={handlePrintLastBill}
                    onOpenBillHistory={() => setShowBillHistoryModal(true)}
                />
            </div>

            {/* Floating Cart Button - Mobile Only */}
            {cart.length > 0 && (
                <button
                    onClick={() => setShowMobileCart(true)}
                    className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <div className="flex items-center gap-2">
                        <div className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                            {cart.reduce((sum, item) => sum + item.qty, 0)}
                        </div>
                        <span className="font-bold">ดูตะกร้า</span>
                    </div>
                    <div className="h-6 w-px bg-white/30"></div>
                    <span className="text-lg font-bold">฿{total.toLocaleString()}</span>
                </button>
            )}

            {/* Mobile Cart Modal */}
            {showMobileCart && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                        <CartSection
                            cart={cart}
                            subtotal={subtotal}
                            discount={discount}
                            total={total}
                            selectedCustomer={selectedCustomer}
                            setSelectedCustomer={setSelectedCustomer}
                            setShowCustomerModal={setShowCustomerModal}
                            updateQty={updateQty}
                            removeItem={removeItem}
                            clearCart={() => {
                                clearCart();
                                channelRef.current?.postMessage({ type: 'RESET' });
                                setShowMobileCart(false);
                            }}
                            onHoldBill={() => {
                                handleHoldBill();
                                setShowMobileCart(false);
                            }}
                            setShowPaymentModal={(show) => {
                                setShowPaymentModal(show);
                                if (show) setShowMobileCart(false);
                            }}
                            heldBillsCount={heldBills.length}
                            onOpenHeldBills={() => {
                                setShowHeldBillsModal(true);
                                setShowMobileCart(false);
                            }}
                            lastBill={lastBill}
                            onPrintLastBill={handlePrintLastBill}
                            onOpenBillHistory={() => {
                                setShowBillHistoryModal(true);
                                setShowMobileCart(false);
                            }}
                        />
                        <button
                            onClick={() => setShowMobileCart(false)}
                            className="p-4 text-slate-500 hover:text-slate-700 font-medium border-t border-slate-100"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <CustomerSelectModal
                show={showCustomerModal}
                onSelect={(customer: any) => {
                    setSelectedCustomer(customer);
                    setShowCustomerModal(false);
                }}
                onClose={() => setShowCustomerModal(false)}
            />

            <HeldBillModal
                show={showHeldBillsModal}
                heldBills={heldBills}
                onRestore={handleRestoreBill}
                onDelete={handleDeleteHeldBill}
                onClose={() => setShowHeldBillsModal(false)}
            />

            <BillHistoryModal
                show={showBillHistoryModal}
                bills={recentBills}
                onPrint={handlePrintBill}
                onClose={() => setShowBillHistoryModal(false)}
            />

            <PaymentModal
                show={showPaymentModal}
                total={total}
                cartLength={cart.length}
                selectedCustomer={selectedCustomer}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cashReceived={cashReceived}
                setCashReceived={setCashReceived}
                onConfirm={handlePayment}
                onClose={() => setShowPaymentModal(false)}
                pointsRedeemed={pointsRedeemed}
                setPointsRedeemed={setPointsRedeemed}
            />

            {/* Hidden Receipt for Printing */}
            <div className="hidden">
                <Receipt ref={componentRef} bill={billToPrint} />
            </div>
        </div>
    );
}
