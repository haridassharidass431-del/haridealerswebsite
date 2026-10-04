import { Product } from '@/types';

export const HARI_DEALERS_PHONE = '917339635485';
export const HARI_DEALERS_PHONE_DISPLAY = '+91 7339635485';
export const HARI_DEALERS_EMAIL = 'haridealers@gmail.com';

export function getWhatsAppLink(message: string) {
  return `https://wa.me/${HARI_DEALERS_PHONE}?text=${encodeURIComponent(message)}`;
}

export function getProductWhatsAppLink(product: Product) {
  const price = product.offer_price.toLocaleString('en-IN');
  const message = [
    'Hello Hari Dealers, I am interested in this product:',
    '',
    `Product: ${product.name}`,
    `Price: ₹${price}`,
    '',
    'Please provide more details and availability.',
  ].join('\n');

  return getWhatsAppLink(message);
}
