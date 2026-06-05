import Link from "next/link";
import {
  Building2,
  Target,
  Brain,
  Swords,
  Package,
  LayoutDashboard,
  Stethoscope,
  FileText,
  ListChecks,
  Map as MapIcon,
  Calculator,
  ArrowRight,
} from "lucide-react";

const sections = [
  {
    href: "/offer-book/clientes",
    label: "Clientes",
    description: "Dossiê de empresa, nicho e canais.",
    icon: Building2,
  },
  {
    href: "/offer-book/icp",
    label: "ICP",
    description: "Perfil demográfico e ponto de dor.",
    icon: Target,
  },
  {
    href: "/offer-book/psicografia",
    label: "Psicografia",
    description: "Desejos, medos, objeções e crenças.",
    icon: Brain,
  },
  {
    href: "/offer-book/concorrentes",
    label: "Concorrentes",
    description: "Mapeamento de players e ofertas.",
    icon: Swords,
  },
  {
    href: "/offer-book/oferta",
    label: "Oferta",
    description: "Produto, mecanismo único e garantia.",
    icon: Package,
  },
  {
    href: "/offer-book/diagnostico",
    label: "Diagnóstico",
    description: "Raio-X operacional do pipeline atual.",
    icon: Stethoscope,
  },
  {
    href: "/offer-book/dashboard",
    label: "Dashboard",
    description: "Síntese executiva com scores 0-100.",
    icon: LayoutDashboard,
  },
  {
    href: "/offer-book/resumo",
    label: "Resumo Executivo",
    description: "Gargalos, oportunidades e diagnóstico consolidado.",
    icon: FileText,
  },
  {
    href: "/offer-book/plano-acao",
    label: "Plano de Ação",
    description: "P1, P2, P3 derivados automaticamente dos scores.",
    icon: ListChecks,
  },
  {
    href: "/offer-book/roadmap",
    label: "Roadmap",
    description: "Trilha em 3 fases — 0/30/90/180 dias.",
    icon: MapIcon,
  },
  {
    href: "/offer-book/roi",
    label: "ROI Potencial",
    description: "Receita atual × potencial × ganho estimado.",
    icon: Calculator,
  },
];

export default function OfferBookHome() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
          O6 / Offer Book v1
        </div>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white">
          Inteligência Comercial
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">
          A primeira ferramenta estratégica da O6 Growth — um coletor e
          organizador de inteligência comercial. Selecione um módulo abaixo
          para começar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 p-5 transition hover:border-brand-cyan/40 hover:bg-zinc-900/70"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-brand-cyan">
                <Icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-brand-cyan" />
            </div>
            <div className="mt-5 text-base font-bold uppercase tracking-tight text-white">
              {label}
            </div>
            <div className="mt-1 text-xs text-zinc-400">{description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
