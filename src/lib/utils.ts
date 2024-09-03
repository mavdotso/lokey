import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CryptoJS from 'crypto-js';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getURL() {
    let url = process?.env?.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    url = url.includes('http') ? url : `https://${url}`;
    return url;
}

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key';

export const crypto = {
    encrypt: (data: string): string => {
        return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
    },
    decrypt: (encryptedData: string): string => {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    },
    hash: (data: string): string => {
        return CryptoJS.SHA256(data).toString();
    },
};

export function formatTimestamp(timestamp: string): string {
    const now = new Date();
    const updatedAt = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - updatedAt.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    }
}
