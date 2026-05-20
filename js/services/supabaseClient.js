import { createClient } from 'https://esm.sh/@supabase/supabase-js';

import { SUPABASE_CONFIG } from '../config/supabaseConfig.js';

export const supabase = createClient(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.ANON_KEY
);