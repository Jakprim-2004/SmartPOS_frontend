export interface Coupon {
    id: string;
    code: string;
    title: string;
    description: string;
    discountAmount?: number;
    discountType: 'FIXED' | 'PERCENT';
    expiryDate: string;
    isUsed: boolean;
    condition?: string;
    imageUrl?: string;
}

export interface Promotion {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    link?: string;
    startDate: string;
    endDate: string;
}


