"use client";

import { Suspense } from "react";
import DiagnosticoExpress from "./DiagnosticoExpress";

export default function DiagnosticoPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#0D0D0D] text-sm font-black uppercase tracking-widest text-white">
          Carregando diagnóstico...
        </main>
      }
    >
      <DiagnosticoExpress />
    </Suspense>
  );
}
