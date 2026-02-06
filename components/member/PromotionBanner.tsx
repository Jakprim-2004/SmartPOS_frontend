"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { getActivePromotions } from "@/lib/api/promotions";
import { getNews } from "@/lib/api/news";

interface Promotion {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
}

interface PromotionBannerProps {
    shopId?: string;
}

export default function PromotionBanner({ shopId }: PromotionBannerProps) {
    const itemsPerLoad = 10;
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [displayedCount, setDisplayedCount] = useState(itemsPerLoad);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Fetch all data on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [promos, newsItems] = await Promise.all([
                    getActivePromotions(shopId).catch(() => []),
                    getNews(shopId).catch(() => [])
                ]);

                // Helper to extract data
                const extractData = (res: any) => Array.isArray(res) ? res : (res.data || []);

                const mappedPromos = extractData(promos).map((p: any) => ({
                    id: String(p.id),
                    title: p.title,
                    description: p.description || "",
                    imageUrl: p.image_url || "https://placehold.co/600x400?text=Promotion",
                    startDate: p.start_date || new Date().toISOString(),
                    endDate: p.end_date || new Date().toISOString()
                }));

                const mappedNews = extractData(newsItems).map((n: any) => ({
                    id: `news-${n.id}`,
                    title: n.title,
                    description: n.content,
                    imageUrl: n.imageUrl || n.image_url || "https://placehold.co/600x400?text=News",
                    startDate: n.created_at || new Date().toISOString(),
                    endDate: new Date((new Date(n.created_at || Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000)).toISOString()
                }));

                const combined = [...mappedPromos, ...mappedNews].sort((a, b) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                );

                setPromotions(combined);
            } catch (error) {
                console.error("Failed to load promotions:", error);
                setPromotions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [shopId]);

    // Get currently displayed promotions
    const displayedPromotions = promotions.slice(0, displayedCount);
    const hasMore = displayedCount < promotions.length;

    // Load more function
    const loadMore = useCallback(() => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        // Simulate network delay for smooth UX
        setTimeout(() => {
            setDisplayedCount(prev => Math.min(prev + itemsPerLoad, promotions.length));
            setIsLoadingMore(false);
        }, 300);
    }, [isLoadingMore, hasMore, promotions.length]);

    // Handle scroll to detect when near the end
    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        const scrollThreshold = 200; // Load more when 200px from end

        if (scrollWidth - scrollLeft - clientWidth < scrollThreshold) {
            loadMore();
        }
    }, [loadMore]);

    // Attach scroll listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    if (isLoading) {
        return (
            <div className="space-y-3">
                <h3 className="font-bold text-lg text-slate-800 px-1">โปรโมชั่นและข่าวสาร</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="min-w-[280px] md:min-w-[320px] bg-slate-100 rounded-2xl h-56 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (promotions.length === 0) {
        return (
            <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-400">
                ยังไม่มีโปรโมชั่นหรือข่าวสาร
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-lg text-slate-800">
                    โปรโมชั่นและข่าวสาร
                    <span className="text-sm font-normal text-slate-400 ml-2">
                        ({displayedPromotions.length}/{promotions.length})
                    </span>
                </h3>
                {hasMore && (
                    <button
                        onClick={loadMore}
                        className="text-sm text-indigo-600 font-medium hover:underline flex items-center"
                    >
                        ดูเพิ่มเติม <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar scroll-smooth"
            >
                {displayedPromotions.map((promo) => (
                    <div
                        key={promo.id}
                        className="min-w-[280px] md:min-w-[320px] snap-center bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer group border border-slate-100"
                    >
                        <div className="relative h-40 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={promo.imageUrl}
                                alt={promo.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                                <div className="text-xs font-medium opacity-90 mb-1 bg-indigo-600 inline-block px-2 py-0.5 rounded-full">
                                    {promo.id.startsWith('news-') ? 'ข่าวสาร' : 'โปรโมชั่น'}
                                </div>
                                <h4 className="font-bold truncate">{promo.title}</h4>
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="text-sm text-slate-500 line-clamp-2">{promo.description}</p>
                            <div className="mt-2 text-xs text-slate-400 font-medium pb-1">
                                {new Date(promo.startDate).toLocaleDateString('th-TH')} - {new Date(promo.endDate).toLocaleDateString('th-TH')}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="min-w-[100px] flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                )}

                {/* Load more trigger area */}
                {hasMore && !isLoading && (
                    <div
                        onClick={loadMore}
                        className="min-w-[100px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6 text-slate-400" />
                        <span className="text-xs text-slate-400 mt-1">ดูเพิ่ม</span>
                    </div>
                )}
            </div>
        </div>
    );
}
