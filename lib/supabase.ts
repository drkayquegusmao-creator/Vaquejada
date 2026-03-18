import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nbydcrgksbnwwvhmhpex.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3awfZAY35chKWU4eXIFxFg_xgbQ53j9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

