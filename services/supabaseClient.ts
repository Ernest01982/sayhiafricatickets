import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Prefer environment variables so deployers can supply their own Supabase project.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
const missingConfigMessage =
  'Supabase credentials are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.';

const mockResponse = <T>(data: T) => ({ data, error: new Error(missingConfigMessage) });

const createMockSupabaseClient = (): SupabaseClient => {
  console.warn(missingConfigMessage);

  const mockSelectBuilder = <T,>(data: T) => ({
    eq: async () => mockResponse(data),
    single: async () => mockResponse(Array.isArray(data) ? (data[0] ?? null) : data),
  });

  const mockFromBuilder = () => ({
    select: () => mockSelectBuilder<any>([]),
    insert: () => ({
      select: () => ({
        single: async () => mockResponse(null),
      }),
    }),
    update: () => ({
      eq: async () => mockResponse(null),
    }),
  });

  return {
    auth: {
      signInWithPassword: async () => ({ data: { user: null }, error: new Error(missingConfigMessage) }),
      signUp: async () => ({ data: { user: null }, error: new Error(missingConfigMessage) }),
      signOut: async () => ({ error: new Error(missingConfigMessage) }),
      getUser: async () => ({ data: { user: null }, error: new Error(missingConfigMessage) }),
    },
    from: () => mockFromBuilder(),
  } as unknown as SupabaseClient;
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : createMockSupabaseClient();

/**
 * Handles Sign In.
 * 1. Signs in with Email/Password.
 * 2. Fetches Profile to get Role.
 * 3. If Login fails (and it's a new user), it attempts to Sign Up + Create Profile.
 */
export const signInAndGetRole = async (email: string, password?: string, defaultRole: 'PROMOTER' | 'ADMIN' = 'PROMOTER') => {
  const finalPassword = password || 'password123'; // Default for demo convenience

  // 1. Try Sign In
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: finalPassword,
  });

  // SUCCESSFUL LOGIN
  if (!signInError && signInData.user) {
    // Fetch profile to determine if Admin or Promoter
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signInData.user.id)
      .single();
    
    // If profile exists, return its role. If missing (edge case), default to provided.
    return { user: signInData.user, role: profile?.role || defaultRole, error: null };
  }

  // 2. If Sign In fails, Try Sign Up (Auto-create for demo/testing flows)
  // Only do this if the specific error suggests user not found, or just attempt it.
  console.log("Login failed, attempting sign up for demo flow...", signInError?.message);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: finalPassword,
  });

  if (signUpError) {
    console.error("Auth Error:", signUpError);
    return { user: null, role: null, error: signUpError };
  }

  if (signUpData.user) {
    // Create Profile for new user
    const { error: profileError } = await supabase.from('profiles').insert({
        id: signUpData.user.id,
        email: email,
        role: defaultRole,
        organization_name: 'My Organization',
        whatsapp_number: ''
    });
    
    if (profileError) console.error("Error creating profile:", profileError);

    return { user: signUpData.user, role: defaultRole, error: null };
  }

  return { user: null, role: null, error: new Error("Unknown auth error") };
};

// Legacy helper for auto-login
export const ensureDemoLogin = async () => {
    return signInAndGetRole('promoter@example.com', 'password123', 'PROMOTER');
};