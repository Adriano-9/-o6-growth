"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

const WHATSAPP_URL = "https://wa.me/5571994054891?text=Acabei%20de%20pagar%20o%20Diagn%C3%B3stico%20O6";

function ObrigadoInner() {
  const sp = useSearchParams();
  const tipo = sp.get("tipo") ?? "diagnostico";
  const title =
    tipo === "diagnostico"
      ? "Diagnóstico confirmado!"
      : "Pagamento confirmado!";

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-zinc-100">
      <section className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle2
            className="mx-auto h-16 w-16 text-emerald-400"
            strokeWidth={1.5}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-5 max-w-xl text-lg text-zinc-300"
        >
          Em até 24h você receberá um WhatsApp de <b className="text-white">Adriano</b> para iniciar o diagnóstico. Em 5 dias úteis, vídeo + plano de ação na sua mão.
        </motion.p>

        <motion.a
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-3 bg-emerald-400 px-7 py-4 text-sm font-black uppercase tracking-widest text-[#0d0d0d] shadow-[4px_4px_0px_0px_#fff] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#fff]"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2} />
          Falar agora pelo WhatsApp
        </motion.a>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-[11px] uppercase tracking-widest text-zinc-500"
        >
          O6 Growth · Sistema Comercial · 2026
        </motion.p>
      </section>
    </main>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense>
      <ObrigadoInner />
    </Suspense>
  );
}
