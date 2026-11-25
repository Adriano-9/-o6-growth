import { whatsappUrl } from "@/app/_lib/contato";

/**
 * Barra de contato fixa só no celular (some a partir de md).
 * O espaçador com a mesma altura evita que a barra cubra o fim da página.
 */
export function MobileContactBar({
  message = "Olá, vim pelo site da O6 e quero conversar.",
  label = "Falar com a O6 no WhatsApp",
}: {
  message?: string;
  label?: string;
}) {
  return (
    <>
      <div aria-hidden="true" className="h-20 md:hidden" />
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 px-4 pt-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <a
          href={whatsappUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f8f55] px-5 text-sm font-bold text-white"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.5.5 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z" />
          </svg>
          {label}
        </a>
      </div>
    </>
  );
}
