import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  name: string;
  email: string;
  face_descriptor: number[] | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in_time: string;
  face_match_confidence: number;
  created_at: string;
  users?: User;
}
