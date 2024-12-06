import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    // Initialize settings with retry mechanism
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        // First check if settings exist
        const { data: existingSettings } = await supabase
          .from('settings')
          .select('*')
          .eq('id', '1')
          .single();

        if (!existingSettings) {
          // If settings don't exist, create them
          const { error: insertError } = await supabase
            .from('settings')
            .insert([{
              id: '1',
              whatsapp_link: '',
              updated_at: new Date().toISOString()
            }]);

          if (insertError) throw insertError;
        }

        success = true;
      } catch (error) {
        attempt++;
        if (attempt === maxRetries) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}