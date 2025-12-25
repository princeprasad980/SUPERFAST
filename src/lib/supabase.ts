import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      track_categories: {
        Row: {
          id: string;
          name: string;
          color: string;
          icon: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          icon?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          icon?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      tracks: {
        Row: {
          id: string;
          title: string;
          description: string;
          category_id: string | null;
          status: string;
          priority: string;
          tracking_number: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          category_id?: string | null;
          status?: string;
          priority?: string;
          tracking_number: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category_id?: string | null;
          status?: string;
          priority?: string;
          tracking_number?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      track_updates: {
        Row: {
          id: string;
          track_id: string;
          status: string;
          message: string;
          location: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          track_id: string;
          status: string;
          message?: string;
          location?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          track_id?: string;
          status?: string;
          message?: string;
          location?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
