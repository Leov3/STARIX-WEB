"use client";

import Link from "next/link";
import { IntegrationArchitectureExperience } from "./architecture-experiences";
import { motion, useReducedMotion } from "motion/react";
import { useRouteTransition } from "@/app/components/app-shell";

const ease = [0.76, 0, 0.24, 1] as const;
const connectionGroups = [
  { label: "SISTEMAS DE NEGOCIO", items: ["Odoo", "ERP y CRM"] },
  { label: "OPERACIÓN", items: ["Inventario y ventas", "Facturación"] },
  { label: "INTERCAMBIO DE DATOS", items: ["Integración de sistemas", "Migración de datos"] },
];
const integrationCapabilities = [
  { label: "CONNECT", items: ["APIs", "Integración de sistemas"] },
  { label: "SYNC", items: ["Odoo", "CRM", "ERP"] },
  { label: "OPERATE", items: ["Inventario", "Ventas", "Compras", "Facturación"] },
  { label: "EVOLVE", items: ["Migración", "Capacitación"] },
];

function SystemLabel({ children }: { children: React.ReactNode }) { return <span className="system-label">{children}</span>; }

function ExternalNode({ x, y, title, code, rectangular = false, active = false }: { x: number; y: number; title: string; code: string; rectangular?: boolean; active?: boolean }) {
  return rectangular ? <g><rect className={`connect-external-frame ${active ? "is-active" : ""}`} x={x - 37} y={y - 21} width="74" height="42" rx="2" /><text className="connect-node-code" x={x} y={y - 3}>{code}</text><text className="connect-node-label" x={x} y={y + 10}>{title}</text></g> : <g><circle className={`connect-node ${active ? "is-active" : ""}`} cx={x} cy={y} r="23" /><text className="connect-node-code" x={x} y={y - 3}>{code}</text><text className="connect-node-label" x={x} y={y + 10}>{title}</text></g>;
}

function ConnectHeroMap() {
  const reduced = useReducedMotion();
  const line = { hidden: { opacity: 0, pathLength: reduced ? 1 : 0 }, visible: { opacity: 1, pathLength: 1, transition: { duration: reduced ? 0 : .62, ease } } };
  const node = { hidden: { opacity: 0, scale: reduced ? 1 : .84 }, visible: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : .3, ease } } };
  return <motion.div className="connect-hero-map" aria-hidden="true" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .13, delayChildren: reduced ? 0 : .12 } } }}><svg viewBox="0 0 510 430" role="presentation"><text className="connect-annotation" x="24" y="30">CONNECT / 03</text><text className="connect-annotation connect-active" x="376" y="30">SYNC / ACTIVE</text><motion.g variants={node}><ExternalNode x={118} y={112} title="CRM" code="SYS / 01" rectangular /></motion.g><motion.g variants={node}><ExternalNode x={392} y={112} title="ERP" code="SYS / 02" rectangular /></motion.g><motion.g variants={node}><ExternalNode x={95} y={305} title="WEB" code="EXT / 01" /></motion.g><motion.g variants={node}><ExternalNode x={415} y={305} title="DATA" code="DATA / 04" /></motion.g><motion.path className="connect-line" d="M155 112L225 192 M355 112L285 192 M115 286L226 235 M395 286L284 235" variants={line} /><motion.g variants={node}><rect className="connect-core" x="205" y="181" width="100" height="64" rx="3" /><rect className="connect-core-inner" x="212" y="188" width="86" height="50" rx="2" /><text className="connect-core-kicker" x="255" y="207">SYSTEM</text><text className="connect-core-title" x="255" y="224">CORE</text><circle className="connect-core-dot" cx="255" cy="233" r="3" /></motion.g><motion.circle className="connect-signal" r="4" initial={{ opacity: 0 }} animate={reduced ? { opacity: 1, cx: 255, cy: 192 } : { opacity: [0, 1, 1, 0], cx: [155, 205, 305, 355], cy: [112, 170, 170, 112] }} transition={{ duration: reduced ? 0 : 4.9, delay: reduced ? 0 : 1.2, repeat: reduced ? 0 : Infinity, ease: "easeInOut" }} /></svg></motion.div>;
}

function ConnectionTopology() {
  const reduced = useReducedMotion();
  return <motion.div className="connection-topology" aria-hidden="true" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .3 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .12 } } }}><svg viewBox="0 0 470 360" role="presentation"><text className="connect-annotation" x="24" y="29">MAP / CONNECTIONS</text><motion.path className="connect-line" d="M235 74V130 M94 180H177 M293 180H376 M235 230V287" variants={{ hidden: { opacity: 0, pathLength: reduced ? 1 : 0 }, visible: { opacity: 1, pathLength: 1, transition: { duration: reduced ? 0 : .8, ease } } }} /><motion.g variants={{ hidden: { opacity: 0, scale: reduced ? 1 : .86 }, visible: { opacity: 1, scale: 1 } }}><ExternalNode x={235} y={52} title="BUSINESS" code="SYS / 01" /><ExternalNode x={72} y={180} title="DIGITAL" code="EXT / 02" /><ExternalNode x={398} y={180} title="COMMS" code="EXT / 03" /><ExternalNode x={235} y={310} title="DATA" code="DATA / 04" /><rect className="connect-core" x="177" y="130" width="116" height="100" rx="3" /><text className="connect-core-kicker" x="235" y="168">INTEGRATION</text><text className="connect-core-title" x="235" y="187">LAYER</text><circle className="connect-core-dot" cx="235" cy="204" r="3" /></motion.g></svg></motion.div>;
}

function FragmentedConnectedMap() {
  const reduced = useReducedMotion();
  const line = { hidden: { opacity: 0, pathLength: reduced ? 1 : 0 }, visible: { opacity: 1, pathLength: 1, transition: { duration: reduced ? 0 : .6, ease } } };
  return <motion.div className="fragmented-connected-map" aria-hidden="true" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .32 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .14 } } }}><svg viewBox="0 0 440 410" role="presentation"><text className="connect-annotation" x="24" y="28">STATUS / FRAGMENTED</text><text className="connect-annotation connect-active" x="286" y="28">CONNECTED</text><motion.g variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}><ExternalNode x={102} y={118} title="CRM" code="SYS / 01" /><ExternalNode x={338} y={118} title="ERP" code="SYS / 02" /><ExternalNode x={102} y={287} title="WEB" code="EXT / 01" /><ExternalNode x={338} y={287} title="DATA" code="DATA / 04" /></motion.g><motion.path className="connect-broken-line" d="M125 126H185 M255 126H315" variants={{ hidden: { opacity: reduced ? 1 : .26 }, visible: { opacity: .26, transition: { duration: reduced ? 0 : .35 } } }} /><motion.path className="connect-line is-active" d="M125 126L198 184 M315 126L242 184 M125 279L198 226 M315 279L242 226" variants={line} /><motion.g variants={{ hidden: { opacity: 0, scale: reduced ? 1 : .84 }, visible: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : .3, ease } } }}><circle className="connect-central-node" cx="220" cy="205" r="29" /><text className="connect-core-kicker" x="220" y="202">SYNC</text><text className="connect-core-title" x="220" y="216">CORE</text></motion.g><motion.circle className="connect-signal" r="4" initial={{ opacity: 0 }} whileInView={reduced ? { opacity: 1, cx: 220, cy: 205 } : { opacity: [0, 1, 1, 0], cx: [125, 175, 220, 265], cy: [126, 164, 205, 164] }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : 1.6, delay: reduced ? 0 : .72, ease: "easeInOut" }} /></svg></motion.div>;
}

function ConnectedPrincipleVisual() { return <div className="connected-principle-visual" aria-hidden="true"><span /><span /><span /><span /><span /><i /><b /></div>; }

export default function IntegrationsPage() {
  const { returnToCapabilities } = useRouteTransition();
  return <main className="capability-page capability-connect">
    <section className="capability-hero connect-hero"><div className="capability-hero-grid" aria-hidden="true" /><div className="page-shell capability-hero-inner"><Link className="capability-back" href="/#servicios" onClick={(event) => { event.preventDefault(); returnToCapabilities(); }}>← Volver a capacidades</Link><p className="capability-index">CAPABILITY / 03</p><h1><span>Implementaciones</span><span className="capability-hero-accent">e integraciones.</span></h1><p className="capability-hero-copy">Implementamos ERP, CRM y Odoo para que las herramientas trabajen como un solo sistema.</p><ConnectHeroMap /></div></section>

    <section id="connect-build" className="capability-section connect-build"><div className="page-shell"><p className="capability-index">01 / QUÉ CONECTAMOS</p><div className="connect-build-layout"><div><h2>Herramientas que comparten la misma realidad.</h2><p>Configuramos e integramos las plataformas que necesita tu operación, priorizando Odoo cuando ofrece la mejor base para crecer.</p></div><ConnectionTopology /></div><div className="connect-groups">{connectionGroups.map((group, index) => <article key={group.label}><SystemLabel>NETWORK / 0{index + 1}</SystemLabel><h3>{group.label}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div></div></section>

    <section id="connect-approach" className="capability-section connect-approach"><div className="page-shell connect-approach-layout"><div><p className="capability-index">02 / ENFOQUE</p><h2>Primero entendemos lo que ya funciona.</h2><p>Una implementación solo funciona cuando refleja cómo trabaja el negocio y deja espacio para evolucionar sin crear nueva fricción.</p><div className="connect-approach-list"><span>ENTENDER</span><span>CONECTAR</span><span>SIMPLIFICAR</span><span>REEMPLAZAR solo cuando es necesario</span></div></div><FragmentedConnectedMap /></div></section>

    <IntegrationArchitectureExperience />

    <section id="connect-capabilities" className="capability-section connect-capabilities"><div className="page-shell"><p className="capability-index">04 / CAPACIDADES</p><div className="connect-capabilities-head"><h2>La base para operar con claridad.</h2><p>Conexiones, sistemas y datos preparados para trabajar como una sola arquitectura.</p></div><div className="connect-capability-map"><div className="connect-capability-core"><SystemLabel>SYSTEM</SystemLabel><strong>CORE</strong><i /></div>{integrationCapabilities.map((group, index) => <article key={group.label} className={`connect-capability-${index + 1}`}><span>0{index + 1}</span><SystemLabel>{group.label}</SystemLabel><p>{group.items.join(" · ")}</p></article>)}</div></div></section>

    <section className="connect-principle"><div className="page-shell"><ConnectedPrincipleVisual /><p>No instalamos software y desaparecemos.<br /><span>Construimos una operación que el equipo puede usar.</span></p></div></section>
    <section className="capability-final-cta connect-final-cta"><div className="page-shell"><p className="capability-index">03 / 05</p><h2>¿Necesitas implementar un ERP?</h2><p>Revisemos si Odoo u otra integración es la base correcta para tu operación.</p><Link href="/#contacto" className="capability-cta">Empezar <span aria-hidden="true">↗</span></Link><span className="connect-cta-link" aria-hidden="true"><i /></span></div></section>
  </main>;
}
