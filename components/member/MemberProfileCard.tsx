import { Star, User, Calendar, Edit2, Camera } from "lucide-react";
import { Customer } from "@/lib/types";

interface MemberProfileCardProps {
    customer: Customer & { membershipTier?: string; totalSpent: number; joinDate: string; points: number; image_url?: string };
    onEditProfile?: () => void;
}

const TIERS = [
    { name: "Bronze", minSpent: 0, color: "from-amber-700 to-yellow-600" },
    { name: "Silver", minSpent: 5000, color: "from-slate-400 to-slate-500" },
    { name: "Gold", minSpent: 20000, color: "from-yellow-400 to-amber-500" },
    { name: "Platinum", minSpent: 50000, color: "from-indigo-400 to-purple-500" }
];

export default function MemberProfileCard({ customer, onEditProfile }: MemberProfileCardProps) {
    const currentSpent = customer.totalSpent || 0;

    // Determine Level
    let currentTierIndex = 0;
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (currentSpent >= TIERS[i].minSpent) {
            currentTierIndex = i;
            break;
        }
    }
    const currentTier = TIERS[currentTierIndex];
    const nextTier = TIERS[currentTierIndex + 1];

    // Calculate Progress
    let progress = 100;
    let nextTierNeeded = 0;

    if (nextTier) {
        const range = nextTier.minSpent - currentTier.minSpent;
        const earned = currentSpent - currentTier.minSpent;
        progress = Math.min((earned / range) * 100, 100);
        nextTierNeeded = nextTier.minSpent - currentSpent;
    }

    return (
        <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl bg-gradient-to-r ${currentTier.color} relative overflow-hidden transition-all duration-500 hover:shadow-2xl group`}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-12 opacity-10">
                <Star className="w-64 h-64 transform rotate-12 translate-x-16 -translate-y-16" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="relative group/image">
                        <button
                            onClick={onEditProfile}
                            className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/30 shadow-inner overflow-hidden relative transition-transform hover:scale-105 active:scale-95"
                        >
                            {customer.image_url ? (
                                <img src={customer.image_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                customer.name.charAt(0)
                            )}

                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </button>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl sm:text-3xl font-bold truncate max-w-[250px]">{customer.name}</h1>
                            <button
                                onClick={onEditProfile}
                                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors opacity-80 hover:opacity-100"
                                title="แก้ไขชื่อ"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 uppercase font-bold tracking-wider">
                                <User className="w-4 h-4" /> {currentTier.name} Member
                            </span>
                            <span className="flex items-center gap-1.5 opacity-80">
                                <Calendar className="w-4 h-4" /> สมาชิกปี {new Date(customer.joinDate).getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 min-w-[140px] border border-white/10">
                        <div className="text-xs text-white/70 uppercase font-bold mb-1">คะแนนสะสม</div>
                        <div className="text-3xl font-bold flex items-center gap-2">
                            {customer.points.toLocaleString()}
                            <span className="text-sm font-normal opacity-70">แต้ม</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {nextTier && (
                <div className="mt-8 relative">
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide opacity-80">
                        <span>ปัจจุบัน: {currentTier.name}</span>
                        <span>ถัดไป: {nextTier.name}</span>
                    </div>
                    <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                        <div
                            className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="mt-2 text-right text-xs opacity-75">
                        ยอดซื้ออีก <span className="font-bold">฿{nextTierNeeded.toLocaleString()}</span> เพื่อเลื่อนระดับ
                    </div>
                </div>
            )}
        </div>
    );
}
