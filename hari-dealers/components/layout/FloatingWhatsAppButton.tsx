import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function FloatingWhatsAppButton() {
  const href = getWhatsAppLink('Hello Hari Dealers, I would like to know more about your collections.');

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Hari Dealers on WhatsApp"
      title="Chat with Hari Dealers on WhatsApp"
      className="fixed right-4 bottom-24 sm:right-6 sm:bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 hover:bg-[#20bd5a] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
    >
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
