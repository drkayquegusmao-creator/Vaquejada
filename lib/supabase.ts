import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kuxxdthygctdanlirwfw.supabase.co';
const supabaseAnonKey = 'sb_publishable_4KE00hzynQGQ3awgbBG6LQ_Fvk9-xx-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
