import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV = process.env.NODE_ENV || 'development';


// Only load .env file locally (not in production or preview)
if (ENV !== 'production' && ENV !== 'preview') {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const config = {
    env: ENV,
    port: process.env.PORT || 3000,
    isServerless: ENV === 'serverless',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
};

export default config; 