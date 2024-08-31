import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './supabase/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});

// export default defineConfig({
//     schema: './src/db/schema.ts',
//     dialect: 'postgresql',
//     out: './migrations',
//     dbCredentials: {
//         url: process.env.DATABASE_URL || '',
//         database: 'postgres',
//         port: 5432,
//         host: 'aws-0-us-east-1.pooler.supabase.com',
//         user: 'postgres.user',
//         password: process.env.PW || '',
//     },
// });
