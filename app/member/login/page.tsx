"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Calendar, Phone, ArrowRight } from "lucide-react";
import welcomeImage from "@/public/images/mochi-young-woman.gif";
import { memberLogin } from "@/lib/api/customers";

export default function MemberLoginPage() {
    const router = useRouter();
    const [loginData, setLoginData] = useState({
        birthday: "",
        phone: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setLoginData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setLoginData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!loginData.birthday || !loginData.phone) {
            toast.error("กรุณากรอกทั้งวันเกิดและเบอร์โทรศัพท์");
            return;
        }

        if (loginData.phone.length !== 10) {
            toast.error("เบอร์โทรศัพท์ต้องครบ 10 หลัก");
            return;
        }

        setLoading(true);

        try {
            // Call API
            const customer = await memberLogin(loginData.phone, loginData.birthday);

            if (customer) {
                localStorage.setItem('customerData', JSON.stringify(customer));
                toast.success("เข้าสู่ระบบสำเร็จ!");
                router.push('/member/dashboard');
            }
        } catch (error) {
            console.error(error);
            toast.error("ข้อมูลไม่ถูกต้อง หรือไม่พบข้อมูลสมาชิกนี้");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-10 flex items-center justify-center p-4 font-sans">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Image Section */}
                <div className="md:w-1/2 bg-gradient-to-br from-blue-300 to-indigo-400 p-8 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-pattern opacity-10"></div>
                    <div className="relative z-10 w-full max-w-sm">
                        <Image
                            src={welcomeImage}
                            alt="Welcome"
                            className="w-full h-auto transform hover:scale-105 transition-transform duration-500"
                            unoptimized // Still good for GIFs
                        />
                        <div className="text-center mt-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">ยินดีต้อนรับกลับมา!</h2>
                            <p className="opacity-90">ระบบสมาชิก Smart POS สะสมแต้มและแลกของรางวัลมากมาย</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">เข้าสู่ระบบสมาชิก</h1>
                        <p className="text-slate-500">กรุณากรอกข้อมูลเพื่อเข้าใช้งาน</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={loginData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white font-mono font-medium text-slate-900 placeholder:text-slate-400"
                                    placeholder="0xxxxxxxxx"
                                    maxLength={10}
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                                    {loginData.phone.length}/10
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                วัน/เดือน/ปี เกิด <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="date"
                                    name="birthday"
                                    value={loginData.birthday}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 ${loading
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1'
                                }`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>เข้าสู่ระบบ <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-slate-400">
                        &copy; 2024 Smart POS System. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}
