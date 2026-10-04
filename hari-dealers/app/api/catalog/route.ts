import { NextRequest, NextResponse } from 'next/server';
import { getCatalog } from '@/lib/catalog-server';
import { STORE_CATEGORIES } from '@/lib/data/initialData';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const includeInactive = isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
    const catalog = await getCatalog({ includeInactive });
    return NextResponse.json(catalog || { categories: STORE_CATEGORIES, products: [] });
  } catch (error) {
    console.error('Failed to load product catalog:', error);
    return NextResponse.json({ error: 'Product catalog is temporarily unavailable.' }, { status: 500 });
  }
}
