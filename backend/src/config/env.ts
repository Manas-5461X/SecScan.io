import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from the root directory since backend is a subfolder
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
    PORT: z.string().default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    GITHUB_TOKEN: z.string().optional(),
    REDIS_URL: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
