export const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5 MB

export const PRICING_CARDS = [
    {
        planType: 'Free Plan',
        price: '0',
        description: 'Basic features for individuals and freelancers',
        highlightFeature: '',
        features: ['10 Secrets created / month', '10 Secret Requests & Secure Chats', '5 MB Secret attachments', 'Single user', 'Basic notifications'],
    },
    {
        planType: 'Team Plan',
        price: '39',
        description: 'Billed annually. $45 billed monthly',
        highlightFeature: 'Everything in Free +',
        features: [
            'Unlimited Secrets created / month',
            'Unlimited Secret Requests & Secure Chats',
            '100 MB Secret attachments',
            'Team size up to 5',
            'Custom domain name',
            'Advanced notifications',
            'API access',
        ],
    },
];

export const PRICING_PLANS = { freeplan: 'Free Plan', teamplan: 'Team Plan' };

export const PLAN_LIMITS = {
    FREE: {
        secretsPerMonth: 10,
        secretRequestsAndChats: 10,
        secretAttachmentSize: 5 * 1024 * 1024, // 5 MB
        teamSize: 1,
    },
    TEAM: {
        secretsPerMonth: Infinity,
        secretRequestsAndChats: Infinity,
        secretAttachmentSize: 100 * 1024 * 1024, // 100 MB
        teamSize: 5,
    }
};
