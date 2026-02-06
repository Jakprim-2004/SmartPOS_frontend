"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
    LogOut,
    ChevronDown,
    LayoutDashboard,
    Receipt,
    Package,
    History,
    Boxes,
    Monitor,
    Users,
    Gift,
    ShoppingCart,
    FileText,
    ShoppingBag,
    ClipboardList,
    Menu,
    ChevronLeft,
    ChevronRight,
    Settings
} from "lucide-react";
import toast from "react-hot-toast";
import { logout } from "@/lib/api/auth";
import { getSettings } from "@/lib/api/settings";

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [name, setName] = useState("Store Name");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [dropdownStates, setDropdownStates] = useState<{ [key: string]: boolean }>({
        reports: false,
        documents: false, // Products
        CRM: false
    });

    // Client-side greeting logic
    const [greeting, setGreeting] = useState("Good Morning");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting("Good Morning");
        else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        // Load name (User name or Store name)
        const loadName = async () => {
            try {
                // Try to get from localStorage first (User)
                const userJson = localStorage.getItem('user');
                if (userJson) {
                    const user = JSON.parse(userJson);
                    if (user) {
                        // Check if user is admin
                        setIsAdmin(user.role === 'admin');

                        if (user.shopName || user.shop_name) {
                            setName(user.shopName || user.shop_name);
                            return;
                        } else if (user.username) {
                            setName(user.username);
                            // Don't return here, try to fetch settings name as it might be better than username
                        }
                    }
                }

                // Fallback to Store Name from settings
                const settings = await getSettings();
                if (settings && settings.name) {
                    setName(settings.name);
                }
            } catch (error) {
                console.error("Failed to load name:", error);
            }
        };
        loadName();
    }, []);

    const handleDropdownClick = (dropdown: string) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setTimeout(() => {
                setDropdownStates((prev) => ({ ...prev, [dropdown]: true }));
            }, 150); // Small delay to allow sidebar to expand before dropdown opens
            return;
        }
        setDropdownStates((prev) => ({
            ...prev,
            [dropdown]: !prev[dropdown],
        }));
    };

    const handleSignOut = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem('user');
            // Force hard reload to login page to ensure cookies are cleared by browser/middleware check
            window.location.href = '/login';
        }
    };

    // Styles object adapted for Tailwind/Next.js
    const styles = {
        sidebar: {
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", // White to very light gray
            fontFamily: "Kanit, sans-serif",
            borderRight: "1px solid #e2e8f0"
        },
    };

    return (
        <div
            className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen flex flex-col font-sans overflow-y-auto scrollbar-hide shrink-0 transition-all duration-300 relative z-20`}
            style={styles.sidebar}
        >

            {/* Brand Link & Toggle */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-6`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                        <div className="w-10 h-10 relative shadow-sm rounded-full shrink-0">
                            <Image
                                src="/images/coin.gif"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                                unoptimized // Needed for GIFs in some Next.js configs to animate properly
                            />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-700 animate-in fade-in duration-300">POS on Cloud</span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md cursor-pointer" onClick={() => setIsCollapsed(false)}>
                        <Image
                            src="/images/coin.gif"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                            unoptimized
                        />
                    </div>
                )}

                {!isCollapsed && (
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* User Panel */}
            <div className={`mx-4 mb-6 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group transition-all duration-300 ${isCollapsed ? 'p-2 flex justify-center items-center h-14 bg-indigo-50' : 'p-4'}`}>
                {!isCollapsed ? (
                    <>
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-md"></div>
                        <div className="relative z-10 w-full overflow-hidden">
                            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 truncate">{greeting}</div>
                            <div className="text-lg font-bold text-slate-700 truncate">{name}</div>
                        </div>
                    </>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {name.charAt(0)}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="px-4 space-y-1 flex-1">

                {/* Sale */}
                <div>
                    <Link href="/sale" className={`flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all group overflow-hidden ${pathname === '/sale' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                        <div className={`w-6 h-6 flex justify-center items-center shrink-0 transition-transform group-hover:scale-110 ${pathname === '/sale' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        {!isCollapsed && <span className="font-medium text-[15px] whitespace-nowrap animate-in fade-in duration-200">ขายสินค้า</span>}
                    </Link>
                </div>

                {/* Customer Display */}
                <div>
                    <button
                        onClick={() => window.open('/customer-display', 'CustomerDisplay', 'width=1000,height=800,menubar=no,toolbar=no,location=no,status=no')}
                        className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all group overflow-hidden text-slate-500 hover:bg-slate-50 hover:text-slate-700`}
                    >
                        <div className={`w-6 h-6 flex justify-center items-center shrink-0 transition-transform group-hover:scale-110 text-slate-400 group-hover:text-indigo-500`}>
                            <Monitor className="w-5 h-5" />
                        </div>
                        {!isCollapsed && <span className="font-medium text-[15px] whitespace-nowrap animate-in fade-in duration-200">เปิดจอลูกค้า</span>}
                    </button>
                </div>



                {/* Products */}
                <div className="mt-2">
                    <button
                        onClick={() => handleDropdownClick("documents")}
                        className={`w-full flex items-center justify-between px-3 py-3.5 rounded-xl transition-all group overflow-hidden ${dropdownStates.documents ? 'bg-slate-50 text-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 flex justify-center items-center shrink-0 transition-transform group-hover:scale-110 ${dropdownStates.documents ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            {!isCollapsed && <span className="font-medium text-[15px] whitespace-nowrap animate-in fade-in duration-200">สินค้า</span>}
                        </div>
                        {!isCollapsed && <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${dropdownStates.documents ? 'rotate-180 text-indigo-500' : ''}`} />}
                    </button>

                    {!isCollapsed && (
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${dropdownStates.documents ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                            <div className="pl-11 pr-2 space-y-1 py-1 relative">
                                <div className="absolute left-[2.2rem] top-0 bottom-0 w-px bg-slate-200"></div>
                                <Link href="/product" className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/product' ? 'text-indigo-600 font-medium bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/product' ? 'bg-indigo-500' : 'bg-slate-300'} mr-1 shrink-0`}></div>
                                    <span className="truncate">จัดการสินค้า</span>
                                </Link>
                                <Link href="/stock" className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/stock' ? 'text-indigo-600 font-medium bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/stock' ? 'bg-indigo-500' : 'bg-slate-300'} mr-1 shrink-0`}></div>
                                    <span className="truncate">รับสินค้าเข้า Stock</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* CRM */}
                <div className="mt-2">
                    <button
                        onClick={() => handleDropdownClick("CRM")}
                        className={`w-full flex items-center justify-between px-3 py-3.5 rounded-xl transition-all group overflow-hidden ${dropdownStates.CRM ? 'bg-slate-50 text-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 flex justify-center items-center shrink-0 transition-transform group-hover:scale-110 ${dropdownStates.CRM ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                <ClipboardList className="w-5 h-5" />
                            </div>
                            {!isCollapsed && <span className="font-medium text-[15px] whitespace-nowrap animate-in fade-in duration-200">CRM</span>}
                        </div>
                        {!isCollapsed && <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${dropdownStates.CRM ? 'rotate-180 text-indigo-500' : ''}`} />}
                    </button>

                    {!isCollapsed && (
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${dropdownStates.CRM ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                            <div className="pl-11 pr-2 space-y-1 py-1 relative">
                                <div className="absolute left-[2.2rem] top-0 bottom-0 w-px bg-slate-200"></div>
                                <Link href="/customer" className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/customer' ? 'text-indigo-600 font-medium bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/customer' ? 'bg-indigo-500' : 'bg-slate-300'} mr-1 shrink-0`}></div>
                                    <span className="truncate">ข้อมูลลูกค้า</span>
                                </Link>
                                <Link href="/reward" className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/reward' ? 'text-indigo-600 font-medium bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${pathname === '/reward' ? 'bg-indigo-500' : 'bg-slate-300'} mr-1 shrink-0`}></div>
                                    <span className="truncate">แลกของรางวัล</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings - Admin Only */}
                {isAdmin && (
                    <div className="mt-2">
                        <Link href="/admin/dashboard" className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all group overflow-hidden ${pathname?.startsWith('/admin') ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                            <div className={`w-6 h-6 flex justify-center items-center shrink-0 transition-transform group-hover:scale-110 ${pathname?.startsWith('/admin') ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                <Settings className="w-5 h-5" />
                            </div>
                            {!isCollapsed && <span className="font-medium text-[15px] whitespace-nowrap animate-in fade-in duration-200">ตั้งค่าร้านค้า</span>}
                        </Link>
                    </div>
                )}

            </nav>

            {/* Footer / Toggle & Logout */}
            <div className="p-4 border-t border-slate-100">
                <div className={`flex flex-col gap-2`}>

                    {/* Logout Button */}
                    <button
                        onClick={handleSignOut}
                        className={`flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium px-2 py-2 rounded-lg hover:bg-red-50 w-full ${isCollapsed ? 'justify-center' : ''}`}
                        title="ออกจากระบบ"
                    >
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span>ออกจากระบบ</span>}
                    </button>


                </div>
            </div>

        </div>
    );
}
