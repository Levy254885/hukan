import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = 'KES', frequency?: string): string {
  const formatted = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);

  if (frequency === 'month') return `${formatted}/mo`;
  if (frequency === 'year') return `${formatted}/yr`;
  return formatted;
}

export function formatKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('254')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+254${cleaned.slice(1)}`;
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) return `+254${cleaned}`;
  return phone;
}

export function generateWhatsAppLink(
  phone: string,
  property: { title: string; location: string; price: string; id: string }
): string {
  const normalized = formatKenyanPhone(phone).replace('+', '');
  const message = encodeURIComponent(
    `Hello, I found this property on Hukan and I'm interested.\n\n` +
      `Property: ${property.title}\n` +
      `Location: ${property.location}\n` +
      `Price: ${property.price}\n` +
      `Hukan Property ID: HKN-${property.id.slice(0, 8).toUpperCase()}\n\n` +
      `Is it still available?`
  );
  return `https://wa.me/${normalized}?text=${message}`;
}

export function createPropertySlug(title: string, location: string, id: string): string {
  const base = `${title} ${location}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  return `${base}-${id.slice(0, 6)}`;
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://hukan.co.ke';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
