import { Trophy, CreditCard } from "lucide-react";
import { useState } from "react";

interface TopSellingSectionProps {
    topSellingProducts: any[];
    topSellingCategories: any[];
    paymentStats: any[];
}

export default function TopSellingSection({ topSellingProducts, topSellingCategories, paymentStats }: TopSellingSectionProps) {
    const [topSellingViewType, setTopSellingViewType] = useState<"products" | "categories">("products");

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top Selling Chart */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden flex flex-col h-full">
                <div className="p-5 bg-gradient-to-r from-[#4a5bcc] to-[#5a4289] text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-yellow-300" />
                        <div>
                            <h5 className="font-bold text-lg">{topSellingViewType === 'products' ? 'สินค้า' : 'หมวดหมู่'}ขายดี 5 อันดับ</h5>
                            <p className="text-xs opacity-75">อันดับการขายในวันนี้</p>
                        </div>
                    </div>
                    <select
                        value={topSellingViewType}
                        onChange={(e) => setTopSellingViewType(e.target.value as any)}
                        className="bg-white/20 border border-white/30 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/50 option:text-gray-800"
                    >
                        <option value="products" className="text-gray-800">สินค้า</option>
                        <option value="categories" className="text-gray-800">หมวดหมู่</option>
                    </select>
                </div>

                <div className="p-4 overflow-y-auto max-h-[500px]">
                    {(topSellingViewType === 'products' ? topSellingProducts : topSellingCategories).length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>ไม่มีข้อมูล</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(topSellingViewType === 'products' ? topSellingProducts : topSellingCategories).map((item, index) => {
                                const itemName = topSellingViewType === 'products' ? (item.productName || 'N/A') : (item.category || 'N/A');
                                const qty = parseInt(item.totalQty || 0);
                                const amount = parseFloat(item.totalAmount || 0);
                                const color = colors[index % colors.length];

                                return (
                                    <div key={index} className="bg-gray-50 rounded-xl p-4 relative overflow-hidden group hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: color }}>
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <span className="text-4xl font-bold" style={{ color: color }}>{index + 1}</span>
                                        </div>
                                        <div className="flex justify-between items-center relative z-10">
                                            <div>
                                                <h6 className="font-bold text-gray-800 text-lg mb-1">{itemName}</h6>
                                                <p className="text-gray-500 text-sm">{amount.toLocaleString()} บาท</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-indigo-600 block">{qty}</span>
                                                <span className="text-xs text-gray-400">ชิ้น</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden flex flex-col h-full">
                <div className="p-5 bg-gradient-to-r from-[#4a5bcc] to-[#5a4289] text-white flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full text-white">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h5 className="font-bold text-lg">วิธีการชำระเงิน</h5>
                        <p className="text-xs opacity-75">สถิติการชำระเงินวันนี้</p>
                    </div>
                </div>
                <div className="p-6">
                    {paymentStats.length > 0 ? (
                        <>
                            <div className="text-center mb-6">
                                <h3 className="text-3xl font-bold text-indigo-600">
                                    {paymentStats.reduce((sum, s) => sum + parseFloat(s.total || 0), 0).toLocaleString()} <span className="text-lg text-gray-400 font-normal">บาท</span>
                                </h3>
                                <p className="text-gray-400 text-sm">ยอดรวมทั้งหมด</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {paymentStats.map((stat, index) => {
                                    const color = colors[index % colors.length];
                                    const amount = parseFloat(stat.total || 0);
                                    const total = paymentStats.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
                                    const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;

                                    const methodMap: Record<string, string> = {
                                        'cash': 'เงินสด',
                                        'qr': 'QR Code',
                                        'transfer': 'โอนเงิน',
                                        'card': 'บัตรเครดิต',
                                        'promptpay': 'พร้อมเพย์',
                                        'scan': 'สแกนจ่าย'
                                    };
                                    const methodName = methodMap[stat.paymentMethod] || stat.paymentMethod;

                                    return (
                                        <div key={index} className="rounded-xl p-4 text-center border-2 border-transparent hover:border-current transition-colors" style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}>
                                            <h5 className="font-bold mb-2 text-lg" style={{ color: color }}>{methodName}</h5>
                                            <p className="text-xl font-bold text-gray-800 mb-1">{amount.toLocaleString()}</p>
                                            <div className="flex justify-between items-center text-xs text-gray-500 mt-2 px-2">
                                                <span>{stat.count || 0} รายการ</span>
                                                <span className="font-bold" style={{ color: color }}>{percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>ไม่มีข้อมูลการชำระเงิน</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
