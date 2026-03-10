import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          onboarding_completed: boolean;
          teddy_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          onboarding_completed?: boolean;
          teddy_name?: string;
        };
        Update: {
          name?: string;
          onboarding_completed?: boolean;
          teddy_name?: string;
        };
      };
      sleep_goals: {
        Row: {
          id: string;
          user_id: string;
          bedtime: string;
          wake_time: string;
          weekday_bedtime: string | null;
          weekday_wake_time: string | null;
          weekend_bedtime: string | null;
          weekend_wake_time: string | null;
          use_different_schedule: boolean;
          locked_until: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      sleep_sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          bedtime: string | null;
          wake_time: string | null;
          duration_minutes: number | null;
          quality_rating: number | null;
          stress_level: number | null;
          notes: string;
          created_at: string;
        };
      };
      content_library: {
        Row: {
          id: string;
          title: string;
          category: 'story' | 'breath' | 'sound';
          duration_minutes: number;
          description: string;
          thumbnail_url: string;
          audio_url: string;
          popularity: number;
          created_at: string;
        };
      };
      alarms: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          time: string;
          days: string[];
          alarm_type: 'wake' | 'bedtime';
          sound: string;
          volume: number;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          time: string;
          days: string[];
          alarm_type?: 'wake' | 'bedtime';
          sound?: string;
          volume?: number;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label?: string;
          time?: string;
          days?: string[];
          alarm_type?: 'wake' | 'bedtime';
          sound?: string;
          volume?: number;
          enabled?: boolean;
          updated_at?: string;
        };
      };
    };
  };
};
