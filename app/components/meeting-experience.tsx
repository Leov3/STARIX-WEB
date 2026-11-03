"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Screen = "loading" | "missing" | "prejoin" | "connecting" | "meeting" | "ended" | "error";
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

function loadJitsiScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) { resolve(); return; }
    const existing = document.querySelector<HTMLScriptElement>('script[data-starix-jitsi="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("script_failed")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://meet.starix.tech/external_api.js";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const date = new Date(Date.now() + 86_400_000);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("preview") === "1") {
      setPreview(true);
      setRoom(`StarixPreview${crypto.randomUUID().replace(/-/g, "")}`);
      setScreen("prejoin");
    } else setScreen("missing");
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      apiRef.current?.dispose();
    };
  }, []);

  const checkDevices = async () => {
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
    if (!room || !frameRef.current) return;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScreen("connecting");
    try {
      await loadJitsiScript();
      if (!window.JitsiMeetExternalAPI || !frameRef.current) throw new Error("api_missing");
      const api = new window.JitsiMeetExternalAPI("meet.starix.tech", {
        roomName: room,
        parentNode: frameRef.current,
        width: "100%",
        height: "100%",
        lang: "es",
        userInfo: { displayName: name.trim() || "Invitado STARIX" },
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
      {preview && <p className="preview-flag">VISTA PREVIA · REUNIÓN DE PRUEBA</p>}
      <div className="meeting-intro"><Image src="/brand/starix-mark.png" alt="" width={48} height={48} /><p className="section-index">REUNIONES STARIX</p></div>
      {screen === "loading" ? <p className="meeting-muted">Preparando tu espacio…</p> : null}
      {screen === "missing" ? <div className="meeting-panel"><p className="agenda-kicker">ACCESO PRIVADO</p><h1>Tu reunión empieza con una invitación.</h1><p>Abre el enlace asociado a tu reserva para entrar a la videollamada.</p><Link className="gap-submit" href="/">Volver a STARIX ↗</Link></div> : null}
      {screen === "prejoin" ? <div className="meeting-panel"><p className="agenda-kicker">TU VIDEOLLAMADA</p><h1>Un espacio para conversar sobre tu proyecto.</h1><p>Nos encontraremos para revisar tu diagnóstico y decidir juntos el siguiente paso.</p><div className="meeting-details"><span>Invitado</span><strong>{name.trim() || "Invitado STARIX"}</strong><span>Horario</span><strong>{dateLabel.format(date)} · hora de Colombia</strong></div><label className="meeting-label" htmlFor="meeting-name">Tu nombre</label><input id="meeting-name" className="meeting-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} autoComplete="name" /><div className="meeting-device"><video ref={videoRef} autoPlay muted playsInline aria-label="Vista previa de tu cámara" /><div><strong>Antes de entrar</strong><p>Comprueba tu cámara y micrófono. Puedes continuar si prefieres entrar sin video.</p><button type="button" className="gap-previous" onClick={() => void checkDevices()}>Probar dispositivos</button>{deviceMessage && <p className="meeting-device-message" role="status">{deviceMessage}</p>}</div></div><button type="button" className="gap-submit meeting-join" onClick={() => void enter()}>Entrar a la sala <span aria-hidden="true">↗</span></button></div> : null}
      {screen === "connecting" || screen === "meeting" ? <div className="meeting-call"><div className="meeting-call-heading"><div><p className="agenda-kicker">VIDEOLLAMADA STARIX</p><h1>{screen === "connecting" ? "Conectando con tu sala…" : "Ya estás en la sala."}</h1></div><span>30 minutos · hora de Colombia</span></div><div className="meeting-frame" ref={frameRef} aria-label="Videollamada STARIX" /></div> : <div className="meeting-frame-hidden" ref={frameRef} />}
      {screen === "error" ? <div className="meeting-panel"><p className="agenda-kicker">NO PUDIMOS CONECTAR</p><h1>Volvamos a intentarlo.</h1><p>Comprueba tu conexión y vuelve a entrar a la sala.</p><button type="button" className="gap-submit" onClick={() => void enter()}>Reintentar ↗</button></div> : null}
      {screen === "ended" ? <div className="meeting-panel"><p className="agenda-kicker">CONVERSACIÓN FINALIZADA</p><h1>Gracias por conversar con STARIX.</h1><p>Revisaremos los próximos pasos y daremos seguimiento a lo acordado.</p><Link className="gap-submit" href="/">Volver a STARIX ↗</Link></div> : null}
    </section>
  </main>;
}
