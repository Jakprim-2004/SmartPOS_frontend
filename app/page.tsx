"use client";

import Link from "next/link";
import { Store, Users, ArrowRight } from "lucide-react";
import Lottie from "lottie-react";
import animationData from "../public/Logo-new.json";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 font-sans">

      <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-48 h-48 relative mb-6">
          {/* If Lottie fails or is heavy, use Image fallback or Icon */}
          <Lottie animationData={animationData} loop={true} autoplay={true} className="w-full h-full" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 text-center tracking-tight">
          Smart POS Cloud
        </h1>
        <p className="text-slate-500 text-lg md:text-xl text-center max-w-2xl">
          ระบบจัดการร้านค้าอัจฉริยะ เชื่อมต่อทุกสาขา บริหารจัดการสต็อกและสมาชิกในที่เดียว
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">

        {/* Shop Owner / Admin Card */}
        <Link
          href="/login"
          className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
            <Store className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
            สำหรับร้านค้า
          </h2>
          <p className="text-slate-500 mb-6">
            เข้าสู่ระบบจัดการร้านค้า, ขายสินค้า, จัดการสต็อก และดูรายงาน
          </p>
          <div className="mt-auto flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all">
            เข้าสู่ระบบร้านค้า <ArrowRight className="w-5 h-5" />
          </div>
        </Link>

        {/* Member / Customer Card */}
        <Link
          href="/member/login"
          className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1"
        >
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300 shadow-sm">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors">
            สำหรับลูกค้าสมาชิก
          </h2>
          <p className="text-slate-500 mb-6">
            ตรวจสอบแต้มสะสม, แลกของรางวัล และดูประวัติการสั่งซื้อ
          </p>
          <div className="mt-auto flex items-center gap-2 text-rose-600 font-semibold group-hover:gap-3 transition-all">
            เข้าสู่ระบบสมาชิก <ArrowRight className="w-5 h-5" />
          </div>
        </Link>

      </div>

      <div className="mt-16 text-slate-400 text-sm">
        © 2024 Smart POS Cloud. All rights reserved.
      </div>

    </div>
  );
}
