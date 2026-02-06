export interface Product {
    id: number;
    name: string;
    barcode?: string;
    cost: number;
    price: number;
    categoryId: number;
    category: Category | string;
    unit?: string;
    imageUrl?: string;
    stock: number;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Customer {
    id: number;
    name: string;
    phone: string;
    points: number;
    birthday?: string;
    shopId?: string;
}
export interface StockTransaction {
    id: number;
    productId: number;
    qty: number;
    type: 'IN' | 'OUT';
    reason: string;
    createdAt: string;
    Product?: Product;
}
