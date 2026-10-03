"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useRouteTransition } from "@/app/components/app-shell";

const ease = [0.76, 0, 0.24, 1] as const;
const automationGroups = [
  { label: "OPERACIÓN", items: ["Automatización de procesos", "Flujos de aprobación"] },
  { label: "INFORMACIÓN", items: ["Captura y clasificación de datos", "Reportes automáticos"] },
  { label: "IA APLICADA", items: ["Asistentes con IA"] },
  { label: "CONEXIÓN", items: ["Integraciones operativas"] },
];
const capabilityGroups = [
  { label: "TRIGGERS", items: ["APIs", "Webhooks", "Validaciones"] },
  { label: "LÓGICA", items: ["Mapeo de procesos", "Documentación"] },
  { label: "INTELIGENCIA", items: ["IA generativa", "OCR"] },
  { label: "ACCIONES", items: ["Notificaciones", "Dashboards"] },
];

function SystemLabel({ children }: { children: React.ReactNode }) { return <span className="system-label">{children}</span>; }

function FlowSignal({ path, duration, delay = 0, radius = 4 }: { path: string; duration: number; delay?: number; radius?: number }) {
  return <circle className="flow-signal" r={radius} fill="#c8a24a" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.08;.18;.78;.9;1" dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" /><animateMotion path={path} dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" /></circle>;
}

function ApproachSignal({ path, duration, delay = 0, radius = 4 }: { path: string; duration: number; delay?: number; radius?: number }) {
  return <circle className="approach-flow-signal" r={radius} fill="#c8a24a" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.08;.18;.78;.9;1" dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" /><animateMotion path={path} dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" /></circle>;
}

function AutomationFlow() {
  const reduced = useReducedMotion();
  const draw = { hidden: { pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduced ? 0 : 1.05, ease }, opacity: { duration: reduced ? 0 : .3, delay: reduced ? 0 : .75 } } } };
  const node = { hidden: { opacity: 0, scale: reduced ? 1 : .86 }, visible: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : .3, ease } } };
  const gear = (x: number, y: number) => (
    <g>
      <circle className="automation-flow-badge" cx={x} cy={y} r="13" />
      <g className="automation-flow-icon" transform={`translate(${x} ${y})`}>
        <circle cx="0" cy="0" r="3.6" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step) => { const angle = step * Math.PI / 4; return <line key={step} x1={Math.cos(angle) * 5.4} y1={Math.sin(angle) * 5.4} x2={Math.cos(angle) * 7.8} y2={Math.sin(angle) * 7.8} />; })}
      </g>
    </g>
  );
  const thought = (x: number, y: number) => (
    <g>
      <circle className="automation-flow-badge" cx={x} cy={y} r="13" />
      <g className="automation-flow-icon" transform={`translate(${x} ${y})`}>
        <circle cx="-1" cy="-3" r="5.4" />
        <circle cx="3.8" cy="5" r="1.8" fill="rgba(247,247,242,.72)" stroke="none" />
        <circle cx="7.6" cy="8.8" r="1.1" fill="rgba(247,247,242,.72)" stroke="none" />
      </g>
    </g>
  );
  const cloud = (x: number, y: number, scale: number) => (
    <g transform={`translate(${x - 3.5 * scale} ${y + 5.5 * scale}) scale(${scale})`}>
      <circle cx="-8" cy="-1" r="12" /><circle cx="5" cy="-7" r="15" /><circle cx="16" cy="1" r="10" /><rect x="-19" y="1" width="36" height="10" rx="5" />
    </g>
  );
  return (
    <motion.div className="automation-flow" aria-hidden="true" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .08 } } }}>
      <svg viewBox="0 0 1440 460" role="presentation">
        <defs>
          <marker id="automation-flow-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path className="automation-flow-arrowhead" d="M0 0L10 5L0 10Z" /></marker>
          <radialGradient id="automation-flow-ai-grad"><stop offset="0%" stopColor="#efd894" /><stop offset="100%" stopColor="#c8a24a" /></radialGradient>
          <radialGradient id="automation-flow-ai-halo"><stop offset="0%" stopColor="#c8a24a" stopOpacity=".55" /><stop offset="55%" stopColor="#c8a24a" stopOpacity=".16" /><stop offset="100%" stopColor="#c8a24a" stopOpacity="0" /></radialGradient>
        </defs>
        <text className="flow-annotation" x="14" y="26">FLOW / AUTOMATIZACIÓN</text>
        <text className="flow-annotation flow-active" x="1180" y="26">STATUS / ACTIVO</text>
        <motion.path className="flow-line" d="M14 230H41 M77 230H110 M202 230H274" markerEnd="url(#automation-flow-arrow)" variants={draw} />
        <motion.path className="flow-line" d="M364 196C460 196 468 88 530 88 M384 230H530 M364 264C460 264 468 372 526 372" markerEnd="url(#automation-flow-arrow)" variants={draw} />
        <motion.path className="flow-line" d="M626 230H750 M846 230H950 M1066 230H1170" markerEnd="url(#automation-flow-arrow)" variants={draw} />
        <motion.path className="flow-line" d="M634 372H940C1000 372 1010 356 1010 290" markerEnd="url(#automation-flow-arrow)" variants={draw} />
        {!reduced && <><FlowSignal path="M202 230H274" duration={.9} delay={1.2} radius={4.5} /><FlowSignal path="M384 230H530" duration={1.15} delay={2.1} radius={4.5} /><FlowSignal path="M626 230H750" duration={1.05} delay={3.25} radius={4.5} /><FlowSignal path="M846 230H950" duration={.95} delay={4.3} radius={4.5} /><FlowSignal path="M1066 230H1170" duration={.95} delay={5.25} radius={4.5} /><FlowSignal path="M364 196C460 196 468 88 530 88" duration={1.55} delay={2.75} /><FlowSignal path="M364 264C460 264 468 372 526 372" duration={1.55} delay={3.45} /><FlowSignal path="M634 372H940C1000 372 1010 356 1010 290" duration={1.75} delay={4.6} /></>}
        <motion.g variants={node}><circle className="flow-node" cx="60" cy="230" r="13" /></motion.g>
        <motion.g variants={node}><circle className="flow-node" cx="158" cy="230" r="40" /><text className="flow-node-label" x="158" y="234">EVENTO</text>{gear(186, 258)}</motion.g>
        <motion.g variants={node}><circle className="automation-flow-ai-halo" cx="330" cy="230" r="86" /><circle className="automation-flow-ai" cx="330" cy="230" r="48" /><text className="automation-flow-ai-label" x="330" y="238">IA</text></motion.g>
        <motion.g variants={node}><circle className="flow-node" cx="580" cy="88" r="42" /><text className="flow-node-label" x="580" y="92">CRM</text>{gear(610, 118)}</motion.g>
        <motion.g variants={node}><circle className="flow-node" cx="580" cy="230" r="42" /><text className="flow-node-label" x="580" y="234">ERP</text>{thought(610, 200)}{gear(550, 260)}</motion.g>
        <motion.g variants={node}><circle className="flow-node" cx="580" cy="372" r="50" /><text className="flow-node-label" x="580" y="368"><tspan x="580" dy="0">CLOUD</tspan><tspan x="580" dy="14">SERVICES</tspan></text>{thought(617, 335)}<g className="automation-flow-icon-fill">{cloud(617, 409, .34)}</g></motion.g>
        <motion.g variants={node}><circle className="flow-node" cx="800" cy="230" r="42" /><text className="flow-node-label" x="800" y="234">DATOS</text></motion.g>
        <motion.g variants={node}><circle className="flow-node" cx="1010" cy="230" r="52" /><g className="automation-flow-icon" transform="translate(1010 230)"><ellipse cx="0" cy="-11" rx="17" ry="6.5" /><ellipse cx="0" cy="0" rx="17" ry="6.5" /><ellipse cx="0" cy="11" rx="17" ry="6.5" /><path d="M-17 -11V11" /><path d="M17 -11V11" /></g></motion.g>
        <motion.g variants={node}><rect className="flow-response-frame" x="1172" y="193" width="116" height="74" rx="3" /><text className="flow-node-label" x="1230" y="219">RESPUESTA</text><g className="automation-flow-icon" transform="translate(1230 243)"><path d="M-17 0H14M5 -9L14 0L5 9" /><path d="M-17 -12V12" /></g></motion.g>
      </svg>
      <svg className="automation-flow-mobile" viewBox="0 0 360 875" role="presentation">
        <defs><marker id="automation-flow-mobile-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path className="automation-flow-arrowhead" d="M0 0L10 5L0 10Z" /></marker><radialGradient id="automation-flow-mobile-ai-grad"><stop offset="0%" stopColor="#efd894" /><stop offset="100%" stopColor="#c8a24a" /></radialGradient></defs>
        <text className="flow-annotation" x="22" y="28">FLOW / AUTOMATIZACIÓN</text><text className="flow-annotation flow-active" x="238" y="28">STATUS / ACTIVO</text>
        <motion.path className="flow-line" d="M180 114V165 M150 254C126 278 93 316 73 334 M180 265V334 M210 254C234 278 267 316 287 334 M180 406V497 M295 410V600C295 650 262 690 226 690 M180 573V644 M180 736V790" markerEnd="url(#automation-flow-mobile-arrow)" variants={draw} />
        {!reduced && <><FlowSignal path="M180 114V165" duration={.9} delay={1.15} /><FlowSignal path="M180 265V334" duration={.9} delay={2.05} /><FlowSignal path="M180 406V497" duration={.9} delay={2.95} /><FlowSignal path="M180 573V644" duration={.85} delay={3.85} /><FlowSignal path="M180 736V790" duration={.75} delay={4.7} /><FlowSignal path="M150 254C126 278 93 316 73 334" duration={1.35} delay={2.35} /><FlowSignal path="M210 254C234 278 267 316 287 334" duration={1.35} delay={2.85} /><FlowSignal path="M295 410V600C295 650 262 690 226 690" duration={1.7} delay={4.25} /></>}
        <motion.g variants={node}><circle className="flow-node" cx="180" cy="82" r="32" /><text className="flow-node-label" x="180" y="86">EVENTO</text></motion.g>
        <motion.g variants={node}><circle className="automation-flow-ai" cx="180" cy="220" r="45" fill="url(#automation-flow-mobile-ai-grad)" /><text className="automation-flow-ai-label" x="180" y="228">IA</text></motion.g>
        <motion.g variants={node}><circle className="flow-node" cx="65" cy="370" r="36" /><text className="flow-node-label" x="65" y="374">CRM</text></motion.g>
        <motion.g variants={node}><circle className="flow-node" cx="180" cy="370" r="36" /><text className="flow-node-label" x="180" y="374">ERP</text></motion.g>
        <motion.g variants={node}><circle className="flow-node" cx="295" cy="370" r="40" /><text className="flow-node-label" x="295" y="366"><tspan x="295" dy="0">CLOUD</tspan><tspan x="295" dy="13">SERVICES</tspan></text></motion.g>
        <motion.g variants={node}><circle className="flow-node" cx="180" cy="535" r="38" /><text className="flow-node-label" x="180" y="539">DATOS</text></motion.g>
        <motion.g variants={node}><circle className="flow-node is-active" cx="180" cy="690" r="46" /><g className="automation-flow-icon" transform="translate(180 690)"><ellipse cx="0" cy="-11" rx="17" ry="6.5" /><ellipse cx="0" cy="0" rx="17" ry="6.5" /><ellipse cx="0" cy="11" rx="17" ry="6.5" /><path d="M-17 -11V11" /><path d="M17 -11V11" /></g></motion.g>
        <motion.g variants={node}><rect className="flow-response-frame" x="125" y="790" width="110" height="74" rx="3" /><text className="flow-node-label" x="180" y="816">RESPUESTA</text><g className="automation-flow-icon" transform="translate(180 841)"><path d="M-16 0H13M4 -8L13 0L4 8" /><path d="M-16 -11V11" /></g></motion.g>
      </svg>
    </motion.div>
  );
}

function ApproachFlow() {
  const reduced = useReducedMotion();
  const draw = { hidden: { pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduced ? 0 : .9, ease }, opacity: { duration: reduced ? 0 : .3, delay: reduced ? 0 : .6 } } } };
  const fade = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: reduced ? 0 : .5, ease } } };
  const node = { hidden: { opacity: 0, scale: reduced ? 1 : .9 }, visible: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : .3, ease } } };
  const diamond = (x: number, y: number) => <path className="approach-port" d={`M${x} ${y - 4.5}L${x + 4.5} ${y}L${x} ${y + 4.5}L${x - 4.5} ${y}Z`} />;
  const plus = (x: number, y: number) => (
    <g>
      <rect className="approach-plus" x={x} y={y} width="17" height="17" rx="4.5" />
      <path className="approach-icon-soft" d={`M${x + 5} ${y + 8.5}H${x + 12}M${x + 8.5} ${y + 5}V${y + 12}`} />
    </g>
  );
  return (
    <motion.div className="approach-flow" aria-hidden="true" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .07 } } }}>
      <svg viewBox="0 0 1000 480" role="presentation">
        <defs>
          <marker id="approach-flow-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="rgba(247,247,242,.55)" /></marker>
        </defs>
        <motion.path className="approach-line" d="M142 198H296" markerEnd="url(#approach-flow-arrow)" variants={draw} />
        <motion.path className="approach-line" d="M502 198H596" markerEnd="url(#approach-flow-arrow)" variants={draw} />
        <motion.path className="approach-line" d="M684 188C734 188 748 118 794 118" markerEnd="url(#approach-flow-arrow)" variants={draw} />
        <motion.path className="approach-line" d="M684 216C734 216 748 301 794 301" markerEnd="url(#approach-flow-arrow)" variants={draw} />
        <motion.path className="approach-line is-dashed" d="M345 241C345 300 262 318 207 356" markerEnd="url(#approach-flow-arrow)" variants={fade} />
        <motion.path className="approach-line is-dashed" d="M410 241C410 300 358 322 315 356" markerEnd="url(#approach-flow-arrow)" variants={fade} />
        <motion.path className="approach-line is-dashed" d="M470 241C470 305 474 330 477 356" markerEnd="url(#approach-flow-arrow)" variants={fade} />
        <motion.path className="approach-line is-dashed" d="M470 241C510 300 566 322 583 356" markerEnd="url(#approach-flow-arrow)" variants={fade} />
        {!reduced && <><ApproachSignal path="M142 198H296" duration={1.35} delay={1.3} radius={4.5} /><ApproachSignal path="M502 198H596" duration={1.05} delay={2.65} radius={4.5} /><ApproachSignal path="M684 188C734 188 748 118 794 118" duration={1.65} delay={3.7} /><ApproachSignal path="M684 216C734 216 748 301 794 301" duration={1.65} delay={4.45} /><ApproachSignal path="M345 241C345 300 262 318 207 356" duration={1.65} delay={5.15} /></>}
        <motion.g variants={node}>
          <path className="approach-bolt" d="M47 162L35 183H41L36 198L52 176H45L51 162Z" />
          <rect className="approach-card" x="58" y="165" width="76" height="66" rx="10" />
          <g transform="translate(96 198)">
            <path className="approach-icon-soft" d="M-9 -14H3L10 -7V14H-9Z" />
            <path className="approach-icon-soft" d="M3 -14V-7H10" />
            <path className="approach-icon" d="M-5 -2H5" />
            <path className="approach-icon-soft" d="M-5 3H5M-5 8H1" />
          </g>
          <circle className="approach-port-dot" cx="140" cy="198" r="3.5" />
          <text className="approach-label" x="96" y="257">Al enviar un</text>
          <text className="approach-label" x="96" y="273">formulario</text>
        </motion.g>
        <motion.g variants={node}>
          <rect className="approach-card" x="302" y="165" width="196" height="68" rx="10" />
          <g transform="translate(345 199)">
            <rect className="approach-icon-soft" x="-13" y="-9" width="26" height="19" rx="5" />
            <circle cx="-5.5" cy="0" r="2.5" fill="#c8a24a" />
            <circle cx="5.5" cy="0" r="2.5" fill="#c8a24a" />
            <path className="approach-icon-soft" d="M0 -9V-14M-13 -3H-17M13 -3H17" />
            <circle cx="0" cy="-16" r="2" fill="#c8a24a" />
          </g>
          <text className="approach-node-title" x="430" y="196">Agente IA</text>
          <text className="approach-node-sub" x="430" y="214">con tus reglas</text>
          <circle className="approach-port-dot" cx="300" cy="198" r="3.5" />
          <circle className="approach-port-dot" cx="500" cy="198" r="3.5" />
          {diamond(345, 239)}{diamond(410, 239)}{diamond(470, 239)}
          <text className="approach-port-label" x="345" y="256">Modelo IA</text>
          <text className="approach-port-label" x="410" y="256">Memoria</text>
          <text className="approach-port-label" x="470" y="256">Herramientas</text>
          {plus(462, 264)}
        </motion.g>
        <motion.g variants={node}>
          <rect className="approach-card is-decision" x="602" y="165" width="74" height="68" rx="10" />
          <g transform="translate(639 199)">
            <rect className="approach-icon" x="-7" y="-14" width="14" height="28" rx="4.5" />
            <circle cx="0" cy="-7.5" r="2.4" fill="rgba(247,247,242,.7)" />
            <circle cx="0" cy="0" r="2.4" fill="#c8a24a" />
            <circle cx="0" cy="7.5" r="2.4" fill="rgba(247,247,242,.3)" />
          </g>
          <circle className="approach-port-dot" cx="600" cy="198" r="3.5" />
          <text className="approach-label" x="639" y="257">¿Se aprueba?</text>
          <circle className="approach-port" cx="682" cy="188" r="4" />
          <circle className="approach-port" cx="682" cy="216" r="4" />
          <text className="approach-port-label" x="694" y="191" style={{ textAnchor: "start" }}>sí</text>
          <text className="approach-port-label" x="694" y="219" style={{ textAnchor: "start" }}>no</text>
        </motion.g>
        <motion.g variants={node}>
          <rect className="approach-card" x="802" y="78" width="78" height="78" rx="12" />
          <g transform="translate(841 117)">
            <path className="approach-icon-soft" d="M-12 -10H12V5H2L-4 11V5H-12Z" />
            <circle cx="-5" cy="-3" r="1.7" fill="#c8a24a" /><circle cx="0" cy="-3" r="1.7" fill="#c8a24a" /><circle cx="5" cy="-3" r="1.7" fill="#c8a24a" />
          </g>
          <circle className="approach-port-dot" cx="798" cy="118" r="3.5" />
          <text className="approach-label" x="841" y="177">Notificar al equipo</text>
          <text className="approach-label-sub" x="841" y="193">mensaje: canal</text>
          {plus(898, 110)}
        </motion.g>
        <motion.g variants={node}>
          <rect className="approach-card" x="802" y="262" width="78" height="78" rx="12" />
          <g transform="translate(841 301)">
            <path className="approach-icon" d="M-11 -5H8M5 -9L11 -5L5 -1" />
            <path className="approach-icon" d="M11 5H-8M-5 1L-11 5L-5 9" />
          </g>
          <circle className="approach-port-dot" cx="798" cy="301" r="3.5" />
          <text className="approach-label" x="841" y="361">Actualizar el sistema</text>
          <text className="approach-label-sub" x="841" y="377">registro: dato</text>
          {plus(898, 294)}
        </motion.g>
        <motion.g variants={node}>
          <circle className="approach-tool" cx="205" cy="392" r="28" />
          <text className="approach-node-title" x="205" y="397">IA</text>
          <text className="approach-label" x="205" y="440">Modelo de IA</text>
        </motion.g>
        <motion.g variants={node}>
          <circle className="approach-tool" cx="315" cy="392" r="28" />
          <g className="approach-icon-soft" transform="translate(315 392)">
            <ellipse cx="0" cy="-7" rx="9" ry="3.6" />
            <path d="M-9 -7V7M9 -7V7" />
            <ellipse cx="0" cy="7" rx="9" ry="3.6" />
            <ellipse cx="0" cy="0" rx="9" ry="3.6" />
          </g>
          <text className="approach-label" x="315" y="440">Base de datos</text>
        </motion.g>
        <motion.g variants={node}>
          <circle className="approach-tool" cx="477" cy="392" r="28" />
          <g className="approach-icon-soft" transform="translate(477 392)">
            <rect x="-11" y="-9" width="22" height="18" rx="3.5" />
            <circle cx="-3" cy="-3" r="2.6" />
            <path d="M-9 7c1.5-3.4 3.6-4.6 6-4.6s4.5 1.2 6 4.6" />
          </g>
          <text className="approach-label" x="477" y="440">CRM</text>
          <text className="approach-label-sub" x="477" y="456">getAll: contactos</text>
        </motion.g>
        <motion.g variants={node}>
          <circle className="approach-tool" cx="585" cy="392" r="28" />
          <g className="approach-icon-soft" transform="translate(585 392)">
            <path d="M0 -10L9 -5L0 0L-9 -5Z" />
            <path d="M-9 -5V5L0 10L9 5V-5M0 0V10" />
          </g>
          <text className="approach-label" x="585" y="440">ERP</text>
          <text className="approach-label-sub" x="585" y="456">create: orden</text>
        </motion.g>
      </svg>
      <svg className="approach-flow-mobile" viewBox="0 0 360 620" role="presentation">
        <defs><marker id="approach-flow-mobile-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="rgba(247,247,242,.55)" /></marker></defs>
        <motion.path className="approach-line" d="M180 112V164M180 244V336M152 398C132 440 98 459 88 500M208 398C228 440 262 459 272 500" markerEnd="url(#approach-flow-mobile-arrow)" variants={draw} />
        <motion.path className="approach-line is-dashed" d="M125 240C108 258 88 268 68 274M155 244C145 258 135 268 122 274M205 244C215 258 225 268 238 274M235 240C252 258 272 268 292 274" variants={fade} />
        {!reduced && <><ApproachSignal path="M180 112V164" duration={1.1} delay={1.2} radius={4.3} /><ApproachSignal path="M180 244V336" duration={1.1} delay={2.35} radius={4.3} /><ApproachSignal path="M152 398C132 440 98 459 88 500" duration={1.5} delay={3.45} /><ApproachSignal path="M208 398C228 440 262 459 272 500" duration={1.5} delay={4.1} /></>}
        <motion.g variants={node}><rect className="approach-card" x="126" y="48" width="108" height="64" rx="10" /><g transform="translate(180 80)"><path className="approach-icon-soft" d="M-9 -14H3L10 -7V14H-9Z" /><path className="approach-icon-soft" d="M3 -14V-7H10" /><path className="approach-icon" d="M-5 -2H5" /><path className="approach-icon-soft" d="M-5 3H5M-5 8H1" /></g><text className="approach-label" x="180" y="132">Formulario</text></motion.g>
        <motion.g variants={node}><rect className="approach-card" x="96" y="164" width="168" height="80" rx="11" /><g transform="translate(140 204)"><rect className="approach-icon-soft" x="-13" y="-9" width="26" height="19" rx="5" /><circle cx="-5.5" cy="0" r="2.5" fill="#c8a24a" /><circle cx="5.5" cy="0" r="2.5" fill="#c8a24a" /></g><text className="approach-node-title" x="194" y="198">Agente IA</text><text className="approach-node-sub" x="194" y="217">con tus reglas</text></motion.g>
        <motion.g variants={node}><circle className="approach-tool" cx="68" cy="290" r="16" /><text className="approach-port-label" x="68" y="293">MODELO</text><circle className="approach-tool" cx="122" cy="290" r="16" /><text className="approach-port-label" x="122" y="293">DATOS</text><circle className="approach-tool" cx="238" cy="290" r="16" /><text className="approach-port-label" x="238" y="293">CRM</text><circle className="approach-tool" cx="292" cy="290" r="16" /><text className="approach-port-label" x="292" y="293">ERP</text></motion.g>
        <motion.g variants={node}><rect className="approach-card is-decision" x="130" y="336" width="100" height="62" rx="10" /><g transform="translate(180 367)"><rect className="approach-icon" x="-7" y="-14" width="14" height="28" rx="4.5" /><circle cx="0" cy="0" r="2.4" fill="#c8a24a" /></g><text className="approach-label" x="180" y="420">¿Se aprueba?</text></motion.g>
        <motion.g variants={node}><rect className="approach-card" x="42" y="500" width="92" height="66" rx="10" /><g transform="translate(88 531)"><path className="approach-icon-soft" d="M-12 -10H12V5H2L-4 11V5H-12Z" /><circle cx="0" cy="-3" r="1.7" fill="#c8a24a" /></g><text className="approach-label" x="88" y="586">Notificar</text></motion.g>
        <motion.g variants={node}><rect className="approach-card" x="226" y="500" width="92" height="66" rx="10" /><g transform="translate(272 532)"><path className="approach-icon" d="M-11 -5H8M5 -9L11 -5L5 -1" /><path className="approach-icon" d="M11 5H-8M-5 1L-11 5L-5 9" /></g><text className="approach-label" x="272" y="586">Actualizar</text></motion.g>
      </svg>
    </motion.div>
  );
}

export default function AutomationAiPage() {
  const { returnToCapabilities } = useRouteTransition();
  useEffect(() => {
    const engine = document.querySelector<HTMLElement>(".automation-capability-engine");
    if (!engine) return;

    const details = [
      "Definimos los eventos que inician el flujo y las validaciones que aseguran que cada dato llegue listo para actuar.",
      "Convertimos reglas de negocio y decisiones repetidas en una secuencia clara, auditable y fácil de mantener.",
      "Aplicamos IA solo donde aporta criterio: clasificar, extraer información, resumir o proponer una siguiente acción.",
      "Conectamos el resultado con el equipo y sus herramientas mediante alertas, actualizaciones y visibilidad operativa.",
    ];
    const articles = Array.from(engine.querySelectorAll<HTMLElement>("article"));
    let activeIndex = -1;

    const setActive = (index: number) => {
      activeIndex = index;
      articles.forEach((article, articleIndex) => {
        const expanded = articleIndex === activeIndex;
        article.dataset.expanded = String(expanded);
        article.setAttribute("aria-expanded", String(expanded));
      });
    };
    const clearActive = () => {
      activeIndex = -1;
      articles.forEach((article) => {
        article.dataset.expanded = "false";
        article.setAttribute("aria-expanded", "false");
      });
    };

    const cleanups = articles.map((article, index) => {
      article.setAttribute("role", "button");
      article.tabIndex = 0;
      article.dataset.expanded = "false";
      article.setAttribute("aria-expanded", "false");
      const detail = document.createElement("p");
      detail.className = "automation-capability-detail";
      detail.textContent = details[index];
      article.querySelector("div")?.append(detail);
      const activate = () => setActive(index);
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); }
      };
      article.addEventListener("mouseenter", activate);
      article.addEventListener("mouseleave", clearActive);
      article.addEventListener("click", activate);
      article.addEventListener("keydown", onKeyDown);
      return () => {
        article.removeEventListener("mouseenter", activate);
        article.removeEventListener("mouseleave", clearActive);
        article.removeEventListener("click", activate);
        article.removeEventListener("keydown", onKeyDown);
        detail.remove();
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
  return <main className="capability-page capability-automation">
    <section className="capability-hero automation-hero"><div className="capability-hero-grid" aria-hidden="true" /><div className="page-shell capability-hero-inner"><Link className="capability-back" href="/#servicios" onClick={(event) => { event.preventDefault(); returnToCapabilities(); }}>← Volver a capacidades</Link><p className="capability-index">CAPABILITY / 02</p><h1><span>Automatización</span><span>e <span className="capability-hero-accent">inteligencia artificial.</span></span></h1><p className="capability-hero-copy">Conectamos tus sistemas y eliminamos trabajo manual para que cada proceso avance con reglas claras.</p><div className="automation-hero-actions"><Link href="/#contacto" className="capability-cta">Mapear mi proceso <span aria-hidden="true">↗</span></Link><p>Procesos <span>·</span> Datos <span>·</span> Integraciones <span>·</span> Agentes IA</p></div><div className="automation-hero-flow" aria-label="Flujo de automatización: evento, inteligencia artificial, sistemas y acción"><span>Evento</span><i aria-hidden="true">→</i><strong>IA</strong><i aria-hidden="true">→</i><span>CRM / ERP</span><i aria-hidden="true">→</i><span>Acción</span></div></div></section>

    <section id="automation-build" className="capability-section automation-build"><div className="page-shell"><p className="capability-index">01 / QUÉ AUTOMATIZAMOS</p><div className="automation-build-head"><div><h2>Sistemas que hacen avanzar la operación.</h2><p>Automatizamos lo repetitivo y diseñamos puntos de control claros para que el equipo dedique su tiempo a lo que sí requiere criterio.</p></div></div><AutomationFlow /><div className="automation-groups">{automationGroups.map((group, index) => <article key={group.label}><SystemLabel>FLOW / 0{index + 1}</SystemLabel><h3>{group.label}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div></div></section>

    <section id="automation-approach" className="capability-section automation-approach"><div className="page-shell automation-approach-layout"><div><p className="capability-index">02 / ENFOQUE</p><h2>Primero diseñamos el flujo.</h2><p>Antes de automatizar, entendemos dónde se pierde tiempo, qué decisiones se repiten y qué información necesita el sistema.</p></div></div></section>

    <section id="automation-workflow" className="capability-section automation-workflow"><div className="page-shell"><p className="capability-index">03 / FLUJO</p><h2>De tarea manual a flujo confiable.</h2><ApproachFlow /></div></section>

    <section id="automation-capabilities" className="capability-section automation-capabilities"><div className="page-shell"><p className="capability-index">04 / CAPACIDADES</p><div className="automation-capabilities-head"><h2>Automatización útil, no automatización por moda.</h2><p>Diseñamos reglas, puntos de control y acciones conectadas para que cada evento sepa qué hacer después.</p></div><div className="automation-capability-engine">{capabilityGroups.map((group, index) => <article key={group.label}><span>0{index + 1}</span><div><SystemLabel>{group.label}</SystemLabel><p>{group.items.join(" · ")}</p></div><i /></article>)}</div></div></section>

    <section className="automation-principle"><div className="page-shell"><p>No automatizamos por automatizar.<br /><span>Diseñamos sistemas que liberan capacidad.</span></p></div></section>
    <section className="capability-final-cta automation-final-cta"><div className="page-shell"><p className="capability-index">02 / 05</p><h2>¿Qué proceso quieres simplificar?</h2><p>Cuéntanos dónde se está yendo el tiempo. Empezamos por entenderlo.</p><Link href="/#contacto" className="capability-cta">Empezar <span aria-hidden="true">↗</span></Link><div className="automation-final-art" aria-hidden="true"><Image src="/automation-process-orbit.png" alt="" width={1280} height={1280} sizes="(max-width: 620px) 84vw, (max-width: 900px) 42vw, 38vw" priority /></div></div></section>
  </main>;
}
