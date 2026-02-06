import { Coins, Receipt, Calculator } from "lucide-react";

interface StatsGridProps {
    todaySales: any;
    dailyViewMode: "today" | "yesterday";
}

export default function StatsGrid({ todaySales, dailyViewMode }: StatsGridProps) {
    const isToday = dailyViewMode === "today";

    const cards = [
        {
            title: isToday ? "ยอดขายวันนี้" : "ยอดขายเมื่อวาน",
            value: isToday ? todaySales.totalAmount : (todaySales.yesterdayTotal || 0),
            secondaryText: isToday
                ? `เมื่อวาน: ${(todaySales.yesterdayTotal || 0).toLocaleString()} บาท`
                : `วันนี้: ${(todaySales.totalAmount || 0).toLocaleString()} บาท`,
            icon: <Coins className="w-10 h-10 text-white drop-shadow-md" />,
            gradient: "from-[#4a5bcc] to-[#5a4289]",
        },
        {
            title: isToday ? "จำนวนบิลวันนี้" : "จำนวนบิลเมื่อวาน",
            value: isToday ? todaySales.billCount : (todaySales.yesterdayBillCount || 0),
            unit: "บิล",
            secondaryText: isToday
                ? `เมื่อวาน: ${todaySales.yesterdayBillCount || 0} บิล`
                : `วันนี้: ${todaySales.billCount || 0} บิล`,
            icon: <Receipt className="w-10 h-10 text-white drop-shadow-md" />,
            gradient: "from-[#2d6e3e] to-[#26a69a]",
        },
        {
            title: isToday ? "ค่าเฉลี่ยต่อบิลวันนี้" : "ค่าเฉลี่ยต่อบิลเมื่อวาน",
            value: isToday ? todaySales.averagePerBill : (todaySales.yesterdayAveragePerBill || 0),
            secondaryText: isToday
                ? `เมื่อวาน: ${(todaySales.yesterdayAveragePerBill || 0).toLocaleString()} บาท`
                : `วันนี้: ${(todaySales.averagePerBill || 0).toLocaleString()} บาท`,
            icon: <Calculator className="w-10 h-10 text-white drop-shadow-md" />,
            gradient: "from-[#c72e6a] to-[#d4a347]",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`rounded-2xl p-6 text-white text-center shadow-lg transform transition-transform hover:-translate-y-1 bg-gradient-to-br ${card.gradient}`}
                >
                    <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-inner">
                        {card.icon}
                    </div>
                    <h3 className="text-lg font-medium opacity-90 mb-1">{card.title}</h3>
                    <div className="text-3xl font-bold mb-1 shadow-black/10 drop-shadow-sm">
                        {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                        {card.unit ? <span className="text-lg ml-2 font-normal">{card.unit}</span> : <span className="text-lg ml-2 font-normal">บาท</span>}
                    </div>
                    <div className="text-sm bg-white/20 inline-block px-3 py-1 rounded-lg mt-3 backdrop-blur-sm">
                        {card.secondaryText}
                    </div>
                </div>
            ))}
        </div>
    );
}
