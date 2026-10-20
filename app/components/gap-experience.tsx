"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GAP_SESSION_KEY, questionsForBranch, validateGapAnswer, type GapAnswers, type GapBranch, type GapQualification } from "@/app/lib/gap";

type StoredSession = { token: string; branch: GapBranch };
type ViewState = "loading" | "question" | "missing" | "unavailable" | "result";

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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      const stored = getSession();
      if (!stored) { setView("missing"); return; }
      setSession(stored);
      try {
        const response = await fetch("/api/gap/session", { method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": stored.token }, body: JSON.stringify({}) });
        if (!response.ok) throw new Error("session_unavailable");
        const payload = await response.json() as { branch: GapBranch; answers: GapAnswers; currentStep: number; qualificationStatus?: GapQualification };
        const nextQuestions = questionsForBranch(payload.branch);
        setSession({ token: stored.token, branch: payload.branch });
        setAnswers(payload.answers || {});
        setStep(Math.min(Math.max(payload.currentStep || 0, 0), nextQuestions.length - 1));
        if (payload.qualificationStatus === "QUALIFIED" || payload.qualificationStatus === "MANUAL_REVIEW") { setQualification(payload.qualificationStatus); setView("result"); }
        else {
          setView("question");
          void fetch("/api/gap/event", { method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": stored.token }, body: JSON.stringify({ event: "gap_started" }) });
        }
      } catch { setView("unavailable"); }
    });
  }, []);

  const questions = session ? questionsForBranch(session.branch) : [];
  const question = questions[step];

  const track = (event: string, questionId?: string) => {
    if (!session) return;
    void fetch("/api/gap/event", { method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": session.token }, body: JSON.stringify({ event, questionId }) });
  };

  useEffect(() => {
    if (view !== "question") return;
    const timer = window.setTimeout(() => (question?.type === "text" ? inputRef.current?.focus() : headingRef.current?.focus()), reduced ? 0 : 280);
    return () => window.clearTimeout(timer);
  }, [step, view, question?.type, reduced]);

  const persist = async (nextAnswer: string) => {
    if (!session || !question) return false;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/gap/save", { method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": session.token }, body: JSON.stringify({ branch: session.branch, questionId: question.id, answer: nextAnswer.trim(), currentStep: step }) });
      if (!response.ok) throw new Error("save_failed");
      return true;
    } catch { setError("No pudimos guardar esta respuesta. Revisa tu conexión e inténtalo de nuevo."); return false; }
    finally { setSaving(false); }
  };

  const continueQuestion = async () => {
    if (!question) return;
    const answer = answers[question.id] || "";
    const validation = validateGapAnswer(question, answer);
    if (validation) { setError(validation); return; }
    if (!await persist(answer)) return;
    track("gap_question_completed", question.id);
    if (step < questions.length - 1) { setStep((value) => value + 1); return; }
    if (!session) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/gap/complete", { method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": session.token }, body: JSON.stringify({ branch: session.branch, answers }) });
      if (!response.ok) throw new Error("completion_failed");
      const payload = await response.json() as { qualificationStatus: GapQualification };
      setQualification(payload.qualificationStatus); setView("result");
      track("gap_completed");
      track(payload.qualificationStatus === "QUALIFIED" ? "gap_qualified" : "gap_manual_review");
    } catch { setError("No pudimos completar el diagnóstico. Tus respuestas siguen disponibles; inténtalo de nuevo."); }
    finally { setSaving(false); }
  };

  const keyDown = (event: React.KeyboardEvent) => {
    if (!question || saving || event.nativeEvent.isComposing) return;
    if (question.type === "text") {
      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void continueQuestion(); }
      return;
    }
    const letterIndex = event.key.toUpperCase().charCodeAt(0) - 65;
    if (letterIndex >= 0 && letterIndex < (question.options?.length || 0)) { event.preventDefault(); setAnswers((current) => ({ ...current, [question.id]: question.options![letterIndex].value })); }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const options = question.options || [];
      const selected = options.findIndex((option) => option.value === answers[question.id]);
      const next = event.key === "ArrowDown" ? Math.min(selected + 1, options.length - 1) : Math.max(selected - 1, 0);
      if (options[next]) setAnswers((current) => ({ ...current, [question.id]: options[next].value }));
    }
    if (event.key === "Enter") { event.preventDefault(); void continueQuestion(); }
  };

  const resultContent = qualification === "QUALIFIED"
    ? { title: "TU PROYECTO YA TIENE UN PUNTO DE PARTIDA.", text: "Gracias por compartirnos esta información. Ahora podemos preparar una conversación enfocada en tus objetivos." }
    : { title: "YA CONOCEMOS MEJOR TU PROYECTO.", text: "Nuestro equipo revisará la información que compartiste para determinar el siguiente paso más adecuado. Te contactaremos a través de los datos que registraste." };

  return <main className="gap-page" onKeyDown={keyDown}>
    <div className="gap-scene" aria-hidden="true" />
    <section className="gap-content" aria-live="polite">
      <Link className="gap-back" href="/gracias">← Volver</Link>
      <Image className="gap-mark" src="/brand/starix-mark.png" alt="" width={294} height={295} sizes="64px" priority />
      {view === "loading" && <div className="gap-card gap-status"><p className="section-index">GAP / CARGANDO</p><h1>Estamos recuperando tu diagnóstico.</h1></div>}
      {view === "missing" && <div className="gap-card gap-status"><p className="section-index">GAP / SESIÓN</p><h1>Necesitamos iniciar desde contacto.</h1><p>Completa el formulario de contacto para recibir un acceso seguro al diagnóstico.</p><Link href="/#contacto" className="gap-submit">Ir a contacto <span aria-hidden="true">↗</span></Link></div>}
      {view === "unavailable" && <div className="gap-card gap-status"><p className="section-index">GAP / NO DISPONIBLE</p><h1>No pudimos recuperar tu diagnóstico.</h1><p>Tu contacto sigue registrado. Inténtalo de nuevo más tarde o escríbenos por WhatsApp.</p><a className="gap-submit" href="https://wa.me/573127946952" target="_blank" rel="noreferrer">Hablar por WhatsApp <span aria-hidden="true">↗</span></a></div>}
      {view === "result" && <div className="gap-card gap-status"><p className="section-index">GAP / COMPLETADO</p><h1>{resultContent.title}</h1><p>{resultContent.text}</p>{qualification === "QUALIFIED" ? <><button className="gap-submit" type="button" disabled aria-describedby="booking-note">Agendar mi reunión de descubrimiento <span aria-hidden="true">↗</span></button><p id="booking-note" className="gap-booking-note">La agenda estará disponible próximamente.</p></> : <Link className="gap-secondary" href="/">Volver al inicio <span aria-hidden="true">↗</span></Link>}</div>}
      {view === "question" && question && <AnimatePresence mode="wait"><motion.div key={question.id} className="gap-card gap-question" initial={{ opacity: 0, y: reduced ? 0 : 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -28 }} transition={{ duration: reduced ? 0 : .3, ease: [0.22, 1, 0.36, 1] }}>
        <div className="gap-meta"><p className="section-index">GAP / DIAGNÓSTICO</p><p>{step + 1} / {questions.length}</p></div><div className="gap-progress" aria-hidden="true"><i style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
        <h1 ref={headingRef} tabIndex={-1}>{question.prompt}</h1>{question.help && <p className="gap-help">{question.help}</p>}
        {question.type === "choice" ? <div className="gap-options" role="radiogroup" aria-label={question.prompt}>{question.options?.map((option, index) => <button key={option.value} type="button" role="radio" aria-checked={answers[question.id] === option.value} className={answers[question.id] === option.value ? "is-selected" : ""} onClick={() => { setAnswers((current) => ({ ...current, [question.id]: option.value })); setError(""); }}><b>{String.fromCharCode(65 + index)}</b><span>{option.label}</span></button>)}</div> : <textarea ref={inputRef} value={answers[question.id] || ""} maxLength={2000} rows={5} aria-label={question.prompt} onChange={(event) => { setAnswers((current) => ({ ...current, [question.id]: event.target.value })); setError(""); }} placeholder="Escribe tu respuesta aquí…" />}
        <div className="gap-navigation"><button className="gap-previous" type="button" disabled={step === 0 || saving} onClick={() => { setError(""); setStep((value) => Math.max(0, value - 1)); }}>← Anterior</button><button className="gap-submit" type="button" disabled={saving} onClick={() => void continueQuestion()}>{saving ? "Guardando…" : step === questions.length - 1 ? "Finalizar diagnóstico" : "Continuar"} <span aria-hidden="true">↗</span></button></div>
        {error && <p className="gap-error" role="alert">{error}</p>}
      </motion.div></AnimatePresence>}
    </section>
  </main>;
}
