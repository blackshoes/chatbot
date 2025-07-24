import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, './.env') });
const ENV = process.env.NODE_ENV || 'development';
console.log("NODE_ENV", process.env.NODE_ENV);


// Map NODE_ENV to the correct .env file
const envFile = ENV === 'serverless'
    ? '.env.production'
    : ENV === 'staging'
        ? '.env.staging'
        : ENV === 'development'
            ? '.env.development'
            : '.env';
console.log("envFile", envFile, ENV);

dotenv.config({ path: path.resolve(__dirname, envFile) });

const config = {
    env: ENV,
    port: process.env.PORT || 3000,
    isServerless: ENV === 'serverless',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
};

export default config; 