import { supabase } from '../lib/supabase';

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  },

  async getAllSubscriptions() {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  },

  async sendNotification(blogId: string, title: string) {
    try {
      const subscriptions = await this.getAllSubscriptions();
      
      if (subscriptions.length === 0) {
        throw new Error('No push subscriptions found');
      }

      const { data: vapidKeys, error: vapidError } = await supabase
        .from('vapid_keys')
        .select('*')
        .single();

      if (vapidError || !vapidKeys) {
        throw new Error('VAPID keys not found');
      }

      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptions,
          payload: {
            title: 'New Blog Post',
            body: title,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: {
              url: `/blog/${blogId}`
            }
          },
          vapidKeys: {
            publicKey: vapidKeys.public_key,
            privateKey: vapidKeys.private_key
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notifications');
      }

      // Record notification in database
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          blog_id: blogId,
          title: title,
          status: 'sent',
          processed_at: new Date().toISOString()
        }]);

      if (notificationError) throw notificationError;
    } catch (error) {
      console.error('Error in sendNotification:', error);
      throw error;
    }
  }
};