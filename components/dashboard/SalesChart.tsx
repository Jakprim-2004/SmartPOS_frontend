import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { AreaChart } from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface SalesChartProps {
    chartData: any;
    viewType: string;
    setViewType: (type: string) => void;
    year: number;
    setYear: (year: number) => void;
    month: number;
    setMonth: (month: number) => void;
}

export default function SalesChart({
    chartData,
    viewType,
    setViewType,
    year,
    setYear,
    month,
    setMonth,
}: SalesChartProps) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                align: "center" as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { family: 'Kanit' }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: 'Kanit' },
                bodyFont: { family: 'Kanit' }
            }
        },
        scales: {
            y: {
                grid: { color: '#f3f4f6' },
                ticks: { font: { family: 'Kanit' } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: 'Kanit' } }
            }
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        }
    };

    const getThaiMonthName = (m: number) => {
        const thaiMonths = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
            "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
            "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
        ];
        return thaiMonths[m - 1];
    };

    const arrYear = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 4 + i).reverse();

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h5 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <AreaChart className="w-6 h-6 text-indigo-500" />
                        กราฟแสดงยอดขาย ต้นทุน และกำไร
                    </h5>
                    <p className="text-sm text-gray-500">วิเคราะห์แนวโน้มการขาย</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={viewType}
                        onChange={(e) => setViewType(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="daily">รายวัน</option>
                        <option value="monthly">รายเดือน</option>
                    </select>

                    {viewType !== "monthly" && (
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <option key={m} value={m}>{getThaiMonthName(m)}</option>
                            ))}
                        </select>
                    )}

                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {arrYear.map(y => <option key={y} value={y}>ปี {y}</option>)}
                    </select>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
