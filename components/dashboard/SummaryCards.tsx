import { TrendingUp, Coins, Trophy } from "lucide-react";

interface SummaryCardsProps {
    data: {
        totalSales: number;
        totalCost: number;
        totalProfit: number;
    };
}

export default function SummaryCards({ data }: SummaryCardsProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                <span className="bg-slate-200 p-1.5 rounded-lg text-slate-600"><Trophy className="w-5 h-5" /></span>
                สรุปยอดขายรวม
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden transform hover:-translate-y-1 transition-transform">
                    <div className="p-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        ยอดขายทั้งหมด
                    </div>
                    <div className="p-6 text-center">
                        <h3 className="text-3xl font-bold text-indigo-600 truncate">{data.totalSales.toLocaleString()} <span className="text-sm font-normal text-gray-400">บาท</span></h3>
                    </div>
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden transform hover:-translate-y-1 transition-transform">
                    <div className="p-4 bg-gradient-to-r from-[#ffa726] to-[#ff7043] text-white font-medium flex items-center gap-2">
                        <Coins className="w-5 h-5" />
                        ต้นทุนรวม
                    </div>
                    <div className="p-6 text-center">
                        <h3 className="text-3xl font-bold text-orange-500 truncate">{data.totalCost.toLocaleString()} <span className="text-sm font-normal text-gray-400">บาท</span></h3>
                    </div>
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden transform hover:-translate-y-1 transition-transform">
                    <div className="p-4 bg-gradient-to-r from-[#66bb6a] to-[#43a047] text-white font-medium flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        กำไรสุทธิ
                    </div>
                    <div className="p-6 text-center">
                        <h3 className="text-3xl font-bold text-green-600 truncate">{data.totalProfit.toLocaleString()} <span className="text-sm font-normal text-gray-400">บาท</span></h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
