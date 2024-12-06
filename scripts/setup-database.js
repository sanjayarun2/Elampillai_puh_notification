import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    // Check if settings record exists
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('id')
      .eq('id', '1')
      .maybeSingle();

    if (!settingsData && !settingsError) {
      // Create initial settings record with retry logic
      for (let i = 0; i < 3; i++) {
        const { error } = await supabase
          .from('settings')
          .insert([
            {
              id: '1',
              whatsapp_link: '',
              updated_at: new Date().toISOString()
            }
          ])
          .select();

        if (!error) {
          console.log('Initial settings created successfully');
          break;
        }

        if (i === 2) {
          console.error('Failed to create initial settings after retries:', error);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();