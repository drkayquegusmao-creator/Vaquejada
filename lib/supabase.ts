import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kuxxdthygctdanlirwfw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4KE00hzynQGQ3awgbBG6LQ_Fvk9-xx-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

