import { CONTACT } from "@/data/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${CONTACT.whatsapp}?text=Hi%20Shivrudra%20Graphics,%20I%20need%20a%20quote.`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-brand hover:scale-110 transition animate-float"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-50 animate-ping -z-10" />
    </a>
  );
}
