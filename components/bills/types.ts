export interface Product {
    id: number;
    name: string;
    barcode?: string;
}

export interface BillDetail {
    id: number;
    price: number;
    qty: number;
    product: Product;
}

export interface BillSale {
    id: number;
    billNumber: string;
    payDate: string | Date;
    totalAmount: number;
    paymentMethod: string;
    billSaleDetails: BillDetail[];
}

export function formatThaiDate(date: string | Date): string {
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

export function formatDateInput(date: Date | null): string {
    if (!date) return "";
    return date.toISOString().split('T')[0];
}


