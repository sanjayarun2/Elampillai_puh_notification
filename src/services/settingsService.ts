import { supabase } from '../lib/supabase';

interface Settings {
  id: string;
  whatsapp_link: string;
  updated_at: string;
}

class SettingsError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'SettingsError';
  }
}

export const settingsService = {
  async getSettings(): Promise<Settings> {
    try {
      // First try to get existing settings
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', '1')
        .single();

      if (error) {
        // If error is not found, try to initialize
        if (error.code === 'PGRST116') {
          const { error: initError } = await supabase.rpc('initialize_settings');
          if (initError) throw initError;

          // Try to get settings again
          const { data: newData, error: retryError } = await supabase
            .from('settings')
            .select('*')
            .eq('id', '1')
            .single();

          if (retryError) throw retryError;
          return newData;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getSettings:', error);
      throw new SettingsError('Failed to fetch settings', error);
    }
  },

  async updateSettings(whatsappLink: string): Promise<Settings> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update({
          whatsapp_link: whatsappLink.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', '1')
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw new SettingsError('Failed to update settings', error);
    }
  }
};