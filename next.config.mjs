/** @type {import('next').NextConfig} */
import MillionLint from '@million/lint';

const nextConfig = {
    experimental: {
        reactCompiler: true,
    },
    reactStrictMode: true,
};

export default MillionLint.next({ rsc: true })(nextConfig);
