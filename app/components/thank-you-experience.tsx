"use client";

import Link from "next/link";
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
        <div className="thank-you-mark" aria-hidden="true">✦</div>
        <h1>Gracias por<br /><span>escribirnos.</span></h1>
        <p>Recibimos tu información. Revisaremos tu solicitud y te contactaremos pronto.</p>
        <div className="thank-you-actions">
          <Link href="/" className="thank-you-link thank-you-link-primary">Volver al inicio <span aria-hidden="true">↗</span></Link>
          <a href="https://wa.me/573217211587" target="_blank" rel="noreferrer" className="thank-you-link thank-you-link-whatsapp">Hablar por WhatsApp <span aria-hidden="true">↗</span></a>
          <span className="thank-you-link thank-you-link-gap" aria-disabled="true">Hacer el GAP <small>Próximamente</small></span>
        </div>
      </section>
    </main>
  );
}
