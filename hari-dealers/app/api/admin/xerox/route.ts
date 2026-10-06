import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

function authorized() { return isValidAdminSession(cookies().get(ADMIN_SESSION_COOKIE)?.value); }
export async function GET() {
  if (!authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getSupabaseAdmin(); if (!db) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  const [orders, pricing] = await Promise.all([db.from('xerox_orders').select('*').order('created_at', { ascending: false }), db.from('xerox_pricing').select('*').eq('id', true).single()]);
  if (orders.error || pricing.error) return NextResponse.json({ error: 'Could not load Xerox data.' }, { status: 500 });
  return NextResponse.json({ orders: orders.data, pricing: pricing.data });
}
export async function PATCH(request: NextRequest) {
  if (!authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getSupabaseAdmin(); if (!db) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  const body = await request.json();
  if (body.pricing) {
    const keys = ['a4_bw','a4_colour','a3_bw','a3_colour','single_side','double_side','spiral_binding'];
    if (!keys.every(k => Number.isFinite(body.pricing[k]) && body.pricing[k] >= 0)) return NextResponse.json({ error: 'All prices must be zero or greater.' }, { status: 400 });
    const { error } = await db.from('xerox_pricing').upsert({ id: true, ...Object.fromEntries(keys.map(k=>[k,body.pricing[k]])), updated_at: new Date().toISOString() });
    return error ? NextResponse.json({error:'Unable to save prices.'},{status:500}) : NextResponse.json({ok:true});
  }
  const allowed = ['Pending','Accepted','Printing','Ready','Completed','Cancelled'];
  if (typeof body.id !== 'string' || !allowed.includes(body.status)) return NextResponse.json({error:'Invalid order update.'},{status:400});
  const update: Record<string, unknown> = { status: body.status, admin_notes: String(body.admin_notes || '').slice(0,1000), updated_at: new Date().toISOString() };
  if (body.final_price !== '' && body.final_price != null) { const price=Number(body.final_price); if (!Number.isFinite(price)||price<0) return NextResponse.json({error:'Final price must be zero or greater.'},{status:400}); update.final_price=price; }
  const {error}=await db.from('xerox_orders').update(update).eq('id',body.id);
  return error?NextResponse.json({error:'Unable to update order.'},{status:500}):NextResponse.json({ok:true});
}
export async function POST(request: NextRequest) {
  if (!authorized()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db)return NextResponse.json({error:'Supabase is not configured.'},{status:503});
  const {id}=await request.json(); const {data:order,error}=await db.from('xerox_orders').select('document_path').eq('id',id).single();
  if(error||!order)return NextResponse.json({error:'Order not found.'},{status:404});
  const {data,error:signError}=await db.storage.from('xerox-documents').createSignedUrl(order.document_path,60);
  return signError?NextResponse.json({error:'Could not create secure download link.'},{status:500}):NextResponse.json({url:data.signedUrl});
}
