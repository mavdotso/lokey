export const credentialsFields = {
    password: [{ id: 'password', label: 'Password', type: 'password' }],
    login_password: [
        { id: 'username', label: 'Username', type: 'text' },
        { id: 'password', label: 'Password', type: 'password' },
    ],
    api_key: [{ id: 'apiKey', label: 'API Key', type: 'text' }],
    oauth_token: [{ id: 'oauthToken', label: 'OAuth Token', type: 'text' }],
    ssh_key: [{ id: 'sshKey', label: 'SSH Key', type: 'text' }],
    ssl_certificate: [
        { id: 'certificate', label: 'Certificate', type: 'text' },
        { id: 'privateKey', label: 'Private Key', type: 'text' },
    ],
    env_variable: [{ id: 'envVariable', label: 'Environment Variable', type: 'text' }],
    database_credentials: [
        { id: 'dbUsername', label: 'DB Username', type: 'text' },
        { id: 'dbPassword', label: 'DB Password', type: 'password' },
    ],
    access_key: [{ id: 'accessKey', label: 'Access Key', type: 'text' }],
    encryption_key: [{ id: 'encryptionKey', label: 'Encryption Key', type: 'text' }],
    jwt_token: [{ id: 'jwtToken', label: 'JWT Token', type: 'text' }],
    two_factor_secret: [{ id: 'twoFactorSecret', label: 'Two-Factor Secret', type: 'text' }],
    webhook_secret: [{ id: 'webhookSecret', label: 'Webhook Secret', type: 'text' }],
    smtp_credentials: [
        { id: 'smtpUsername', label: 'SMTP Username', type: 'text' },
        { id: 'smtpPassword', label: 'SMTP Password', type: 'password' },
    ],
    ftp_credentials: [
        { id: 'ftpUsername', label: 'FTP Username', type: 'text' },
        { id: 'ftpPassword', label: 'FTP Password', type: 'password' },
    ],
    vpn_credentials: [
        { id: 'vpnUsername', label: 'VPN Username', type: 'text' },
        { id: 'vpnPassword', label: 'VPN Password', type: 'password' },
    ],
    dns_credentials: [
        { id: 'dnsUsername', label: 'DNS Username', type: 'text' },
        { id: 'dnsPassword', label: 'DNS Password', type: 'password' },
    ],
    device_key: [{ id: 'deviceKey', label: 'Device Key', type: 'text' }],
    key_value: [
        { id: 'key', label: 'Key', type: 'text' },
        { id: 'value', label: 'Value', type: 'text' },
    ],
    custom: [{ id: 'customField', label: 'Custom Field', type: 'text' }],
    other: [{ id: 'otherField', label: 'Other Field', type: 'text' }],
};
