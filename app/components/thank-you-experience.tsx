"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GAP_SESSION_KEY } from "@/app/lib/gap";

type StoredSession = { token?: string; name?: string };
const whatsappUrl = "https://wa.me/573226912001?text=Hola%2C%20quiero%20hablar%20sobre%20mi%20proyecto%20con%20STARIX.";

export default function ThankYouExperience() {
  const pageRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [name, setName] = useState("");
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end start"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.55 });
  const earthY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [160, 160] : [160, 20]);
  const earthScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.14]);
  const starsY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 28]);
  const starsScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.04]);
  const astronautY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -72]);
  const astronautScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.035]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(GAP_SESSION_KEY);
      const session = saved ? JSON.parse(saved) as StoredSession : null;
      if (session?.name) { const sessionName = session.name; window.setTimeout(() => setName(sessionName), 0); }
      if (session?.token) {
        void fetch("/api/gap/event", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-starix-gap-token": session.token },
          body: JSON.stringify({ event: "pagina_gracias_vista" }),
        });
      }
    } catch { /* This page remains useful even when browser storage is unavailable. */ }
  }, []);

  return (
    <main ref={pageRef} className="thank-you-page">
      <div className="thank-you-scene" aria-hidden="true">
        <motion.div className="hero-stars" style={{ y: starsY, scale: starsScale }} />
        <motion.div className="hero-earth" style={{ y: earthY, scale: earthScale }} />
        <motion.div className="hero-astronaut" style={{ y: astronautY, scale: astronautScale }} animate={prefersReducedMotion ? undefined : { x: [0, 8, 0, -6, 0], rotate: [0, .45, 0, -.3, 0] }} transition={{ duration: 20, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }} />
      </div>
      <section className="thank-you-content">
        <p className="section-index">CONTACTO RECIBIDO</p>
        <p className="thank-you-step">PASO 1 COMPLETADO · SIGUIENTE: TU DIAGNÓSTICO</p>
        <Image className="thank-you-mark" src="/brand/starix-mark.png" alt="" width={294} height={295} sizes="(max-width: 620px) 72px, 112px" priority />
        <h1>Gracias por dar el primer paso{name ? `, ${name}` : ""}.</h1>
        <p>Ya recibimos tu información. Ahora queremos entender mejor tu contexto para preparar una conversación que aporte a tu proyecto.</p>
        <p>Continúa con tu diagnóstico. En pocos minutos podremos identificar dónde estás hoy, qué quieres mejorar y cuáles pueden ser tus próximos pasos.</p>
        <div className="thank-you-actions">
          <Link href="/diagnostico" className="thank-you-link thank-you-link-primary">Iniciar mi diagnóstico <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="thank-you-divider" />
        <div className="thank-you-alternative">
          <p>¿Prefieres una respuesta rápida?</p>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">Hablar por WhatsApp <span aria-hidden="true">↗</span></a>
        </div>
        <p className="thank-you-next-step">Tu información será tratada de forma confidencial y solo se usará para dar seguimiento a tu solicitud.</p>
      </section>
    </main>
  );
}
