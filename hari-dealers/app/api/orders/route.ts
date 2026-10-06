import { NextResponse } from 'next/server';
import { getAuthenticatedCustomer } from '@/lib/supabase/request-auth';

export async function GET(request: Request) {
  const customer = await getAuthenticatedCustomer(request);
  if (!customer) return NextResponse.json({ error: 'Sign in with Google to view your orders.' }, { status: 401 });

  const { data: orders, error } = await customer.supabase
    .from('orders')
    .select('*, order_items(*), order_status_history(*)')
    .eq('user_id', customer.user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load your orders.' }, { status: 500 });
  return NextResponse.json({ orders: orders || [] });
}
