import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';

function isAdmin(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase service credentials are not configured.' }, { status: 503 });
  const { data, error } = await supabase.from('orders').select('*, order_items(*), order_status_history(*)').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load orders.' }, { status: 500 });
  return NextResponse.json({ orders: data || [] });
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase service credentials are not configured.' }, { status: 503 });
  const { order_number, status, notes, tracking } = await request.json();
  const allowed = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancel_requested', 'cancelled', 'return_requested', 'returned', 'refunded'];
  if (typeof order_number !== 'string' || !allowed.includes(status)) return NextResponse.json({ error: 'Invalid order status update.' }, { status: 400 });

  const updates: Record<string, unknown> = { order_status: status };
  if (tracking?.courier_name !== undefined) updates.courier_name = tracking.courier_name;
  if (tracking?.tracking_number !== undefined) updates.tracking_number = tracking.tracking_number;
  if (tracking?.tracking_url !== undefined) updates.tracking_url = tracking.tracking_url;
  const { data: order, error } = await supabase.from('orders').update(updates).eq('order_number', order_number).select('id').single();
  if (error || !order) return NextResponse.json({ error: 'Order was not found or could not be updated.' }, { status: 404 });
  const { error: historyError } = await supabase.from('order_status_history').insert({
    order_id: order.id,
    status,
    message: typeof notes === 'string' && notes.trim() ? notes.trim() : `Order status updated to ${status.replaceAll('_', ' ')}.`,
  });
  if (historyError) return NextResponse.json({ error: 'Status updated, but order history could not be recorded.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
