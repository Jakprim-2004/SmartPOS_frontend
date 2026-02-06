"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirectPage() {
    useEffect(() => {
        redirect("/admin/dashboard");
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <p className="text-slate-500">กำลังนำทาง...</p>
        </div>
    );
}
