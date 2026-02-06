import React from "react";

interface IconProps {
    className?: string;
}

// Gift Box Icon - for Buy 1 Get 1
export const GiftBoxIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="28" width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.3" />
        <rect x="4" y="20" width="56" height="12" rx="3" fill="currentColor" />
        <rect x="28" y="20" width="8" height="40" fill="currentColor" fillOpacity="0.5" />
        <path d="M32 20C32 20 24 12 20 8C16 4 12 6 12 10C12 14 16 18 20 20H32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 20C32 20 40 12 44 8C48 4 52 6 52 10C52 14 48 18 44 20H32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="26" r="4" fill="white" fillOpacity="0.8" />
    </svg>
);

// Price Tag Icon - for Discount
export const PriceTagIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M8 12C8 9.79086 9.79086 8 12 8H28L56 36L36 56L8 28V12Z"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="3"
        />
        <circle cx="20" cy="20" r="5" fill="currentColor" />
        <path d="M30 38L38 30" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="42" r="4" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="40" cy="30" r="4" stroke="white" strokeWidth="2" fill="none" />
    </svg>
);

// Star Badge Icon - for Double Points
export const StarBadgeIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M32 4L39.5 21.5L58 24L44 38L48 56L32 47L16 56L20 38L6 24L24.5 21.5L32 4Z"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
        />
        <text x="32" y="38" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="bold">x2</text>
    </svg>
);

// Coffee Cup Icon - for Beverages
export const CoffeeCupIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 20H44V52C44 56.4183 40.4183 60 36 60H20C15.5817 60 12 56.4183 12 52V20Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="3" />
        <path d="M44 28H52C54.2091 28 56 29.7909 56 32V36C56 38.2091 54.2091 40 52 40H44" stroke="currentColor" strokeWidth="3" />
        <path d="M20 8C20 8 22 12 28 12C34 12 36 8 36 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 4C24 4 25 6 28 6C31 6 32 4 32 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Cake Icon - for Bakery
export const CakeIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="52" rx="24" ry="8" fill="currentColor" fillOpacity="0.2" />
        <path d="M8 36C8 32 12 28 12 28H52C52 28 56 32 56 36V48C56 52 52 56 32 56C12 56 8 52 8 48V36Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="3" />
        <path d="M8 36C12 40 22 42 32 42C42 42 52 40 56 36" stroke="currentColor" strokeWidth="2" />
        <rect x="18" y="16" width="4" height="12" rx="2" fill="currentColor" />
        <rect x="30" y="12" width="4" height="16" rx="2" fill="currentColor" />
        <rect x="42" y="16" width="4" height="12" rx="2" fill="currentColor" />
        <circle cx="20" cy="14" r="3" fill="#FCD34D" />
        <circle cx="32" cy="10" r="3" fill="#FCD34D" />
        <circle cx="44" cy="14" r="3" fill="#FCD34D" />
    </svg>
);

// Membership Card Icon
export const MemberCardIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="14" width="56" height="36" rx="4" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="3" />
        <circle cx="20" cy="32" r="8" fill="currentColor" fillOpacity="0.5" />
        <rect x="32" y="26" width="20" height="3" rx="1.5" fill="currentColor" />
        <rect x="32" y="33" width="14" height="3" rx="1.5" fill="currentColor" fillOpacity="0.5" />
        <path d="M4 22H60" stroke="currentColor" strokeWidth="2" />
    </svg>
);
