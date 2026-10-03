"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const heroHeadline = "Tu negocio no tiene por qué\nquedarse en tierra.";

export default function HeroParallax() {
  const heroRef = useRef<HTMLElement>(null);
  // Keep the primary message in the server-rendered HTML so delayed hydration
  // never leaves the hero empty.
  const [typedHeadline] = useState(heroHeadline);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.55 });
  const earthY = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion
      ? [isMobile ? 20 : 160, isMobile ? 20 : 160]
      : [isMobile ? 20 : 160, isMobile ? -80 : 20],
  );
  const earthScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.14]);
  const starsY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 28]);
  const starsScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.04]);
  const astronautY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -72]);
  const astronautScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.035]);
  const copyY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 42]);
  const headlineComplete = typedHeadline.length === heroHeadline.length;

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 620px)");
    const updateMobile = () => setIsMobile(mobileQuery.matches);
    updateMobile();
    mobileQuery.addEventListener("change", updateMobile);

    return () => {
      mobileQuery.removeEventListener("change", updateMobile);
    };
  }, []);

  return (
    <section ref={heroRef} id="top" className="hero" aria-label="Inicio de STARIX">
      <div className="hero-scene" aria-hidden="true">
        <motion.div className="hero-stars" style={{ y: starsY, scale: starsScale }} />
        <motion.div className="hero-earth" style={{ y: earthY, scale: earthScale }} />
        <motion.div
          className="hero-astronaut"
          style={{ y: astronautY, scale: astronautScale }}
          animate={prefersReducedMotion ? undefined : {
            x: [0, 8, 0, -6, 0],
            rotate: [0, 0.45, 0, -0.3, 0],
          }}
          transition={{
            duration: 20,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      </div>
      <div className="hero-brand">
        <Image className="hero-brand-mark" src="/brand/starix-mark.png" alt="" width={294} height={295} sizes="(max-width: 620px) 76px, 104px" priority />
        <Image className="hero-brand-wordmark" src="/brand/starix-wordmark.png" alt="STARIX" width={684} height={81} sizes="(max-width: 620px) 168px, 224px" priority />
      </div>
      <motion.div className="hero-copy" style={{ y: copyY }}>
        <h1 aria-label={heroHeadline}>
          <span className="sr-only">{heroHeadline}</span>
          <span className="hero-typed" aria-hidden="true">{typedHeadline}</span>
        </h1>
        <motion.p
          className="hero-support"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          Diseñamos y desarrollamos sistemas digitales que conectan procesos, automatizan operaciones y ayudan a las empresas a avanzar.
        </motion.p>
        <div className="hero-actions">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: prefersReducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <a className="hero-cta hero-cta-primary" href="#contacto">Hablemos de tu proyecto</a>
          </motion.div>
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: prefersReducedMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <a className="hero-cta hero-cta-secondary" href="#servicios">Ver lo que construimos</a>
          </motion.div>
        </div>
      </motion.div>
      <a className="hero-scroll-cue" href="#servicios" aria-label="Desplazarse a servicios">
        <span>Desliza para explorar</span>
        <span className="hero-scroll-arrow" aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
