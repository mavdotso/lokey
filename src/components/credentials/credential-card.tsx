import { Credential } from '../../../convex/types';

interface CredentialCardProps {
    credential: Credential;
}

export function CredentialCard({ credential }: CredentialCardProps) {
    return (
        <div className="flex justify-between items-center border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 border-b">
            <div className="flex items-center space-x-2">
                <div className="bg-green-400 rounded-full w-2 h-2"></div>
                <span className="font-medium text-gray-900 text-sm">{credential.name}</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-500 text-xs">
                <span>Ready</span>
                <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 21l-4-4h3V7h-3l4-4 4 4h-3v10h3l-4 4z" />
                    </svg>
                    <span>main</span>
                </div>
                <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" />
                    </svg>
                    <span>1m 7s (10h ago)</span>
                </div>
            </div>
        </div>
    );
}