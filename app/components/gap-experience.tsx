"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";

type ContactDetails = {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  company?: string;
  interest: string;
  consent: boolean;
};

type GapStatus = "idle" | "submitting" | "success" | "error";

export default function GapExperience() {
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
  const [status, setStatus] = useState<GapStatus>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contact) return;

    const formData = new FormData(event.currentTarget);
    const gap = {
      goal: String(formData.get("goal") || "").trim(),
      challenge: String(formData.get("challenge") || "").trim(),
      timeline: String(formData.get("timeline") || "").trim(),
      teamSize: String(formData.get("teamSize") || "").trim(),
    };

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, gap, page: window.location.pathname }),
      });
      if (!response.ok) throw new Error("gap_submission_failed");
      sessionStorage.setItem("starix-gap", JSON.stringify(gap));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="gap-page">
      <div className="gap-scene" aria-hidden="true" />
      <section className="gap-content">
        <Link className="gap-back" href="/gracias">← Volver</Link>
        <Image className="gap-mark" src="/brand/starix-mark.png" alt="" width={294} height={295} sizes="64px" priority />
        {!contact ? (
          <div className="gap-card gap-missing">
            <p className="section-index">GAP / DIAGNÓSTICO</p>
            <h1>Necesitamos conocer primero tu proyecto.</h1>
            <p>Completa el formulario de contacto para conservar tus datos y continuar con el diagnóstico.</p>
            <Link href="/#contacto" className="gap-submit">Ir a contacto <span aria-hidden="true">↗</span></Link>
          </div>
        ) : status === "success" ? (
          <div className="gap-card gap-success" role="status">
            <p className="section-index">GAP / RECIBIDO</p>
            <h1>Gracias, {contact.name.split(" ")[0]}.</h1>
            <p>Ya tenemos el contexto para preparar una conversación de descubrimiento más útil. Nuestro equipo te contactará pronto.</p>
            <Link href="/" className="gap-submit">Volver al inicio <span aria-hidden="true">↗</span></Link>
          </div>
        ) : (
          <form className="gap-card" onSubmit={handleSubmit}>
            <p className="section-index">GAP / DIAGNÓSTICO</p>
            <h1>Antes de hablar, entendamos el punto de partida.</h1>
            <p className="gap-intro">Tus datos de contacto ya están listos. Responde estas cuatro preguntas para que la reunión tenga contexto.</p>
            <label>¿Qué resultado quieres conseguir?<textarea name="goal" rows={3} minLength={10} required /></label>
            <label>¿Qué está frenando ese resultado hoy?<textarea name="challenge" rows={3} minLength={10} required /></label>
            <div className="gap-fields">
              <label>¿Cuándo quieres empezar?
                <select name="timeline" defaultValue="" required>
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="asap">Lo antes posible</option>
                  <option value="1_3_months">En 1 a 3 meses</option>
                  <option value="exploring">Estoy explorando opciones</option>
                </select>
              </label>
              <label>¿Cuántas personas usan este proceso?
                <select name="teamSize" defaultValue="" required>
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="1_5">1 a 5 personas</option>
                  <option value="6_20">6 a 20 personas</option>
                  <option value="20_plus">Más de 20 personas</option>
                </select>
              </label>
            </div>
            <button className="gap-submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Enviando..." : "Enviar diagnóstico"} <span aria-hidden="true">↗</span></button>
            {status === "error" && <p className="gap-error" role="alert">No pudimos enviar el diagnóstico. Inténtalo de nuevo o escríbenos por WhatsApp.</p>}
          </form>
        )}
      </section>
    </main>
  );
}
