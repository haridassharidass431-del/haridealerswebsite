import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';

function authorized(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase service credentials are not configured.' }, { status: 503 });
  const body = await request.json();
  const name = String(body.name || '').trim();
  const slug = String(body.slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  if (!name || !slug) return NextResponse.json({ error: 'Category name and slug are required.' }, { status: 400 });
  const { data, error } = await supabase.from('categories').insert({
    name, slug, description: String(body.description || ''), image_url: String(body.image_url || ''), is_active: true,
  }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ category: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase service credentials are not configured.' }, { status: 503 });
  const body = await request.json();
  if (typeof body.id !== 'string') return NextResponse.json({ error: 'Category id is required.' }, { status: 400 });
  const updates = {
    name: String(body.name || '').trim(),
    slug: String(body.slug || '').trim(),
    description: String(body.description || ''),
    image_url: String(body.image_url || ''),
  };
  if (!updates.name || !updates.slug) return NextResponse.json({ error: 'Category name and slug are required.' }, { status: 400 });
  const { data, error } = await supabase.from('categories').update(updates).eq('id', body.id).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ category: data });
}
