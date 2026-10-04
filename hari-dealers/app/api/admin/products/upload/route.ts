import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase service credentials are not configured.' }, { status: 503 });

  const formData = await request.formData();
  const file = formData.get('image');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 });

  const extension = ALLOWED_TYPES.get(file.type);
  if (!extension) return NextResponse.json({ error: 'Upload a JPG, PNG, or WebP image.' }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: 'Image size must be between 1 byte and 5 MB.' }, { status: 400 });
  }

  const path = `products/${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) {
    console.error('Product image upload failed:', error);
    return NextResponse.json({ error: 'Could not upload the image. Check the product-images Storage bucket.' }, { status: 500 });
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return NextResponse.json({ image_url: data.publicUrl }, { status: 201 });
}
