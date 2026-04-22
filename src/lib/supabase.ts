import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sxpaeuvxdekhpfykorlf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_y8qgBlWZlySGadmXHoYmUA_dXXX7ag1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
