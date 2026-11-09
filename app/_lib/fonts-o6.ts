import { Anton, DM_Mono, Instrument_Serif, Manrope } from "next/font/google";

// Fontes da direção visual C (aprovada em 08/11/2026). Aplicar só nas páginas
// novas via `o6Fonts`, para não alterar as páginas legadas que usam Geist.
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-o6-display", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-o6-serif", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-o6-sans", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-o6-mono", display: "swap" });

export const o6Fonts = `${anton.variable} ${serif.variable} ${manrope.variable} ${mono.variable}`;
