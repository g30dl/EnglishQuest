import * as dotenv from 'dotenv';

// Carga .env.local si existe, de lo contrario cae a .env
dotenv.config({ path: '.env.local' });
dotenv.config();

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY
  }
});
