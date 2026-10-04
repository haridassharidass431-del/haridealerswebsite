import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { GIRLS_VARIETIES } from '@/lib/collections';

function isAdmin(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function productInput(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const categoryId = typeof body.category_id === 'string' ? body.category_id : '';
  const variety = typeof body.variety === 'string' ? body.variety : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const originalPrice = Number(body.original_price);
  const offerPrice = Number(body.offer_price);
  const stock = Number(body.stock);
  const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() : '';

  if (!name || !categoryId || !Number.isFinite(originalPrice) || originalPrice < 0 ||
      !Number.isFinite(offerPrice) || offerPrice < 0 || !Number.isInteger(stock) || stock < 0) {
    return { error: 'Enter a product name, category, valid prices, and non-negative stock.' };
  }

  return {
    value: {
      name,
      category_id: categoryId,
      variety: variety || null,
      description,
      original_price: originalPrice,
      offer_price: offerPrice,
      stock,
      is_active: body.is_active !== false,
      is_featured: body.is_featured === true,
      is_new_arrival: body.is_new_arrival === true,
      is_offer: body.is_offer === true,
      is_admin_uploaded: body.is_admin_uploaded === true,
      sku: typeof body.sku === 'string' && body.sku.trim() ? body.sku.trim() : null,
      slug: typeof body.slug === 'string' && body.slug.trim()
        ? body.slug.trim()
        : `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${randomUUID().slice(0, 8)}`,
    },
    imageUrl,
  };
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase service credentials are not configured.' }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid product details.' }, { status: 400 });
  }
  const parsed = productInput(body);
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data: category, error: categoryError } = await supabase
    .from('categories').select('id, slug').eq('id', parsed.value.category_id).maybeSingle();
  if (categoryError) {
    console.error('Failed to validate product category:', categoryError);
    return NextResponse.json({ error: 'Could not verify the selected category.' }, { status: 500 });
  }
  if (!category) return NextResponse.json({ error: 'Select a valid category.' }, { status: 400 });
  if (category.slug === 'girls-collection' && !GIRLS_VARIETIES.includes(parsed.value.variety as (typeof GIRLS_VARIETIES)[number])) {
    return NextResponse.json({ error: 'Select a Girls Collection variety.' }, { status: 400 });
  }
  if (category.slug === 'boys-collection' && parsed.value.variety) {
    return NextResponse.json({ error: 'Boys Collection products do not use a Girls variety.' }, { status: 400 });
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({ ...parsed.value, is_admin_uploaded: true })
    .select('id')
    .single();
  if (error) {
    console.error('Failed to add product:', error);
    return NextResponse.json({ error: error.code === '23505' ? 'A product with this SKU or slug already exists.' : 'Could not save the product.' }, { status: 500 });
  }

  if (parsed.imageUrl) {
    const { error: imageError } = await supabase.from('product_images').insert({
      product_id: product.id,
      image_url: parsed.imageUrl,
      display_order: 0,
    });
    if (imageError) {
      await supabase.from('products').delete().eq('id', product.id);
      console.error('Failed to save product image reference:', imageError);
      return NextResponse.json({ error: 'Product image could not be linked to the product.' }, { status: 500 });
    }
  }

  return NextResponse.json({ id: product.id }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase service credentials are not configured.' }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid product details.' }, { status: 400 });
  }
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
  const parsed = productInput(body);
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { data: category, error: categoryError } = await supabase
    .from('categories').select('id, slug').eq('id', parsed.value.category_id).maybeSingle();
  if (categoryError) {
    console.error('Failed to validate product category:', categoryError);
    return NextResponse.json({ error: 'Could not verify the selected category.' }, { status: 500 });
  }
  if (!category) return NextResponse.json({ error: 'Select a valid category.' }, { status: 400 });
  if (category.slug === 'girls-collection' && !GIRLS_VARIETIES.includes(parsed.value.variety as (typeof GIRLS_VARIETIES)[number])) {
    return NextResponse.json({ error: 'Select a Girls Collection variety.' }, { status: 400 });
  }
  if (category.slug === 'boys-collection' && parsed.value.variety) {
    return NextResponse.json({ error: 'Boys Collection products do not use a Girls variety.' }, { status: 400 });
  }

  const { error } = await supabase.from('products').update(parsed.value).eq('id', id);
  if (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: error.code === '23505' ? 'A product with this SKU or slug already exists.' : 'Could not update the product.' }, { status: 500 });
  }

  const { data: existingImages, error: existingImagesError } = await supabase
    .from('product_images').select('id, image_url').eq('product_id', id).order('display_order');
  if (existingImagesError) {
    console.error('Failed to load existing product image:', existingImagesError);
    return NextResponse.json({ error: 'Product saved, but its image could not be updated.' }, { status: 500 });
  }
  if (parsed.imageUrl !== (existingImages?.[0]?.image_url || '')) {
    const { error: deleteImageError } = await supabase.from('product_images').delete().eq('product_id', id);
    if (deleteImageError) {
      console.error('Failed to replace product image:', deleteImageError);
      return NextResponse.json({ error: 'Product saved, but its previous image could not be replaced.' }, { status: 500 });
    }
    if (parsed.imageUrl) {
      const { error: insertImageError } = await supabase.from('product_images').insert({
        product_id: id,
        image_url: parsed.imageUrl,
        display_order: 0,
      });
      if (insertImageError) {
        console.error('Failed to save replacement product image:', insertImageError);
        return NextResponse.json({ error: 'Product saved, but its replacement image could not be linked.' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ updated: true });
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase service credentials are not configured.' }, { status: 503 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
  const { data: images, error: imagesError } = await supabase.from('product_images').select('image_url').eq('product_id', id);
  if (imagesError) {
    console.error('Failed to load product images for deletion:', imagesError);
    return NextResponse.json({ error: 'Could not load product images.' }, { status: 500 });
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Could not delete the product.' }, { status: 500 });
  }

  const imagePaths = (images || []).map((image) => {
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')}/storage/v1/object/public/product-images/`;
    return prefix && image.image_url.startsWith(prefix)
      ? decodeURIComponent(image.image_url.slice(prefix.length))
      : null;
  }).filter((path): path is string => Boolean(path));
  if (imagePaths.length) {
    const { error: storageError } = await supabase.storage.from('product-images').remove(imagePaths);
    if (storageError) {
      console.error('Product deleted but uploaded image cleanup failed:', storageError);
      return NextResponse.json({
        deleted: true,
        warning: 'Product deleted, but its uploaded image could not be removed from Storage.',
      });
    }
  }

  return NextResponse.json({ deleted: true });
}
