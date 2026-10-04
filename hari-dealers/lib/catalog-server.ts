import { Category, Product } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { STORE_CATEGORIES } from '@/lib/data/initialData';

type CatalogOptions = { includeInactive?: boolean };

export async function getCatalog({ includeInactive = false }: CatalogOptions = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  let categoryQuery = supabase
    .from('categories')
    .select('*')
    .in('slug', STORE_CATEGORIES.map((category) => category.slug))
    .order('display_order');
  if (!includeInactive) {
    categoryQuery = categoryQuery.eq('is_active', true);
  }

  const { data: categoryRows, error: categoriesError } = await categoryQuery;
  if (categoriesError) throw categoriesError;

  const categoryIds = (categoryRows || []).map((category) => category.id);
  const productsResult = categoryIds.length
    ? await (includeInactive
        ? supabase
            .from('products')
            .select('*')
            .eq('is_admin_uploaded', true)
            .in('category_id', categoryIds)
            .order('created_at', { ascending: false })
        : supabase
            .from('products')
            .select('*')
            .eq('is_admin_uploaded', true)
            .eq('is_active', true)
            .in('category_id', categoryIds)
            .order('created_at', { ascending: false }))
    : { data: [], error: null };
  if (productsResult.error) throw productsResult.error;
  const productRows = productsResult.data || [];

  const productIds = productRows.map((product) => product.id);
  const [imageResult, variantResult] = productIds.length
    ? await Promise.all([
        supabase.from('product_images').select('*').in('product_id', productIds).order('display_order'),
        supabase.from('product_variants').select('*').in('product_id', productIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];

  if (imageResult.error) throw imageResult.error;
  if (variantResult.error) throw variantResult.error;

  const categories: Category[] = (categoryRows || []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    image_url: category.image_url || '',
    is_active: category.is_active,
    display_order: category.display_order,
    created_at: category.created_at,
  }));
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const imagesByProduct = new Map<string, string[]>();
  for (const image of imageResult.data || []) {
    imagesByProduct.set(image.product_id, [...(imagesByProduct.get(image.product_id) || []), image.image_url]);
  }
  const variantsByProduct = new Map<string, Product['variants']>();
  for (const variant of variantResult.data || []) {
    const variants = variantsByProduct.get(variant.product_id) || [];
    variants.push({
      id: variant.id,
      product_id: variant.product_id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      sku: variant.sku || undefined,
      price: variant.price ? Number(variant.price) : undefined,
    });
    variantsByProduct.set(variant.product_id, variants);
  }

  const products: Product[] = (productRows || []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    category_id: product.category_id || '',
    category_name: categoryNames.get(product.category_id) || 'Collection',
    variety: product.variety || undefined,
    original_price: Number(product.original_price),
    offer_price: Number(product.offer_price),
    discount_percentage: product.discount_percentage || 0,
    stock: product.stock,
    is_offer: product.is_offer,
    is_featured: product.is_featured,
    is_new_arrival: product.is_new_arrival,
    is_active: product.is_active,
    is_admin_uploaded: product.is_admin_uploaded === true,
    sku: product.sku || undefined,
    images: imagesByProduct.get(product.id) || [],
    variants: variantsByProduct.get(product.id) || [],
    created_at: product.created_at,
    updated_at: product.updated_at,
  }));

  return { categories, products };
}
