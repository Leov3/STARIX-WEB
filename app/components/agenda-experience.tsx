"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GAP_SESSION_KEY } from "@/app/lib/gap";

type AgendaPayload = { ok: boolean; error?: string; status?: "pending" | "confirmed"; slots?: string[]; scheduledAt?: string; durationMinutes?: number; contactName?: string };
type View = "loading" | "ready" | "missing" | "error" | "confirmed";
const timeZone = "America/Bogota";
const dateFormatter = new Intl.DateTimeFormat("es-CO", { timeZone, weekday: "long", day: "numeric", month: "long" });
const shortDateFormatter = new Intl.DateTimeFormat("es-CO", { timeZone, weekday: "short", day: "numeric", month: "short" });
const timeFormatter = new Intl.DateTimeFormat("es-CO", { timeZone, hour: "numeric", minute: "2-digit", hour12: true });
const monthFormatter = new Intl.DateTimeFormat("es-CO", { timeZone, month: "long", year: "numeric" });

function dateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function monthKey(date: Date) { return dateKey(date).slice(0, 7); }
function addMonths(month: string, count: number) {
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year, number - 1 + count, 15)).toISOString().slice(0, 7);
}
function labelDate(value: string) { return dateFormatter.format(new Date(value)); }
function labelShortDate(value: string) { return shortDateFormatter.format(new Date(value)); }
function labelTime(value: string) { return timeFormatter.format(new Date(value)); }
function labelMonth(value: string) {
  const label = monthFormatter.format(new Date(`${value}-15T12:00:00-05:00`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
function previewSlots(month: string) {
  const today = dateKey(new Date());
  const [year, number] = month.split("-").map(Number);
  const slots: string[] = [];
  for (let day = 1; day <= 31; day += 1) {
    const date = new Date(Date.UTC(year, number - 1, day));
    if (date.getUTCMonth() !== number - 1) break;
    const key = date.toISOString().slice(0, 10);
    if (key <= today || date.getUTCDay() === 0) continue;
    for (const hour of [11, 12, 13]) slots.push(`${key}T${String(hour).padStart(2, "0")}:00:00-05:00`);
  }
  return slots;
}

export default function AgendaExperience() {
  const pageRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [preview, setPreview] = useState(false);
  const [token, setToken] = useState("");
  const [month, setMonth] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [contactName, setContactName] = useState("");
  const [view, setView] = useState<View>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAllDays, setShowAllDays] = useState(false);
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end start"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.55 });
  const earthY = useTransform(smoothProgress, [0, 1], reduced ? [isMobile ? 20 : 160, isMobile ? 20 : 160] : [isMobile ? 20 : 160, isMobile ? -80 : 20]);
  const earthScale = useTransform(smoothProgress, [0, 1], reduced ? [1, 1] : [1, 1.14]);
  const starsY = useTransform(smoothProgress, [0, 1], reduced ? [0, 0] : [0, 28]);
  const starsScale = useTransform(smoothProgress, [0, 1], reduced ? [1, 1] : [1, 1.04]);
  const astronautY = useTransform(smoothProgress, [0, 1], reduced ? [0, 0] : [0, -72]);
  const astronautScale = useTransform(smoothProgress, [0, 1], reduced ? [1, 1] : [1, 1.035]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 620px)");
    const updateMobile = () => setIsMobile(query.matches);
    updateMobile();
    query.addEventListener("change", updateMobile);
    return () => query.removeEventListener("change", updateMobile);
  }, []);

  useEffect(() => {
    const currentMonth = monthKey(new Date());
    setMonth(currentMonth);
    if (new URLSearchParams(window.location.search).get("preview") === "1") { setPreview(true); setContactName("María"); return; }
    try {
      const raw = sessionStorage.getItem(GAP_SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) as { token?: string } : null;
      if (parsed?.token) setToken(parsed.token);
      else setView("missing");
    } catch { setView("missing"); }
  }, []);

  useEffect(() => {
    if (!month || (!preview && !token)) return;
    if (preview) {
      const next = previewSlots(month);
      setSlots(next);
      setSelectedDay(next.length ? dateKey(new Date(next[0])) : "");
      setSelectedSlot("");
      setView("ready");
      return;
    }
    const controller = new AbortController();
    setView("loading"); setMessage(""); setSelectedSlot(""); setShowAllDays(false);
    void (async () => {
      try {
        const response = await fetch("/api/agenda/slots", {
          method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": token },
          body: JSON.stringify({ month }), signal: controller.signal,
        });
        const result = await response.json() as AgendaPayload;
        if (!response.ok || !result.ok) throw new Error(result.error || "agenda_unavailable");
        setContactName(result.contactName || "");
        if (result.status === "confirmed" && result.scheduledAt) { setScheduledAt(result.scheduledAt); setView("confirmed"); return; }
        const next = Array.isArray(result.slots) ? result.slots : [];
        setSlots(next);
        setSelectedDay(next.length ? dateKey(new Date(next[0])) : "");
        setView("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setMessage(error instanceof Error && error.message === "booking_unavailable" ? "Esta invitación ya no está disponible. Escríbenos para ayudarte a coordinar." : "No pudimos cargar los horarios. Inténtalo de nuevo.");
        setView("error");
      }
    })();
    return () => controller.abort();
  }, [month, preview, token, refreshKey]);

  const days = useMemo(() => [...new Set(slots.map((slot) => dateKey(new Date(slot))))], [slots]);
  const visibleDays = showAllDays ? days : days.slice(0, 8);
  const times = useMemo(() => slots.filter((slot) => dateKey(new Date(slot)) === selectedDay), [slots, selectedDay]);
  const firstMonth = monthKey(new Date());
  const monthOffset = month ? (Number(month.slice(0, 4)) - Number(firstMonth.slice(0, 4))) * 12 + Number(month.slice(5, 7)) - Number(firstMonth.slice(5, 7)) : 0;

  const confirm = async () => {
    if (!selectedSlot || busy) return;
    if (preview) { setScheduledAt(selectedSlot); setView("confirmed"); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/agenda/confirm", {
        method: "POST", headers: { "Content-Type": "application/json", "x-starix-gap-token": token },
        body: JSON.stringify({ when: selectedSlot }),
      });
      const result = await response.json() as AgendaPayload;
      if (!response.ok || !result.ok || !result.scheduledAt) {
        if (result.error === "slot_taken") {
          setSelectedSlot("");
          setMessage("Ese horario acaba de ocuparse. Elige otro disponible.");
          setRefreshKey((current) => current + 1);
        } else setMessage("No pudimos confirmar la reserva. Inténtalo de nuevo.");
        return;
      }
      setScheduledAt(result.scheduledAt);
      if (result.contactName) setContactName(result.contactName);
      setView("confirmed");
    } catch { setMessage("No pudimos confirmar la reserva. Revisa tu conexión e inténtalo de nuevo."); }
    finally { setBusy(false); }
  };

  return <main ref={pageRef} className="hero agenda-page">
    <div className="hero-scene agenda-scene" aria-hidden="true">
      <motion.div className="hero-stars" style={{ y: starsY, scale: starsScale }} />
      <motion.div className="hero-earth" style={{ y: earthY, scale: earthScale }} />
      <motion.div className="hero-astronaut" style={{ y: astronautY, scale: astronautScale }} animate={reduced ? undefined : { x: [0, 8, 0, -6, 0], rotate: [0, .45, 0, -.3, 0] }} transition={{ duration: 20, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }} />
    </div>
    <section className="agenda-content" aria-live="polite">
      {preview && <p className="preview-flag">VISTA PREVIA · HORARIOS FICTICIOS</p>}
      <Link className="gap-back" href={preview ? "/diagnostico?preview=1&result=medium" : "/diagnostico"}>← Volver al diagnóstico</Link>
      <div className="gap-intro"><Image className="gap-mark" src="/brand/starix-mark.png" alt="" width={294} height={295} sizes="48px" priority /><p className="section-index">AGENDA STARIX</p></div>
      {view === "missing" ? <div className="agenda-state"><h1>Primero completa tu diagnóstico.</h1><p>Así podremos preparar una conversación enfocada en tu proyecto.</p><Link className="gap-submit" href="/#contacto">Ir a contacto ↗</Link></div>
        : view === "confirmed" ? <div className="agenda-state">
          <p className="agenda-kicker">VIDEOLLAMADA AGENDADA</p>
          <h1>Nos vemos pronto{contactName ? <>, <span className="agenda-name">{contactName}.</span></> : "."}</h1>
          <p>{preview ? "Esta es una confirmación de vista previa; no se creó ninguna reserva." : "Tu videollamada quedó agendada. Revisaremos tu diagnóstico antes de conversar para aprovechar mejor el tiempo."}</p>
          <div className="agenda-confirmed-date">{scheduledAt && `${labelDate(scheduledAt)} · ${labelTime(scheduledAt)}`}<span>30 minutos · hora de Colombia</span></div>
          <Link href="/" className="gap-submit">Volver a STARIX ↗</Link>
        </div>
          : <div className="agenda-state"><p className="agenda-kicker">SIGUIENTE PASO · VIDEOLLAMADA</p><h1>Elige un momento para conversar.</h1><p>Una conversación de 30 minutos para revisar tu diagnóstico y definir los próximos pasos.</p><div className="agenda-summary"><span>30 minutos</span><span>Videollamada</span><span>Hora de Colombia</span></div>
            {view === "error" ? <div className="agenda-empty"><p>{message}</p><button type="button" className="gap-previous" onClick={() => setRefreshKey((current) => current + 1)}>Reintentar</button></div>
              : <><div className="agenda-month"><h2>{month ? labelMonth(month) : "Disponibilidad"}</h2><div><button type="button" aria-label="Mes anterior" disabled={monthOffset <= 0 || view === "loading"} onClick={() => setMonth((current) => addMonths(current, -1))}>←</button><button type="button" aria-label="Mes siguiente" disabled={monthOffset >= 5 || view === "loading"} onClick={() => setMonth((current) => addMonths(current, 1))}>→</button></div></div>
                {view === "loading" ? <p className="agenda-loading">Buscando horarios disponibles…</p> : days.length ? <><div className="agenda-days" aria-label="Fechas disponibles">{visibleDays.map((day) => <button type="button" key={day} className={day === selectedDay ? "is-selected" : ""} aria-pressed={day === selectedDay} onClick={() => { setSelectedDay(day); setSelectedSlot(""); setMessage(""); }}>{labelShortDate(`${day}T12:00:00-05:00`)}</button>)}</div>{days.length > 8 && <button type="button" className="agenda-more" onClick={() => setShowAllDays((value) => !value)}>{showAllDays ? "Ver menos fechas" : `Ver ${days.length - 8} fechas más`}</button>}<h2 className="agenda-time-heading">Horarios disponibles</h2><div className="agenda-times">{times.map((slot) => <button type="button" key={slot} className={slot === selectedSlot ? "is-selected" : ""} aria-pressed={slot === selectedSlot} onClick={() => { setSelectedSlot(slot); setMessage(""); }}>{labelTime(slot)}</button>)}</div>{selectedSlot && <div className="agenda-selection"><span>Tu elección</span><strong>{labelDate(selectedSlot)} · {labelTime(selectedSlot)}</strong></div>}{message && <p className="gap-error" role="alert">{message}</p>}<button type="button" className="gap-submit agenda-confirm" disabled={!selectedSlot || busy} onClick={() => void confirm()}>{busy ? "Confirmando…" : "Confirmar videollamada"} <span aria-hidden="true">↗</span></button></> : <p className="agenda-empty">No hay horarios libres este mes. Prueba el siguiente.</p>}</>}
          </div>}
    </section>
  </main>;
}
