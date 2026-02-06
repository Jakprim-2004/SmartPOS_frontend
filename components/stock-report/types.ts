export interface StockItem {
    id: number;
    barcode: string;
    name: string;
    category: string;
    unit: string;
    stockIn: number;
    stockOut: number;
    remaining: number;
}

export interface StockDetail {
    id: number;
    barcode: string;
    name: string;
    qty: number;
    date: string | Date;
}

export function formatDateTime(date: string | Date): string {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

