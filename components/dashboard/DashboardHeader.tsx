import { Clock, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardHeaderProps {
    dailyViewMode: "today" | "yesterday";
    setDailyViewMode: (mode: "today" | "yesterday") => void;
}

export default function DashboardHeader({ dailyViewMode, setDailyViewMode }: DashboardHeaderProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Helper for formatting date to avoid mismatch if needed, but 'mounted' check is safest
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
                    <span>อัปเดตล่าสุด:</span>
                    <span>
                        {mounted ? formatDate(currentTime) : "กำลังโหลด..."}
                    </span>
                </p>
            </div>

            <div className="bg-indigo-50 p-1.5 rounded-xl flex gap-1">
                <button
                    onClick={() => setDailyViewMode("today")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${dailyViewMode === "today"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-indigo-600 hover:bg-indigo-100"
                        }`}
                >
                    <Calendar className="w-4 h-4" />
                    วันนี้
                </button>
                <button
                    onClick={() => setDailyViewMode("yesterday")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${dailyViewMode === "yesterday"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-indigo-600 hover:bg-indigo-100"
                        }`}
                >
                    <Calendar className="w-4 h-4" />
                    เมื่อวาน
                </button>
            </div>
        </div>
    );
}
