export interface Customer {
    id: number;
    name: string;
    phone: string;
}

export interface PointTransaction {
    id: number;
    transactionDate: string | Date;
    Customer: Customer;
    transactionType: string;
    points: number;
    description: string;
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


