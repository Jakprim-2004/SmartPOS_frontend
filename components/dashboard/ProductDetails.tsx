
import { Package, Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getProductSalesStats } from "@/lib/api/sales";

interface ProductStat {
    id: number;
    barcode: string;
    name: string;
    soldQty: number;
    totalAmount: number;
    netProfit: number;
}

export default function ProductDetails() {
    const [dateRange, setDateRange] = useState("today");
    const [products, setProducts] = useState<ProductStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setCurrentPage(1);
    }, [dateRange]);

    useEffect(() => {
        fetchData();
    }, [dateRange, currentPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const offset = (currentPage - 1) * itemsPerPage;
            const result = await getProductSalesStats({
                dateRange,
                limit: itemsPerPage,
                offset
            });

            setProducts(result.data || []);
            setTotal(result.total || 0);
        } catch (error) {
            console.error("Failed to fetch product stats", error);
            setProducts([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(total / itemsPerPage);

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 overflow-hidden">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h5 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-6 h-6 text-indigo-500" />
                        รายละเอียดสินค้า
                    </h5>
                    <p className="text-sm text-gray-500">ข้อมูลการขายและสต็อกสินค้า</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                        >
                            <option value="today">วันนี้</option>
                            <option value="yesterday">เมื่อวาน</option>
                            <option value="last7days">7 วันล่าสุด</option>
                            <option value="last30days">เดือนนี้</option>
                        </select>
                        <CalendarIcon className="w-4 h-4 text-gray-500 absolute left-3 top-3 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100 mb-6">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-4">ลำดับ</th>
                            <th className="px-6 py-4">บาร์โค้ด</th>
                            <th className="px-6 py-4">ชื่อสินค้า</th>
                            <th className="px-6 py-4 text-right">จำนวนขาย (ชิ้น)</th>
                            <th className="px-6 py-4 text-right">รวมเป็นเงิน (บาท)</th>
                            <th className="px-6 py-4 text-right text-green-600">กำไรสุทธิ (บาท)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 bg-white">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>กำลังโหลดข้อมูล...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : products.length > 0 ? (
                            products.map((item: ProductStat, index: number) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-6 py-4">{item.barcode}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                                    <td className="px-6 py-4 text-right">{item.soldQty}</td>
                                    <td className="px-6 py-4 text-right font-bold text-indigo-600">{item.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600">{item.netProfit.toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 bg-white">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>ไม่พบข้อมูลสินค้าในช่วงเวลาที่เลือก</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && products.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* 1. Status Text */}
                        <div className="text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm whitespace-nowrap">
                            แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, total)} - {Math.min((currentPage - 1) * itemsPerPage + products.length, total)} จาก {total.toLocaleString()} รายการ
                        </div>

                        {/* 2. Controls Area */}
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {/* Pagination Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all duration-200 group active:scale-95 shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-orange-600" />
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                                        .map((page, idx, arr) => (
                                            <div key={page} className="flex items-center gap-1.5">
                                                {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                    <span className="text-gray-300 font-black px-1 select-none">...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-9 h-9 rounded-xl font-bold transition-all duration-300 ${currentPage === page
                                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200 ring-2 ring-orange-100 ring-offset-1 scale-110"
                                                        : "bg-white border border-gray-200 text-gray-600 hover:border-orange-200 hover:text-orange-600 hover:bg-orange-50 active:scale-95 shadow-sm"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            </div>
                                        ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all duration-200 group active:scale-95 shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-orange-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
