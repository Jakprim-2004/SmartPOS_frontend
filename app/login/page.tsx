"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { User, Lock, ArrowRight, Loader2 } from "lucide-react";
import { login } from "@/lib/api/auth";

export default function AdminLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await login(formData.username, formData.password);

            // Store token & user info
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
                // Also set a cookie so the middleware can see it
                document.cookie = `access_token=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
            }
            localStorage.setItem('user', JSON.stringify(data.user));

            toast.success(`Welcome back, ${data.user.username}!`);

            // Redirect based on user role
            if (data.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/sale');
            }
        } catch (error) {
            console.error(error);
            toast.error("เข้าสู่ระบบล้มเหลว ตรวจสอบชื่อผู้ใช้และรหัสผ่าน");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-12 border border-slate-100 relative overflow-hidden">
                {/* Decor elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex justify-center items-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4 text-indigo-600 shadow-sm">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
                        <p className="text-slate-500 mt-2 text-sm">เข้าสู่ระบบจัดการร้านค้า</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-4 transition-all ${loading
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                                }`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-500">ยังไม่มีบัญชีร้านค้า? </span> <br />
                        <Link href="" className="text-indigo-600 font-bold hover:underline">
                            ลงชื่อเข้าใช้ด้วย username smartpos และ password 123456789
                        </Link>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400">
                            Secured by Smart POS Cloud
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
