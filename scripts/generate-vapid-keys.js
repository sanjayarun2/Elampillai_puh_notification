import webpush from 'web-push';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateVapidKeys() {
  try {
    // Check if VAPID keys exist in Supabase
    const { data: vapidData, error: vapidError } = await supabase
      .from('vapid_keys')
      .select('*')
      .maybeSingle();

    if (vapidError && vapidError.code !== 'PGRST116') {
      console.error('Error checking VAPID keys:', vapidError);
      return;
    }

    let vapidKeys;

    if (!vapidData) {
      // Generate new VAPID keys
      vapidKeys = webpush.generateVAPIDKeys();
      
      // Save to Supabase
      const { error: insertError } = await supabase
        .from('vapid_keys')
        .insert([{
          public_key: vapidKeys.publicKey,
          private_key: vapidKeys.privateKey
        }]);

      if (insertError) {
        console.error('Error saving VAPID keys:', insertError);
        return;
      }
    } else {
      vapidKeys = {
        publicKey: vapidData.public_key,
        privateKey: vapidData.private_key
      };
    }

    // Update .env file
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = `VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}
VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VITE_VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`;

    await fs.writeFile(envPath, envContent);
    
    console.log('VAPID Keys retrieved/generated and saved to .env file');
  } catch (error) {
    console.error('Error handling VAPID keys:', error);
  }
}

generateVapidKeys();