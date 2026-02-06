export interface Reward {
    id?: number;
    name: string;
    description?: string;
    pointsCost?: number; // normalized frontend field
    points_required?: number; // snake_case from database
    pointsRequired?: number; // camelCase alias
    stock: number;
    imageUrl?: string;
    image_url?: string; // snake_case from backend
    active?: boolean;
    createdAt?: string;
    created_at?: string;
    updatedAt?: string;
    updated_at?: string;
}
