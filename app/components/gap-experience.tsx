"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GAP_SESSION_KEY, questionsForBranch, validateGapAnswer, type GapAnswers, type GapBranch, type GapQualification } from "@/app/lib/gap";

type StoredSession = { token: string; branch: GapBranch; name?: string };
type ViewState = "loading" | "question" | "missing" | "unavailable" | "result";
type SessionResponse = { branch: GapBranch; answers: GapAnswers; currentStep: number; qualificationStatus?: GapQualification; bookingUrl?: string };
const whatsappNumber = "573226912001";

function getSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(GAP_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    return typeof parsed.token === "string" && typeof parsed.branch === "string" ? parsed : null;
  } catch { return null; }
}

export default function GapExperience() {
  const reduced = useReducedMotion();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [answers, setAnswers] = useState<GapAnswers>({});
  const [step, setStep] = useState(0);
  const [view, setView] = useState<ViewState>("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [qualification, setQualification] = useState<GapQualification | null>(null);
  const [bookingUrl, setBookingUrl] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const track = (event: string, questionId?: string) => {
    if (!session) return;
    void fetch("/api/gap/event", { method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": session.token }, body: JSON.stringify({ event, questionId }) });
  };

  useEffect(() => {
    void (async () => {
      const stored = getSession();
      if (!stored) { setView("missing"); return; }
      setSession(stored);
      try {
        const response = await fetch("/api/gap/session", { method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": stored.token }, body: "{}" });
        if (!response.ok) throw new Error("session_unavailable");
        const payload = await response.json() as SessionResponse;
        const nextQuestions = questionsForBranch(payload.branch);
        setSession({ ...stored, branch: payload.branch });
        setAnswers(payload.answers || {});
        setStep(Math.min(Math.max(payload.currentStep || 0, 0), nextQuestions.length - 1));
        setBookingUrl(payload.bookingUrl || "");
        if (payload.qualificationStatus === "HIGH_PRIORITY" || payload.qualificationStatus === "MEDIUM_PRIORITY" || payload.qualificationStatus === "MANUAL_REVIEW") {
          setQualification(payload.qualificationStatus);
          setView("result");
        } else {
          setView("question");
          void fetch("/api/gap/event", { method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": stored.token }, body: JSON.stringify({ event: "diagnostico_iniciado" }) });
        }
      } catch { setView("unavailable"); }
    })();
  }, []);

  const questions = session ? questionsForBranch(session.branch) : [];
  const question = questions[step];

  useEffect(() => {
    if (view !== "question") return;
    const timer = window.setTimeout(() => headingRef.current?.focus(), reduced ? 0 : 280);
    return () => window.clearTimeout(timer);
  }, [step, view, reduced]);

  const persist = async (nextAnswer: string) => {
    if (!session || !question) return false;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/gap/save", { method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": session.token }, body: JSON.stringify({ branch: session.branch, questionId: question.id, answer: nextAnswer, currentStep: step }) });
      if (!response.ok) throw new Error("save_failed");
      return true;
    } catch { setError("No pudimos guardar esta respuesta. Revisa tu conexión e inténtalo de nuevo."); return false; }
    finally { setSaving(false); }
  };

  const complete = async () => {
    if (!session) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/gap/complete", { method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": session.token }, body: JSON.stringify({ branch: session.branch, answers }) });
      if (!response.ok) throw new Error("completion_failed");
      const payload = await response.json() as { qualificationStatus: GapQualification; bookingUrl?: string };
      setQualification(payload.qualificationStatus); setBookingUrl(payload.bookingUrl || ""); setView("result");
      track("diagnostico_completado");
    } catch { setError("No pudimos completar el diagnóstico. Tus respuestas siguen disponibles; inténtalo de nuevo."); }
    finally { setSaving(false); }
  };

  const continueQuestion = async () => {
    if (!question) return;
    const answer = answers[question.id] || "";
    const validation = validateGapAnswer(question, answer);
    if (validation) { setError(validation); return; }
    if (!await persist(answer)) return;
    if (step < questions.length - 1) { setStep((value) => value + 1); return; }
    await complete();
  };

  const resultContent = qualification === "HIGH_PRIORITY"
    ? { title: "TU PROYECTO ESTÁ LISTO PARA PROFUNDIZAR.", text: "La información que compartiste nos permite tener una conversación enfocada en tus prioridades y posibles oportunidades." }
    : qualification === "MEDIUM_PRIORITY"
      ? { title: "YA TENEMOS UN BUEN PUNTO DE PARTIDA.", text: "En una conversación de descubrimiento podremos aclarar alcance, prioridades y el siguiente paso más conveniente." }
      : { title: "EMPECEMOS POR DAR CLARIDAD A TU CONTEXTO.", text: "Antes de agendar una sesión, conversemos brevemente por WhatsApp para orientarte mejor sobre el camino más útil para tu proyecto." };
  const area = session?.branch === "WEB_PRODUCT" ? "tu sitio web o producto" : session?.branch === "AUTOMATION" ? "tu automatización" : session?.branch === "BRAND_DIGITAL" ? "tu marca o presencia digital" : "tu proyecto";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola, acabo de completar el diagnóstico de STARIX. Quiero orientación sobre ${area}.`)}`;
  const eligibleForBooking = qualification === "HIGH_PRIORITY" || qualification === "MEDIUM_PRIORITY";

  return <main className="gap-page">
    <div className="gap-scene" aria-hidden="true" />
    <section className="gap-content" aria-live="polite">
      <Link className="gap-back" href="/gracias">← Volver</Link>
      <Image className="gap-mark" src="/brand/starix-mark.png" alt="" width={294} height={295} sizes="64px" priority />
      {view === "loading" && <div className="gap-card gap-status"><p className="section-index">DIAGNÓSTICO</p><h1>Estamos preparando tu diagnóstico.</h1></div>}
      {view === "missing" && <div className="gap-card gap-status"><p className="section-index">DIAGNÓSTICO</p><h1>Necesitamos iniciar desde contacto.</h1><p>Completa el formulario de contacto para recibir un acceso seguro al diagnóstico.</p><Link href="/#contacto" className="gap-submit">Ir a contacto <span aria-hidden="true">↗</span></Link></div>}
      {view === "unavailable" && <div className="gap-card gap-status"><p className="section-index">DIAGNÓSTICO</p><h1>No pudimos recuperar tu diagnóstico.</h1><p>Tu contacto sigue registrado. Inténtalo de nuevo más tarde o escríbenos por WhatsApp.</p><a className="gap-submit" href={whatsappUrl} target="_blank" rel="noreferrer">Hablar por WhatsApp <span aria-hidden="true">↗</span></a></div>}
      {view === "result" && <div className="gap-card gap-status"><p className="section-index">DIAGNÓSTICO COMPLETADO</p><h1>{resultContent.title}</h1><p>{resultContent.text}</p>{eligibleForBooking && bookingUrl ? <a className="gap-submit" href={bookingUrl} target="_blank" rel="noreferrer" onClick={() => track("agenda_mostrada")}>Agendar videollamada <span aria-hidden="true">↗</span></a> : eligibleForBooking ? <p className="gap-booking-note">Estamos preparando la disponibilidad. Te contactaremos para coordinar la videollamada.</p> : <a className="gap-submit" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_desde_resultado")}>Hablar por WhatsApp <span aria-hidden="true">↗</span></a>}</div>}
      {view === "question" && question && <AnimatePresence mode="wait"><motion.div key={question.id} className="gap-card gap-question" initial={{ opacity: 0, y: reduced ? 0 : 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -28 }} transition={{ duration: reduced ? 0 : .3, ease: [0.22, 1, 0.36, 1] }}>
        <div className="gap-meta"><p className="section-index">TU DIAGNÓSTICO</p><p>{step + 1} / {questions.length}</p></div><div className="gap-progress" aria-hidden="true"><i style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
        <h1 ref={headingRef} tabIndex={-1}>{question.prompt}</h1>
        <div className="gap-options" role="radiogroup" aria-label={question.prompt}>{question.options?.map((option, index) => <button key={option.value} type="button" role="radio" aria-checked={answers[question.id] === option.value} className={answers[question.id] === option.value ? "is-selected" : ""} onClick={() => { setAnswers((current) => ({ ...current, [question.id]: option.value })); setError(""); }}><b>{String.fromCharCode(65 + index)}</b><span>{option.label}</span></button>)}</div>
        <div className="gap-navigation"><button className="gap-previous" type="button" disabled={step === 0 || saving} onClick={() => { setError(""); setStep((value) => Math.max(0, value - 1)); }}>← Anterior</button><button className="gap-submit" type="button" disabled={saving} onClick={() => void continueQuestion()}>{saving ? "Guardando…" : step === questions.length - 1 ? "Finalizar diagnóstico" : "Continuar"} <span aria-hidden="true">↗</span></button></div>
        {error && <p className="gap-error" role="alert">{error}</p>}
      </motion.div></AnimatePresence>}
    </section>
  </main>;
}
