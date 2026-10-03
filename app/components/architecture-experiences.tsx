"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import styles from "./architecture-experiences.module.css";

const stages = [
  { name: "Problema", description: "Acordamos qué debe resolver el producto y para quién.", result: "Objetivo y alcance claros" },
  { name: "Arquitectura", description: "Definimos cómo se relacionan experiencia, datos y operación.", result: "Mapa del sistema" },
  { name: "Construcción", description: "Diseñamos la experiencia y desarrollamos las piezas del producto en paralelo.", result: "Producto funcional" },
  { name: "Integración", description: "Conectamos el producto con los procesos y herramientas que necesita.", result: "Flujo completo verificado" },
  { name: "Producto", description: "Ponemos el sistema en uso y observamos qué debe mejorar.", result: "Base preparada para evolucionar" },
];

export function ProductArchitectureExperience() {
  const [selected, setSelected] = useState(0);
  const stage = stages[selected];

  return <section id="product-architecture" className={styles.section} aria-labelledby="product-architecture-title">
    <div className="page-shell">
      <p className={styles.eyebrow}>03 / ARQUITECTURA</p>
      <div className={styles.productLayout}>
        <div>
          <h2 id="product-architecture-title" className={styles.title}>De idea<br />a <em>producto.</em></h2>
          <p className={styles.intro}>Cada decisión conecta una necesidad del negocio con una parte del sistema.</p>
          <div className={styles.detail} id="product-stage-detail" aria-live="polite" aria-atomic="true">
            <p className={styles.eyebrow}>ETAPA 0{selected + 1} / 05</p>
            <h3>{stage.name}</h3>
            <p>{stage.description}</p>
            <span className={styles.resultLabel}>RESULTADO</span>
            <strong>{stage.result}</strong>
          </div>
          <div className={styles.controls}>
            <button type="button" disabled={selected === 0} onClick={() => setSelected(value => value - 1)} aria-label="Etapa anterior">←</button>
            <span>{selected + 1} de {stages.length}</span>
            <button type="button" disabled={selected === stages.length - 1} onClick={() => setSelected(value => value + 1)} aria-label="Etapa siguiente">→</button>
          </div>
        </div>
        <div className={styles.route}>
          <p className={styles.mapLabel}>UNA RUTA. UN SISTEMA COMPLETO.</p>
          <ol className={styles.stageList} aria-label="Ruta de construcción del producto">
            {stages.map((item, index) => <li key={item.name} className={selected === index ? styles.activeStage : undefined}>
              <button type="button" className={styles.stageButton} aria-pressed={selected === index} aria-controls="product-stage-detail" onClick={() => setSelected(index)}>
                <span className={styles.number}>0{index + 1}</span>
                <span><strong>{item.name}</strong><small>{item.result}</small></span>
                <span className={styles.stageIndicator} aria-hidden="true">{selected === index ? "−" : "+"}</span>
              </button>
              {index === 2 && <div className={styles.branches}><span>Experiencia <small>UX / UI</small></span><span>Desarrollo <small>Lógica y datos</small></span></div>}
              {selected === index && <p className={styles.mobileDetail}>{item.description}</p>}
            </li>)}
          </ol>
          <p className={styles.caption}>Selecciona una etapa para explorar cómo construimos.</p>
        </div>
      </div>
    </div>
  </section>;
}

const systems = [
  { name: "Ventas", before: "Registrar el pedido", after: "Pedido recibido" },
  { name: "Inventario", before: "Confirmar stock", after: "Stock actualizado" },
  { name: "Facturación", before: "Copiar los datos", after: "Factura generada" },
  { name: "CRM", before: "Actualizar a mano", after: "Cliente actualizado" },
];

export function IntegrationArchitectureExperience() {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (reducedMotion || step === systems.length - 1) {
        setPlaying(false);
        setStep(null);
      } else {
        setStep(value => (value ?? -1) + 1);
      }
    }, reducedMotion ? 0 : 600);
    return () => window.clearTimeout(timer);
  }, [playing, step, reducedMotion]);

  function togglePlayback() {
    if (playing) { setPlaying(false); setStep(null); return; }
    setHasPlayed(true);
    if (reducedMotion) { setStep(null); return; }
    setStep(0);
    setPlaying(true);
  }

  return <section id="connect-architecture" className={styles.section} aria-labelledby="integration-architecture-title">
    <div className="page-shell">
      <p className={styles.eyebrow}>03 / ARQUITECTURA</p>
      <div className={styles.integrationHeading}>
        <h2 id="integration-architecture-title" className={styles.title}>Una operación.<br /><em>Todo conectado.</em></h2>
        <p className={styles.intro}>Conectamos los puntos donde hoy el equipo copia, concilia o vuelve a registrar datos.</p>
      </div>
      <div className={styles.comparison}>
        <div className={styles.isolated}>
          <p className={styles.mapLabel}>01 / HOY</p><h3>Procesos aislados.</h3>
          <p className={styles.comparisonCopy}>El equipo hace de puente entre las herramientas.</p>
          <ol className={styles.systemList}>{systems.map((system, index) => <li key={system.name}><span className={styles.number}>0{index + 1}</span><strong>{system.name}</strong><span>{system.before}</span></li>)}</ol>
          <p className={styles.bottomNote}>La información se vuelve a registrar en cada paso.</p>
        </div>
        <div className={styles.connected}>
          <p className={styles.eyebrow}>02 / CON STARIX</p><h3>Un mismo sistema.</h3>
          <p className={styles.comparisonCopy}>Cada evento puede activar el siguiente paso.</p>
          <ol className={styles.systemList}>{systems.map((system, index) => <li key={system.name} className={step === index ? styles.currentSystem : undefined}><span className={styles.number}>0{index + 1}</span><strong>{system.name}</strong><span>{system.after}</span></li>)}</ol>
          <div className={styles.core}><strong>Integración y reglas</strong><span>Odoo, ERP, CRM y las herramientas de tu operación.</span></div>
        </div>
      </div>
      <div className={styles.demo}>
        <div><p className={styles.eyebrow}>EJEMPLO ILUSTRATIVO / UN PEDIDO</p><p>Del pedido al cliente actualizado, con información que continúa.</p></div>
        <button type="button" className={styles.demoButton} onClick={togglePlayback}>{playing ? "Detener" : hasPlayed ? "Repetir recorrido" : "Ver recorrido"}<span aria-hidden="true">{playing ? "−" : "→"}</span></button>
        <p className={styles.demoStatus} role="status">{playing ? `Paso ${(step ?? 0) + 1} de 4: ${systems[step ?? 0].after}.` : hasPlayed ? "Recorrido completo visible: pedido, stock, factura y cliente." : "La integración se define según los procesos de tu negocio."}</p>
      </div>
    </div>
  </section>;
}
