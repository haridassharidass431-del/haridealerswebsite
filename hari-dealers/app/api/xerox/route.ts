import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Xerox service is not configured. Set Supabase environment variables and apply migration 006.' }, { status: 503 });
  const { data, error } = await db.from('xerox_pricing').select('a4_bw,a4_colour,a3_bw,a3_colour,single_side,double_side,spiral_binding').eq('id', true).single();
  if (error) return NextResponse.json({ error: 'Could not load current printing prices.' }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Xerox service is not configured. Set Supabase environment variables and apply migration 006.' }, { status: 503 });
  try {
    const form = await request.formData();
    const file = form.get('document');
    const name = String(form.get('name') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const email = String(form.get('email') || '').trim();
    const pages = Number(form.get('pages'));
    const copies = Number(form.get('copies'));
    const printType = String(form.get('print_type'));
    const paperSize = String(form.get('paper_size'));
    const printSide = String(form.get('print_side'));
    const binding = String(form.get('binding'));
    if (!(file instanceof File) || !name || !/^\+?[0-9 ()-]{8,18}$/.test(phone) || !/^\S+@\S+\.\S+$/.test(email) || !Number.isInteger(pages) || pages < 1 || pages > 1000 || !Number.isInteger(copies) || copies < 1 || copies > 100 || !['B&W','Colour'].includes(printType) || !['A4','A3'].includes(paperSize) || !['Single Side','Double Side'].includes(printSide) || !['None','Spiral Binding'].includes(binding)) return NextResponse.json({ error: 'Check the contact details and print options.' }, { status: 400 });
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png'];
    if (!allowed.includes(file.type) || file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'Upload PDF, DOC, DOCX, JPG or PNG files up to 15 MB.' }, { status: 400 });
    const { data: pricing, error: priceError } = await db.from('xerox_pricing').select('*').eq('id', true).single();
    if (priceError || !pricing) return NextResponse.json({ error: 'Printing prices are unavailable.' }, { status: 503 });
    const key = `${paperSize.toLowerCase()}_${printType === 'B&W' ? 'bw' : 'colour'}`;
    const estimated = (pages * copies * Number(pricing[key]) + Number(pricing[printSide === 'Single Side' ? 'single_side' : 'double_side']) + (binding === 'Spiral Binding' ? Number(pricing.spiral_binding) : 0));
    const orderNumber = `XRX-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
    const path = `${new Date().getFullYear()}/${orderNumber}/${safeName}`;
    const { error: uploadError } = await db.storage.from('xerox-documents').upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) return NextResponse.json({ error: 'Document upload failed. Check the private storage bucket setup.' }, { status: 500 });
    const { data, error } = await db.from('xerox_orders').insert({ order_number: orderNumber, customer_name: name, phone, email, document_path: path, file_name: safeName, pages, copies, print_type: printType, paper_size: paperSize, print_side: printSide, binding, notes: String(form.get('notes') || '').slice(0, 1000), estimated_price: estimated }).select('order_number,estimated_price,status').single();
    if (error) { await db.storage.from('xerox-documents').remove([path]); return NextResponse.json({ error: 'Could not save your request. Apply the latest Supabase migration.' }, { status: 500 }); }
    return NextResponse.json({ order: data }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Unable to process this request.' }, { status: 400 }); }
}
