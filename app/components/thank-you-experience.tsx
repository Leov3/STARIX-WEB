"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

export default function ThankYouExperience() {
  const pageRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.55 });
  const earthY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [160, 160] : [160, 20]);
  const earthScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.14]);
  const starsY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 28]);
  const starsScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.04]);
  const astronautY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -72]);
  const astronautScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.035]);

  return (
    <main ref={pageRef} className="thank-you-page">
      <div className="thank-you-scene" aria-hidden="true">
        <motion.div className="hero-stars" style={{ y: starsY, scale: starsScale }} />
        <motion.div className="hero-earth" style={{ y: earthY, scale: earthScale }} />
        <motion.div
          className="hero-astronaut"
          style={{ y: astronautY, scale: astronautScale }}
          animate={prefersReducedMotion ? undefined : { x: [0, 8, 0, -6, 0], rotate: [0, .45, 0, -.3, 0] }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
        />
      </div>
      <section className="thank-you-content">
        <p className="section-index">CONTACTO / RECIBIDO</p>
        <Image
          className="thank-you-mark"
          src="/brand/starix-mark.png"
          alt=""
          width={294}
          height={295}
          sizes="(max-width: 620px) 72px, 112px"
          priority
        />
        <h1>Gracias por<br /><span>escribirnos.</span></h1>
        <p>Hemos recibido tu solicitud. El siguiente paso es conocer mejor tu proyecto para preparar una conversación realmente útil.</p>
        <div className="thank-you-actions">
          <Link href="/gap" className="thank-you-link thank-you-link-primary">Continuar con mi proyecto <span aria-hidden="true">↗</span></Link>
        </div>
        <p className="thank-you-next-step">Completa un breve diagnóstico y agenda tu reunión de descubrimiento.</p>
        <div className="thank-you-divider" />
        <div className="thank-you-alternative">
          <p>¿Prefieres hablar primero con nuestro equipo?</p>
          <a href="https://wa.me/573127946952" target="_blank" rel="noreferrer">Contactar por WhatsApp <span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </main>
  );
}
