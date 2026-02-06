export interface Customer {
    id: number;
    name: string;
    phone: string;
    email?: string;
    points: number;
    birthday?: string;
    totalSpent: number;
    shopId?: string; // Added shopId
    joinDate: string;
    createdAt?: string;
}
