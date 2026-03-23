import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://lhaaipxsiccoukafiwtk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_7AgccO6sEkkYCtTpDqSc2w__y5-papy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
