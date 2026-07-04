"use client";

import { Cormorant_Garamond, Inter } from "next/font/google";
import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

// Premium Fonts config
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export default function JhunBistroHero() {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const moveCursor = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      if (!cursorVisible) setCursorVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("cursor-pointer")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setCursorVisible(false);
    };

    const handleMouseEnter = () => {
      setCursorVisible(true);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorVisible]);

  // Framer Motion text reveal variants
  const revealVariants: Variants = {
    hidden: { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", y: 50 },
    visible: (custom: number) => ({
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      y: 0,
      transition: {
        duration: 1.2,
        delay: custom * 0.15,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <div
      className={`${cormorant.variable} ${inter.variable} min-h-screen w-full bg-[#0A0808] text-[#E8D5B7] relative overflow-hidden select-none md:cursor-none flex flex-col font-sans`}
    >
      {/* Custom Cursor */}
      {mounted && cursorVisible && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-50 rounded-full bg-[#B8271E] mix-blend-difference hidden md:block"
          animate={{
            x: cursorPos.x - (isHovered ? 24 : 4),
            y: cursorPos.y - (isHovered ? 24 : 4),
            width: isHovered ? 48 : 8,
            height: isHovered ? 48 : 8,
            backgroundColor: isHovered ? "#E8D5B7" : "#B8271E",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 28,
            mass: 0.2,
          }}
        />
      )}

      {/* Hero Section Container */}
      <section className="relative w-full h-screen min-h-[600px] flex flex-col justify-between p-6 md:p-12 lg:p-16 z-10">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 w-full h-full -z-10">
          <Image
            src="/jhun/chef.png"
            alt="Chef Jhun Bistrô"
            fill
            priority
            quality={100}
            className="object-cover brightness-[0.4] contrast-[1.05]"
          />
          {/* Moody Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0808] via-transparent to-[#0A0808]/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0808]/80 via-transparent to-[#0A0808]/20" />
        </div>

        {/* Header/Nav */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-between items-center"
        >
          <span className={`${cormorant.className} font-semibold text-lg md:text-xl tracking-[0.25em] text-[#E8D5B7]`}>
            JHUN BISTRÔ
          </span>
          <div className={`${inter.className} font-light text-xs tracking-widest text-[#E8D5B7]/60 hidden md:flex items-center gap-6`}>
            <span>EXPERIÊNCIA ÚNICA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8271E]" />
            <span>SALVADOR, BA</span>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-end max-w-4xl pb-12">
          {/* Category Tag */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="h-[1px] w-8 bg-[#B8271E]" />
            <span className={`${inter.className} text-xs font-light tracking-[0.3em] uppercase text-[#B8271E]`}>
              alta gastronomia japonesa
            </span>
          </motion.div>

          {/* Heading with clipPath reveal */}
          <h1 className={`${cormorant.className} text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.1] font-light text-[#E8D5B7] tracking-tight mb-8`}>
            <div className="overflow-hidden block py-1">
              <motion.span
                custom={1}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="block"
              >
                A experiência começa
              </motion.span>
            </div>
            <div className="overflow-hidden block py-1">
              <motion.span
                custom={2}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="block italic text-[#E8D5B7]/95"
              >
                antes de você
              </motion.span>
            </div>
            <div className="overflow-hidden block py-1">
              <motion.span
                custom={3}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="block font-normal"
              >
                sentar.
              </motion.span>
            </div>
          </h1>

          {/* Subtitle/Text */}
          <div className="overflow-hidden block mb-10 max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className={`${inter.className} text-sm sm:text-base font-light text-[#E8D5B7]/70 leading-relaxed`}
            >
              Uma jornada sensorial guiada pelo respeito às origens, refinamento da técnica e a busca implacável pela perfeição dos ingredientes.
            </motion.p>
          </div>

          {/* CTA Button */}
          <div>
            <motion.a
              href="https://wa.me/5571994152643"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${inter.className} inline-flex items-center justify-center px-8 py-4 bg-[#B8271E] text-[#E8D5B7] text-sm uppercase tracking-[0.2em] font-medium border border-[#B8271E] hover:bg-[#E8D5B7] hover:text-[#0A0808] hover:border-[#E8D5B7] transition-all duration-300 rounded-sm`}
            >
              <span className="flex items-center gap-2">
                Reservar mesa 
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </motion.a>
          </div>
        </div>

        {/* Footer info / Page Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="w-full flex justify-between items-center text-[10px] md:text-xs font-light tracking-widest text-[#E8D5B7]/40 border-t border-[#E8D5B7]/10 pt-4"
        >
          <div className={`${inter.className}`}>
            © {new Date().getFullYear()} JHUN BISTRÔ. TODOS OS DIREITOS RESERVADOS.
          </div>
          <div className={`${inter.className} hidden sm:block`}>
            JAPONÊS CONTEMPORÂNEO
          </div>
        </motion.div>
      </section>
    </div>
  );
}
