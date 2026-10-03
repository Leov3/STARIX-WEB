"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import ScrollTypewriterHeading from "@/app/components/scroll-typewriter-heading";
import FrictionSlider from "@/app/components/friction-slider";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ProcessStep = readonly [string, string, string];
const processActivationThresholds = [0.52, 0.64, 0.76, 0.88, 0.98];

export function FrictionSection({ hideHeading = false }: { hideHeading?: boolean }) {
  return (
    <section className="friction section-blue">
      <div className="page-shell friction-editorial">
        {!hideHeading && (
          <div className="section-head friction-head">
            <p className="section-index">03 / FRICCIÓN</p>
            <div className="friction-section-title">
              <ScrollTypewriterHeading text="Lo que frena tu crecimiento." />
            </div>
            <p className="friction-head-copy">
              Tu negocio probablemente no necesita otra herramienta. Necesita que las que ya tiene funcionen juntas.
            </p>
          </div>
        )}
        <FrictionSlider />
      </div>
    </section>
  );
}

export function ApproachSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mobileTransitionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const { scrollYProgress: mobileEntranceProgress } = useScroll({
    target: mobileTransitionRef,
    offset: ["start end", "center 72%"],
  });
  const { scrollYProgress: mobileExplosionProgress } = useScroll({
    target: mobileTransitionRef,
    offset: ["end end", "end 55%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.55 });
  const mobileEntrance = useSpring(mobileEntranceProgress, { stiffness: 95, damping: 24, mass: 0.5 });
  const mobileExplosion = useSpring(mobileExplosionProgress, { stiffness: 105, damping: 28, mass: 0.45 });
  const starY = useTransform(progress, [0, 0.32, 0.52, 1], prefersReducedMotion ? [0, 0, 0, 0] : [220, 0, 0, 0]);
  const starOpacity = useTransform(progress, [0, 0.2, 0.52, 0.78, 1], prefersReducedMotion ? [1, 1, 1, 1, 1] : [0, 1, 1, 1, 0]);
  const starScale = useTransform(progress, [0, 0.32, 1], prefersReducedMotion ? [1, 1, 1] : [0.76, 1, 1]);
  const transitionClip = useTransform(
    progress,
    [0, 0.46, 0.58, 0.76, 1],
    prefersReducedMotion
      ? ["circle(150% at 50% 50%)", "circle(150% at 50% 50%)", "circle(150% at 50% 50%)", "circle(150% at 50% 50%)", "circle(150% at 50% 50%)"]
      : ["circle(0% at 50% 50%)", "circle(0% at 50% 50%)", "circle(18% at 50% 50%)", "circle(150% at 50% 50%)", "circle(150% at 50% 50%)"],
  );
  const mobileStarOpacity = useTransform(mobileEntrance, [0, 0.55, 1], prefersReducedMotion ? [1, 1, 1] : [0, 1, 1]);
  const mobileStarScale = useTransform(mobileEntrance, [0, 0.6, 1], prefersReducedMotion ? [1, 1, 1] : [0.68, 1.04, 1]);
  const mobileTransitionClip = useTransform(
    mobileExplosion,
    [0, 0.08, 1],
    prefersReducedMotion
      ? ["circle(150% at 50% 50%)", "circle(150% at 50% 50%)", "circle(150% at 50% 50%)"]
      : ["circle(0% at 50% 50%)", "circle(4% at 50% 50%)", "circle(150% at 50% 50%)"],
  );
  const approachItems = [
    "Entender — Detectar la fricción real.",
    "Diseñar — Crear una arquitectura clara.",
    "Conectar — Integrar lo que ya funciona.",
    "Evolucionar — Construir para crecer.",
  ];
  return (
    <section ref={sectionRef} id="enfoque" className="approach section-light">
      <motion.div className="approach-star approach-star-desktop" style={{ y: starY, opacity: starOpacity, scale: starScale }}>
        <Image
          className="approach-star-image"
          src="/brand/starix-mark.png"
          alt=""
          width={294}
          height={295}
          sizes="clamp(180px, 20vw, 300px)"
          aria-hidden="true"
        />
      </motion.div>
      <motion.div className="approach-transition approach-transition-desktop" style={{ clipPath: transitionClip }} aria-hidden="true" />
      <div className="page-shell approach-layout">
        <motion.div
          className="approach-title"
          initial={{ opacity: 1, y: prefersReducedMotion ? 0 : 28 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ amount: 0.25, once: false }}
          transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-index">02 / POSICIONAMIENTO</p>
          <ScrollTypewriterHeading text="Diseñamos el sistema antes de elegir la herramienta." />
          <p className="approach-lead">Primero entendemos cómo funciona tu negocio. Después diseñamos la arquitectura que conecta personas, procesos y tecnología.</p>
        </motion.div>
        <div className="principles">
          {approachItems.map((principle, index) => (
            <motion.p
              key={principle}
              initial={{ opacity: 1, x: prefersReducedMotion ? 0 : 24 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ amount: 0.2, once: false }}
              transition={{ duration: 0.58, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {principle}
            </motion.p>
          ))}
        </div>
      </div>
      <div ref={mobileTransitionRef} className="approach-mobile-transition" aria-hidden="true">
        <motion.div className="approach-mobile-wash" style={{ clipPath: mobileTransitionClip }} />
        <motion.div className="approach-mobile-star" style={{ opacity: mobileStarOpacity, scale: mobileStarScale }}>
          <Image
            className="approach-star-image"
            src="/brand/starix-mark.png"
            alt=""
            width={294}
            height={295}
            sizes="132px"
          />
        </motion.div>
      </div>
    </section>
  );
}

function ProcessStepItem({ step, index, progress, prefersReducedMotion }: {
  step: ProcessStep;
  index: number;
  progress: ReturnType<typeof useSpring>;
  prefersReducedMotion: boolean | null;
}) {
  const [number, title, description] = step;
  const threshold = processActivationThresholds[index] ?? index / 4;
  const active = useTransform(progress, [Math.max(0, threshold - 0.06), threshold, Math.min(1, threshold + 0.12)], prefersReducedMotion ? [1, 1, 1] : [0, 1, 1]);
  const titleOpacity = useTransform(active, [0, 1], prefersReducedMotion ? [1, 1] : [0, 1]);
  const titleY = useTransform(active, [0, 1], prefersReducedMotion ? [0, 0] : [12, 0]);
  const descriptionOpacity = useTransform(active, [0, 1], prefersReducedMotion ? [1, 1] : [0, 1]);
  const descriptionY = useTransform(active, [0, 1], prefersReducedMotion ? [0, 0] : [7, 0]);
  const numberColor = useTransform(active, [0, 1], ["rgba(200,162,74,.42)", "#c8a24a"]);
  const titleColor = useTransform(active, [0, 1], ["rgba(247,247,242,.6)", "#f7f7f2"]);
  const nodeScale = useTransform(progress, [Math.max(0, threshold - 0.04), threshold, Math.min(1, threshold + 0.08)], prefersReducedMotion ? [1, 1, 1] : [1, 1.15, 1]);
  const signalOpacity = useTransform(progress, [Math.max(0, threshold - 0.02), threshold, Math.min(1, threshold + 0.12)], prefersReducedMotion ? [0, 0, 0] : [0, 1, 0]);
  const signalScale = useTransform(progress, [Math.max(0, threshold - 0.02), threshold, Math.min(1, threshold + 0.12)], prefersReducedMotion ? [0.5, 0.5, 0.5] : [0.5, 1, 1.5]);

  return (
    <article className="process-step">
      <motion.span className="step-node" style={{ scale: nodeScale }} aria-hidden="true" />
      <motion.span className="step-signal" style={{ opacity: signalOpacity, scale: signalScale }} aria-hidden="true" />
      <motion.p className="step-number" style={{ color: numberColor }}>{number}</motion.p>
      <motion.h3 style={{ color: titleColor, opacity: titleOpacity, y: titleY }}>{title}</motion.h3>
      <motion.p style={{ opacity: descriptionOpacity, y: descriptionY }}>{description}</motion.p>
    </article>
  );
}

export function ProcessSection({ steps }: { steps: readonly ProcessStep[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });
  const headOpacity = useTransform(progress, [0, 0.025], prefersReducedMotion ? [1, 1] : [0, 1]);
  const headY = useTransform(progress, [0, 0.12], prefersReducedMotion ? [0, 0] : [10, -20]);
  const titleRevealY = useTransform(progress, [0, 0.08], prefersReducedMotion ? [0, 0] : [40, 0]);
  const sideY = useTransform(progress, [0, 0.12], prefersReducedMotion ? [0, 0] : [15, 10]);
  const timelineOpacity = useTransform(progress, [0, 0.1], prefersReducedMotion ? [1, 1] : [0, 1]);
  const timelineY = useTransform(progress, [0, 0.1], prefersReducedMotion ? [0, 0] : [18, 0]);
  const lineProgress = useTransform(
    progress,
    prefersReducedMotion ? [0, 1] : [0, ...processActivationThresholds],
    prefersReducedMotion ? [1, 1] : [0, 0, 0.25, 0.5, 0.75, 1],
  );

  return (
    <section ref={sectionRef} id="proceso" className="process section-dark">
      <div className="process-sticky">
        <div className="page-shell process-inner">
          <div className="section-head process-head">
            <motion.p className="section-index" style={{ opacity: headOpacity, y: headY }}>04 / MÉTODO</motion.p>
            <div className="process-title-reveal">
              <motion.h2 style={{ opacity: headOpacity, y: titleRevealY }}>Cómo trabajamos.</motion.h2>
            </div>
            <motion.p style={{ opacity: headOpacity, y: sideY }}>Un proceso claro para convertir complejidad en dirección, y dirección en resultados.</motion.p>
          </div>
          <motion.div className="process-timeline" style={{ opacity: timelineOpacity, y: timelineY }}>
            <div className="process-line" aria-hidden="true">
              <motion.span className="process-progress process-progress-horizontal" style={{ scaleX: lineProgress }} />
              <motion.span className="process-progress process-progress-vertical" style={{ scaleY: lineProgress }} />
            </div>
            <div className="process-steps">
              {steps.map((step, index) => <ProcessStepItem key={step[0]} step={step} index={index} progress={progress} prefersReducedMotion={prefersReducedMotion} />)}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const manifestoLines = ["El futuro no se espera.", "Se construye."] as const;
const manifestoText = manifestoLines.join("\n");

export function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [typedText, setTypedText] = useState(manifestoText);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let timer = 0;
    let started = false;
    const typeText = () => {
      if (typedText === manifestoText) return;
      if (started) return;
      started = true;

      if (prefersReducedMotion) {
        setTypedText(manifestoText);
        return;
      }

      let character = 0;
      const typeNext = () => {
        character += 1;
        setTypedText(manifestoText.slice(0, character));
        if (character < manifestoText.length) timer = window.setTimeout(typeNext, manifestoText[character] === "\n" ? 180 : 34);
      };
      timer = window.setTimeout(typeNext, 280);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        typeText();
        observer.disconnect();
      }
    }, { threshold: 0.25 });

    observer.observe(section);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [prefersReducedMotion]);

  const [firstLine = "", secondLine = ""] = typedText.split("\n");

  return (
    <section ref={sectionRef} className="interlude" aria-label="Declaración Starix">
      <motion.div
        className="interlude-rings"
        initial={{ opacity: 0, scale: 0.78 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <span /><span /><span />
        <span className="interlude-planet interlude-planet-one" />
        <span className="interlude-planet interlude-planet-two" />
        <span className="interlude-planet interlude-planet-three" />
        <Image className="interlude-star" src="/brand/starix-mark.png" alt="" width={294} height={295} sizes="clamp(72px, 10vw, 150px)" />
      </motion.div>
      <div className="page-shell">
        <p className="section-index">05 / MANIFIESTO</p>
        <p className="interlude-copy" aria-label={manifestoText}>
          <span className="interlude-typed" aria-hidden="true">
            {firstLine}<br /><em>{secondLine}</em>
          </span>
        </p>
      </div>
    </section>
  );
}
