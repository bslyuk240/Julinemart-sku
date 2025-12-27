// Shared Supabase configuration for the JulineMart app
// This file centralizes the Supabase URL and anon key so pages don't duplicate them.
// If you need to change the project, update the values here.
// Local overrides can be injected before this file via js/shared/supabase.local.js.
window.SUPABASE_URL = window.SUPABASE_URL || 'https://hnpwnjjjgxuelfognakp.supabase.co';
window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'sb_publishable_-eRUvETP7n4hP4Zoj-xQ4g_WYBwrwOw';

// Helpful: expose a small helper that returns the same names existing code expects
// (pages call getSupabase(), which builds a client using SUPABASE_URL and SUPABASE_ANON_KEY).
// We don't override getSupabase here to avoid clashing with page-local implementations.
// This file only provides the constants on the window object.
