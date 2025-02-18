import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Some features may be limited.'
  );
}

// Create Supabase client with additional options
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    storage: window.localStorage,
    storageKey: 'meme-advisor-auth'
  }
});

// Add error handling and security monitoring
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Successful authentication:', session?.user?.email);
    // Clear any sensitive data from localStorage except auth session
    Object.keys(localStorage).forEach(key => {
      if (!key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    // Clear all local storage data on sign out
    localStorage.clear();
  }
});

// Add rate limiting for auth attempts
let authAttempts = 0;
const MAX_AUTH_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
let lastAuthAttempt = 0;

export const isRateLimited = () => {
  const now = Date.now();
  if (now - lastAuthAttempt < LOCKOUT_DURATION && authAttempts >= MAX_AUTH_ATTEMPTS) {
    return true;
  }
  if (now - lastAuthAttempt > LOCKOUT_DURATION) {
    authAttempts = 0;
  }
  return false;
};

export const trackAuthAttempt = () => {
  lastAuthAttempt = Date.now();
  authAttempts++;
};

// Helper function to handle OAuth errors
export const handleOAuthError = (error: any) => {
  console.error('OAuth Error:', error);

  if (error.message?.includes('CORS')) {
    return 'Unable to connect to authentication service. Please check your internet connection and try again.';
  }
  if (error.message?.includes('popup')) {
    return 'The authentication popup was blocked. Please allow popups for this site and try again.';
  }
  if (error.message?.includes('network')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  return error.message || 'An error occurred during authentication';
};

// Helper function to check connection status
export const checkSupabaseConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return false;
    }
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Supabase connection not available:', error);
    return false;
  }
};