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
  const [preview, setPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end start"] });
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

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 620px)");
    const updateMobile = () => setIsMobile(mobileQuery.matches);
    updateMobile();
    mobileQuery.addEventListener("change", updateMobile);
    return () => mobileQuery.removeEventListener("change", updateMobile);
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("preview") === "1") {
      setPreview(true);
      setName("Alex");
      return;
    }
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
    <main ref={pageRef} className="hero thank-you-page">
      <div className="hero-scene thank-you-scene" aria-hidden="true">
        <motion.div className="hero-stars" style={{ y: starsY, scale: starsScale }} />
        <motion.div className="hero-earth" style={{ y: earthY, scale: earthScale }} />
        <motion.div className="hero-astronaut" style={{ y: astronautY, scale: astronautScale }} animate={prefersReducedMotion ? undefined : { x: [0, 8, 0, -6, 0], rotate: [0, .45, 0, -.3, 0] }} transition={{ duration: 20, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }} />
      </div>
      <section className="thank-you-content">
        {preview && <p className="preview-flag">VISTA PREVIA · DATOS FICTICIOS</p>}
        <div className="thank-you-intro">
          <Image className="thank-you-mark" src="/brand/starix-mark.png" alt="" width={294} height={295} sizes="52px" priority />
          <p className="section-index">CONTACTO RECIBIDO</p>
        </div>
        <h1>Gracias{name ? <span>, {name}</span> : " por dar el primer paso"}.</h1>
        <p className="thank-you-lead">Ya recibimos tu información. Queremos conocer mejor tu proyecto para preparar una conversación útil para ti.</p>
        <div className="thank-you-next">
          <p className="thank-you-step">SIGUIENTE PASO · TU DIAGNÓSTICO</p>
          <p>Responde seis preguntas sobre lo que quieres lograr. Te tomará solo unos minutos.</p>
          <Link href={preview ? "/diagnostico?preview=1" : "/diagnostico"} className="thank-you-link thank-you-link-primary">Iniciar mi diagnóstico <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="thank-you-alternative">
          <span>¿Prefieres conversar ahora?</span>
          {preview ? <span className="preview-static-link">Hablar por WhatsApp ↗</span> : <a href={whatsappUrl} target="_blank" rel="noreferrer">Hablar por WhatsApp ↗</a>}
        </div>
        <p className="thank-you-privacy">Usaremos tus datos solo para dar seguimiento a tu solicitud.</p>
      </section>
    </main>
  );
}
