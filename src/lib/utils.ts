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
