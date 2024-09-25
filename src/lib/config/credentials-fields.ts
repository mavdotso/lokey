import { CREDENTIALS_TYPES } from '@/convex/schema';

type FieldType = 'text' | 'password';

export interface CredentialsField {
    id: string;
    label: string;
    type: FieldType;
}

function generateCredentialFields(type: keyof typeof CREDENTIALS_TYPES): CredentialsField[] {
    switch (type) {
        case 'PASSWORD':
            return [{ id: 'password', label: 'Password', type: 'password' }];
        case 'LOGIN_PASSWORD':
            return [
                { id: 'username', label: 'Username', type: 'text' },
                { id: 'password', label: 'Password', type: 'password' },
            ];
        case 'API_KEY':
            return [{ id: 'apiKey', label: 'API Key', type: 'text' }];
        case 'OAUTH_TOKEN':
            return [{ id: 'oauthToken', label: 'OAuth Token', type: 'text' }];
        case 'SSH_KEY':
            return [{ id: 'sshKey', label: 'SSH Key', type: 'text' }];
        case 'SSL_CERTIFICATE':
            return [
                { id: 'certificate', label: 'Certificate', type: 'text' },
                { id: 'privateKey', label: 'Private Key', type: 'text' },
            ];
        case 'ENV_VARIABLE':
            return [{ id: 'envVariable', label: 'Environment Variable', type: 'text' }];
        case 'DATABASE_CREDENTIALS':
            return [
                { id: 'dbUsername', label: 'DB Username', type: 'text' },
                { id: 'dbPassword', label: 'DB Password', type: 'password' },
            ];
        case 'ACCESS_KEY':
            return [{ id: 'accessKey', label: 'Access Key', type: 'text' }];
        case 'ENCRYPTION_KEY':
            return [{ id: 'encryptionKey', label: 'Encryption Key', type: 'text' }];
        case 'JWT_TOKEN':
            return [{ id: 'jwtToken', label: 'JWT Token', type: 'text' }];
        case 'TWO_FACTOR_SECRET':
            return [{ id: 'twoFactorSecret', label: 'Two-Factor Secret', type: 'text' }];
        case 'WEBHOOK_SECRET':
            return [{ id: 'webhookSecret', label: 'Webhook Secret', type: 'text' }];
        case 'SMTP_CREDENTIALS':
            return [
                { id: 'smtpUsername', label: 'SMTP Username', type: 'text' },
                { id: 'smtpPassword', label: 'SMTP Password', type: 'password' },
            ];
        case 'FTP_CREDENTIALS':
            return [
                { id: 'ftpUsername', label: 'FTP Username', type: 'text' },
                { id: 'ftpPassword', label: 'FTP Password', type: 'password' },
            ];
        case 'VPN_CREDENTIALS':
            return [
                { id: 'vpnUsername', label: 'VPN Username', type: 'text' },
                { id: 'vpnPassword', label: 'VPN Password', type: 'password' },
            ];
        case 'DNS_CREDENTIALS':
            return [
                { id: 'dnsUsername', label: 'DNS Username', type: 'text' },
                { id: 'dnsPassword', label: 'DNS Password', type: 'password' },
            ];
        case 'DEVICE_KEY':
            return [{ id: 'deviceKey', label: 'Device Key', type: 'text' }];
        case 'KEY_VALUE':
            return [
                { id: 'key', label: 'Key', type: 'text' },
                { id: 'value', label: 'Value', type: 'text' },
            ];
        case 'CUSTOM':
            return [{ id: 'customField', label: 'Custom Field', type: 'text' }];
        case 'OTHER':
            return [{ id: 'otherField', label: 'Other Field', type: 'text' }];
        default:
            return [{ id: 'value', label: type, type: 'text' }];
    }
}

export const credentialsFields = Object.fromEntries(Object.values(CREDENTIALS_TYPES).map((type) => [type, generateCredentialFields(type as keyof typeof CREDENTIALS_TYPES)]));
