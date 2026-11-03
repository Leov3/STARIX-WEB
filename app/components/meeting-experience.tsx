"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Screen = "loading" | "missing" | "prejoin" | "connecting" | "meeting" | "ended" | "error";
type SessionPayload = { ok?: boolean; room?: string; jwt?: string; role?: "client" | "staff"; contactName?: string; scheduledAt?: string; name?: string; domain?: string };
type JitsiApi = {
  addEventListener: (event: string, listener: () => void) => void;
  dispose: () => void;
};
type JitsiConstructor = new (domain: string, options: Record<string, unknown>) => JitsiApi;
declare global {
  interface Window { JitsiMeetExternalAPI?: JitsiConstructor }
}

const dateLabel = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true,
});
const previewScreens = [
  { label: "Confirmación", href: "/agenda?preview=1&estado=confirmada" },
  { label: "Antes de entrar", href: "/reunion?preview=1" },
  { label: "Sala de espera", href: "/reunion?preview=1&estado=espera" },
  { label: "En llamada", href: "/reunion?preview=1&estado=llamada" },
  { label: "Cierre", href: "/reunion?preview=1&estado=cierre" },
];

function loadJitsiScript(domain: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) { resolve(); return; }
    const existing = document.querySelector<HTMLScriptElement>('script[data-starix-jitsi="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("script_failed")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.dataset.starixJitsi = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("script_failed"));
    document.head.appendChild(script);
  });
}

export default function MeetingExperience() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [name, setName] = useState("María");
  const [deviceMessage, setDeviceMessage] = useState("");
  const [deviceReady, setDeviceReady] = useState(false);
  const [preview, setPreview] = useState(false);
  const [room, setRoom] = useState("");
  const [jwt, setJwt] = useState("");
  const [domain, setDomain] = useState("meet.starix.tech");
  const [role, setRole] = useState<"client" | "staff">("client");
  const [scheduledAt, setScheduledAt] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const date = scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 86_400_000);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "1") {
      setPreview(true);
      setRole(params.get("rol") === "colaborador" ? "staff" : "client");
      setScreen(({ espera: "connecting", llamada: "meeting", cierre: "ended" } as Record<string, Screen>)[params.get("estado") || ""] || "prejoin");
    } else {
      void (async () => {
        try {
          const response = await fetch("/api/jitsi/session", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientCode: params.get("acceso") || undefined }),
            cache: "no-store",
          });
          const data = await response.json() as SessionPayload;
          if (!response.ok || !data.ok || !data.room || !data.jwt || !data.scheduledAt || !data.role) { setScreen("missing"); return; }
          setRoom(data.room); setJwt(data.jwt); setRole(data.role); setScheduledAt(data.scheduledAt); setDomain(data.domain || "meet.starix.tech");
          setName(data.name || data.contactName || "Invitado STARIX");
          setScreen("prejoin");
        } catch { setScreen("error"); }
      })();
    }
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      apiRef.current?.dispose();
    };
  }, []);

  const checkDevices = async () => {
    if (preview) { setDeviceMessage("En la reunión real podrás comprobar la cámara y el micrófono antes de entrar."); return; }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setDeviceMessage("Comprobando cámara y micrófono…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setDeviceReady(true);
      setDeviceMessage("Cámara y micrófono listos.");
    } catch {
      setDeviceReady(false);
      setDeviceMessage("No pudimos acceder a la cámara o al micrófono. Revisa los permisos del navegador; también podrás entrar sin video.");
    }
  };

  const enter = async () => {
    if (preview) { setScreen("connecting"); return; }
    if (!room || !jwt || !frameRef.current) return;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScreen("connecting");
    try {
      await loadJitsiScript(domain);
      if (!window.JitsiMeetExternalAPI || !frameRef.current) throw new Error("api_missing");
      const api = new window.JitsiMeetExternalAPI(domain, {
        roomName: room,
        jwt,
        parentNode: frameRef.current,
        width: "100%",
        height: "100%",
        lang: "es",
        userInfo: { displayName: role === "staff" ? name : (name.trim() || "Invitado STARIX") },
        configOverwrite: { prejoinConfig: { enabled: false }, startWithAudioMuted: !deviceReady, startWithVideoMuted: !deviceReady },
        interfaceConfigOverwrite: { APP_NAME: "STARIX", PROVIDER_NAME: "STARIX" },
      });
      apiRef.current = api;
      api.addEventListener("videoConferenceJoined", () => setScreen("meeting"));
      api.addEventListener("readyToClose", () => setScreen("ended"));
      api.addEventListener("videoConferenceLeft", () => setScreen("ended"));
    } catch {
      setScreen("error");
    }
  };

  return <main className={`hero meeting-page${screen === "connecting" || screen === "meeting" ? " meeting-page-active" : ""}`}>
    <div className="hero-scene meeting-scene" aria-hidden="true"><div className="hero-stars" /><div className="hero-earth" /><div className="hero-astronaut" /></div>
    <section className="meeting-content" aria-live="polite">
      {preview && <><p className="preview-flag">VISTA PREVIA · SIN RESERVA NI CONEXIÓN REAL</p><nav className="meeting-preview-nav" aria-label="Pantallas de la videollamada">{previewScreens.map((item) => <Link key={item.href} href={item.href} aria-current={item.href === `/reunion?preview=1${screen === "connecting" ? "&estado=espera" : screen === "meeting" ? "&estado=llamada" : screen === "ended" ? "&estado=cierre" : ""}` ? "page" : undefined}>{item.label}</Link>)}</nav></>}
      <div className="meeting-intro"><Image src="/brand/starix-mark.png" alt="" width={48} height={48} /><p className="section-index">REUNIONES STARIX</p></div>
      {screen === "loading" ? <p className="meeting-muted">Preparando tu espacio…</p> : null}
      {screen === "missing" ? <div className="meeting-panel"><p className="agenda-kicker">ACCESO PRIVADO</p><h1>Tu reunión empieza con una invitación.</h1><p>Abre el enlace asociado a tu reserva para entrar a la videollamada.</p><Link className="gap-submit" href="/">Volver a STARIX ↗</Link></div> : null}
      {screen === "prejoin" ? <div className="meeting-panel"><p className="agenda-kicker">TU VIDEOLLAMADA</p><h1>Un espacio para conversar sobre tu proyecto.</h1><p>{role === "staff" ? "Revisa el diagnóstico de la oportunidad antes de comenzar y admite al cliente cuando llegue." : "Nos encontraremos para revisar tu diagnóstico y decidir juntos el siguiente paso."}</p><div className="meeting-details"><span>{role === "staff" ? "Colaborador" : "Invitado"}</span><strong>{name.trim() || "Invitado STARIX"}</strong><span>Horario</span><strong>{dateLabel.format(date)} · hora de Colombia</strong></div>{role === "client" && <><label className="meeting-label" htmlFor="meeting-name">Tu nombre</label><input id="meeting-name" className="meeting-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} autoComplete="name" /></>}<div className="meeting-device"><video ref={videoRef} autoPlay muted playsInline aria-label="Vista previa de tu cámara" /><div><strong>Antes de entrar</strong><p>Comprueba tu cámara y micrófono. Puedes continuar si prefieres entrar sin video.</p><button type="button" className="gap-previous" onClick={() => void checkDevices()}>Probar dispositivos</button>{deviceMessage && <p className="meeting-device-message" role="status">{deviceMessage}</p>}</div></div><button type="button" className="gap-submit meeting-join" onClick={() => void enter()}>{preview ? "Ver acceso de prueba" : "Entrar a la sala"} <span aria-hidden="true">↗</span></button></div> : null}
      {screen === "connecting" || screen === "meeting" ? <div className="meeting-call"><div className="meeting-call-heading"><div><p className="agenda-kicker">VIDEOLLAMADA STARIX</p><h1>{screen === "connecting" ? (role === "client" ? "Solicita entrar y espera al anfitrión." : "Tu cliente espera para entrar.") : "Ya estás en la sala."}</h1></div><span>30 minutos · hora de Colombia</span></div><div className="meeting-frame" ref={frameRef} aria-label="Videollamada STARIX">{preview && (screen === "connecting" ? <div className="meeting-preview-wait"><span className="meeting-preview-symbol" aria-hidden="true">✦</span><p className="agenda-kicker">SALA PRIVADA</p><h2>{role === "client" ? "Estamos esperando a tu anfitrión." : "Tu invitado espera tu aprobación."}</h2><p>{role === "client" ? "Cuando un colaborador de STARIX esté listo, te permitirá entrar a la llamada." : "Revisa el diagnóstico en Odoo y admite a la persona cuando estés listo."}</p><button type="button" className="gap-submit" onClick={() => setScreen("meeting")}>{role === "client" ? "Simular admisión" : "Admitir invitado"} ↗</button></div> : <div className="meeting-preview-call"><div className="meeting-preview-status"><span>● En llamada</span><span>Simulación visual · 30 min</span></div><div className="meeting-preview-tiles"><div className="meeting-preview-tile"><span className="meeting-preview-avatar">S</span><span>Colaborador STARIX</span></div><div className="meeting-preview-tile"><span className="meeting-preview-avatar">M</span><span>María · Invitada</span></div></div><div className="meeting-preview-controls"><span>Micrófono</span><span>Cámara</span><span>Compartir</span><span>Participantes</span><button type="button" onClick={() => setScreen("ended")}>Finalizar vista previa</button></div></div>)}</div></div> : <div className="meeting-frame-hidden" ref={frameRef} />}
      {screen === "error" ? <div className="meeting-panel"><p className="agenda-kicker">NO PUDIMOS CONECTAR</p><h1>Volvamos a intentarlo.</h1><p>Comprueba tu conexión y vuelve a entrar a la sala.</p><button type="button" className="gap-submit" onClick={() => void enter()}>Reintentar ↗</button></div> : null}
      {screen === "ended" ? <div className="meeting-panel"><p className="agenda-kicker">CONVERSACIÓN FINALIZADA</p><h1>Gracias por conversar con STARIX.</h1><p>Revisaremos los próximos pasos y daremos seguimiento a lo acordado.</p><Link className="gap-submit" href="/">Volver a STARIX ↗</Link></div> : null}
    </section>
  </main>;
}
