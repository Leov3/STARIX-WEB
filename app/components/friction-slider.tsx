"use client";

import { motion, useReducedMotion } from "motion/react";
import FrictionLottie, { type FrictionIllustration } from "@/app/components/friction-lottie";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    title: "Datos repartidos entre plataformas.",
    detail: "La información existe, pero vive en lugares distintos y nadie tiene una visión completa.",
    illustration: "data" as FrictionIllustration,
  },
  {
    title: "Tareas repetidas que consumen al equipo.",
    detail: "Cada paso manual añade fricción, errores y tiempo que podría estar dedicado a crecer.",
    illustration: "repetition" as FrictionIllustration,
  },
  {
    title: "Leads que se pierden en el camino.",
    detail: "Cuando el recorrido no está conectado, una oportunidad puede desaparecer entre herramientas.",
    illustration: "leads" as FrictionIllustration,
  },
  {
    title: "Sistemas que no comparten información.",
    detail: "La operación se fragmenta cuando cada plataforma trabaja con una versión diferente de la realidad.",
    illustration: "systems" as FrictionIllustration,
  },
  {
    title: "Una web que no representa tu nivel.",
    detail: "La experiencia digital debería comunicar con la misma claridad y ambición que el negocio.",
    illustration: "web" as FrictionIllustration,
  },
];

export default function FrictionSlider() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const lastWheelChange = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  const goTo = (index: number) => {
    const nextIndex = (index + slides.length) % slides.length;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 4) return;

      const direction = delta > 0 ? 1 : -1;
      const nextIndex = activeIndexRef.current + direction;

      // En los extremos, deja que la página continúe con su scroll vertical.
      if (nextIndex < 0 || nextIndex >= slides.length) return;

      event.preventDefault();

      const now = Date.now();
      if (now - lastWheelChange.current < 720) return;

      lastWheelChange.current = now;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div ref={viewportRef} className="friction-slider" aria-label="Fricciones habituales">
      <div className="friction-slider-viewport">
        <motion.div
          className="friction-slider-track"
          animate={{ x: `calc(-${activeIndex} * (var(--friction-card-width) + var(--friction-card-gap)))` }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            type: "spring",
            stiffness: 72,
            damping: 19,
            mass: 0.82,
          }}
          drag={prefersReducedMotion ? false : "x"}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) goTo(activeIndex + 1);
            else if (info.offset.x > 60) goTo(activeIndex - 1);
          }}
        >
          {slides.map((slide, index) => (
            <article className="friction-slide" key={slide.title} aria-hidden={activeIndex !== index}>
              <div className="friction-slide-copy">
                <span className="friction-slide-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{slide.title}</h3>
                <p>{slide.detail}</p>
              </div>
              <div className="friction-slide-image">
                <FrictionLottie illustration={slide.illustration} />
              </div>
            </article>
          ))}
        </motion.div>
      </div>
      <div className="friction-slider-controls">
        <div className="friction-slider-progress" aria-hidden="true">
          {slides.map((slide, index) => (
            <span key={slide.title} className={activeIndex === index ? "is-active" : ""} />
          ))}
        </div>
        <div className="friction-slider-arrows">
          <button type="button" onClick={() => goTo(activeIndex - 1)} aria-label="Fricción anterior">←</button>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => goTo(activeIndex + 1)} aria-label="Siguiente fricción">→</button>
        </div>
      </div>
    </div>
  );
}
