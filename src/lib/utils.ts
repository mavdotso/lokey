import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';
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

    generateSecretKey: (secretPhrase: string): string => {
        return CryptoJS.SHA256(secretPhrase).toString();
    },

    generateKeyPair: () => {
        const crypt = new JSEncrypt({ default_key_size: '2048' });
        return {
            publicKey: crypt.getPublicKey(),
            privateKey: crypt.getPrivateKey(),
        };
    },

    encrypt: (data: string, key: string): string => {
        const encrypted = CryptoJS.AES.encrypt(data, key).toString();
        return encrypted;
    },

    decrypt: (encryptedData: string, key: string): string => {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    },

    encryptWithPublicKey: (data: string, publicKey: string): string => {
        const encrypt = new JSEncrypt();
        encrypt.setPublicKey(publicKey);
        return encrypt.encrypt(data) || '';
    },

    decryptWithPrivateKey: (encryptedData: string, privateKey: string): string => {
        const decrypt = new JSEncrypt();
        decrypt.setPrivateKey(privateKey);
        return decrypt.decrypt(encryptedData) || '';
    },

    encryptPrivateKey: (privateKey: string, password: string): string => {
        return CryptoJS.AES.encrypt(privateKey, password).toString();
    },

    decryptPrivateKey: (encryptedPrivateKey: string, password: string): string => {
        const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, password);
        return bytes.toString(CryptoJS.enc.Utf8);
    },

    encodePublicKey: (publicKey: string): string => {
        return Buffer.from(publicKey).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    },

    decodePublicKey: (encodedPublicKey: string): string => {
        const base64 = encodedPublicKey.replace(/-/g, '+').replace(/_/g, '/');
        return Buffer.from(base64, 'base64').toString('ascii');
    },

    hash: (data: string): string => {
        return CryptoJS.SHA256(data).toString();
    },
};

export function encryptData(data: string): { publicKey: string; privateKey: string; encryptedData: string } {
    const publicKey = crypto.generateRandomString(18);
    const privateKey = crypto.generateRandomString(18);
    const encryptionKey = crypto.generateSecretKey(publicKey + privateKey);

    const encryptedData = crypto.encrypt(data, encryptionKey);

    return { publicKey, privateKey, encryptedData };
}

export function decryptData(encryptedData: string, publicKey: string, privateKey: string): string {
    const decryptionKey = crypto.generateSecretKey(publicKey + privateKey);
    return crypto.decrypt(encryptedData, decryptionKey);
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

export function formatConstantToTitleCase(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace(/_/g, ' ');
}
