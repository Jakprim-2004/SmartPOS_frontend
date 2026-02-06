"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Calendar, Phone, ArrowRight, User, UserPlus } from "lucide-react";
import welcomeImage from "@/public/images/mochi-young-woman.gif";
import { registerMember } from "@/lib/api/customers";
import Link from "next/link";

export default function MemberRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        birthday: "",
        phone: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.birthday || !formData.phone) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        if (formData.phone.length !== 10) {
            toast.error("เบอร์โทรศัพท์ต้องครบ 10 หลัก");
            return;
        }

        setLoading(true);

        try {
            // Call API
            const customer = await registerMember({
                name: formData.name,
                phone: formData.phone,
                birthday: formData.birthday
            });

            if (customer) {
                toast.success("สมัครสมาชิกสำเร็จ!");
                // Optionally auto login or redirect to login
                // localStorage.setItem('customerData', JSON.stringify(customer));
                // router.push('/member/dashboard');

                // Redirect to login to force them to use their credentials
                setTimeout(() => router.push('/member/login'), 1500);
            }
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาด หรือเบอร์นี้มีผู้ใช้งานแล้ว");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-10 flex items-center justify-center p-4 font-sans">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Image Section */}
                <div className="md:w-1/2 bg-gradient-to-br from-purple-400 to-indigo-500 p-8 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-pattern opacity-10"></div>
                    <div className="relative z-10 w-full max-w-sm text-center">
                        <div className="mb-6 relative w-48 h-48 mx-auto">
                            <Image
                                src={welcomeImage}
                                alt="Welcome"
                                fill
                                className="object-contain drop-shadow-xl"
                                unoptimized
                            />
                        </div>
                        <div className="text-white">
                            <h2 className="text-3xl font-bold mb-2">สมัครสมาชิกใหม่</h2>
                            <p className="opacity-90 text-sm">รับสิทธิพิเศษและโปรโมชั่นมากมาย</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-6 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <UserPlus className="w-6 h-6 text-indigo-600" />
                            ลงทะเบียนสมาชิก
                        </h1>
                        <p className="text-slate-500 text-sm">กรอกข้อมูลเพื่อเริ่มต้นสะสมคะแนน</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                ชื่อ-นามสกุล <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-900"
                                    placeholder="เช่น สมชาย ใจดี"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white font-mono font-medium text-slate-900 placeholder:text-slate-400"
                                    placeholder="0xxxxxxxxx"
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>

                        {/* Birthday Input */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                วัน/เดือน/ปี เกิด <span className="text-red-500">*</span>
                                <span className="text-xs font-normal text-slate-400 ml-auto">(ใช้เป็นรหัสผ่าน)</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="date"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4 ${loading
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1'
                                }`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>สมัครสมาชิก <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            เป็นสมาชิกอยู่แล้ว? {" "}
                            <Link href="/member/login" className="text-indigo-600 font-bold hover:underline">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 text-center text-xs text-slate-400">
                        &copy; 2024 Smart POS System. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}
