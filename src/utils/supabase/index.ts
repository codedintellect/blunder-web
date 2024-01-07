import { SupabaseClient, createClient } from '@supabase/supabase-js'

export const supabase: SupabaseClient = createClient(
  'https://fronddi.letz.dev:3443',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzA0NTIwODAwLAogICJleHAiOiAxODYyMzczNjAwCn0.SZMrq1DLE0AdXsmNu7hk7-B8j6STdoAz0FNEK1uYLo4'
);
