import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function getAuthenticatedCustomer(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const supabase = getSupabaseAdmin();
  if (!token || !supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user?.email) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, email, phone, role')
    .eq('id', user.id)
    .single();
  if (profileError || !profile || profile.role !== 'customer') return null;

  return { supabase, user, profile };
}
