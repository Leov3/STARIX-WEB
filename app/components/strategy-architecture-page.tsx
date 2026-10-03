"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useRouteTransition } from "@/app/components/app-shell";

const ease = [0.76, 0, 0.24, 1] as const;

const analysisDimensions = [
  { label: "PEOPLE", copy: "Roles, equipos y responsabilidades." },
  { label: "PROCESS", copy: "Pasos, dependencias y trabajo manual." },
  { label: "SYSTEMS", copy: "Herramientas, plataformas e integraciones." },
  { label: "DATA", copy: "Origen, movimiento y acceso." },
  { label: "EXPERIENCE", copy: "Cliente, usuario y operación." },
];

const strategyCapabilities = [
  { label: "DISCOVER", copy: "Contexto y levantamiento" },
  { label: "MAP", copy: "Procesos, sistemas y relaciones" },
  { label: "DIAGNOSE", copy: "Fricciones y redundancias" },
  { label: "PRIORITIZE", copy: "Oportunidades y dependencias" },
  { label: "ARCHITECT", copy: "Sistema objetivo" },
  { label: "PLAN", copy: "Fases y próximos pasos" },
];

function SystemLabel({ children }: { children: React.ReactNode }) {
  return <span className="system-label">{children}</span>;
}

function DirectNode({ x, y, label, code, target = false, frame = false }: { x: number; y: number; label: string; code?: string; target?: boolean; frame?: boolean }) {
  return <g>{frame ? <rect className={`direct-frame ${target ? "is-target" : ""}`} x={x - 38} y={y - 20} width="76" height="40" rx="2" /> : <circle className={`direct-node ${target ? "is-target" : ""}`} cx={x} cy={y} r="22" />}<text className="direct-node-code" x={x} y={y - 3}>{code}</text><text className="direct-node-label" x={x} y={y + 10}>{label}</text></g>;
}

function FrictionMarker({ x, y, label = "FRICTION / 02" }: { x: number; y: number; label?: string }) {
  return <g className="direct-friction"><path d={`M${x - 12} ${y}H${x - 4}L${x + 1} ${y - 7}L${x + 6} ${y + 7}L${x + 12} ${y}`} /><path d={`M${x - 1} ${y - 7}L${x + 3} ${y + 7}`} /><text x={x} y={y + 25}>{label}</text></g>;
}

function PriorityNode({ x, y, label = "PRIORITY / 01" }: { x: number; y: number; label?: string }) {
  const reduced = useReducedMotion();
  return <motion.g initial={{ opacity: 0, scale: reduced ? 1 : .72 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : .34, delay: reduced ? 0 : .94, ease }}><circle className="direct-priority-halo" cx={x} cy={y} r="15" /><circle className="direct-priority" cx={x} cy={y} r="6" /><text className="direct-priority-label" x={x} y={y + 29}>{label}</text></motion.g>;
}

function DirectHeroMap() {
  const reduced = useReducedMotion();
  const current = { hidden: { opacity: 0 }, visible: { opacity: reduced ? .42 : [.18, .9, .32], transition: { duration: reduced ? 0 : 1.18, delay: reduced ? 0 : .18, times: [0, .28, 1], ease } } };
  const target = { hidden: { opacity: 0, scale: reduced ? 1 : .96 }, visible: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : .55, delay: reduced ? 0 : 1.12, ease } } };
  return <motion.div className="direct-hero-map" aria-hidden="true" initial="hidden" animate="visible"><svg viewBox="0 0 560 470" role="presentation"><text className="direct-annotation" x="28" y="30">STATE / CURRENT</text><text className="direct-annotation is-gold" x="389" y="30">TARGET / SYSTEM</text><motion.g variants={current}><path className="direct-line is-current" d="M109 121L190 164 M190 164L138 250 M190 164L275 135 M275 135L321 211 M138 250L251 284" /><DirectNode x={88} y={110} label="CRM" code="SYS / 01" /><DirectNode x={275} y={120} label="DATA" code="DATA / 02" /><DirectNode x={132} y={262} label="SALES" code="OPS / 03" /><DirectNode x={319} y={221} label="MANUAL" code="PROC / 04" /><FrictionMarker x={214} y={183} /></motion.g><PriorityNode x={294} y={255} /><motion.g variants={target}><path className="direct-line is-target" d="M405 130H466 M405 130V212 M466 130V212 M405 212H466 M435 232V301" /><DirectNode x={405} y={130} label="INPUT" code="01" target /><DirectNode x={466} y={130} label="FLOW" code="02" target /><DirectNode x={405} y={212} label="DATA" code="03" target /><DirectNode x={466} y={212} label="CORE" code="04" target /><DirectNode x={435} y={323} label="ROADMAP" code="05" target frame /><path className="direct-decision-path" d="M294 261C340 275 351 321 397 323" /><text className="direct-route-label" x="347" y="302">DECISION PATH</text></motion.g></svg></motion.div>;
}

function CurrentSystemMap() {
  const reduced = useReducedMotion();
  const item = { hidden: { opacity: 0, scale: reduced ? 1 : .86 }, visible: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : .32, ease } } };
  return <motion.div className="current-system-map" aria-hidden="true" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .3 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .1 } } }}><svg viewBox="0 0 500 390" role="presentation"><text className="direct-annotation" x="24" y="28">SYSTEM / CURRENT</text><motion.path className="direct-line" d="M250 109V159 M133 230H208 M292 230H367 M250 270V326 M151 122L220 181 M349 122L280 181" variants={{ hidden: { opacity: 0, pathLength: reduced ? 1 : 0 }, visible: { opacity: 1, pathLength: 1, transition: { duration: reduced ? 0 : .75, ease } } }} /><motion.g variants={item}><DirectNode x={250} y={88} label="PEOPLE" code="01" /><DirectNode x={112} y={230} label="PROCESS" code="02" /><DirectNode x={388} y={230} label="SYSTEMS" code="03" /><DirectNode x={250} y={347} label="DATA" code="04" /><DirectNode x={250} y={230} label="CURRENT" code="SYSTEM" frame /><DirectNode x={250} y={147} label="EXPERIENCE" code="05" /></motion.g></svg></motion.div>;
}

function DiagnosticMap() {
  const reduced = useReducedMotion();
  const reveal = { hidden: { opacity: 0, pathLength: reduced ? 1 : 0 }, visible: { opacity: 1, pathLength: 1, transition: { duration: reduced ? 0 : .65, ease } } };
  return <motion.div className="diagnostic-map" aria-hidden="true" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .35 }}><svg viewBox="0 0 430 520" role="presentation"><text className="direct-annotation" x="22" y="30">DIAGNOSTIC / MAP</text><motion.path className="direct-diagnostic-route" d="M214 104V186 M214 254V337 M214 401V458" variants={reveal} /><motion.g initial={{ opacity: 0, scale: reduced ? 1 : .86 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : .3, delay: reduced ? 0 : .2, ease }}><DirectNode x={214} y={84} label="CONTEXT" code="01" frame /><DirectNode x={214} y={229} label="FRICTION" code="02" /><DirectNode x={214} y={380} label="DIRECTION" code="03" frame /></motion.g><FrictionMarker x={284} y={229} label="FRICTION / ACTIVE" /><PriorityNode x={214} y={308} label="PRIORITY / HIGH" /><path className="direct-direction-arrow" d="M214 440V466M207 459L214 466L221 459" /><text className="direct-route-label" x="239" y="466">NEXT DECISION</text></svg></motion.div>;
}

function TargetArchitectureMap() {
  const reduced = useReducedMotion();
  const line = { hidden: { opacity: 0, pathLength: reduced ? 1 : 0 }, visible: { opacity: 1, pathLength: 1, transition: { duration: reduced ? 0 : .78, ease } } };
  const node = { hidden: { opacity: 0, scale: reduced ? 1 : .86 }, visible: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : .3, ease } } };
  return <motion.div className="target-architecture-map" aria-hidden="true" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .22 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .1 } } }}><svg viewBox="0 0 940 560" role="presentation"><text className="direct-annotation" x="26" y="30">CURRENT / DIAGNOSED</text><text className="direct-annotation is-gold" x="650" y="30">TARGET / ARCHITECTURE</text><motion.g variants={node} className="direct-current-ghost"><DirectNode x={123} y={155} label="TOOLS" code="01" /><DirectNode x={243} y={220} label="DATA" code="02" /><DirectNode x={105} y={304} label="TEAM" code="03" /><FrictionMarker x={183} y={245} label="FRICTION" /></motion.g><motion.path className="direct-line is-current" d="M142 168L221 211 M219 235L124 291" variants={line} /><motion.path className="direct-decision-path" d="M292 254C375 254 405 196 482 196" variants={line} /><PriorityNode x={385} y={225} label="P1 / FIRST" /><motion.path className="direct-line is-target" d="M604 128V205 M530 251H604 M604 251H682 M604 297V372 M530 251L478 372 M682 251L730 372" variants={line} /><motion.g variants={node}><DirectNode x={604} y={108} label="CUSTOMER" code="01" target /><DirectNode x={509} y={251} label="FRONTEND" code="02" target frame /><DirectNode x={699} y={251} label="CRM" code="03" target frame /><DirectNode x={604} y={251} label="SYSTEM" code="CORE" target frame /><DirectNode x={469} y={392} label="DATA" code="04" target /><DirectNode x={604} y={392} label="ROADMAP" code="05" target frame /><DirectNode x={740} y={392} label="OPERATIONS" code="06" target /></motion.g><motion.path className="direct-roadmap-line" d="M476 478H604V512H740" variants={line} /><motion.g variants={node}><circle className="direct-roadmap-dot is-active" cx="476" cy="478" r="5" /><circle className="direct-roadmap-dot" cx="604" cy="478" r="5" /><circle className="direct-roadmap-dot" cx="604" cy="512" r="5" /><circle className="direct-roadmap-dot" cx="740" cy="512" r="5" /><text className="direct-roadmap-label" x="476" y="500">01 / FOUNDATION</text><text className="direct-roadmap-label" x="604" y="470">02 / CONNECT</text><text className="direct-roadmap-label" x="604" y="536">03 / BUILD</text><text className="direct-roadmap-label" x="740" y="536">04 / EVOLVE</text></motion.g></svg></motion.div>;
}

function DecisionCapabilityMap() {
  return <div className="decision-capability-map" aria-label="Capacidades estratégicas"><span className="decision-capability-route" aria-hidden="true" />{strategyCapabilities.map((capability, index) => <article key={capability.label} className={index === 3 ? "is-priority" : undefined}><span>0{index + 1}</span><SystemLabel>{capability.label}</SystemLabel><p>{capability.copy}</p></article>)}</div>;
}

function StrategyPrincipleVisual() {
  return <div className="strategy-principle-visual" aria-hidden="true"><span>TOOL</span><i>?</i><b><em />SYSTEM</b><small>RELATIONS / FIRST</small></div>;
}

export default function StrategyArchitecturePage() {
  const { returnToCapabilities } = useRouteTransition();
  return <main className="capability-page capability-direct">
    <section className="capability-hero direct-hero"><div className="capability-hero-grid" aria-hidden="true" /><div className="page-shell capability-hero-inner"><Link className="capability-back" href="/#servicios" onClick={(event) => { event.preventDefault(); returnToCapabilities(); }}>← Volver a capacidades</Link><p className="capability-index">CAPABILITY / 05</p><h1><span>Estrategia y</span><span>arquitectura</span><span className="capability-hero-accent">digital.</span></h1><p className="capability-hero-copy">Definimos qué construir, qué conectar y qué debe cambiar antes de elegir una herramienta.</p><DirectHeroMap /></div></section>

    <section className="capability-section direct-current"><div className="page-shell"><p className="capability-index">01 / QUÉ ANALIZAMOS</p><div className="direct-current-layout"><div><h2>Todo lo que afecta una decisión.</h2><p>Observamos el sistema completo para distinguir las relaciones que importan de los síntomas que solo ocupan tiempo.</p></div><CurrentSystemMap /></div><div className="direct-dimension-list">{analysisDimensions.map((dimension, index) => <article key={dimension.label}><span>0{index + 1}</span><SystemLabel>{dimension.label}</SystemLabel><p>{dimension.copy}</p></article>)}</div></div></section>

    <section className="capability-section direct-approach"><div className="page-shell direct-approach-layout"><div><p className="capability-index">02 / ENFOQUE</p><h2>Claridad antes de construir.</h2><p>No empezamos con una solución predeterminada. Entendemos el contexto, encontramos la fricción y definimos la dirección que debe ocurrir después.</p></div><DiagnosticMap /></div></section>

    <section className="capability-section direct-architecture"><div className="page-shell"><p className="capability-index">03 / ARQUITECTURA Y ROADMAP</p><h2>De complejidad a una ruta accionable.</h2><TargetArchitectureMap /></div></section>

    <section className="capability-section direct-capabilities"><div className="page-shell"><p className="capability-index">04 / CAPACIDADES</p><div className="direct-capabilities-head"><h2>Decisiones que conectan negocio y tecnología.</h2><p>Un sistema de trabajo para comprender el presente, ordenar las dependencias y decidir el siguiente movimiento.</p></div><DecisionCapabilityMap /></div></section>

    <section className="direct-principle"><div className="page-shell"><StrategyPrincipleVisual /><p>La tecnología no corrige una dirección confusa.<br /><span>Primero diseñamos el sistema correcto.</span></p></div></section>
    <section className="capability-final-cta direct-final-cta"><div className="page-shell"><p className="capability-index">05 / 05</p><h2>¿Necesitas ordenar lo que sigue?</h2><p>Empecemos por entender tu operación y convertirla en una dirección clara.</p><Link href="/#contacto" className="capability-cta">Empezar <span aria-hidden="true">↗</span></Link></div></section>
  </main>;
}
