import * as dotenv from 'dotenv';

// Carga .env.local si existe, de lo contrario cae a .env
dotenv.config({ path: '.env.local' });
dotenv.config();

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    // Prioritize env vars when available, otherwise keep values from app.json
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || config.extra?.supabaseUrl,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY || config.extra?.supabaseKey
  }
});
