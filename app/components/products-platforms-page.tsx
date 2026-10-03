"use client";

import Link from "next/link";
import { ProductArchitectureExperience } from "./architecture-experiences";
import { motion, useReducedMotion } from "motion/react";
import { useRouteTransition } from "@/app/components/app-shell";

const ease = [0.76, 0, 0.24, 1] as const;
const buildGroups = [
  { label: "PRODUCTOS DIGITALES", items: ["SaaS", "Aplicaciones web", "Plataformas"] },
  { label: "EXPERIENCIAS WEB", items: ["Sitios corporativos", "Portales", "E-commerce"] },
  { label: "HERRAMIENTAS INTERNAS", items: ["Sistemas internos", "Dashboards", "Portales operativos"] },
];
const capabilityLayers = [
  { label: "EXPERIENCIA", items: "UX / UI · Frontend" },
  { label: "SISTEMA", items: "Backend · APIs · Bases de datos · Autenticación" },
  { label: "CONEXIÓN", items: "Integraciones · Automatizaciones" },
  { label: "OPERACIÓN", items: "Analítica · Infraestructura · Despliegue · Administración" },
];

function SystemLabel({ children }: { children: React.ReactNode }) {
  return <span className="system-label">{children}</span>;
}

function ProductSystemVisual() {
  const reduced = useReducedMotion();
  return <motion.div className="product-system-visual" aria-hidden="true" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .12, delayChildren: reduced ? 0 : .18 } } }}>
    <SystemLabel>PRODUCTO / SISTEMA</SystemLabel>
    <motion.div className="product-system-frame" variants={{ hidden: { opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : .98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: reduced ? 0 : .55, ease } } }}>
      {["EXPERIENCIA", "APLICACIÓN", "API / LÓGICA", "DATOS", "INTEGRACIONES"].map((layer, index) => <motion.div className={`product-system-layer ${index === 2 ? "is-active" : ""}`} key={layer} variants={{ hidden: { opacity: 0, x: reduced ? 0 : 10 }, visible: { opacity: 1, x: 0, transition: { duration: reduced ? 0 : .38, ease } } }}><span>{layer}</span>{index === 2 && <i />}</motion.div>)}
    </motion.div>
    <motion.span className="product-system-connection connection-one" variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: reduced ? 0 : .5, ease } } }} />
    <motion.span className="product-system-connection connection-two" variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: reduced ? 0 : .5, ease } } }} />
    <SystemLabel>ESTADO / ACTIVO</SystemLabel>
  </motion.div>;
}

function ApproachDiagram() {
  const reduced = useReducedMotion();
  const draw = { initial: { pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }, whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true }, transition: { duration: reduced ? 0 : .65, ease } };
  const node = (x: number, y: number, label: string, delay: number, driftX: number, driftY: number) => <motion.g key={label} initial={{ opacity: 0, scale: reduced ? 1 : .88 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : .28, delay: reduced ? 0 : delay, ease }}><motion.g animate={reduced ? undefined : { x: [0, driftX, 0], y: [0, driftY, 0] }} transition={reduced ? undefined : { duration: 4.8 + delay * 3, repeat: Infinity, ease: "easeInOut" }}><circle className="diagram-node" cx={x} cy={y} r="30" /><text className="diagram-node-text" x={x} y={y + 2}>{label}</text></motion.g></motion.g>;
  return <motion.div className="system-diagram approach-diagram" aria-hidden="true" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: .4 }} transition={{ duration: reduced ? 0 : .3 }}>
    <svg viewBox="0 0 400 330" role="presentation">
      <text className="diagram-annotation is-accent" x="20" y="28">CONEXIÓN / MODELO</text><text className="diagram-annotation" x="310" y="28">SIS.02</text>
      <motion.ellipse className="diagram-orbit" cx="200" cy="180" rx="129" ry="104" {...draw} />
      <motion.line className="diagram-connection" x1="200" y1="142" x2="200" y2="106" {...draw} transition={{ duration: reduced ? 0 : .42, delay: reduced ? 0 : .14, ease }} />
      <motion.line className="diagram-connection" x1="171" y1="197" x2="117" y2="227" {...draw} transition={{ duration: reduced ? 0 : .42, delay: reduced ? 0 : .22, ease }} />
      <motion.line className="diagram-connection" x1="229" y1="197" x2="283" y2="227" {...draw} transition={{ duration: reduced ? 0 : .42, delay: reduced ? 0 : .3, ease }} />
      {node(200, 76, "NEGOCIO", .04, 2, -4)}
      {node(90, 242, "USUARIO", .13, -3, 3)}
      {node(310, 242, "SISTEMA", .22, 3, 2)}
      <motion.image className="diagram-brand-mark" href="/brand/starix-mark.png" x="162" y="142" width="76" height="76" initial={{ opacity: 0, scale: reduced ? 1 : .82 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : .34, delay: reduced ? 0 : .3, ease }} />
      <text className="diagram-caption" x="200" y="305">NEGOCIO · USUARIO · SISTEMA</text>
    </svg>
  </motion.div>;
}

function FinalSystemVisual() {
  const reduced = useReducedMotion();
  const reveal = { hidden: { opacity: 0, scale: reduced ? 1 : .92 }, visible: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : .4, ease } } };
  return <motion.div className="final-system-visual" aria-hidden="true" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .45 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .12 } } }}>
    <svg viewBox="0 0 400 330" role="presentation">
      <motion.g className="final-wireframe-back" variants={reveal}><rect x="72" y="35" width="255" height="205" rx="3" /><path d="M72 65H327" /><circle cx="91" cy="50" r="3" /><circle cx="103" cy="50" r="3" /><path d="M128 50H210" /></motion.g>
      <motion.g className="final-wireframe-main" variants={reveal}><rect x="42" y="66" width="285" height="210" rx="3" /><path d="M42 96H327 M128 96V276" /><circle cx="61" cy="81" r="3" /><circle cx="73" cy="81" r="3" /><path d="M97 81H164" /><rect x="60" y="117" width="48" height="10" rx="2" /><path d="M60 147H108 M60 160H100 M60 187H108 M60 200H94 M60 227H108" /></motion.g>
      <motion.g className="final-wireframe-content" variants={reveal}><rect x="149" y="117" width="142" height="48" rx="2" /><path d="M164 136H232 M164 149H208" /><rect x="149" y="181" width="66" height="71" rx="2" /><rect x="226" y="181" width="65" height="31" rx="2" /><rect x="226" y="222" width="65" height="30" rx="2" /></motion.g>
      <motion.g className="final-wireframe-active" variants={reveal}><rect x="238" y="193" width="17" height="7" rx="2" /><circle cx="278" cy="196.5" r="3" /><path d="M164 229H200" /></motion.g>
      <motion.path className="final-wireframe-signal" d="M336 131H365 M350 117V145" variants={reveal} />
    </svg>
  </motion.div>;
}

export default function ProductsPlatformsPage() {
  const { returnToCapabilities } = useRouteTransition();
  const reduced = useReducedMotion();

  return <main className="capability-page capability-products">
    <section className="capability-hero product-hero">
      <div className="capability-hero-grid" aria-hidden="true" />
      <div className="page-shell capability-hero-inner">
        <Link className="capability-back" href="/#servicios" onClick={(event) => { event.preventDefault(); returnToCapabilities(); }}>← Volver a capacidades</Link>
        <p className="capability-index">CAPABILITY / 01</p>
        <h1>Productos y<br />plataformas<br /><span className="capability-hero-accent">digitales.</span></h1>
        <p className="capability-hero-copy">Diseñamos y construimos productos digitales alrededor de objetivos reales de negocio.</p>
        <ProductSystemVisual />
      </div>
    </section>

    <section className="capability-section capability-build product-build"><div className="page-shell">
      <p className="capability-index">01 / QUÉ CONSTRUIMOS</p>
      <div className="capability-section-head"><h2>Productos digitales que tienen un trabajo que hacer.</h2><p>No partimos de una lista de entregables. Partimos de lo que el negocio necesita activar, simplificar o hacer posible.</p></div>
      <div className="build-modules">{buildGroups.map((group, index) => <motion.article className={`system-frame build-module build-module-${index + 1}`} key={group.label} initial={{ opacity: 0, y: reduced ? 0 : 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: reduced ? 0 : .42, delay: reduced ? 0 : index * .1, ease }}><SystemLabel>MÓDULO / 0{index + 1}</SystemLabel><h3>{group.label}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></motion.article>)}</div>
    </div></section>

    <section id="product-approach" className="capability-section capability-approach product-approach"><div className="page-shell product-approach-layout">
      <ApproachDiagram />
      <div><p className="capability-index">02 / ENFOQUE</p><h2>No empezamos por la interfaz.</h2><div className="capability-approach-copy"><p>Primero definimos qué necesita hacer el producto, quién lo utiliza y cómo se conecta con el resto del negocio.</p><div className="capability-triad"><article><span>01</span><h3>Negocio</h3><p>Qué debe resolver.</p></article><article><span>02</span><h3>Usuario</h3><p>Quién lo utiliza y qué necesita.</p></article><article><span>03</span><h3>Sistema</h3><p>Con qué procesos, datos y herramientas debe conectarse.</p></article></div></div></div>
    </div></section>

    <ProductArchitectureExperience />

    <section className="capability-section capability-includes product-layers"><div className="page-shell capability-two-column"><div><p className="capability-index">04 / CAPACIDADES</p><h2>Lo necesario para construir el producto completo.</h2></div><div className="layer-stack">{capabilityLayers.map((layer, index) => <motion.article className={`system-frame layer-frame layer-frame-${index + 1}`} key={layer.label} initial={{ opacity: 0, x: reduced ? 0 : 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: reduced ? 0 : .4, delay: reduced ? 0 : index * .09, ease }}><SystemLabel>CAPA / 0{index + 1}</SystemLabel><h3>{layer.label}</h3><p>{layer.items}</p></motion.article>)}</div></div></section>

    <section className="capability-principle product-principle"><div className="page-shell"><p>No construimos funcionalidades porque sí.<br /><span>Construimos lo que el sistema necesita.</span></p></div></section>

    <section id="product-cta" className="capability-final-cta product-final-cta"><div className="page-shell"><p className="capability-index">01 / 05</p><h2>¿Tienes algo que construir?</h2><p>Cuéntanos qué quieres resolver. Nosotros empezamos por entender el sistema.</p><Link href="/#contacto" className="capability-cta">Empezar <span aria-hidden="true">↗</span></Link><FinalSystemVisual /></div></section>
  </main>;
}
