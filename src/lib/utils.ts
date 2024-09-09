import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CryptoJS from 'crypto-js';
import { Credentials } from '@/convex/types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getURL() {
    let url = process?.env?.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    url = url.includes('http') ? url : `https://${url}`;
    return url;
}

export const crypto = {
    generateRandomString: (length: number): string => {
        return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
    },

    encrypt: (data: string, key: string): string => {
        return CryptoJS.AES.encrypt(data, key).toString();
    },

    decrypt: (encryptedData: string, key: string): string => {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    },

    hash: (data: string): string => {
        return CryptoJS.SHA256(data).toString();
    },
};

export function encryptData(data: string) {
    const publicKey = crypto.generateRandomString(18);
    const privateKey = crypto.generateRandomString(18);
    const encryptionKey = publicKey + privateKey;

    const encryptedData = crypto.encrypt(data, encryptionKey);

    return { publicKey, privateKey, encryptedData };
}

export function decryptData(encryptedData: string, publicKey: string, privateKey: string) {
    const decryptionKey = publicKey + privateKey;
    const decryptedText = crypto.decrypt(encryptedData, decryptionKey);
    return decryptedText;
}

export function generateShareLink(credentialsId: string, publicKey: string) {
    return `${getURL()}/shared/${credentialsId}?publicKey=${publicKey}`;
}

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

export function isCredentialsActive(credentials: Credentials): boolean {
    const now = new Date().getTime();
    const expiresAtTimestamp = typeof credentials.expiresAt === 'string' ? new Date(credentials.expiresAt).getTime() : Number(credentials.expiresAt);
    const notExpired = !credentials.expiresAt || (isFinite(expiresAtTimestamp) && expiresAtTimestamp > now);
    const hasRemainingViews = !credentials.maxViews || (credentials.viewCount || 0) < credentials.maxViews;

    return notExpired && hasRemainingViews;
}

export function capitalizeFirstLetter(str: string) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
