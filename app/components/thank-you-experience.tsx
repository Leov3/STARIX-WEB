"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { FormEvent, useRef, useState } from "react";

type ContactDetails = {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  company?: string;
  interest: string;
  consent: boolean;
};

export default function ThankYouExperience() {
  const pageRef = useRef<HTMLElement>(null);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [contact] = useState<ContactDetails | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const savedContact = sessionStorage.getItem("starix-contact");
      return savedContact ? JSON.parse(savedContact) as ContactDetails : null;
    } catch {
      sessionStorage.removeItem("starix-contact");
      return null;
    }
  });
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

  const handleSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contact) return;
    const formData = new FormData(event.currentTarget);
    setSchedulerStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contact,
          page: window.location.pathname,
          meetingDate: formData.get("meetingDate"),
          meetingTime: formData.get("meetingTime"),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) throw new Error("schedule_submission_failed");
      setSchedulerStatus("success");
    } catch {
      setSchedulerStatus("error");
    }
  };

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
        <p>Recibimos tu información. Revisaremos tu solicitud y te contactaremos pronto.</p>
        <div className="thank-you-actions">
          <button type="button" className="thank-you-link thank-you-link-uniform thank-you-schedule-trigger" onClick={() => { setSchedulerOpen((open) => !open); setSchedulerStatus("idle"); }} aria-expanded={schedulerOpen} aria-controls="schedule-panel">Agendar una Reunion <span aria-hidden="true">↗</span></button>
          <a href="https://wa.me/573127946952" target="_blank" rel="noreferrer" className="thank-you-link thank-you-link-uniform">Hablar por WhatsApp <span aria-hidden="true">↗</span></a>
          <Link href="/" className="thank-you-link thank-you-link-uniform">Volver al inicio <span aria-hidden="true">↗</span></Link>
        </div>
        {schedulerOpen && (
          <section id="schedule-panel" className="thank-you-scheduler" aria-labelledby="schedule-title">
            {!contact ? (
              <div>
                <p className="section-index">AGENDA UNA REUNION</p>
                <h2 id="schedule-title">Primero necesitamos tus datos de contacto.</h2>
                <p>Completa el formulario de contacto y vuelve a esta pantalla para elegir fecha y hora.</p>
                <Link href="/#contacto" className="thank-you-scheduler-submit">Ir al formulario <span aria-hidden="true">↗</span></Link>
              </div>
            ) : schedulerStatus === "success" ? (
              <div role="status">
                <p className="section-index">SOLICITUD RECIBIDA</p>
                <h2 id="schedule-title">Tu reunion esta en proceso de confirmacion.</h2>
                <p>Te contactaremos para confirmar el horario que elegiste.</p>
              </div>
            ) : (
              <form onSubmit={handleSchedule}>
                <div className="thank-you-scheduler-head">
                  <div>
                    <p className="section-index">AGENDA UNA REUNION</p>
                    <h2 id="schedule-title">Elige un horario que te funcione.</h2>
                  </div>
                  <button type="button" className="thank-you-scheduler-close" onClick={() => setSchedulerOpen(false)} aria-label="Cerrar agenda">×</button>
                </div>
                <p className="thank-you-scheduler-copy">Usaremos los datos que acabas de compartirnos. Solo selecciona la fecha y hora que prefieras.</p>
                <div className="thank-you-scheduler-grid thank-you-scheduler-grid-compact">
                  <label>Fecha preferida<input name="meetingDate" type="date" min={new Date().toISOString().slice(0, 10)} required /></label>
                  <label>Hora preferida<input name="meetingTime" type="time" required /></label>
                </div>
                <button className="thank-you-scheduler-submit" type="submit" disabled={schedulerStatus === "submitting"}>{schedulerStatus === "submitting" ? "Enviando..." : "Solicitar reunion"} <span aria-hidden="true">↗</span></button>
                {schedulerStatus === "error" && <p className="thank-you-scheduler-error" role="alert">No pudimos enviar la solicitud. Intentalo de nuevo o contactanos por WhatsApp.</p>}
              </form>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
