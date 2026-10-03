"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import ManifestoSystem from "@/app/components/manifesto-system";
import ManifestoTypewriter from "@/app/components/manifesto-typewriter";

export default function ManifestoExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 72, damping: 24, mass: 0.55 });
  const copyOpacity = useTransform(progress, [0, 0.44, 0.58, 1], prefersReducedMotion ? [1, 1, 1, 1] : [1, 1, 0, 0]);
  const copyY = useTransform(progress, [0, 0.48, 1], prefersReducedMotion ? [0, 0, 0] : [0, -34, -34]);
  const starWashScale = useTransform(progress, [0, 0.38, 0.68, 0.86, 1], prefersReducedMotion ? [0, 0, 0, 0, 0] : [0.08, 0.3, 1.05, 12, 12]);
  const starWashOpacity = useTransform(progress, [0, 0.2, 0.54, 0.9, 1], prefersReducedMotion ? [0, 0, 0, 0, 0] : [0, 0.52, 0.92, 1, 1]);

  return (
    <section ref={sectionRef} id="manifiesto" className="manifesto section-dark">
      <div className="manifesto-sticky">
        <ManifestoSystem progress={progress} />
        <motion.div className="page-shell manifesto-layout" style={{ opacity: copyOpacity, y: copyY }}>
          <div className="manifesto-copy">
            <p className="section-index">02 / MANIFIESTO</p>
            <ManifestoTypewriter />
          </div>
        </motion.div>
        <div className="manifesto-star-wash-anchor" aria-hidden="true">
          <motion.div className="manifesto-star-wash" style={{ scale: starWashScale, opacity: starWashOpacity }} />
        </div>
      </div>
    </section>
  );
}
