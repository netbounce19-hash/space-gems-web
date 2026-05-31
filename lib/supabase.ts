import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials are missing. Please add them to .env.local");
}

export const supabase = createClient(supabaseUrl || "http://placeholder", supabaseKey || "placeholder");
